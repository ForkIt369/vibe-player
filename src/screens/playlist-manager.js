// Playlist Manager - Handles playlist functionality with Vercel Blob Storage
class PlaylistManager {
  constructor(vibePlayer) {
    this.vibePlayer = vibePlayer;
    this.songLibrary = null;
    this.currentSongIndex = 0;
    this.isLoading = false;
  }
  
  async initialize() {
    await this.loadSongLibrary();
    this.setupPlaylistUI();
    this.setupEventListeners();
  }
  
  async loadSongLibrary() {
    try {
      // Fetch from static JSON file
      const response = await fetch('/songs-blob.json');
      if (!response.ok) {
        throw new Error('Failed to fetch song library');
      }
      
      this.songLibrary = await response.json();
      return this.songLibrary;
    } catch (error) {
      console.error('Error loading song library:', error);
      // Use fallback
      this.songLibrary = this.getFallbackLibrary();
      return this.songLibrary;
    }
  }
  
  setupPlaylistUI() {
    const playlistScreen = document.getElementById('playlist-screen');
    if (!playlistScreen) return;
    
    const trackList = playlistScreen.querySelector('.track-list');
    if (!trackList || !this.songLibrary) return;
    
    // Clear existing tracks
    trackList.innerHTML = '';
    
    // Add featured track first
    if (this.songLibrary.featured) {
      const featuredTrack = this.createTrackElement(
        this.songLibrary.featured,
        'featured',
        true
      );
      trackList.appendChild(featuredTrack);
    }
    
    // Add library tracks
    this.songLibrary.library.forEach((song, index) => {
      const trackElement = this.createTrackElement(song, song.id || index);
      trackList.appendChild(trackElement);
    });
  }
  
  createTrackElement(song, id, isFeatured = false) {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'track-item';
    if (isFeatured) {
      trackDiv.classList.add('featured');
    }
    trackDiv.dataset.songId = id;
    
    // Genre-based emoji
    const genreEmojis = {
      'Electronic': '🎛️',
      'Alternative': '🎸',
      'Rock': '🤘',
      'Electropop': '⚡',
      'Alternative Rock': '🎵',
      'Hip Hop': '🎤',
      'Indie Rock': '🎶'
    };
    
    const emoji = genreEmojis[song.genre] || '🎵';
    
    trackDiv.innerHTML = `
      <span class="track-icon">${emoji}</span>
      <div class="track-info">
        <div class="track-name">${song.title}</div>
        <div class="track-artist">${song.artist}</div>
      </div>
      <span class="track-duration">${song.duration || '0:00'}</span>
    `;
    
    // Add click handler
    trackDiv.addEventListener('click', () => this.loadSong(song));
    
    return trackDiv;
  }
  
  async loadSong(song) {
    if (this.isLoading) return;
    
    try {
      this.isLoading = true;
      
      // Show loading state
      const loadingElement = document.getElementById('loading');
      if (loadingElement) {
        loadingElement.classList.add('show');
      }
      
      // Fetch the song from Blob storage
      const response = await fetch(song.url);
      if (!response.ok) {
        throw new Error('Failed to load song');
      }
      
      const blob = await response.blob();
      const fileName = `${song.artist} - ${song.title}.mp3`;
      const file = new File([blob], fileName, { type: 'audio/mpeg' });
      
      // Load the file into the player
      await this.vibePlayer.loadAudioFile(file);
      
      // Set the appropriate visualization
      if (song.visualization) {
        this.vibePlayer.currentVisualization = song.visualization;
        this.vibePlayer.updateVisualizationButton();
      }
      
      // Update UI
      const uploadZone = document.getElementById('upload-zone');
      if (uploadZone) {
        const uploadText = uploadZone.querySelector('.upload-text');
        if (uploadText) {
          uploadText.innerHTML = `
            <span class="upload-icon">🎵</span>
            <span>Now Playing</span>
            <span class="upload-hint">${song.artist} - ${song.title}</span>
          `;
        }
      }
      
      // Close playlist screen
      this.closePlaylist();
      
      // Auto-play if audio context is ready
      if (this.vibePlayer.audioContext && this.vibePlayer.audioContext.state === 'running') {
        this.vibePlayer.play();
      }
      
    } catch (error) {
      console.error('Error loading song:', error);
      alert('Failed to load song. Please try again.');
    } finally {
      this.isLoading = false;
      const loadingElement = document.getElementById('loading');
      if (loadingElement) {
        loadingElement.classList.remove('show');
      }
    }
  }
  
  async loadNextSong() {
    if (!this.songLibrary || !this.songLibrary.library.length) return;
    
    this.currentSongIndex = (this.currentSongIndex + 1) % this.songLibrary.library.length;
    const nextSong = this.songLibrary.library[this.currentSongIndex];
    await this.loadSong(nextSong);
  }
  
  async loadPreviousSong() {
    if (!this.songLibrary || !this.songLibrary.library.length) return;
    
    this.currentSongIndex = (this.currentSongIndex - 1 + this.songLibrary.library.length) % this.songLibrary.library.length;
    const prevSong = this.songLibrary.library[this.currentSongIndex];
    await this.loadSong(prevSong);
  }
  
  closePlaylist() {
    const playlistScreen = document.getElementById('playlist-screen');
    const mainScreen = document.getElementById('main-screen');
    
    if (playlistScreen) {
      playlistScreen.classList.remove('active');
    }
    if (mainScreen) {
      mainScreen.classList.add('active');
    }
  }
  
  setupEventListeners() {
    // Next/Previous buttons
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.loadNextSong());
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.loadPreviousSong());
    }
  }
  
  getFallbackLibrary() {
    return {
      featured: {
        title: "Global Concepts",
        artist: "Robert DeLong",
        url: "audio/Robert_DeLong-Global_Concepts.mp3",
        duration: "3:42",
        genre: "Electronic",
        visualization: "neon"
      },
      library: []
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlaylistManager;
}