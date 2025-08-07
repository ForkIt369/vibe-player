#!/usr/bin/env node

// Bot Setup Script - Initialize Telegram Bot for Vibe Player
const TelegramBotConfig = require('./bot-config.js');

// ASCII Art Banner
console.log(`
╔══════════════════════════════════════════╗
║       🎵 VIBE PLAYER BOT SETUP 🎵        ║
╚══════════════════════════════════════════╝
`);

// Main setup function
async function setupBot() {
  try {
    // Initialize bot config
    const bot = new TelegramBotConfig();
    
    console.log('🚀 Starting bot setup...\n');
    
    // Step 1: Get bot info
    console.log('1️⃣  Getting bot information...');
    const botInfo = await bot.getMe();
    
    if (!botInfo.ok) {
      throw new Error('Failed to get bot info. Check your token.');
    }
    
    console.log(`   ✅ Bot name: ${botInfo.result.first_name}`);
    console.log(`   ✅ Bot username: @${botInfo.result.username}`);
    console.log(`   ✅ Bot ID: ${botInfo.result.id}\n`);
    
    // Step 2: Set commands
    console.log('2️⃣  Setting bot commands...');
    await bot.setCommands();
    console.log('   ✅ Commands configured\n');
    
    // Step 3: Set menu button
    console.log('3️⃣  Setting menu button...');
    await bot.setMenuButton();
    console.log('   ✅ Menu button configured\n');
    
    // Step 4: Configure webhook (for production)
    const args = process.argv.slice(2);
    const mode = args[1] || 'development';
    
    if (mode === 'production') {
      console.log('4️⃣  Setting webhook for production...');
      await bot.setWebhook();
      console.log('   ✅ Webhook configured\n');
      
      // Verify webhook
      const response = await fetch(`${bot.TELEGRAM_API}/getWebhookInfo`);
      const webhookInfo = await response.json();
      
      if (webhookInfo.ok && webhookInfo.result) {
        console.log('📡 Webhook Status:');
        console.log(`   URL: ${webhookInfo.result.url || 'Not set'}`);
        console.log(`   Has certificate: ${webhookInfo.result.has_custom_certificate}`);
        console.log(`   Pending updates: ${webhookInfo.result.pending_update_count || 0}`);
        
        if (webhookInfo.result.last_error_message) {
          console.log(`   ⚠️  Last error: ${webhookInfo.result.last_error_message}`);
        }
      }
    } else {
      console.log('4️⃣  Development mode - Deleting webhook...');
      await bot.deleteWebhook();
      console.log('   ✅ Webhook deleted (use polling for local dev)\n');
    }
    
    // Step 5: Send test message (optional)
    if (args[2]) {
      const testChatId = args[2];
      console.log(`5️⃣  Sending test message to chat ${testChatId}...`);
      
      await bot.sendMessage(testChatId, 
        `✅ <b>Bot Setup Complete!</b>\n\n` +
        `Vibe Player is ready to use.\n` +
        `Click the menu button to launch the app.`,
        {
          reply_markup: {
            inline_keyboard: [[
              {
                text: '🚀 Launch Vibe Player',
                web_app: { url: bot.MINI_APP_CONFIG.web_app.url }
              }
            ]]
          }
        }
      );
      
      console.log('   ✅ Test message sent\n');
    }
    
    // Success message
    console.log(`
╔══════════════════════════════════════════╗
║          ✅ SETUP COMPLETE! ✅           ║
╠══════════════════════════════════════════╣
║  Your bot is ready to use!               ║
║                                          ║
║  Bot username: @${botInfo.result.username.padEnd(25)}║
║  Mode: ${mode.padEnd(34)}║
║                                          ║
║  Next steps:                             ║
║  1. Open Telegram                        ║
║  2. Search for @${botInfo.result.username.padEnd(24)}║
║  3. Start the bot with /start            ║
║  4. Click menu button to launch app      ║
╚══════════════════════════════════════════╝
    `);
    
    // Show app URL
    console.log(`📱 Mini App URL: ${bot.MINI_APP_CONFIG.web_app.url}\n`);
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your bot token is correct');
    console.error('2. Make sure you have internet connection');
    console.error('3. Verify the bot token with @BotFather');
    process.exit(1);
  }
}

// Parse command line arguments
function showHelp() {
  console.log(`
Usage: node bot-setup.js [BOT_TOKEN] [MODE] [TEST_CHAT_ID]

Arguments:
  BOT_TOKEN     - Your Telegram bot token (required)
  MODE          - 'development' or 'production' (default: development)
  TEST_CHAT_ID  - Optional chat ID to send test message

Examples:
  node bot-setup.js YOUR_BOT_TOKEN
  node bot-setup.js YOUR_BOT_TOKEN production
  node bot-setup.js YOUR_BOT_TOKEN development YOUR_CHAT_ID

Environment Variables:
  TELEGRAM_BOT_TOKEN - Bot token (alternative to command line)
  APP_URL           - Application URL for webhook
  `);
}

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Check for bot token
if (!process.env.TELEGRAM_BOT_TOKEN && !process.argv[2]) {
  console.error('❌ Error: Bot token is required!\n');
  showHelp();
  process.exit(1);
}

// Run setup
setupBot().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});