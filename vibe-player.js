// Vibe Player - Simple MP3 Visualizer for Telegram Mini Apps
// DDV Codex Design System Implementation

// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0a0a0a');
  tg.setBackgroundColor('#0a0a0a');
}

// Audio Context and Visualization Engine
class VibePlayer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.audio = null;
    this.isPlaying = false;
    this.currentVisualization = 'bars';
    this.nextVisualization = null;
    this.transitionProgress = 0;
    this.animationId = null;
    this.canvas = document.getElementById('visualizer-canvas');
    this.ctx = this.canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    });
    
    // Agent colors
    this.colors = {
      bigSis: '#00D4FF',
      bro: '#FF9500',
      lilSis: '#D946EF',
      cbo: '#30D158'
    };
    
    // Performance settings
    this.settings = {
      fps: 60,
      barCount: 32,
      smoothing: 0.8
    };
    
    // Particle system for advanced visualizations
    this.particles = [];
    this.initParticles();
    
    // Animation properties
    this.time = 0;
    this.ribbons = [];
    
    // Preloaded song configuration
    this.preloadedSongUrl = null; // Will be set if a default song is configured
    
    this.init();
  }
  
  init() {
    // Set up canvas
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Set up file input
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    
    uploadZone.addEventListener('click', () => fileInput.click());
    
    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('audio/')) {
        this.loadAudioFile(file);
      }
    });
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.loadAudioFile(file);
      }
    });
    
    // Set up controls
    this.setupControls();
    
    // Set up visualization selector
    this.setupVisualizationSelector();
    
    // Set up progress bar
    this.setupProgressBar();
    
    // Set up share menu
    this.setupShareMenu();
    
    // Load preloaded song if configured
    this.loadPreloadedSong();
  }
  
  async loadPreloadedSong() {
    try {
      // Fetch song library from static JSON (works around Vercel API issues)
      const response = await fetch('/songs-blob.json');
      if (!response.ok) {
        throw new Error('Failed to fetch song library');
      }
      
      const songData = await response.json();
      
      // Store song library for playlist functionality
      this.songLibrary = songData;
      
      // Load featured song
      if (songData.featured && songData.featured.url) {
        const songUrl = songData.featured.url;
        const songResponse = await fetch(songUrl);
        
        if (songResponse.ok) {
          const blob = await songResponse.blob();
          const fileName = `${songData.featured.artist} - ${songData.featured.title}.mp3`;
          const file = new File([blob], fileName, { type: 'audio/mpeg' });
          
          // Auto-load but don't auto-play (user interaction required for audio)
          this.loadAudioFile(file);
          
          // Set the visualization type
          if (songData.featured.visualization) {
            this.currentVisualization = songData.featured.visualization;
            this.updateVisualizationButton();
          }
          
          // Update UI to show preloaded song
          const uploadZone = document.getElementById('upload-zone');
          if (uploadZone) {
            const uploadText = uploadZone.querySelector('.upload-text');
            if (uploadText) {
              uploadText.innerHTML = `
                <span class="upload-icon">🎵</span>
                <span>Track loaded - Click to play</span>
                <span class="upload-hint">${songData.featured.artist} - ${songData.featured.title}</span>
              `;
            }
          }
        }
      }
    } catch (error) {
      console.log('Using local fallback for preloaded songs');
      // Fallback to local files if Blob storage is not available
      this.loadLocalPreloadedSong();
    }
  }
  
  async loadLocalPreloadedSong() {
    // Fallback method for local development
    const preloadUrl = 'audio/Robert_DeLong-Global_Concepts.mp3';
    
    try {
      const response = await fetch(preloadUrl);
      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], 'Robert DeLong - Global Concepts.mp3', { type: 'audio/mpeg' });
        
        this.loadAudioFile(file);
        
        const uploadZone = document.getElementById('upload-zone');
        if (uploadZone) {
          const uploadText = uploadZone.querySelector('.upload-text');
          if (uploadText) {
            uploadText.innerHTML = `
              <span class="upload-icon">🎵</span>
              <span>Track loaded - Click to play</span>
              <span class="upload-hint">Robert DeLong - Global Concepts</span>
            `;
          }
        }
      }
    } catch (error) {
      console.log('Could not load local preloaded song:', error);
    }
  }
  
  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
  }
  
  async loadFile(filePath) {
    try {
      // Show loading
      document.getElementById('loading').classList.add('show');
      
      // Create audio element
      if (this.audio) {
        this.audio.pause();
        if (this.audio.src.startsWith('blob:')) {
          URL.revokeObjectURL(this.audio.src);
        }
      }
      
      this.audio = new Audio();
      this.audio.src = filePath;
      this.audio.crossOrigin = 'anonymous';
      
      // Wait for metadata
      await new Promise((resolve, reject) => {
        this.audio.addEventListener('loadedmetadata', resolve, { once: true });
        this.audio.addEventListener('error', reject, { once: true });
      });
      
      // Create audio context if needed
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = this.settings.smoothing;
      }
      
      // Connect audio to analyser
      if (this.source) {
        this.source.disconnect();
      }
      this.source = this.audioContext.createMediaElementSource(this.audio);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      // Hide upload zone
      document.getElementById('upload-zone').style.display = 'none';
      
      // Setup audio events
      this.audio.addEventListener('ended', () => {
        this.stop();
      });
      
      // Update time display
      this.audio.addEventListener('timeupdate', () => {
        this.updateProgress();
      });
      
      // Hide loading
      document.getElementById('loading').classList.remove('show');
      
      // Start playing
      this.play();
      
      // Start animation
      if (!this.animationId) {
        this.animate();
      }
      
    } catch (error) {
      console.error('Error loading audio file:', error);
      document.getElementById('loading').classList.remove('show');
      throw error;
    }
  }
  
  async loadAudioFile(file) {
    try {
      // Show loading
      document.getElementById('loading').classList.add('show');
      
      // Create audio element
      if (this.audio) {
        this.audio.pause();
        URL.revokeObjectURL(this.audio.src);
      }
      
      this.audio = new Audio();
      this.audio.src = URL.createObjectURL(file);
      this.audio.crossOrigin = 'anonymous';
      
      // Wait for metadata
      await new Promise((resolve, reject) => {
        this.audio.addEventListener('loadedmetadata', resolve, { once: true });
        this.audio.addEventListener('error', reject, { once: true });
      });
      
      // Set up Web Audio API
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = this.settings.smoothing;
      
      // Connect audio source
      if (this.source) {
        this.source.disconnect();
      }
      this.source = this.audioContext.createMediaElementSource(this.audio);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      // Update UI
      this.updateTrackInfo(file.name);
      this.updateTotalTime();
      
      // Switch to player view
      document.getElementById('upload-container').classList.add('hidden');
      document.getElementById('player-container').classList.add('active');
      document.getElementById('loading').classList.remove('show');
      
      // Set up audio event listeners
      this.audio.addEventListener('timeupdate', () => this.updateProgress());
      this.audio.addEventListener('ended', () => this.onTrackEnded());
      
      // Start visualization
      this.startVisualization();
      
      // Auto-play
      this.play();
      
    } catch (error) {
      console.error('Error loading audio:', error);
      this.showError('Failed to load audio file');
      document.getElementById('loading').classList.remove('show');
    }
  }
  
  updateTrackInfo(filename) {
    // Extract track name from filename
    const trackName = filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    document.getElementById('track-title').textContent = trackName;
    document.getElementById('track-artist').textContent = 'Local File';
  }
  
  updateTotalTime() {
    const duration = this.audio.duration;
    document.getElementById('total-time').textContent = this.formatTime(duration);
  }
  
  updateProgress() {
    const current = this.audio.currentTime;
    const duration = this.audio.duration;
    const percent = (current / duration) * 100;
    
    document.getElementById('current-time').textContent = this.formatTime(current);
    document.getElementById('progress-fill').style.width = `${percent}%`;
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  setupControls() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    
    playPauseBtn.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    });
  }
  
  play() {
    if (this.audio && this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.audio.play();
      this.isPlaying = true;
      this.updatePlayPauseButton();
      
      // Haptic feedback
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      }
    }
  }
  
  pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
      this.updatePlayPauseButton();
    }
  }
  
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
      this.updatePlayPauseButton();
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  updatePlayPauseButton() {
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    
    if (playIcon && pauseIcon) {
      if (this.isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
      } else {
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
      }
    } else {
      // Fallback if icons aren't found
      const btn = document.getElementById('play-pause-btn');
      if (btn) {
        btn.innerHTML = this.isPlaying ? 
          '<i class="fas fa-pause"></i>' : 
          '<i class="fas fa-play"></i>';
      }
    }
  }
  
  onTrackEnded() {
    this.isPlaying = false;
    this.updatePlayPauseButton();
    // Could implement loop or playlist functionality here
  }
  
  setupVisualizationSelector() {
    const vizBtn = document.getElementById('viz-btn');
    const vizSelector = document.getElementById('viz-selector');
    
    // Update button icon based on current visualization
    this.updateVisualizationButton();
    
    vizBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Viz button clicked, current state:', vizSelector.classList.contains('show'));
      vizSelector.classList.toggle('show');
      vizBtn.classList.toggle('active');
      
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
      }
    });
    
    // Handle visualization selection
    const vizOptions = document.querySelectorAll('.viz-option');
    vizOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Switching to visualization:', option.dataset.viz);
        
        // Update active state
        vizOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Initiate smooth transition
        if (this.currentVisualization !== option.dataset.viz) {
          this.nextVisualization = option.dataset.viz;
          this.transitionProgress = 0;
          console.log('Transitioning from', this.currentVisualization, 'to', this.nextVisualization);
        }
        
        // Hide selector after a small delay
        setTimeout(() => {
          vizSelector.classList.remove('show');
          vizBtn.classList.remove('active');
        }, 100);
        
        // Haptic feedback
        if (tg?.HapticFeedback) {
          tg.HapticFeedback.impactOccurred('medium');
        }
      });
    });
    
    // Close selector when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#viz-btn') && !e.target.closest('#viz-selector')) {
        vizSelector.classList.remove('show');
        vizBtn.classList.remove('active');
      }
    });
  }
  
  setupProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    
    progressBar.addEventListener('click', (e) => {
      if (this.audio) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = percent * this.audio.duration;
      }
    });
  }
  
  setupShareMenu() {
    const shareBtn = document.getElementById('share-btn');
    const shareMenu = document.getElementById('share-menu');
    
    shareBtn.addEventListener('click', () => {
      shareMenu.classList.add('show');
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      }
    });
    
    // Handle share options
    const shareOptions = document.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
      option.addEventListener('click', () => {
        const action = option.dataset.action;
        this.handleShareAction(action);
      });
    });
  }
  
  handleShareAction(action) {
    switch (action) {
      case 'record':
        this.startRecording();
        break;
      case 'telegram':
        this.shareToTelegram();
        break;
      case 'download':
        this.downloadSnapshot();
        break;
    }
    
    // Close share menu
    document.getElementById('share-menu').classList.remove('show');
  }
  
  startRecording() {
    // TODO: Implement video recording
    this.showError('Recording feature coming soon!');
  }
  
  shareToTelegram() {
    if (tg) {
      // Take a screenshot and share
      this.canvas.toBlob(blob => {
        // In a real implementation, you'd upload this to a server
        // and share the URL
        tg.showAlert('Sharing feature coming soon!');
      }, 'image/png');
    }
  }
  
  downloadSnapshot() {
    this.canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibe-visualizer-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }
  
  showError(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.classList.add('show');
    
    setTimeout(() => {
      errorEl.classList.remove('show');
    }, 3000);
  }
  
  updateVisualizationButton() {
    const vizBtn = document.getElementById('viz-btn');
    const icons = {
      bars: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="12" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="12" rx="1"/><rect x="17" y="4" width="4" height="16" rx="1"/></svg>',
      wave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c0-4 2-6 4-6s4 4 4 4 2-4 4-4 4 2 4 6-2 6-4 6-4-4-4-4-2 4-4 4-4-2-4-6z"/></svg>',
      circle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M20 12H4"/></svg>',
      particles: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
      galaxy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 2c0 5.5-4.5 10-10 10"/><path d="M22 12c-5.5 0-10 4.5-10 10"/></svg>',
      dna: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5v14M21 5v14"/><path d="M3 5c4 4 4 4 8 0s4-4 8 0M3 19c4-4 4-4 8 0s4 4 8 0"/><path d="M3 12c4 2 4 2 8 0s4-2 8 0"/></svg>',
      ribbons: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c4-8 8-8 12 0s8 8 12 0"/><path d="M2 6c4-4 8-4 12 0s8 4 12 0"/><path d="M2 18c4 4 8 4 12 0s8-4 12 0"/></svg>',
      fractal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v8M12 10l-4 4M12 10l4 4M8 14v4M16 14v4M8 18l-2 2M8 18l2 2M16 18l-2 2M16 18l2 2"/></svg>',
      neon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>'
    };
    
    vizBtn.innerHTML = icons[this.currentVisualization] || icons.bars;
  }
  
  startVisualization() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    const render = () => {
      this.drawVisualization();
      this.animationId = requestAnimationFrame(render);
    };
    
    render();
  }
  
  drawVisualization() {
    if (!this.analyser) return;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Clear canvas
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, width, height);
    
    // Handle transitions
    if (this.nextVisualization && this.transitionProgress < 1) {
      // Draw current visualization with fade out
      this.ctx.save();
      this.ctx.globalAlpha = 1 - this.transitionProgress;
      this.drawVisualizationType(this.currentVisualization, dataArray, width, height);
      this.ctx.restore();
      
      // Draw next visualization with fade in
      this.ctx.save();
      this.ctx.globalAlpha = this.transitionProgress;
      this.drawVisualizationType(this.nextVisualization, dataArray, width, height);
      this.ctx.restore();
      
      // Update transition progress
      this.transitionProgress += 0.05;
      
      // Complete transition
      if (this.transitionProgress >= 1) {
        this.currentVisualization = this.nextVisualization;
        this.nextVisualization = null;
        this.transitionProgress = 0;
        this.updateVisualizationButton();
      }
    } else {
      // Draw current visualization normally
      this.drawVisualizationType(this.currentVisualization, dataArray, width, height);
    }
  }
  
  drawVisualizationType(type, dataArray, width, height) {
    switch (type) {
      case 'bars':
        this.drawBars(dataArray, width, height);
        break;
      case 'wave':
        this.drawWave(dataArray, width, height);
        break;
      case 'circle':
        this.drawCircle(dataArray, width, height);
        break;
      case 'particles':
        this.drawParticles(dataArray, width, height);
        break;
      case 'galaxy':
        this.drawGalaxy(dataArray, width, height);
        break;
      case 'dna':
        this.drawDNA(dataArray, width, height);
        break;
      case 'ribbons':
        this.drawRibbons(dataArray, width, height);
        break;
      case 'fractal':
        this.drawFractal(dataArray, width, height);
        break;
      case 'neon':
        this.drawNeonGrid(dataArray, width, height);
        break;
    }
  }
  
  drawBars(dataArray, width, height) {
    const barCount = this.settings.barCount;
    const barWidth = width / barCount;
    const barGap = barWidth * 0.2;
    const actualBarWidth = barWidth - barGap;
    
    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * dataArray.length * 0.7);
      const value = dataArray[dataIndex] / 255;
      const barHeight = value * height * 0.8;
      
      // Gradient based on frequency
      const gradient = this.ctx.createLinearGradient(0, height - barHeight, 0, height);
      if (i < barCount * 0.25) {
        gradient.addColorStop(0, this.colors.bigSis);
        gradient.addColorStop(1, '#0051D5');
      } else if (i < barCount * 0.5) {
        gradient.addColorStop(0, this.colors.bro);
        gradient.addColorStop(1, '#FF6B00');
      } else if (i < barCount * 0.75) {
        gradient.addColorStop(0, this.colors.lilSis);
        gradient.addColorStop(1, '#7B2CBF');
      } else {
        gradient.addColorStop(0, this.colors.cbo);
        gradient.addColorStop(1, '#00C851');
      }
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        i * barWidth + barGap / 2,
        height - barHeight,
        actualBarWidth,
        barHeight
      );
    }
  }
  
  drawWave(dataArray, width, height) {
    // Create a proper waveform visualization using frequency data
    const centerY = height / 2;
    
    // Draw upper waveform
    this.ctx.beginPath();
    this.ctx.moveTo(0, centerY);
    
    for (let i = 0; i < dataArray.length; i++) {
      const x = (i / dataArray.length) * width;
      const amplitude = (dataArray[i] / 255) * (height * 0.4);
      const y = centerY - amplitude;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        // Smooth curve
        const prevX = ((i - 1) / dataArray.length) * width;
        const midX = (prevX + x) / 2;
        this.ctx.quadraticCurveTo(prevX, y, midX, y);
      }
    }
    
    // Mirror for lower waveform
    for (let i = dataArray.length - 1; i >= 0; i--) {
      const x = (i / dataArray.length) * width;
      const amplitude = (dataArray[i] / 255) * (height * 0.4);
      const y = centerY + amplitude;
      this.ctx.lineTo(x, y);
    }
    
    this.ctx.closePath();
    
    // Create gradient fill
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `${this.colors.bigSis}20`);
    gradient.addColorStop(0.5, `${this.colors.bigSis}40`);
    gradient.addColorStop(1, `${this.colors.bigSis}20`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    // Draw center line
    this.ctx.strokeStyle = `${this.colors.bigSis}60`;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, centerY);
    this.ctx.lineTo(width, centerY);
    this.ctx.stroke();
    
    // Draw outline with glow
    this.ctx.strokeStyle = this.colors.bigSis;
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = this.colors.bigSis;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }
  
  drawCircle(dataArray, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    
    // Average frequency for size
    let sum = 0;
    for (let i = 0; i < dataArray.length * 0.7; i++) {
      sum += dataArray[i];
    }
    const average = sum / (dataArray.length * 0.7);
    const scale = 1 + (average / 255) * 0.5;
    
    // Draw circle with frequency data
    this.ctx.beginPath();
    
    for (let i = 0; i <= 360; i++) {
      const angle = (i * Math.PI) / 180;
      const dataIndex = Math.floor((i / 360) * dataArray.length * 0.5);
      const value = dataArray[dataIndex] / 255;
      const r = radius * scale + value * 50;
      
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.closePath();
    
    // Gradient fill
    const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * scale);
    gradient.addColorStop(0, `${this.colors.lilSis}40`);
    gradient.addColorStop(0.5, `${this.colors.lilSis}20`);
    gradient.addColorStop(1, 'transparent');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    // Stroke
    this.ctx.strokeStyle = this.colors.lilSis;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
  
  initParticles() {
    this.particles = [];
    for (let i = 0; i < 200; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        life: 1,
        color: Math.floor(Math.random() * 4)
      });
    }
  }
  
  drawParticles(dataArray, width, height) {
    // Update time
    this.time += 0.01;
    
    // Get average frequency
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    const intensity = average / 255;
    
    // Update and draw particles
    this.particles.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx * (1 + intensity * 3);
      particle.y += particle.vy * (1 + intensity * 3);
      
      // Wrap around edges
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;
      
      // Update life
      particle.life -= 0.005;
      if (particle.life <= 0) {
        particle.life = 1;
        particle.x = Math.random() * width;
        particle.y = Math.random() * height;
      }
      
      // Draw particle
      const colors = [this.colors.bigSis, this.colors.bro, this.colors.lilSis, this.colors.cbo];
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * (1 + intensity), 0, Math.PI * 2);
      this.ctx.fillStyle = `${colors[particle.color]}${Math.floor(particle.life * 255).toString(16).padStart(2, '0')}`;
      this.ctx.fill();
      
      // Connect nearby particles
      this.particles.forEach((other, otherIndex) => {
        if (index !== otherIndex) {
          const distance = Math.sqrt(
            Math.pow(particle.x - other.x, 2) + 
            Math.pow(particle.y - other.y, 2)
          );
          
          if (distance < 100 * (1 + intensity)) {
            this.ctx.beginPath();
            this.ctx.moveTo(particle.x, particle.y);
            this.ctx.lineTo(other.x, other.y);
            this.ctx.strokeStyle = `${colors[particle.color]}${Math.floor((1 - distance / 100) * particle.life * 100).toString(16).padStart(2, '0')}`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
          }
        }
      });
    });
  }
  
  drawGalaxy(dataArray, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    this.time += 0.005;
    
    // Get frequency data
    const bassSum = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    const midSum = dataArray.slice(10, 50).reduce((a, b) => a + b, 0) / 40;
    const trebleSum = dataArray.slice(50, 100).reduce((a, b) => a + b, 0) / 50;
    
    // Draw spiral arms
    for (let arm = 0; arm < 4; arm++) {
      const armAngle = (arm * Math.PI) / 2 + this.time;
      
      this.ctx.beginPath();
      for (let i = 0; i < 200; i++) {
        const angle = armAngle + (i * 0.1);
        const radius = i * 2;
        const dataIndex = Math.floor((i / 200) * dataArray.length);
        const intensity = dataArray[dataIndex] / 255;
        
        const x = centerX + Math.cos(angle) * radius * (1 + intensity * 0.3);
        const y = centerY + Math.sin(angle) * radius * (1 + intensity * 0.3);
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      const gradient = this.ctx.createLinearGradient(centerX - 200, centerY, centerX + 200, centerY);
      gradient.addColorStop(0, this.colors.bigSis);
      gradient.addColorStop(0.5, this.colors.lilSis);
      gradient.addColorStop(1, this.colors.bro);
      
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 2 + bassSum / 50;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = this.colors.lilSis;
      this.ctx.stroke();
    }
    
    // Draw center
    const centerGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50 + bassSum / 5);
    centerGradient.addColorStop(0, `${this.colors.cbo}80`);
    centerGradient.addColorStop(0.5, `${this.colors.cbo}40`);
    centerGradient.addColorStop(1, 'transparent');
    
    this.ctx.fillStyle = centerGradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 50 + bassSum / 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.shadowBlur = 0;
  }
  
  drawDNA(dataArray, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    this.time += 0.02;
    
    // DNA parameters
    const amplitude = 100;
    const frequency = 0.02;
    const strands = 2;
    
    for (let strand = 0; strand < strands; strand++) {
      this.ctx.beginPath();
      
      for (let i = 0; i < height; i += 2) {
        const dataIndex = Math.floor((i / height) * dataArray.length);
        const intensity = dataArray[dataIndex] / 255;
        
        const x = centerX + Math.sin(i * frequency + this.time + strand * Math.PI) * amplitude * (1 + intensity);
        const y = i;
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
        
        // Draw connections between strands
        if (i % 20 === 0 && strand === 0) {
          const x2 = centerX + Math.sin(i * frequency + this.time + Math.PI) * amplitude * (1 + intensity);
          
          this.ctx.save();
          this.ctx.strokeStyle = `${this.colors.cbo}60`;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x2, y);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
      
      const strandColor = strand === 0 ? this.colors.bigSis : this.colors.lilSis;
      this.ctx.strokeStyle = strandColor;
      this.ctx.lineWidth = 3;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = strandColor;
      this.ctx.stroke();
    }
    
    this.ctx.shadowBlur = 0;
  }
  
  drawRibbons(dataArray, width, height) {
    this.time += 0.01;
    
    // Initialize ribbons if needed
    if (this.ribbons.length === 0) {
      for (let i = 0; i < 5; i++) {
        this.ribbons.push({
          points: [],
          color: [this.colors.bigSis, this.colors.bro, this.colors.lilSis, this.colors.cbo, this.colors.bigSis][i],
          offset: i * Math.PI / 2.5,
          amplitude: 50 + i * 20,
          frequency: 0.01 + i * 0.002
        });
      }
    }
    
    // Get frequency data for different ranges
    const bassSum = dataArray.slice(0, 20).reduce((a, b) => a + b, 0) / 20 / 255;
    const midSum = dataArray.slice(20, 60).reduce((a, b) => a + b, 0) / 40 / 255;
    const trebleSum = dataArray.slice(60, 100).reduce((a, b) => a + b, 0) / 40 / 255;
    
    // Update and draw each ribbon
    this.ribbons.forEach((ribbon, index) => {
      // Update ribbon points
      ribbon.points = [];
      const segments = 100;
      
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * width;
        const baseY = height / 2;
        
        // Multi-layered wave calculation
        const wave1 = Math.sin(x * ribbon.frequency + this.time + ribbon.offset) * ribbon.amplitude;
        const wave2 = Math.sin(x * ribbon.frequency * 2 + this.time * 1.5 + ribbon.offset) * (ribbon.amplitude * 0.5);
        const wave3 = Math.sin(x * ribbon.frequency * 0.5 + this.time * 0.7 + ribbon.offset) * (ribbon.amplitude * 0.3);
        
        // Audio modulation
        const audioMod = 1 + (index < 2 ? bassSum : index < 4 ? midSum : trebleSum) * 1.5;
        
        const y = baseY + (wave1 + wave2 + wave3) * audioMod;
        ribbon.points.push({ x, y });
      }
      
      // Draw ribbon with gradient
      this.ctx.beginPath();
      ribbon.points.forEach((point, i) => {
        if (i === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      });
      
      // Create flowing gradient
      const gradient = this.ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, ribbon.color + '00');
      gradient.addColorStop(0.2, ribbon.color + '60');
      gradient.addColorStop(0.5, ribbon.color + 'ff');
      gradient.addColorStop(0.8, ribbon.color + '60');
      gradient.addColorStop(1, ribbon.color + '00');
      
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 3 + index * 0.5;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = ribbon.color;
      this.ctx.stroke();
      
      // Draw ribbon fill with transparency
      this.ctx.beginPath();
      ribbon.points.forEach((point, i) => {
        if (i === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      });
      
      // Close the path below
      this.ctx.lineTo(width, height / 2 + ribbon.amplitude * 2);
      this.ctx.lineTo(0, height / 2 + ribbon.amplitude * 2);
      this.ctx.closePath();
      
      const fillGradient = this.ctx.createLinearGradient(0, height / 2 - ribbon.amplitude, 0, height / 2 + ribbon.amplitude);
      fillGradient.addColorStop(0, ribbon.color + '20');
      fillGradient.addColorStop(0.5, ribbon.color + '10');
      fillGradient.addColorStop(1, ribbon.color + '00');
      
      this.ctx.fillStyle = fillGradient;
      this.ctx.fill();
    });
    
    this.ctx.shadowBlur = 0;
  }
  
  drawFractal(dataArray, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Get frequency data
    const bassSum = dataArray.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
    const intensity = bassSum / 255;
    
    // Draw fractal tree
    const drawBranch = (x, y, length, angle, depth) => {
      if (depth === 0 || length < 2) return;
      
      const dataIndex = Math.floor((depth / 8) * dataArray.length);
      const branchIntensity = dataArray[dataIndex] / 255;
      
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      
      // Choose color based on depth
      const colors = [this.colors.cbo, this.colors.lilSis, this.colors.bro, this.colors.bigSis];
      const colorIndex = Math.floor(depth / 2) % colors.length;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = colors[colorIndex];
      this.ctx.lineWidth = depth / 2;
      this.ctx.stroke();
      
      // Recursively draw branches
      const angleVariation = (Math.PI / 4) * (0.5 + branchIntensity);
      drawBranch(endX, endY, length * 0.7, angle - angleVariation, depth - 1);
      drawBranch(endX, endY, length * 0.7, angle + angleVariation, depth - 1);
    };
    
    // Draw main trunk and branches
    this.time += 0.01;
    const baseAngle = -Math.PI / 2 + Math.sin(this.time) * 0.1;
    drawBranch(centerX, height - 50, 100 + intensity * 50, baseAngle, 8);
  }
  
  drawNeonGrid(dataArray, width, height) {
    const gridSize = 40;
    const perspective = 400;
    this.time += 0.01;
    
    // Get frequency data
    const bassIntensity = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 2550;
    
    // Draw horizon line
    const horizon = height * 0.4;
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.4, '#0a0a0a');
    gradient.addColorStop(1, this.colors.lilSis + '20');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw sun
    const sunX = width / 2;
    const sunY = horizon - 50;
    const sunGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 80 + bassIntensity * 100);
    sunGradient.addColorStop(0, this.colors.bro);
    sunGradient.addColorStop(0.5, this.colors.bro + '60');
    sunGradient.addColorStop(1, 'transparent');
    
    this.ctx.fillStyle = sunGradient;
    this.ctx.beginPath();
    this.ctx.arc(sunX, sunY, 80 + bassIntensity * 100, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw grid
    this.ctx.strokeStyle = this.colors.bigSis;
    this.ctx.lineWidth = 2;
    
    // Vertical lines
    for (let x = -20; x <= 20; x++) {
      this.ctx.beginPath();
      const startX = width / 2 + x * gridSize;
      this.ctx.moveTo(startX, horizon);
      
      for (let z = 0; z < 20; z++) {
        const y = horizon + z * gridSize;
        const scale = perspective / (perspective + z * gridSize);
        const screenX = width / 2 + (startX - width / 2) * scale;
        this.ctx.lineTo(screenX, y);
      }
      
      this.ctx.stroke();
    }
    
    // Horizontal lines with audio reactivity
    for (let z = 0; z < 20; z++) {
      const y = horizon + z * gridSize;
      const scale = perspective / (perspective + z * gridSize);
      const dataIndex = Math.floor((z / 20) * dataArray.length);
      const intensity = dataArray[dataIndex] / 255;
      
      this.ctx.beginPath();
      this.ctx.moveTo(width / 2 - width * scale, y);
      this.ctx.lineTo(width / 2 + width * scale, y);
      this.ctx.strokeStyle = `${this.colors.bigSis}${Math.floor((1 - z / 20) * 255 * (0.5 + intensity * 0.5)).toString(16).padStart(2, '0')}`;
      this.ctx.stroke();
    }
  }
}

// Global functions for HTML onclick handlers
window.closeShareMenu = function() {
  document.getElementById('share-menu').classList.remove('show');
};

// Initialize the player
const vibePlayer = new VibePlayer();