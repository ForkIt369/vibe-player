// Performance Monitor and Adaptive Quality Manager

class PerformanceMonitor {
  constructor() {
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.lastFPSUpdate = 0;
    this.fpsHistory = [];
    this.maxHistorySize = 60;
    
    // Performance metrics
    this.metrics = {
      fps: 60,
      avgFps: 60,
      minFps: 60,
      maxFps: 60,
      frameTime: 16.67,
      memory: 0,
      battery: 1,
      charging: true
    };
    
    // Callbacks
    this.onFPSUpdate = null;
    this.onPerformanceWarning = null;
  }
  
  recordFrame() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    this.frameCount++;
    
    // Update FPS every 500ms
    if (now - this.lastFPSUpdate >= 500) {
      const elapsedSeconds = (now - this.lastFPSUpdate) / 1000;
      this.fps = Math.round(this.frameCount / elapsedSeconds);
      
      // Update history
      this.fpsHistory.push(this.fps);
      if (this.fpsHistory.length > this.maxHistorySize) {
        this.fpsHistory.shift();
      }
      
      // Calculate metrics
      this.updateMetrics();
      
      // Reset counters
      this.frameCount = 0;
      this.lastFPSUpdate = now;
      
      // Notify listeners
      if (this.onFPSUpdate) {
        this.onFPSUpdate(this.fps);
      }
      
      // Check for performance issues
      if (this.fps < 30 && this.onPerformanceWarning) {
        this.onPerformanceWarning('Low FPS detected');
      }
    }
    
    return delta;
  }
  
  updateMetrics() {
    if (this.fpsHistory.length === 0) return;
    
    // Calculate average FPS
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    this.metrics.avgFps = Math.round(sum / this.fpsHistory.length);
    
    // Calculate min/max FPS
    this.metrics.minFps = Math.min(...this.fpsHistory);
    this.metrics.maxFps = Math.max(...this.fpsHistory);
    
    // Current FPS
    this.metrics.fps = this.fps;
    
    // Frame time
    this.metrics.frameTime = this.fps > 0 ? 1000 / this.fps : 16.67;
    
    // Memory usage (if available)
    if (performance.memory) {
      this.metrics.memory = performance.memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    
    // Battery status (if available)
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        this.metrics.battery = battery.level;
        this.metrics.charging = battery.charging;
      });
    }
  }
  
  getPerformanceScore() {
    // Calculate a performance score (0-100)
    let score = 100;
    
    // FPS impact (most important)
    if (this.metrics.avgFps < 60) {
      score -= (60 - this.metrics.avgFps) * 1.5;
    }
    
    // Frame time impact
    if (this.metrics.frameTime > 16.67) {
      score -= Math.min(20, (this.metrics.frameTime - 16.67) * 2);
    }
    
    // Memory impact
    if (this.metrics.memory > 150) {
      score -= Math.min(10, (this.metrics.memory - 150) / 10);
    }
    
    // Battery impact
    if (!this.metrics.charging && this.metrics.battery < 0.2) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  reset() {
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.lastFPSUpdate = 0;
    this.fpsHistory = [];
  }
}

class QualityProfiles {
  static ultra = {
    particles: 500,
    particleSize: 3,
    particleTrails: true,
    particleConnections: 150,
    barCount: 64,
    fftSize: 2048,
    smoothing: 0.85,
    shadowBlur: 20,
    glowEffects: true,
    galaxyStars: 300,
    fractalDepth: 8,
    gridLines: 20,
    ribbonSegments: 200,
    waveSegments: 512
  };
  
  static high = {
    particles: 200,
    particleSize: 2.5,
    particleTrails: true,
    particleConnections: 80,
    barCount: 48,
    fftSize: 1024,
    smoothing: 0.8,
    shadowBlur: 15,
    glowEffects: true,
    galaxyStars: 200,
    fractalDepth: 6,
    gridLines: 15,
    ribbonSegments: 150,
    waveSegments: 256
  };
  
  static medium = {
    particles: 100,
    particleSize: 2,
    particleTrails: false,
    particleConnections: 50,
    barCount: 32,
    fftSize: 512,
    smoothing: 0.75,
    shadowBlur: 10,
    glowEffects: false,
    galaxyStars: 100,
    fractalDepth: 5,
    gridLines: 10,
    ribbonSegments: 100,
    waveSegments: 128
  };
  
  static low = {
    particles: 50,
    particleSize: 2,
    particleTrails: false,
    particleConnections: 0,
    barCount: 16,
    fftSize: 256,
    smoothing: 0.7,
    shadowBlur: 0,
    glowEffects: false,
    galaxyStars: 50,
    fractalDepth: 4,
    gridLines: 8,
    ribbonSegments: 50,
    waveSegments: 64
  };
}

class AdaptiveQualityManager {
  constructor() {
    this.monitor = new PerformanceMonitor();
    this.currentProfile = 'high';
    this.targetProfile = 'high';
    this.settings = QualityProfiles.high;
    this.autoMode = true;
    this.lastCheck = 0;
    this.checkInterval = 2000; // Check every 2 seconds
    
    // Quality history for smoothing
    this.qualityHistory = [];
    this.maxHistorySize = 5;
    
    // Callbacks
    this.onQualityChange = null;
    
    // Initial quality detection
    this.detectInitialQuality();
  }
  
  detectInitialQuality() {
    // Quick performance test
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1920;
    canvas.height = 1080;
    
    const startTime = performance.now();
    
    // Render test
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `hsl(${i * 3.6}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * 1920,
        Math.random() * 1080,
        Math.random() * 50,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    const renderTime = performance.now() - startTime;
    
    // Determine initial quality based on render time
    if (renderTime < 5) {
      this.setQuality('ultra');
    } else if (renderTime < 10) {
      this.setQuality('high');
    } else if (renderTime < 20) {
      this.setQuality('medium');
    } else {
      this.setQuality('low');
    }
    
    // Check device capabilities
    this.checkDeviceCapabilities();
  }
  
  checkDeviceCapabilities() {
    // Check for mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check screen resolution
    const pixelRatio = window.devicePixelRatio || 1;
    const screenWidth = window.screen.width * pixelRatio;
    const screenHeight = window.screen.height * pixelRatio;
    const totalPixels = screenWidth * screenHeight;
    
    // Adjust quality based on device
    if (isMobile) {
      // Mobile devices typically need lower quality
      if (this.currentProfile === 'ultra') {
        this.setQuality('high');
      }
      
      // Low-end mobile
      if (totalPixels < 1920 * 1080) {
        this.setQuality('medium');
      }
    }
    
    // High-DPI displays may need adjustment
    if (pixelRatio > 2 && this.currentProfile === 'ultra') {
      this.setQuality('high');
    }
  }
  
  update() {
    if (!this.autoMode) return;
    
    const now = performance.now();
    if (now - this.lastCheck < this.checkInterval) return;
    
    this.lastCheck = now;
    
    // Get performance score
    const score = this.monitor.getPerformanceScore();
    
    // Add to history
    this.qualityHistory.push(score);
    if (this.qualityHistory.length > this.maxHistorySize) {
      this.qualityHistory.shift();
    }
    
    // Calculate average score
    const avgScore = this.qualityHistory.reduce((a, b) => a + b, 0) / this.qualityHistory.length;
    
    // Determine target quality
    let newProfile = this.currentProfile;
    
    if (avgScore >= 90 && this.currentProfile !== 'ultra') {
      newProfile = this.upgradeProfile(this.currentProfile);
    } else if (avgScore >= 70 && avgScore < 90) {
      if (this.currentProfile !== 'high') {
        newProfile = avgScore > 80 ? this.upgradeProfile(this.currentProfile) : 'high';
      }
    } else if (avgScore >= 50 && avgScore < 70) {
      if (this.currentProfile !== 'medium') {
        newProfile = avgScore > 60 ? 'medium' : this.downgradeProfile(this.currentProfile);
      }
    } else if (avgScore < 50) {
      newProfile = this.downgradeProfile(this.currentProfile);
    }
    
    // Apply quality change if needed
    if (newProfile !== this.currentProfile) {
      this.setQuality(newProfile);
    }
  }
  
  setQuality(profile) {
    if (!QualityProfiles[profile]) {
      console.warn('Invalid quality profile:', profile);
      return;
    }
    
    const oldProfile = this.currentProfile;
    this.currentProfile = profile;
    this.settings = QualityProfiles[profile];
    
    // Notify listeners
    if (this.onQualityChange && oldProfile !== profile) {
      this.onQualityChange(profile, this.settings);
    }
  }
  
  upgradeProfile(profile) {
    const profiles = ['low', 'medium', 'high', 'ultra'];
    const currentIndex = profiles.indexOf(profile);
    if (currentIndex < profiles.length - 1) {
      return profiles[currentIndex + 1];
    }
    return profile;
  }
  
  downgradeProfile(profile) {
    const profiles = ['low', 'medium', 'high', 'ultra'];
    const currentIndex = profiles.indexOf(profile);
    if (currentIndex > 0) {
      return profiles[currentIndex - 1];
    }
    return profile;
  }
  
  setAutoMode(enabled) {
    this.autoMode = enabled;
    if (!enabled) {
      // Reset to high quality when auto mode is disabled
      this.setQuality('high');
    }
  }
  
  getSettings() {
    return this.settings;
  }
  
  getCurrentProfile() {
    return this.currentProfile;
  }
  
  getMonitor() {
    return this.monitor;
  }
}

// Object Pool for performance optimization
class ObjectPool {
  constructor(createFn, resetFn, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
    this.pool = [];
    this.active = [];
    
    // Pre-populate pool
    for (let i = 0; i < maxSize / 2; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  acquire() {
    let obj;
    
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    
    this.active.push(obj);
    return obj;
  }
  
  release(obj) {
    const index = this.active.indexOf(obj);
    if (index !== -1) {
      this.active.splice(index, 1);
      
      if (this.pool.length < this.maxSize) {
        this.resetFn(obj);
        this.pool.push(obj);
      }
    }
  }
  
  releaseAll() {
    while (this.active.length > 0) {
      const obj = this.active.pop();
      if (this.pool.length < this.maxSize) {
        this.resetFn(obj);
        this.pool.push(obj);
      }
    }
  }
  
  clear() {
    this.pool = [];
    this.active = [];
  }
}

// Export for use in other modules
window.PerformanceMonitor = PerformanceMonitor;
window.QualityProfiles = QualityProfiles;
window.AdaptiveQualityManager = AdaptiveQualityManager;
window.ObjectPool = ObjectPool;