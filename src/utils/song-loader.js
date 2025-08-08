// Song Loader - Manages loading songs from Vercel Blob Storage
class SongLoader {
  constructor() {
    this.baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : ''; // Use relative path in production
    this.songLibrary = null;
    this.currentSongIndex = 0;
  }
  
  // Fetch song library from API
  async fetchSongLibrary() {
    try {
      const response = await fetch(`${this.baseUrl}/api/songs`);
      if (!response.ok) {
        throw new Error('Failed to fetch song library');
      }
      this.songLibrary = await response.json();
      return this.songLibrary;
    } catch (error) {
      console.error('Error fetching song library:', error);
      // Fallback to local storage if API fails
      return this.getLocalFallback();
    }
  }
  
  // Get featured song
  async getFeaturedSong() {
    if (!this.songLibrary) {
      await this.fetchSongLibrary();
    }
    return this.songLibrary?.featured || null;
  }
  
  // Get all songs in library
  async getAllSongs() {
    if (!this.songLibrary) {
      await this.fetchSongLibrary();
    }
    return this.songLibrary?.library || [];
  }
  
  // Get song by ID
  async getSongById(id) {
    const songs = await this.getAllSongs();
    return songs.find(song => song.id === id) || null;
  }
  
  // Get next song in playlist
  async getNextSong() {
    const songs = await this.getAllSongs();
    if (songs.length === 0) return null;
    
    this.currentSongIndex = (this.currentSongIndex + 1) % songs.length;
    return songs[this.currentSongIndex];
  }
  
  // Get previous song in playlist
  async getPreviousSong() {
    const songs = await this.getAllSongs();
    if (songs.length === 0) return null;
    
    this.currentSongIndex = (this.currentSongIndex - 1 + songs.length) % songs.length;
    return songs[this.currentSongIndex];
  }
  
  // Load audio from Blob URL
  async loadAudioFromUrl(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load audio');
      }
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error loading audio from URL:', error);
      throw error;
    }
  }
  
  // Local fallback for development
  getLocalFallback() {
    return {
      featured: {
        title: "Global Concepts",
        artist: "Robert DeLong",
        url: "audio/Robert_DeLong-Global_Concepts.mp3",
        duration: "3:42",
        genre: "Electronic",
        visualization: "neon"
      },
      library: [
        {
          id: "chlorine",
          title: "Chlorine",
          artist: "twenty one pilots",
          url: "audio/Twenty_One_Pilots-Chlorine.mp3",
          duration: "5:24",
          genre: "Alternative",
          visualization: "particles"
        },
        {
          id: "11minutes",
          title: "11 Minutes",
          artist: "YUNGBLUD, Halsey",
          url: "audio/YUNGBLUD_Halsey-11_Minutes.mp3",
          duration: "3:41",
          genre: "Rock",
          visualization: "fractal"
        },
        {
          id: "gasoline",
          title: "Gasoline",
          artist: "Halsey",
          url: "audio/Halsey-Gasoline.mp3",
          duration: "3:17",
          genre: "Electropop",
          visualization: "dna"
        },
        {
          id: "high-enough",
          title: "High Enough",
          artist: "K.Flay",
          url: "audio/K_Flay-High_Enough.mp3",
          duration: "3:50",
          genre: "Alternative",
          visualization: "wave"
        },
        {
          id: "zen",
          title: "Zen",
          artist: "X Ambassadors, K.Flay",
          url: "audio/X_Ambassadors_K_Flay-Zen.mp3",
          duration: "3:37",
          genre: "Alternative Rock",
          visualization: "bars"
        }
      ]
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SongLoader;
}