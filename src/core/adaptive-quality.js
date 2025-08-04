import PerformanceMonitor from './performance-monitor.js';
import CircularBuffer from '../utils/circular-buffer.js';
import QualityProfiles from './quality-profiles.js';

class AdaptiveQualityManager {
  constructor(visualizer) {
    this.visualizer = visualizer;
    this.monitor = new PerformanceMonitor();
    this.currentProfile = 'high';
    this.targetProfile = 'high';
    this.transitionSpeed = 0.1;
    
    this.qualityHistory = new CircularBuffer(10);
    this.lastQualityCheck = 0;
    this.checkInterval = 1000; // Check every second
    
    this.enabled = true;
    this.locked = false;
  }

  initialize() {
    this.monitor.startMonitoring();
    this.detectInitialQuality();
    this.applyProfile(this.currentProfile);
  }

  detectInitialQuality() {
    // Quick performance test
    const testCanvas = document.createElement('canvas');
    const ctx = testCanvas.getContext('2d');
    testCanvas.width = 1920;
    testCanvas.height = 1080;
    
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
    
    // Determine initial quality
    if (renderTime < 5) {
      this.currentProfile = 'ultra';
    } else if (renderTime < 10) {
      this.currentProfile = 'high';
    } else if (renderTime < 20) {
      this.currentProfile = 'medium';
    } else {
      this.currentProfile = 'low';
    }
  }

  update() {
    if (!this.enabled || this.locked) return;
    
    this.monitor.recordFrame();
    
    const now = performance.now();
    if (now - this.lastQualityCheck > this.checkInterval) {
      this.evaluateQuality();
      this.lastQualityCheck = now;
    }
  }

  evaluateQuality() {
    const score = this.monitor.getPerformanceScore();
    const metrics = this.monitor.getMetrics();
    
    this.qualityHistory.push(score);
    const avgScore = this.qualityHistory.average();
    
    // Determine target quality
    if (avgScore >= 90) {
      this.targetProfile = 'ultra';
    } else if (avgScore >= 70) {
      this.targetProfile = 'high';
    } else if (avgScore >= 50) {
      this.targetProfile = 'medium';
    } else {
      this.targetProfile = 'low';
    }
    
    // Battery-aware adjustments
    if (metrics.battery < 0.2 && !metrics.charging) {
      this.targetProfile = this.downgradeProfile(this.targetProfile);
    }
    
    // Apply changes gradually
    if (this.targetProfile !== this.currentProfile) {
      this.transitionToProfile(this.targetProfile);
    }
  }

  transitionToProfile(targetProfile) {
    const profiles = ['low', 'medium', 'high', 'ultra'];
    const currentIndex = profiles.indexOf(this.currentProfile);
    const targetIndex = profiles.indexOf(targetProfile);
    
    // Step-wise transition
    if (currentIndex < targetIndex) {
      this.currentProfile = profiles[currentIndex + 1];
    } else if (currentIndex > targetIndex) {
      this.currentProfile = profiles[currentIndex - 1];
    }
    
    this.applyProfile(this.currentProfile);
    
    // Show notification
    this.showQualityNotification(this.currentProfile);
  }

  applyProfile(profileName) {
    const profile = QualityProfiles[profileName];
    
    // Update visualizer settings
    this.visualizer.settings = { ...this.visualizer.settings, ...profile };
    
    // Update analyzer
    if (this.visualizer.analyser) {
      this.visualizer.analyser.fftSize = profile.fftSize;
      this.visualizer.analyser.smoothingTimeConstant = profile.smoothing;
    }
    
    // Update canvas scale
    const canvas = this.visualizer.canvas;
    const scale = profile.canvasScale;
    canvas.width = window.innerWidth * window.devicePixelRatio * scale;
    canvas.height = window.innerHeight * window.devicePixelRatio * scale;
    
    console.log(`Quality profile changed to: ${profileName}`);
  }

  showQualityNotification(profile) {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    
    // Could add visual notification here
  }

  downgradeProfile(profile) {
    const profiles = ['low', 'medium', 'high', 'ultra'];
    const index = profiles.indexOf(profile);
    return index > 0 ? profiles[index - 1] : profile;
  }

  lockQuality(profile) {
    this.locked = true;
    this.currentProfile = profile;
    this.applyProfile(profile);
  }

  unlockQuality() {
    this.locked = false;
  }

  getMonitor() {
    return this.monitor;
  }
}

export default AdaptiveQualityManager;