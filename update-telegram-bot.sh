#!/bin/bash

# Telegram Bot Configuration
BOT_TOKEN="8286485795:AAGNATWwU9cMuyzJe29oipcis61Hx8GMvQ8"
APP_URL="https://vibe-player.vercel.app"
WEBHOOK_URL="https://vibe-player.vercel.app/api/telegram-webhook"

echo "🤖 Updating Telegram Bot Configuration..."
echo "==========================================="
echo "Bot Token: ${BOT_TOKEN:0:10}..."
echo "App URL: $APP_URL"
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Set webhook
echo "1. Setting webhook..."
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$WEBHOOK_URL\"}"
echo ""

# Set bot commands
echo "2. Setting bot commands..."
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setMyCommands" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "start", "description": "🎵 Open Vibe Player"},
      {"command": "help", "description": "📖 Show help"},
      {"command": "about", "description": "ℹ️ About Vibe Player"}
    ]
  }'
echo ""

# Set menu button
echo "3. Setting menu button..."
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d "{
    \"menu_button\": {
      \"type\": \"web_app\",
      \"text\": \"🎵 Open Vibe Player\",
      \"web_app\": {
        \"url\": \"$APP_URL/vibe-player-vanilla/\"
      }
    }
  }"
echo ""

# Get webhook info
echo "4. Verifying webhook configuration..."
curl -X GET "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo"
echo ""
echo ""

echo "==========================================="
echo "✅ Bot configuration complete!"
echo ""
echo "Your Telegram Mini App is ready at:"
echo "👉 Bot: @VibeVizDemobot"
echo "👉 App: $APP_URL"
echo ""
echo "Test it by:"
echo "1. Opening @VibeVizDemobot in Telegram"
echo "2. Clicking the menu button or typing /start"
echo "3. Upload an audio file to start visualizing!"