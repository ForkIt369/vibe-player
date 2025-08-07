# Telegram Bot Setup Instructions

## Current Status
The bot configuration has been updated to use the new Vercel deployment URL:
- **New URL**: https://vibe-player-flame.vercel.app/
- **Old URL**: https://vibe-player.vercel.app/ (was returning 401 errors)

## To Update Your Telegram Bot

### Method 1: Using Bot Setup Script
```bash
# Run the setup script with your bot token
node bot-setup.js YOUR_BOT_TOKEN production

# Example:
# node bot-setup.js 1234567890:ABCdef_GHIjklmnop_QRSTuvwxyz123456 production
```

### Method 2: Manual Update via BotFather
1. Open Telegram and go to @BotFather
2. Send `/mybots`
3. Select your Vibe Player bot
4. Choose "Bot Settings"
5. Select "Menu Button"
6. Choose "Configure menu button"
7. Send this URL: `https://vibe-player-flame.vercel.app/`

### Method 3: Set Environment Variable
If you prefer to use environment variables:
```bash
export TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN"
export APP_URL="https://vibe-player-flame.vercel.app"
node bot-setup.js
```

## What Has Changed
1. **bot-config.js**: Updated APP_URL to new Vercel deployment
2. **telegram-manifest.json**: Updated all webapp URLs
3. Removed `/vibe-player-vanilla/` subdirectory from URLs (app is at root)

## Verification
After running the setup, you can verify:
1. Open your bot in Telegram
2. The menu button should show "🎵 Open Vibe Player"
3. Clicking it should open the app at https://vibe-player-flame.vercel.app/
4. The mobile UI with header bar should be visible

## Important Notes
- The GitHub repository is now PUBLIC (was previously private)
- Vercel deployment is working correctly
- Mobile UI improvements are live on production
- No bot token is stored in the repository for security