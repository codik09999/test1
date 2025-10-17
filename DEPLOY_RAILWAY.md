# Railway Deployment Guide

## Quick Deploy to Railway

1. **Connect GitHub to Railway**
   - Go to [Railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "Deploy from GitHub"
   - Select this repository

2. **Set Environment Variables**
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ADMIN_CHAT_ID=your_telegram_chat_id
   NODE_ENV=production
   ```

3. **Configure Domain (Optional)**
   - In Railway dashboard, go to your service
   - Click "Settings" > "Domains"
   - Generate a domain or use custom domain

## Alternative: Railway CLI Deploy

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway link
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set TELEGRAM_BOT_TOKEN=your_token
   railway variables set ADMIN_CHAT_ID=your_chat_id
   railway variables set NODE_ENV=production
   ```

## After Deployment

1. Get your Railway URL (e.g., `https://yourapp.railway.app`)
2. Update webhook in your Telegram bot:
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://yourapp.railway.app/webhook/telegram
   ```

3. Test the deployment by visiting your Railway URL

## Files Ready for Production

- ✅ `webhook-server.js` - Main server with static file serving
- ✅ `package.json` - Dependencies and start script
- ✅ `Procfile` - Process configuration
- ✅ `railway.json` - Railway-specific configuration
- ✅ All frontend files ready for production use