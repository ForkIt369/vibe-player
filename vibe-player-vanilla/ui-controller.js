// UI Controller - Handles all user interface interactions

class UIController {
  constructor(audioProcessor, visualizer, qualityManager) {
    this.audioProcessor = audioProcessor;
    this.visualizer = visualizer;
    this.qualityManager = qualityManager;
    
    // Telegram WebApp
    this.tg = window.Telegram?.WebApp;
    
    // UI Elements
    this.elements = {};
    this.initializeElements();
    
    // State
    this.isVisualizationSelectorOpen = false;
    this.isQualitySelectorOpen = false;
    this.isShareMenuOpen = false;
    
    // Initialize
    this.setupEventListeners();
    this.setupTelegramIntegration();
  }
  
  initializeElements() {
    // Containers
    this.elements.uploadContainer = document.getElementById('upload-container');
    this.elements.playerContainer = document.getElementById('player-container');
    
    // Upload
    this.elements.uploadZone = document.getElementById('upload-zone');
    this.elements.fileInput = document.getElementById('file-input');
    
    // Player controls
    this.elements.playPauseBtn = document.getElementById('play-pause-btn');
    this.elements.prevBtn = document.getElementById('prev-btn');
    this.elements.nextBtn = document.getElementById('next-btn');
    
    // Track info
    this.elements.trackTitle = document.getElementById('track-title');
    this.elements.trackArtist = document.getElementById('track-artist');
    
    // Progress
    this.elements.progressBar = document.getElementById('progress-bar');
    this.elements.progressFill = document.getElementById('progress-fill');
    this.elements.progressHandle = document.getElementById('progress-handle');
    this.elements.currentTime = document.getElementById('current-time');
    this.elements.totalTime = document.getElementById('total-time');
    
    // Bottom bar
    this.elements.vizBtn = document.getElementById('viz-btn');
    this.elements.qualityBtn = document.getElementById('quality-btn');
    this.elements.shareBtn = document.getElementById('share-btn');
    
    // Selectors
    this.elements.vizSelector = document.getElementById('viz-selector');
    this.elements.qualitySelector = document.getElementById('quality-selector');
    this.elements.shareMenu = document.getElementById('share-menu');
    
    // Others
    this.elements.loading = document.getElementById('loading');
    this.elements.errorToast = document.getElementById('error-toast');
    this.elements.errorMessage = document.getElementById('error-message');
    this.elements.fpsCounter = document.getElementById('fps-counter');
  }
  
  setupEventListeners() {
    // File upload
    this.setupFileUpload();
    
    // Player controls
    this.setupPlayerControls();
    
    // Progress bar
    this.setupProgressBar();
    
    // Visualization selector
    this.setupVisualizationSelector();
    
    // Quality selector
    this.setupQualitySelector();
    
    // Share menu
    this.setupShareMenu();
    
    // Audio processor callbacks
    this.setupAudioCallbacks();
    
    // Performance monitor callbacks
    this.setupPerformanceCallbacks();
  }
  
  setupFileUpload() {
    // Click to upload
    this.elements.uploadZone.addEventListener('click', () => {
      // Initialize AudioContext on user interaction if needed
      this.initializeAudioContextOnUserInteraction();
      this.elements.fileInput.click();
    });
    
    // File input change
    this.elements.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.loadAudioFile(file);
      }
    });
    
    // Drag and drop
    this.elements.uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.elements.uploadZone.classList.add('drag-over');
    });
    
    this.elements.uploadZone.addEventListener('dragleave', () => {
      this.elements.uploadZone.classList.remove('drag-over');
    });
    
    this.elements.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.elements.uploadZone.classList.remove('drag-over');
      
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('audio/')) {
        this.loadAudioFile(file);
      } else if (file) {
        this.showError('Please select an audio file');
      }
    });
  }
  
  setupPlayerControls() {
    // Play/Pause
    this.elements.playPauseBtn.addEventListener('click', () => {
      if (this.audioProcessor.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    });
    
    // Previous (placeholder)
    this.elements.prevBtn.addEventListener('click', () => {
      this.audioProcessor.seek(0);
      this.hapticFeedback('light');
    });
    
    // Next (placeholder)
    this.elements.nextBtn.addEventListener('click', () => {
      this.hapticFeedback('light');
      // Could implement playlist functionality
    });
  }
  
  setupProgressBar() {
    this.elements.progressBar.addEventListener('click', (e) => {
      if (!this.audioProcessor.isLoaded) return;
      
      const rect = this.elements.progressBar.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      this.audioProcessor.seekToPercent(percent);
      this.hapticFeedback('light');
    });
    
    // Touch/drag support for progress handle
    let isDragging = false;
    
    const handleDragStart = (e) => {
      isDragging = true;
      this.elements.progressHandle.style.opacity = '1';
    };
    
    const handleDragMove = (e) => {
      if (!isDragging || !this.audioProcessor.isLoaded) return;
      
      const rect = this.elements.progressBar.getBoundingClientRect();
      const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const percent = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
      
      this.audioProcessor.seekToPercent(percent);
    };
    
    const handleDragEnd = () => {
      isDragging = false;
      this.elements.progressHandle.style.opacity = '';
    };
    
    this.elements.progressBar.addEventListener('mousedown', handleDragStart);
    this.elements.progressBar.addEventListener('touchstart', handleDragStart);
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove);
    
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  }
  
  setupVisualizationSelector() {
    // Toggle selector
    this.elements.vizBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      this.toggleVisualizationSelector();
      this.hapticFeedback('selectionChanged');
    });
    
    // Visualization options
    const vizOptions = this.elements.vizSelector.querySelectorAll('.viz-option');
    vizOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Update active state
        vizOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Change visualization
        const vizMode = option.dataset.viz;
        this.visualizer.setMode(vizMode);
        
        // Update button icon
        this.updateVisualizationButton(vizMode);
        
        // Close selector
        setTimeout(() => {
          this.closeVisualizationSelector();
        }, 100);
        
        this.hapticFeedback('medium');
      });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#viz-btn') && !e.target.closest('#viz-selector')) {
        this.closeVisualizationSelector();
      }
    });
  }
  
  setupQualitySelector() {
    // Toggle selector
    this.elements.qualityBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      this.toggleQualitySelector();
      this.hapticFeedback('selectionChanged');
    });
    
    // Quality options
    const qualityOptions = this.elements.qualitySelector.querySelectorAll('.quality-option');
    qualityOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Update active state
        qualityOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Change quality
        const quality = option.dataset.quality;
        if (quality === 'auto') {
          this.qualityManager.setAutoMode(true);
        } else {
          this.qualityManager.setAutoMode(false);
          this.qualityManager.setQuality(quality);
        }
        
        // Close selector
        setTimeout(() => {
          this.closeQualitySelector();
        }, 100);
        
        this.hapticFeedback('light');
      });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#quality-btn') && !e.target.closest('#quality-selector')) {
        this.closeQualitySelector();
      }
    });
  }
  
  setupShareMenu() {
    // Toggle menu
    this.elements.shareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      this.toggleShareMenu();
      this.hapticFeedback('light');
    });
    
    // Share options
    const shareOptions = this.elements.shareMenu.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const action = option.dataset.action;
        this.handleShareAction(action);
        
        // Close menu
        setTimeout(() => {
          this.closeShareMenu();
        }, 100);
        
        this.hapticFeedback('light');
      });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#share-btn') && !e.target.closest('#share-menu')) {
        this.closeShareMenu();
      }
    });
  }
  
  setupAudioCallbacks() {
    // Load complete
    this.audioProcessor.onLoadComplete = (metadata) => {
      this.updateTrackInfo(metadata);
      this.showPlayer();
      this.hideLoading();
    };
    
    // Time update
    this.audioProcessor.onTimeUpdate = (timeData) => {
      this.updateProgress(timeData);
    };
    
    // Ended
    this.audioProcessor.onEnded = () => {
      this.updatePlayPauseButton(false);
    };
    
    // Error
    this.audioProcessor.onError = (message) => {
      this.showError(message);
      this.hideLoading();
    };
  }
  
  setupPerformanceCallbacks() {
    if (!this.qualityManager) return;
    
    // FPS update
    this.qualityManager.monitor.onFPSUpdate = (fps) => {
      this.elements.fpsCounter.textContent = `${fps} FPS`;
      
      // Color code based on performance
      if (fps >= 50) {
        this.elements.fpsCounter.style.color = '#30D158'; // Green
      } else if (fps >= 30) {
        this.elements.fpsCounter.style.color = '#FF9500'; // Orange
      } else {
        this.elements.fpsCounter.style.color = '#FF4444'; // Red
      }
    };
    
    // Quality change
    this.qualityManager.onQualityChange = (profile) => {
      this.updateQualityIndicator(profile);
    };
    
    // Performance warning
    this.qualityManager.monitor.onPerformanceWarning = (message) => {
      console.warn('Performance:', message);
    };
  }
  
  initializeAudioContextOnUserInteraction() {
    // This helps ensure AudioContext can be created on browsers that require user interaction
    if (!window.audioContextInitialized) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        try {
          const tempContext = new AudioContextClass();
          tempContext.close();
          window.audioContextInitialized = true;
          console.log('AudioContext pre-initialized on user interaction');
        } catch (e) {
          console.warn('Could not pre-initialize AudioContext:', e);
        }
      }
    }
  }
  
  setupTelegramIntegration() {
    if (!this.tg) return;
    
    // Set theme colors
    this.tg.setHeaderColor('#0a0a0a');
    this.tg.setBackgroundColor('#0a0a0a');
    
    // Expand to full height
    this.tg.expand();
    
    // Ready
    this.tg.ready();
  }
  
  async loadAudioFile(file) {
    try {
      this.showLoading();
      
      // Log file details for debugging
      console.log('Loading audio file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });
      
      // Load the audio file
      await this.audioProcessor.loadAudioFile(file);
      
      // Start visualizer
      this.visualizer.start();
      
      // Hide loading and show player
      this.hideLoading();
      this.showPlayer();
      
      console.log('Audio file loaded successfully');
    } catch (error) {
      console.error('Error loading file:', error);
      this.showError(error.message || 'Failed to load audio file');
      this.hideLoading();
    }
  }
  
  play() {
    this.audioProcessor.play();
    this.updatePlayPauseButton(true);
    this.hapticFeedback('light');
  }
  
  pause() {
    this.audioProcessor.pause();
    this.updatePlayPauseButton(false);
    this.hapticFeedback('light');
  }
  
  updatePlayPauseButton(isPlaying) {
    if (isPlaying) {
      this.elements.playPauseBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>
      `;
    } else {
      this.elements.playPauseBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
    }
  }
  
  updateTrackInfo(metadata) {
    this.elements.trackTitle.textContent = metadata.name || 'Unknown Track';
    this.elements.trackArtist.textContent = 'Local File';
    this.elements.totalTime.textContent = this.formatTime(metadata.duration);
  }
  
  updateProgress(timeData) {
    this.elements.currentTime.textContent = this.formatTime(timeData.currentTime);
    this.elements.progressFill.style.width = `${timeData.progress}%`;
    this.elements.progressHandle.style.left = `${timeData.progress}%`;
  }
  
  updateVisualizationButton(mode) {
    // Update button icon based on current visualization
    const icons = {
      bars: '<rect x="4" y="11" width="3" height="10"/><rect x="9" y="7" width="3" height="14"/><rect x="14" y="4" width="3" height="17"/><rect x="19" y="9" width="3" height="12"/>',
      wave: '<path d="M2 12c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4zm6 0c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4zm6 0c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4z"/>',
      circle: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3"/>',
      particles: '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>',
      galaxy: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>',
      dna: '<path d="M4 2v20h2V12h2v10h2V12h2v10h2V12h2v10h2V12h2V2h-2v8h-2V2h-2v8h-2V2H10v8H8V2H6v8H4V2z"/>',
      ribbons: '<path d="M2 7c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V7zm2 0v10h16V7H4z"/>',
      fractal: '<path d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7L3 9h7z"/>',
      neonGrid: '<path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h10v10H7V7zm2 2v6h6V9H9z"/>'
    };
    
    this.elements.vizBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        ${icons[mode] || icons.bars}
      </svg>
    `;
  }
  
  updateQualityIndicator(profile) {
    // Update quality button to show current profile
    const qualityOptions = this.elements.qualitySelector.querySelectorAll('.quality-option');
    qualityOptions.forEach(opt => {
      if (opt.dataset.quality === profile) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }
  
  toggleVisualizationSelector() {
    this.isVisualizationSelectorOpen = !this.isVisualizationSelectorOpen;
    
    if (this.isVisualizationSelectorOpen) {
      this.elements.vizSelector.classList.add('show');
      this.elements.vizBtn.classList.add('active');
      this.closeQualitySelector();
      this.closeShareMenu();
    } else {
      this.closeVisualizationSelector();
    }
  }
  
  closeVisualizationSelector() {
    this.isVisualizationSelectorOpen = false;
    this.elements.vizSelector.classList.remove('show');
    this.elements.vizBtn.classList.remove('active');
  }
  
  toggleQualitySelector() {
    this.isQualitySelectorOpen = !this.isQualitySelectorOpen;
    
    if (this.isQualitySelectorOpen) {
      this.elements.qualitySelector.classList.add('show');
      this.elements.qualityBtn.classList.add('active');
      this.closeVisualizationSelector();
      this.closeShareMenu();
    } else {
      this.closeQualitySelector();
    }
  }
  
  closeQualitySelector() {
    this.isQualitySelectorOpen = false;
    this.elements.qualitySelector.classList.remove('show');
    this.elements.qualityBtn.classList.remove('active');
  }
  
  toggleShareMenu() {
    this.isShareMenuOpen = !this.isShareMenuOpen;
    
    if (this.isShareMenuOpen) {
      this.elements.shareMenu.classList.add('show');
      this.elements.shareBtn.classList.add('active');
      this.closeVisualizationSelector();
      this.closeQualitySelector();
    } else {
      this.closeShareMenu();
    }
  }
  
  closeShareMenu() {
    this.isShareMenuOpen = false;
    this.elements.shareMenu.classList.remove('show');
    this.elements.shareBtn.classList.remove('active');
  }
  
  handleShareAction(action) {
    switch (action) {
      case 'snapshot':
        this.takeSnapshot();
        break;
      case 'record':
        this.showError('Recording feature coming soon!');
        break;
      case 'telegram':
        this.shareToTelegram();
        break;
    }
  }
  
  takeSnapshot() {
    if (!this.visualizer || !this.visualizer.canvas) return;
    
    this.visualizer.canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibe-visualizer-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      this.hapticFeedback('medium');
    }, 'image/png');
  }
  
  shareToTelegram() {
    if (this.tg) {
      // In a real implementation, you'd upload the snapshot to a server
      // and share the URL via Telegram
      this.tg.showAlert('Sharing feature will be available soon!');
    } else {
      this.showError('Telegram not available');
    }
  }
  
  showPlayer() {
    this.elements.uploadContainer.classList.add('hidden');
    this.elements.playerContainer.classList.add('active');
  }
  
  showLoading() {
    this.elements.loading.classList.add('show');
  }
  
  hideLoading() {
    this.elements.loading.classList.remove('show');
  }
  
  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorToast.classList.add('show');
    
    setTimeout(() => {
      this.elements.errorToast.classList.remove('show');
    }, 3000);
  }
  
  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  hapticFeedback(type) {
    if (!this.tg?.HapticFeedback) return;
    
    switch (type) {
      case 'light':
        this.tg.HapticFeedback.impactOccurred('light');
        break;
      case 'medium':
        this.tg.HapticFeedback.impactOccurred('medium');
        break;
      case 'heavy':
        this.tg.HapticFeedback.impactOccurred('heavy');
        break;
      case 'selectionChanged':
        this.tg.HapticFeedback.selectionChanged();
        break;
    }
  }
  
  destroy() {
    // Clean up event listeners
    // In a real implementation, you'd remove all event listeners
  }
}

// Export for use in other modules
window.UIController = UIController;