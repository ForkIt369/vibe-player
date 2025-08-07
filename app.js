// Vibe Player - Main Application Entry Point

class VibePlayerApp {
  constructor() {
    this.audioProcessor = null;
    this.visualizer = null;
    this.qualityManager = null;
    this.uiController = null;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
  
  init() {
    console.log('Vibe Player initializing...');
    
    try {
      // Initialize Telegram WebApp if available
      this.initTelegram();
      
      // Create audio processor
      this.audioProcessor = new AudioProcessor();
      
      // Create quality manager
      this.qualityManager = new AdaptiveQualityManager();
      
      // Get canvas element
      const canvas = document.getElementById('visualizer-canvas');
      if (!canvas) {
        throw new Error('Canvas element not found');
      }
      
      // Create visualizer
      this.visualizer = new Visualizer(canvas, this.audioProcessor, this.qualityManager);
      
      // Create UI controller
      this.uiController = new UIController(
        this.audioProcessor,
        this.visualizer,
        this.qualityManager
      );
      
      // Set up global error handling
      this.setupErrorHandling();
      
      // Check browser compatibility
      this.checkCompatibility();
      
      // Log success
      console.log('Vibe Player initialized successfully');
      
      // Add to window for debugging
      window.vibePlayer = this;
      
    } catch (error) {
      console.error('Failed to initialize Vibe Player:', error);
      this.showInitError(error.message);
    }
  }
  
  initTelegram() {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      // Set theme
      tg.setHeaderColor('#0a0a0a');
      tg.setBackgroundColor('#0a0a0a');
      
      // Expand to full height
      tg.expand();
      
      // Enable closing confirmation
      tg.enableClosingConfirmation();
      
      // Get user data
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        console.log('Telegram user:', user);
        
        // Store user info
        window.telegramUser = user;
        
        // Send analytics if needed
        this.trackUser(user);
      }
      
      // Set main button if needed
      if (tg.MainButton) {
        tg.MainButton.text = 'Share Visualization';
        tg.MainButton.color = '#FF9500';
        tg.MainButton.onClick(() => {
          this.shareVisualization();
        });
      }
      
      // Handle theme changes
      tg.onEvent('themeChanged', () => {
        this.updateTheme(tg.themeParams);
      });
      
      // Handle viewport changes
      tg.onEvent('viewportChanged', ({ isStateStable }) => {
        if (isStateStable) {
          this.visualizer?.resizeCanvas();
        }
      });
      
      // Mark as ready
      tg.ready();
      
      console.log('Telegram WebApp initialized');
      console.log('Platform:', tg.platform);
      console.log('Version:', tg.version);
    } else {
      console.log('Running outside Telegram');
    }
  }
  
  trackUser(user) {
    // Analytics tracking (if enabled)
    if (window.gtag) {
      window.gtag('event', 'telegram_user_init', {
        user_id: user.id,
        username: user.username,
        platform: window.Telegram?.WebApp?.platform
      });
    }
  }
  
  updateTheme(themeParams) {
    // Update CSS variables based on Telegram theme
    if (themeParams) {
      const root = document.documentElement;
      
      if (themeParams.bg_color) {
        root.style.setProperty('--tg-bg-color', themeParams.bg_color);
      }
      if (themeParams.text_color) {
        root.style.setProperty('--tg-text-color', themeParams.text_color);
      }
      if (themeParams.button_color) {
        root.style.setProperty('--tg-button-color', themeParams.button_color);
      }
    }
  }
  
  shareVisualization() {
    // Take snapshot and share
    if (this.visualizer?.canvas) {
      this.visualizer.canvas.toBlob(blob => {
        // In a real implementation, upload to server and share URL
        console.log('Share visualization:', blob);
        
        // Show success message
        if (window.Telegram?.WebApp?.showAlert) {
          window.Telegram.WebApp.showAlert('Visualization will be shared!');
        }
      }, 'image/png');
    }
  }
  
  checkCompatibility() {
    const issues = [];
    
    // Check Web Audio API
    if (!window.AudioContext && !window.webkitAudioContext) {
      issues.push('Web Audio API not supported');
    }
    
    // Check Canvas
    const canvas = document.createElement('canvas');
    if (!canvas.getContext || !canvas.getContext('2d')) {
      issues.push('Canvas not supported');
    }
    
    // Check File API
    if (!window.File || !window.FileReader || !window.Blob) {
      issues.push('File API not supported');
    }
    
    // Check requestAnimationFrame
    if (!window.requestAnimationFrame) {
      issues.push('requestAnimationFrame not supported');
    }
    
    // Show warnings if any
    if (issues.length > 0) {
      console.warn('Compatibility issues:', issues);
      
      // Show warning to user for critical issues
      if (issues.length > 2) {
        this.showCompatibilityWarning(issues);
      }
    } else {
      console.log('Browser compatibility check passed');
    }
  }
  
  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      // Don't show UI errors to user unless critical
      if (event.error && event.error.stack && event.error.stack.includes('AudioProcessor')) {
        this.uiController?.showError('Audio playback error occurred');
      }
    });
    
    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Handle specific audio-related rejections
      if (event.reason && event.reason.toString().includes('audio')) {
        this.uiController?.showError('Audio processing error');
      }
    });
  }
  
  showInitError(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #FF4444, #CC0000);
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(255, 68, 68, 0.3);
      z-index: 10000;
      text-align: center;
      max-width: 300px;
    `;
    
    errorDiv.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">Initialization Error</h3>
      <p style="margin: 0;">${message}</p>
      <button onclick="location.reload()" style="
        margin-top: 15px;
        padding: 8px 20px;
        background: white;
        color: #FF4444;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
      ">Reload</button>
    `;
    
    document.body.appendChild(errorDiv);
  }
  
  showCompatibilityWarning(issues) {
    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #FF9500, #FF6B00);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(255, 149, 0, 0.3);
      z-index: 9999;
      text-align: center;
      max-width: 350px;
    `;
    
    warningDiv.innerHTML = `
      <p style="margin: 0; font-size: 14px;">
        Your browser may not support all features.
        For the best experience, please use a modern browser.
      </p>
    `;
    
    document.body.appendChild(warningDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      warningDiv.style.transition = 'opacity 0.5s';
      warningDiv.style.opacity = '0';
      setTimeout(() => warningDiv.remove(), 500);
    }, 5000);
  }
  
  // Public API methods
  
  loadFile(file) {
    if (!file) return;
    
    this.uiController?.loadAudioFile(file);
  }
  
  play() {
    this.uiController?.play();
  }
  
  pause() {
    this.uiController?.pause();
  }
  
  setVisualization(mode) {
    this.visualizer?.setMode(mode);
  }
  
  setQuality(profile) {
    this.qualityManager?.setQuality(profile);
  }
  
  getStatus() {
    return {
      isPlaying: this.audioProcessor?.isPlaying || false,
      isLoaded: this.audioProcessor?.isLoaded || false,
      currentVisualization: this.visualizer?.currentMode || 'bars',
      currentQuality: this.qualityManager?.getCurrentProfile() || 'high',
      fps: this.qualityManager?.monitor?.fps || 0
    };
  }
  
  destroy() {
    console.log('Destroying Vibe Player...');
    
    // Stop visualizer
    this.visualizer?.destroy();
    
    // Clean up audio
    this.audioProcessor?.destroy();
    
    // Clean up UI
    this.uiController?.destroy();
    
    // Clear references
    this.audioProcessor = null;
    this.visualizer = null;
    this.qualityManager = null;
    this.uiController = null;
    
    console.log('Vibe Player destroyed');
  }
}

// Initialize app when script loads
const app = new VibePlayerApp();

// Export for debugging
window.VibePlayerApp = VibePlayerApp;