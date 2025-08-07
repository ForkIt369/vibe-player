// Express Server for Vibe Player Telegram Mini App
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const TelegramBotConfig = require('./bot-config.js');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize bot configuration
const botConfig = new TelegramBotConfig();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS configuration for Telegram
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://web.telegram.org',
    'https://telegram.org',
    'https://t.me'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL'); // Allow Telegram to embed
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    app: 'Vibe Player',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Telegram webhook endpoint
app.post('/api/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    
    // Log incoming updates (for debugging)
    console.log('Received update:', JSON.stringify(update, null, 2));
    
    // Handle the update
    await botConfig.handleWebhook(update);
    
    // Send 200 OK to Telegram
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(200); // Still send 200 to prevent Telegram from retrying
  }
});

// Bot info endpoint (for debugging)
app.get('/api/bot-info', async (req, res) => {
  try {
    const info = await botConfig.getMe();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook info endpoint (for debugging)
app.get('/api/webhook-info', async (req, res) => {
  try {
    const response = await fetch(`${botConfig.TELEGRAM_API}/getWebhookInfo`);
    const info = await response.json();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User validation endpoint
app.post('/api/validate-user', (req, res) => {
  const { initData } = req.body;
  
  if (!initData) {
    return res.status(400).json({ error: 'No init data provided' });
  }
  
  // In production, validate the init data hash
  // For now, we'll just parse and return the user info
  try {
    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get('user') || '{}');
    
    res.json({
      valid: true,
      user: user
    });
  } catch (error) {
    res.status(400).json({ 
      valid: false, 
      error: 'Invalid init data' 
    });
  }
});

// Serve the Mini App
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     Vibe Player Server Running         ║
╠════════════════════════════════════════╣
║  Port: ${PORT}                            ║
║  URL: http://localhost:${PORT}            ║
║                                        ║
║  Endpoints:                            ║
║  • GET  /                              ║
║  • GET  /health                        ║
║  • POST /api/telegram-webhook          ║
║  • GET  /api/bot-info                  ║
║  • GET  /api/webhook-info              ║
║  • POST /api/validate-user             ║
╚════════════════════════════════════════╝
  `);
  
  // Show deployment instructions
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️  Warning: TELEGRAM_BOT_TOKEN not set');
    console.log('   Set it in your environment or .env file');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;