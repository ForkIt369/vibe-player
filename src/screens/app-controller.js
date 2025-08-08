// App Controller - Manages screen navigation and state
class AppController {
  constructor() {
    this.currentScreen = 'intro';
    this.screens = {
      intro: null,
      library: null,
      player: null
    };
    this.vibePlayer = null;
    this.selectedSong = null;
    
    this.init();
  }
  
  init() {
    // Initialize Telegram WebApp
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#0a0a0a');
      tg.setBackgroundColor('#0a0a0a');
    }
    
    // Load song data
    this.loadSongData();
    
    // Initialize screens
    this.initScreens();
    
    // Show intro screen
    this.showScreen('intro');
  }
  
  async loadSongData() {
    try {
      const response = await fetch('src/data/songs.json');
      this.songData = await response.json();
    } catch (error) {
      console.log('Loading song data from fallback');
      // Fallback if fetch fails (local file system)
      this.songData = window.SONG_DATA || {
        featured: {},
        library: []
      };
    }
  }
  
  initScreens() {
    // Create screen containers
    this.createIntroScreen();
    this.createLibraryScreen();
    this.createPlayerScreen();
  }
  
  createIntroScreen() {
    const intro = document.createElement('div');
    intro.className = 'screen intro-screen';
    intro.innerHTML = `
      <div class="intro-content">
        <div class="intro-logo">
          <div class="logo-animation">
            <div class="wave-circle"></div>
            <div class="wave-circle delay-1"></div>
            <div class="wave-circle delay-2"></div>
          </div>
          <h1 class="app-title">VIBE PLAYER</h1>
          <p class="app-tagline">Feel the Music, See the Vibes</p>
        </div>
        
        <div class="intro-preview">
          <canvas id="intro-canvas" width="300" height="200"></canvas>
        </div>
        
        <button class="start-button" id="start-button">
          <span class="button-icon">🎵</span>
          <span class="button-text">Start Vibing</span>
        </button>
        
        <div class="intro-features">
          <div class="feature">
            <span class="feature-icon">🎨</span>
            <span class="feature-text">9 Visualizations</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🎬</span>
            <span class="feature-text">Record & Share</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🎵</span>
            <span class="feature-text">14 Tracks Ready</span>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(intro);
    this.screens.intro = intro;
    
    // Add click handler
    const startBtn = intro.querySelector('#start-button');
    startBtn.addEventListener('click', () => {
      this.showScreen('library');
    });
    
    // Animate intro canvas
    this.animateIntroCanvas();
  }
  
  createLibraryScreen() {
    const library = document.createElement('div');
    library.className = 'screen library-screen';
    library.innerHTML = `
      <div class="library-header">
        <h2 class="library-title">Choose Your Vibe</h2>
      </div>
      
      <div class="library-content">
        <div class="featured-section">
          <h3 class="section-title">🎵 Featured Track</h3>
          <div class="featured-card" id="featured-track">
            <!-- Will be populated with featured song -->
          </div>
        </div>
        
        <div class="tracks-section">
          <h3 class="section-title">🎼 Track Library</h3>
          <div class="tracks-grid" id="tracks-grid">
            <!-- Will be populated with songs -->
          </div>
        </div>
        
        <div class="upload-section">
          <h3 class="section-title">📁 Your Music</h3>
          <div class="upload-zone" id="library-upload">
            <span class="upload-icon">📤</span>
            <span class="upload-text">Drop your own track</span>
            <span class="upload-hint">MP3, WAV, OGG • Max 50MB</span>
            <input type="file" id="library-file-input" accept="audio/*" style="display: none;">
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(library);
    this.screens.library = library;
    
    // Populate songs
    this.populateLibrary();
    
    // Setup upload
    const uploadZone = library.querySelector('#library-upload');
    const fileInput = library.querySelector('#library-file-input');
    
    uploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.loadCustomSong(file);
      }
    });
  }
  
  createPlayerScreen() {
    // Use existing player HTML but wrap it
    const player = document.createElement('div');
    player.className = 'screen player-screen';
    
    // Move existing player elements into this screen
    const existingApp = document.getElementById('app');
    if (existingApp) {
      player.innerHTML = existingApp.innerHTML;
      existingApp.style.display = 'none';
    }
    
    document.body.appendChild(player);
    this.screens.player = player;
  }
  
  populateLibrary() {
    if (!this.songData) return;
    
    // Populate featured track
    const featured = this.songData.featured;
    const featuredEl = document.getElementById('featured-track');
    if (featured && featuredEl) {
      featuredEl.innerHTML = `
        <div class="featured-content">
          <div class="featured-info">
            <h4 class="featured-title">${featured.title}</h4>
            <p class="featured-artist">${featured.artist}</p>
            <p class="featured-meta">${featured.genre} • ${featured.duration}</p>
          </div>
          <button class="play-button" data-song="featured">
            <span class="play-icon">▶️</span>
            <span class="play-text">Play</span>
          </button>
        </div>
      `;
      
      featuredEl.querySelector('.play-button').addEventListener('click', () => {
        this.playSong(featured);
      });
    }
    
    // Populate track grid
    const grid = document.getElementById('tracks-grid');
    if (this.songData.library && grid) {
      grid.innerHTML = this.songData.library.map(song => `
        <div class="track-card" data-id="${song.id}">
          <div class="track-viz-icon">${this.getVizIcon(song.visualization)}</div>
          <div class="track-info">
            <h5 class="track-title">${song.title}</h5>
            <p class="track-artist">${song.artist}</p>
            <p class="track-duration">${song.duration}</p>
          </div>
        </div>
      `).join('');
      
      // Add click handlers
      grid.querySelectorAll('.track-card').forEach(card => {
        card.addEventListener('click', () => {
          const songId = card.dataset.id;
          const song = this.songData.library.find(s => s.id === songId);
          if (song) {
            this.playSong(song);
          }
        });
      });
    }
  }
  
  getVizIcon(vizType) {
    const icons = {
      bars: '▐█▌',
      wave: '∿∿∿',
      circle: '◉',
      particles: '∘∘',
      galaxy: '✦',
      dna: '∞',
      ribbons: '~~',
      fractal: '❋',
      neon: '▦▦'
    };
    return icons[vizType] || '🎵';
  }
  
  async playSong(song) {
    this.selectedSong = song;
    
    // Initialize player if not already
    if (!this.vibePlayer) {
      await this.initializePlayer();
    }
    
    // Load the song
    try {
      const response = await fetch(song.url);
      const blob = await response.blob();
      const file = new File([blob], song.title + '.mp3', { type: 'audio/mpeg' });
      
      // Switch to player screen
      this.showScreen('player');
      
      // Load and play
      await this.vibePlayer.loadAudioFile(file);
      
      // Set visualization type
      if (song.visualization) {
        this.vibePlayer.currentVisualization = song.visualization;
      }
      
      // Update UI with song info
      this.updatePlayerInfo(song);
      
    } catch (error) {
      console.error('Error loading song:', error);
      // For local file system, provide instructions
      if (window.location.protocol === 'file:') {
        alert('Please run a local server: python3 -m http.server 8000');
      }
    }
  }
  
  async loadCustomSong(file) {
    const customSong = {
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Your Upload',
      duration: 'Unknown',
      genre: 'Custom',
      visualization: 'bars'
    };
    
    // Initialize player if needed
    if (!this.vibePlayer) {
      await this.initializePlayer();
    }
    
    // Switch to player
    this.showScreen('player');
    
    // Load file
    await this.vibePlayer.loadAudioFile(file);
    
    // Update UI
    this.updatePlayerInfo(customSong);
  }
  
  async initializePlayer() {
    // Dynamically load vibe-player.js if not loaded
    if (!window.VibePlayer) {
      await this.loadScript('vibe-player.js');
    }
    
    // Initialize in player screen context
    const playerScreen = this.screens.player;
    const canvas = playerScreen.querySelector('#visualizer-canvas');
    
    if (canvas) {
      this.vibePlayer = new window.VibePlayer();
    }
  }
  
  updatePlayerInfo(song) {
    // Update any player UI elements with song info
    const playerScreen = this.screens.player;
    const titleEl = playerScreen.querySelector('.now-playing-title');
    const artistEl = playerScreen.querySelector('.now-playing-artist');
    
    if (titleEl) titleEl.textContent = song.title;
    if (artistEl) artistEl.textContent = song.artist;
  }
  
  showScreen(screenName) {
    // Hide all screens
    Object.values(this.screens).forEach(screen => {
      if (screen) screen.classList.remove('active');
    });
    
    // Show selected screen
    if (this.screens[screenName]) {
      this.screens[screenName].classList.add('active');
      this.currentScreen = screenName;
    }
  }
  
  animateIntroCanvas() {
    const canvas = document.getElementById('intro-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let time = 0;
    
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Simple wave animation
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let x = 0; x < canvas.width; x += 5) {
        const y = canvas.height / 2 + Math.sin((x + time) * 0.02) * 30;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      time += 2;
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.appController = new AppController();
  });
} else {
  window.appController = new AppController();
}