import CircularBuffer from '../utils/circular-buffer.js';

class PerformanceMonitor {
  constructor() {
    this.samples = {
      fps: new CircularBuffer(60),      // 1 second of samples
      frameTime: new CircularBuffer(60),
      memory: new CircularBuffer(30),    // Sample every 2 frames
      battery: null
    };
    
    this.thresholds = {
      criticalFPS: 25,
      lowFPS: 45,
      highFPS: 58,
      criticalFrameTime: 40,
      highFrameTime: 20,
      lowMemory: 50 * 1024 * 1024,  // 50MB available
    };
    
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
  }

  startMonitoring() {
    // Monitor battery
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        this.battery = battery;
        battery.addEventListener('levelchange', () => {
          this.onBatteryChange(battery.level);
        });
      });
    }

    // Monitor memory (if available)
    if (performance.memory) {
      setInterval(() => {
        const used = performance.memory.usedJSHeapSize;
        const limit = performance.memory.jsHeapSizeLimit;
        this.samples.memory.push(limit - used);
      }, 100);
    }
  }

  recordFrame() {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    
    this.samples.frameTime.push(frameTime);
    this.frameCount++;
    
    // Calculate FPS every second
    if (this.frameCount % 60 === 0) {
      const fps = 1000 / this.samples.frameTime.average();
      this.samples.fps.push(fps);
    }
    
    this.lastFrameTime = now;
  }

  getMetrics() {
    return {
      fps: this.samples.fps.average(),
      frameTime: this.samples.frameTime.average(),
      memory: this.samples.memory.average(),
      battery: this.battery ? this.battery.level : 1,
      charging: this.battery ? this.battery.charging : false
    };
  }

  getPerformanceScore() {
    const metrics = this.getMetrics();
    let score = 100;

    // FPS impact (0-40 points)
    if (metrics.fps < this.thresholds.criticalFPS) {
      score -= 40;
    } else if (metrics.fps < this.thresholds.lowFPS) {
      score -= 20;
    } else if (metrics.fps < this.thresholds.highFPS) {
      score -= 10;
    }

    // Frame time impact (0-30 points)
    if (metrics.frameTime > this.thresholds.criticalFrameTime) {
      score -= 30;
    } else if (metrics.frameTime > this.thresholds.highFrameTime) {
      score -= 15;
    }

    // Memory impact (0-20 points)
    if (metrics.memory < this.thresholds.lowMemory) {
      score -= 20;
    }

    // Battery impact (0-10 points)
    if (!metrics.charging && metrics.battery < 0.2) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  onBatteryChange(level) {
    // Override this method if needed
  }
}

export default PerformanceMonitor;