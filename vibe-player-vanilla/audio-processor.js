// Audio Processor - Handles Web Audio API and audio analysis

class AudioProcessor {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.audio = null;
    this.dataArray = null;
    this.isPlaying = false;
    this.isLoaded = false;
    
    // Audio settings
    this.fftSize = 256;
    this.smoothingTimeConstant = 0.8;
    
    // Callbacks
    this.onTimeUpdate = null;
    this.onEnded = null;
    this.onLoadComplete = null;
    this.onError = null;
  }
  
  async loadAudioFile(file) {
    try {
      // Validate file
      if (!file || !file.type.startsWith('audio/')) {
        throw new Error('Invalid audio file');
      }
      
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size exceeds 50MB limit');
      }
      
      // Clean up previous audio
      this.cleanup();
      
      // Create audio element
      this.audio = new Audio();
      // Only set crossOrigin for external URLs, not blob URLs
      // this.audio.crossOrigin = 'anonymous';
      
      // Create object URL for the file
      const url = URL.createObjectURL(file);
      this.audio.src = url;
      
      // Wait for metadata to load with better error handling
      await new Promise((resolve, reject) => {
        const onLoadedMetadata = () => {
          console.log('Audio metadata loaded successfully');
          resolve();
        };
        
        const onError = (e) => {
          console.error('Audio load error:', e);
          const audioError = this.audio.error;
          if (audioError) {
            const errorMessages = {
              1: 'Audio loading aborted',
              2: 'Network error while loading audio',
              3: 'Audio decoding error - file may be corrupted or unsupported format',
              4: 'Audio format not supported'
            };
            reject(new Error(errorMessages[audioError.code] || `Audio error code: ${audioError.code}`));
          } else {
            reject(new Error('Failed to load audio file'));
          }
        };
        
        this.audio.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        this.audio.addEventListener('error', onError, { once: true });
        
        // Add timeout
        setTimeout(() => {
          this.audio.removeEventListener('loadedmetadata', onLoadedMetadata);
          this.audio.removeEventListener('error', onError);
          reject(new Error('Audio loading timeout - file may be too large or corrupted'));
        }, 15000);
      });
      
      // Initialize Web Audio API
      await this.initializeAudioContext();
      
      // Connect audio source
      this.connectAudioSource();
      
      // Set up event listeners
      this.setupAudioEventListeners();
      
      this.isLoaded = true;
      
      // Extract metadata
      const metadata = {
        name: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        duration: this.audio.duration,
        size: file.size,
        type: file.type
      };
      
      if (this.onLoadComplete) {
        this.onLoadComplete(metadata);
      }
      
      return metadata;
      
    } catch (error) {
      console.error('Error loading audio:', error);
      if (this.onError) {
        this.onError(error.message);
      }
      throw error;
    }
  }
  
  async initializeAudioContext() {
    try {
      if (!this.audioContext) {
        // Check for AudioContext support
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error('Web Audio API is not supported in this browser');
        }
        
        this.audioContext = new AudioContextClass();
        console.log('AudioContext created, state:', this.audioContext.state);
        
        // Resume context if suspended (common in mobile browsers)
        if (this.audioContext.state === 'suspended') {
          console.log('Resuming suspended AudioContext...');
          await this.audioContext.resume();
          console.log('AudioContext resumed, state:', this.audioContext.state);
        }
      }
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
      
      // Create data array for frequency data
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      console.log('Audio analysis initialized with buffer length:', bufferLength);
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      throw new Error('Audio initialization failed: ' + error.message);
    }
  }
  
  connectAudioSource() {
    if (this.source) {
      this.source.disconnect();
    }
    
    // Create media element source
    this.source = this.audioContext.createMediaElementSource(this.audio);
    
    // Connect nodes: source -> analyser -> destination
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }
  
  setupAudioEventListeners() {
    // Time update event
    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdate) {
        this.onTimeUpdate({
          currentTime: this.audio.currentTime,
          duration: this.audio.duration,
          progress: (this.audio.currentTime / this.audio.duration) * 100
        });
      }
    });
    
    // Ended event
    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      if (this.onEnded) {
        this.onEnded();
      }
    });
    
    // Error event
    this.audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      if (this.onError) {
        this.onError('Playback error occurred');
      }
    });
  }
  
  async play() {
    if (!this.audio || !this.isLoaded) return;
    
    try {
      // Resume audio context if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      await this.audio.play();
      this.isPlaying = true;
    } catch (error) {
      console.error('Error playing audio:', error);
      if (this.onError) {
        this.onError('Failed to play audio');
      }
    }
  }
  
  pause() {
    if (!this.audio) return;
    
    this.audio.pause();
    this.isPlaying = false;
  }
  
  seek(time) {
    if (!this.audio || !this.isLoaded) return;
    
    // Clamp time to valid range
    const clampedTime = Math.max(0, Math.min(time, this.audio.duration));
    this.audio.currentTime = clampedTime;
  }
  
  seekToPercent(percent) {
    if (!this.audio || !this.isLoaded) return;
    
    const time = (percent / 100) * this.audio.duration;
    this.seek(time);
  }
  
  setVolume(volume) {
    if (!this.audio) return;
    
    // Clamp volume between 0 and 1
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }
  
  getFrequencyData() {
    if (!this.analyser || !this.dataArray) {
      return new Uint8Array(128);
    }
    
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
  
  getTimeDomainData() {
    if (!this.analyser) {
      return new Uint8Array(128);
    }
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }
  
  getAverageFrequency() {
    const data = this.getFrequencyData();
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
  }
  
  getBassFrequency() {
    const data = this.getFrequencyData();
    // Bass frequencies are in the lower range (0-10% of the spectrum)
    const bassRange = Math.floor(data.length * 0.1);
    let sum = 0;
    for (let i = 0; i < bassRange; i++) {
      sum += data[i];
    }
    return sum / bassRange;
  }
  
  getMidFrequency() {
    const data = this.getFrequencyData();
    // Mid frequencies are in the middle range (10-60% of the spectrum)
    const startIndex = Math.floor(data.length * 0.1);
    const endIndex = Math.floor(data.length * 0.6);
    let sum = 0;
    for (let i = startIndex; i < endIndex; i++) {
      sum += data[i];
    }
    return sum / (endIndex - startIndex);
  }
  
  getTrebleFrequency() {
    const data = this.getFrequencyData();
    // Treble frequencies are in the upper range (60-100% of the spectrum)
    const startIndex = Math.floor(data.length * 0.6);
    let sum = 0;
    for (let i = startIndex; i < data.length; i++) {
      sum += data[i];
    }
    return sum / (data.length - startIndex);
  }
  
  updateFFTSize(size) {
    if (!this.analyser) return;
    
    // Validate FFT size (must be power of 2)
    const validSizes = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
    if (!validSizes.includes(size)) {
      console.warn('Invalid FFT size, using default');
      size = 256;
    }
    
    this.fftSize = size;
    this.analyser.fftSize = size;
    
    // Update data array
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
  }
  
  updateSmoothing(value) {
    if (!this.analyser) return;
    
    // Clamp between 0 and 1
    this.smoothingTimeConstant = Math.max(0, Math.min(1, value));
    this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
  }
  
  getCurrentTime() {
    return this.audio ? this.audio.currentTime : 0;
  }
  
  getDuration() {
    return this.audio ? this.audio.duration : 0;
  }
  
  getProgress() {
    if (!this.audio || !this.audio.duration) return 0;
    return (this.audio.currentTime / this.audio.duration) * 100;
  }
  
  cleanup() {
    // Pause audio
    if (this.audio) {
      this.audio.pause();
      
      // Revoke object URL
      if (this.audio.src && this.audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(this.audio.src);
      }
      
      // Remove event listeners
      this.audio.removeEventListener('timeupdate', null);
      this.audio.removeEventListener('ended', null);
      this.audio.removeEventListener('error', null);
    }
    
    // Disconnect audio nodes
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    
    // Reset state
    this.audio = null;
    this.dataArray = null;
    this.isPlaying = false;
    this.isLoaded = false;
  }
  
  destroy() {
    this.cleanup();
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    // Clear callbacks
    this.onTimeUpdate = null;
    this.onEnded = null;
    this.onLoadComplete = null;
    this.onError = null;
  }
}

// Export for use in other modules
window.AudioProcessor = AudioProcessor;