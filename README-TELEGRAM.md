# 🎵 Vibe Player - Telegram Mini App Deployment Guide

## 📱 Overview

Vibe Player is now ready to be deployed as a Telegram Mini App! This guide will walk you through the complete setup process.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- A Telegram Bot Token from [@BotFather](https://t.me/BotFather)
- Vercel account (free tier works)

### Step 1: Create Your Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the prompts
3. Save your bot token (looks like: `8286485795:AAGNATWwU9cMuyzJe29oipcis61Hx8GMvQ8`)
4. Send `/mybots`, select your bot, then "Bot Settings" → "Menu Button" → "Configure menu button"

### Step 2: Local Setup

```bash
# Navigate to the project
cd vibe-player-vanilla

# Install dependencies
npm install express body-parser

# Copy environment file
cp .env.example .env

# Edit .env and add your bot token
# TELEGRAM_BOT_TOKEN=8286485795:AAGNATWwU9cMuyzJe29oipcis61Hx8GMvQ8
```

### Step 3: Initialize Bot

```bash
# Run bot setup
node bot-setup.js 8286485795:AAGNATWwU9cMuyzJe29oipcis61Hx8GMvQ8 development

# For production deployment
node bot-setup.js 8286485795:AAGNATWwU9cMuyzJe29oipcis61Hx8GMvQ8 production
```

### Step 4: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts and note your deployment URL
# e.g., https://vibe-player.vercel.app
```

### Step 5: Configure Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `TELEGRAM_BOT_TOKEN`: Your bot token
   - `APP_URL`: Your deployment URL

### Step 6: Set Webhook for Production

```bash
# After deployment, set the webhook
node bot-setup.js YOUR_BOT_TOKEN production
```

## 🎮 Testing Your Mini App

### In Telegram Desktop/Mobile:
1. Search for your bot (e.g., @VibePlayerBot)
2. Press Start
3. Click "🎵 Open Vibe Player" button
4. The Mini App will open!

### Direct Link:
```
https://t.me/YourBotUsername/vibeapp
```

## 📁 Project Structure

```
vibe-player-vanilla/
├── index.html           # Main app interface
├── app.js              # Application logic with Telegram integration
├── server.js           # Express server for local testing
├── bot-config.js       # Bot configuration
├── bot-setup.js        # Bot initialization script
├── telegram-manifest.json # Mini App manifest
├── .env.example        # Environment template
└── api/
    └── telegram-webhook.js # Vercel serverless function
```

## 🔧 Bot Commands

Your bot supports these commands:
- `/start` - Launch Vibe Player
- `/help` - Show usage guide
- `/about` - About the app
- `/webapp` - Open Mini App directly

## 🎨 Features in Telegram

- **9 Visualization Modes**: All visualizations work perfectly
- **Haptic Feedback**: Native haptic responses
- **Theme Adaptation**: Adapts to user's Telegram theme
- **User Context**: Access to Telegram user data
- **Cloud Storage**: Can integrate with Telegram Cloud Storage
- **Share Feature**: Share visualizations with friends

## 🔒 Security Configuration

### Bot Token Security
- **NEVER** commit your bot token to Git
- Always use environment variables
- Use `.gitignore` to exclude `.env` files

### Content Security Policy
The app includes CSP headers for security while allowing Telegram integration.

## 🐛 Troubleshooting

### Bot Not Responding
```bash
# Check webhook status
curl https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo
```

### Mini App Not Loading
- Ensure HTTPS is enabled (Vercel provides this)
- Check X-Frame-Options is set to ALLOWALL
- Verify bot token is correct

### Local Testing
```bash
# Start local server
node server.js

# Use ngrok for HTTPS tunnel
ngrok http 3000

# Update webhook to ngrok URL
node bot-setup.js YOUR_TOKEN development
```

## 📊 Analytics Integration

Track usage with Google Analytics:
1. Add GA tracking ID to index.html
2. User events are automatically tracked
3. View real-time usage in GA dashboard

## 🚀 Advanced Features

### Custom Domain
1. Add custom domain in Vercel
2. Update APP_URL in environment
3. Re-run bot setup

### Multiple Environments
```bash
# Development
vercel --env development

# Staging
vercel --env staging

# Production
vercel --prod
```

## 📝 Deployment Checklist

- [ ] Bot created via @BotFather
- [ ] Bot token saved securely
- [ ] Environment variables configured
- [ ] Bot commands set
- [ ] Menu button configured
- [ ] Webhook set for production
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Testing completed

## 🆘 Support

- **GitHub**: [Issues](https://github.com/ForkIt369/vibe-player/issues)
- **Telegram**: [@VibePlayerSupport](https://t.me/VibePlayerSupport)
- **Documentation**: [Wiki](https://github.com/ForkIt369/vibe-player/wiki)

## 📄 License

MIT License - feel free to use for your own projects!

---

**Made with ❤️ by Digital DaVinci**

*Enjoy your music with stunning visualizations in Telegram!* 🎵✨