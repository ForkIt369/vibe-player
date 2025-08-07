// Vercel Serverless Function for Telegram Webhook
const TelegramBotConfig = require('../vibe-player-vanilla/bot-config.js');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Initialize bot config
    const bot = new TelegramBotConfig();
    
    // Get the update from request body
    const update = req.body;
    
    // Log for debugging (remove in production)
    console.log('Received webhook:', JSON.stringify(update, null, 2));
    
    // Handle the update
    await bot.handleWebhook(update);
    
    // Send 200 OK to Telegram
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Still send 200 to prevent Telegram from retrying
    res.status(200).json({ ok: true, error: error.message });
  }
};