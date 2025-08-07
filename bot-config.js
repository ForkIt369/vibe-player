// Telegram Bot Configuration
// IMPORTANT: Never commit actual bot tokens to version control

class TelegramBotConfig {
  constructor() {
    // Bot token from environment variable or command line
    this.BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.argv[2];
    
    if (!this.BOT_TOKEN) {
      console.error('❌ Bot token is required!');
      console.error('Usage: node bot-setup.js YOUR_BOT_TOKEN');
      console.error('Or set TELEGRAM_BOT_TOKEN environment variable');
      process.exit(1);
    }
    
    // Bot configuration
    this.BOT_USERNAME = '@VibePlayerBot'; // Update with your bot username
    this.APP_URL = process.env.APP_URL || 'https://vibe-player.vercel.app';
    
    // Telegram API endpoints
    this.TELEGRAM_API = `https://api.telegram.org/bot${this.BOT_TOKEN}`;
    
    // Mini App configuration
    this.MINI_APP_CONFIG = {
      web_app: {
        url: `${this.APP_URL}/vibe-player-vanilla/`,
        name: 'Vibe Player',
        description: 'Audio Visualizer with 9 stunning modes'
      }
    };
    
    // Bot commands
    this.COMMANDS = [
      {
        command: 'start',
        description: 'Start the bot and open Vibe Player'
      },
      {
        command: 'help',
        description: 'Show help information'
      },
      {
        command: 'about',
        description: 'About Vibe Player'
      },
      {
        command: 'webapp',
        description: 'Open Vibe Player Mini App'
      }
    ];
    
    // Menu button configuration
    this.MENU_BUTTON = {
      type: 'web_app',
      text: '🎵 Open Vibe Player',
      web_app: {
        url: `${this.APP_URL}/vibe-player-vanilla/`
      }
    };
  }
  
  // Set webhook for bot
  async setWebhook(webhookUrl = null) {
    const url = webhookUrl || `${this.APP_URL}/api/telegram-webhook`;
    
    try {
      const response = await fetch(`${this.TELEGRAM_API}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          allowed_updates: ['message', 'callback_query']
        })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Webhook set successfully:', url);
      } else {
        console.error('❌ Failed to set webhook:', result.description);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error setting webhook:', error);
      throw error;
    }
  }
  
  // Delete webhook (for local development)
  async deleteWebhook() {
    try {
      const response = await fetch(`${this.TELEGRAM_API}/deleteWebhook`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Webhook deleted successfully');
      } else {
        console.error('❌ Failed to delete webhook:', result.description);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error deleting webhook:', error);
      throw error;
    }
  }
  
  // Set bot commands
  async setCommands() {
    try {
      const response = await fetch(`${this.TELEGRAM_API}/setMyCommands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commands: this.COMMANDS
        })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Commands set successfully');
      } else {
        console.error('❌ Failed to set commands:', result.description);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error setting commands:', error);
      throw error;
    }
  }
  
  // Set menu button
  async setMenuButton(chatId = null) {
    try {
      const body = {
        menu_button: this.MENU_BUTTON
      };
      
      if (chatId) {
        body.chat_id = chatId;
      }
      
      const response = await fetch(`${this.TELEGRAM_API}/setChatMenuButton`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Menu button set successfully');
      } else {
        console.error('❌ Failed to set menu button:', result.description);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error setting menu button:', error);
      throw error;
    }
  }
  
  // Send message
  async sendMessage(chatId, text, options = {}) {
    try {
      const body = {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        ...options
      };
      
      const response = await fetch(`${this.TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error('❌ Failed to send message:', result.description);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }
  
  // Get bot info
  async getMe() {
    try {
      const response = await fetch(`${this.TELEGRAM_API}/getMe`);
      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Bot info:', result.result);
        this.BOT_USERNAME = `@${result.result.username}`;
      } else {
        console.error('❌ Failed to get bot info:', result.description);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error getting bot info:', error);
      throw error;
    }
  }
  
  // Handle incoming webhook
  handleWebhook(update) {
    // Handle different update types
    if (update.message) {
      this.handleMessage(update.message);
    } else if (update.callback_query) {
      this.handleCallbackQuery(update.callback_query);
    }
  }
  
  // Handle regular messages
  handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text || '';
    
    // Handle commands
    if (text.startsWith('/')) {
      const command = text.split(' ')[0].substring(1);
      this.handleCommand(chatId, command, message);
    }
  }
  
  // Handle bot commands
  async handleCommand(chatId, command, message) {
    switch (command) {
      case 'start':
        await this.sendMessage(chatId, 
          `🎵 <b>Welcome to Vibe Player!</b>\n\n` +
          `Experience music visualization like never before with 9 stunning modes.\n\n` +
          `Click the button below to launch the app:`,
          {
            reply_markup: {
              inline_keyboard: [[
                {
                  text: '🚀 Launch Vibe Player',
                  web_app: { url: `${this.APP_URL}/vibe-player-vanilla/` }
                }
              ]]
            }
          }
        );
        break;
        
      case 'help':
        await this.sendMessage(chatId,
          `📚 <b>How to use Vibe Player:</b>\n\n` +
          `1. Click "Launch Vibe Player" button\n` +
          `2. Upload your music file (MP3, WAV, OGG)\n` +
          `3. Choose from 9 visualization modes\n` +
          `4. Enjoy the visual experience!\n\n` +
          `<b>Visualization Modes:</b>\n` +
          `• Bars • Wave • Circle • Particles\n` +
          `• Galaxy • DNA • Ribbons • Fractal • Grid\n\n` +
          `<b>Features:</b>\n` +
          `• Adaptive quality for smooth performance\n` +
          `• Touch controls and haptic feedback\n` +
          `• Dark theme optimized for Telegram`
        );
        break;
        
      case 'about':
        await this.sendMessage(chatId,
          `🎨 <b>About Vibe Player</b>\n\n` +
          `Version: 1.0.0\n` +
          `Developer: Digital DaVinci\n\n` +
          `A high-performance audio visualizer built specifically for Telegram.\n\n` +
          `<b>Tech Stack:</b>\n` +
          `• Web Audio API for sound processing\n` +
          `• Canvas 2D for visualizations\n` +
          `• Telegram Mini Apps SDK\n` +
          `• Adaptive performance optimization\n\n` +
          `Enjoy the music! 🎶`
        );
        break;
        
      case 'webapp':
        await this.sendMessage(chatId,
          `🎵 Click the button to open Vibe Player:`,
          {
            reply_markup: {
              inline_keyboard: [[
                {
                  text: '🚀 Open Mini App',
                  web_app: { url: `${this.APP_URL}/vibe-player-vanilla/` }
                }
              ]]
            }
          }
        );
        break;
        
      default:
        await this.sendMessage(chatId,
          `❓ Unknown command. Use /help to see available commands.`
        );
    }
  }
  
  // Handle callback queries
  async handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    
    // Answer callback query to remove loading state
    await fetch(`${this.TELEGRAM_API}/answerCallbackQuery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callback_query_id: callbackQuery.id
      })
    });
    
    // Handle callback data
    console.log('Callback data:', data);
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TelegramBotConfig;
}

// Export for browser
if (typeof window !== 'undefined') {
  window.TelegramBotConfig = TelegramBotConfig;
}