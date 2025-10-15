require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Telegram Bot setup
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7808830885:AAHFkGTaOylnQ99RrNolU5UgjEgo2gxFrqo';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '2063086506';
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// In-memory storage для заказов (в продакшене используйте базу данных)
const orders = new Map();
const confirmationCodes = new Map();

// Генерация уникального ID заказа
function generateOrderId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Генерация кода подтверждения
function generateConfirmationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// API Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Создание заказа
app.post('/api/order', async (req, res) => {
    try {
        console.log('📥 Received order request:', req.body);
        console.log('🤖 Bot token exists:', !!TELEGRAM_BOT_TOKEN);
        console.log('👤 Admin chat ID:', ADMIN_CHAT_ID);
        
        const { customerName, customerPhone, customerEmail, orderDetails } = req.body;
        const orderId = generateOrderId();
        
        const order = {
            id: orderId,
            customerName,
            customerPhone,
            customerEmail,
            orderDetails,
            status: 'pending',
            createdAt: new Date()
        };
        
        orders.set(orderId, order);
        console.log('💾 Order saved:', orderId);
        
        // Отправка уведомления в Telegram
        const message = `🆕 Новый заказ #${orderId}\n\n` +
                       `👤 Имя: ${customerName}\n` +
                       `📞 Телефон: ${customerPhone}\n` +
                       `📧 Email: ${customerEmail}\n` +
                       `📝 Детали: ${orderDetails}\n\n` +
                       `⏰ Время: ${new Date().toLocaleString('ru-RU')}`;
        
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Подтвердить', callback_data: `confirm_${orderId}` },
                        { text: '❌ Отклонить', callback_data: `reject_${orderId}` }
                    ]
                ]
            }
        };
        
        console.log('📤 Sending to Telegram...');
        const result = await bot.sendMessage(ADMIN_CHAT_ID, message, keyboard);
        console.log('✅ Telegram message sent:', result.message_id);
        
        res.json({ success: true, orderId });
    } catch (error) {
        console.error('❌ Error creating order:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

// Проверка кода подтверждения
app.post('/api/verify-code', (req, res) => {
    try {
        const { orderId, code } = req.body;
        const storedCode = confirmationCodes.get(orderId);
        
        if (storedCode && storedCode === code) {
            const order = orders.get(orderId);
            if (order) {
                order.status = 'completed';
                orders.set(orderId, order);
                confirmationCodes.delete(orderId);
                
                // Уведомление в Telegram о завершении заказа
                bot.sendMessage(ADMIN_CHAT_ID, `✅ Заказ #${orderId} успешно завершен!\n👤 Клиент: ${order.customerName}`);
                
                res.json({ success: true });
            } else {
                res.json({ success: false, error: 'Order not found' });
            }
        } else {
            res.json({ success: false, error: 'Invalid code' });
        }
    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Обработка callback'ов от Telegram бота
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;
    
    if (data.startsWith('confirm_')) {
        const orderId = data.replace('confirm_', '');
        const order = orders.get(orderId);
        
        if (order) {
            order.status = 'confirmed';
            orders.set(orderId, order);
            
            // Генерация кода подтверждения
            const confirmationCode = generateConfirmationCode();
            confirmationCodes.set(orderId, confirmationCode);
            
            // Уведомление клиента через WebSocket
            io.emit('orderConfirmed', { orderId });
            
            // Отправка кода подтверждения в Telegram
            const codeMessage = `🔐 Код подтверждения для заказа #${orderId}: \n\n` +
                               `**${confirmationCode}**\n\n` +
                               `Сообщите этот код клиенту для завершения заказа.`;
            
            await bot.editMessageText(
                `✅ Заказ #${orderId} подтвержден!\n\n${codeMessage}`,
                {
                    chat_id: chatId,
                    message_id: messageId
                }
            );
        }
    } else if (data.startsWith('reject_')) {
        const orderId = data.replace('reject_', '');
        const order = orders.get(orderId);
        
        if (order) {
            order.status = 'rejected';
            orders.set(orderId, order);
            
            // Уведомление клиента через WebSocket
            io.emit('orderRejected', { orderId });
            
            await bot.editMessageText(
                `❌ Заказ #${orderId} отклонен.`,
                {
                    chat_id: chatId,
                    message_id: messageId
                }
            );
        }
    }
    
    await bot.answerCallbackQuery(callbackQuery.id);
});

// Обработка текстовых сообщений бота
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    
    if (msg.text === '/start') {
        bot.sendMessage(chatId, 
            'Привет! 👋\n\n' +
            'Этот бот предназначен для управления заказами.\n' +
            'Когда поступит новый заказ, вы получите уведомление с кнопками для подтверждения или отклонения.\n\n' +
            'Ваш Chat ID: `' + chatId + '`\n' +
            'Сохраните его в переменной ADMIN_CHAT_ID в настройках.',
            { parse_mode: 'Markdown' }
        );
    }
});

// Socket.IO connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Error handling
bot.on('error', (error) => {
    console.error('Telegram bot error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('🤖 Telegram bot token:', TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');
    console.log('👤 Admin chat ID:', ADMIN_CHAT_ID || 'NOT SET');
    
    // Проверка подключения к Telegram
    try {
        const botInfo = await bot.getMe();
        console.log('✅ Telegram bot connected:', botInfo.username);
    } catch (error) {
        console.error('❌ Telegram bot connection failed:', error.message);
    }
});
