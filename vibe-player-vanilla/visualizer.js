// Visualizer Engine - 9 Visualization Modes

class Visualizer {
  constructor(canvas, audioProcessor, qualityManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    });
    
    this.audioProcessor = audioProcessor;
    this.qualityManager = qualityManager;
    
    // Current visualization
    this.currentMode = 'bars';
    this.nextMode = null;
    this.transitionProgress = 0;
    this.transitionSpeed = 0.05;
    
    // Animation
    this.animationId = null;
    this.time = 0;
    this.lastFrameTime = performance.now();
    
    // Agent colors
    this.colors = {
      bigSis: '#00D4FF',
      bro: '#FF9500',
      lilSis: '#D946EF',
      cbo: '#30D158'
    };
    
    // Particles system
    this.particles = [];
    this.particlePool = null;
    this.initParticlePool();
    
    // Ribbons
    this.ribbons = [];
    
    // Galaxy
    this.galaxyRotation = 0;
    
    // DNA
    this.dnaRotation = 0;
    
    // Fractal
    this.fractalAngle = 0;
    
    // Grid
    this.gridOffset = 0;
    
    // Canvas setup
    this.resizeCanvas();
    
    // Debounced resize handler for better mobile performance
    let resizeTimeout = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.resizeCanvas();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Also listen for visibility changes (important for mobile)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.resizeCanvas();
      }
    });
  }
  
  initParticlePool() {
    this.particlePool = new ObjectPool(
      () => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        color: this.colors.bigSis,
        alpha: 1,
        life: 1,
        maxLife: 1
      }),
      (particle) => {
        particle.x = 0;
        particle.y = 0;
        particle.vx = 0;
        particle.vy = 0;
        particle.alpha = 1;
        particle.life = 1;
        particle.maxLife = 1;
      },
      500
    );
  }
  
  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    
    // Get parent container dimensions instead of using getBoundingClientRect
    const parent = this.canvas.parentElement;
    if (!parent) return;
    
    // Use offsetWidth/offsetHeight for more reliable sizing on mobile
    const width = parent.offsetWidth || parent.clientWidth;
    const height = parent.offsetHeight || parent.clientHeight;
    
    // Ensure minimum dimensions
    if (width <= 0 || height <= 0) return;
    
    // Set canvas dimensions
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    
    // Set CSS dimensions
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    
    // Scale context for device pixel ratio
    this.ctx.scale(dpr, dpr);
    
    // Update logical size
    this.width = width;
    this.height = height;
  }
  
  start() {
    if (this.animationId) return;
    this.animate();
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Update time
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.time += deltaTime * 0.001;
    
    // Record frame for performance monitoring
    if (this.qualityManager) {
      this.qualityManager.monitor.recordFrame();
      this.qualityManager.update();
    }
    
    // Clear canvas
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Get audio data
    const dataArray = this.audioProcessor ? this.audioProcessor.getFrequencyData() : new Uint8Array(128);
    
    // Handle transitions
    if (this.nextMode && this.transitionProgress < 1) {
      this.transitionProgress += this.transitionSpeed;
      
      if (this.transitionProgress >= 1) {
        this.currentMode = this.nextMode;
        this.nextMode = null;
        this.transitionProgress = 0;
      } else {
        // Draw both visualizations with fade
        this.ctx.save();
        this.ctx.globalAlpha = 1 - this.transitionProgress;
        this.drawVisualization(this.currentMode, dataArray);
        this.ctx.restore();
        
        this.ctx.save();
        this.ctx.globalAlpha = this.transitionProgress;
        this.drawVisualization(this.nextMode, dataArray);
        this.ctx.restore();
        return;
      }
    }
    
    // Draw current visualization
    this.drawVisualization(this.currentMode, dataArray);
  }
  
  drawVisualization(mode, dataArray) {
    const settings = this.qualityManager ? this.qualityManager.getSettings() : QualityProfiles.high;
    
    switch (mode) {
      case 'bars':
        this.drawBars(dataArray, settings);
        break;
      case 'wave':
        this.drawWave(dataArray, settings);
        break;
      case 'circle':
        this.drawCircle(dataArray, settings);
        break;
      case 'particles':
        this.drawParticles(dataArray, settings);
        break;
      case 'galaxy':
        this.drawGalaxy(dataArray, settings);
        break;
      case 'dna':
        this.drawDNA(dataArray, settings);
        break;
      case 'ribbons':
        this.drawRibbons(dataArray, settings);
        break;
      case 'fractal':
        this.drawFractal(dataArray, settings);
        break;
      case 'neonGrid':
        this.drawNeonGrid(dataArray, settings);
        break;
    }
  }
  
  setMode(mode) {
    if (mode === this.currentMode) return;
    this.nextMode = mode;
    this.transitionProgress = 0;
  }
  
  // Visualization 1: Bars
  drawBars(dataArray, settings) {
    const barCount = settings.barCount || 32;
    const barWidth = this.width / barCount;
    const barGap = barWidth * 0.2;
    const actualBarWidth = barWidth - barGap;
    
    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * dataArray.length * 0.7);
      const value = dataArray[dataIndex] / 255;
      const barHeight = value * this.height * 0.8;
      
      // Create gradient based on frequency range
      const gradient = this.ctx.createLinearGradient(0, this.height - barHeight, 0, this.height);
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
      
      // Draw bar with rounded top
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.roundRect(
        i * barWidth + barGap / 2,
        this.height - barHeight,
        actualBarWidth,
        barHeight,
        [actualBarWidth / 4, actualBarWidth / 4, 0, 0]
      );
      this.ctx.fill();
      
      // Add glow effect for high values
      if (value > 0.7 && settings.glowEffects) {
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = gradient.addColorStop(0, this.colors.bigSis);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    }
  }
  
  // Visualization 2: Wave
  drawWave(dataArray, settings) {
    const centerY = this.height / 2;
    const segments = settings.waveSegments || 256;
    
    // Draw upper waveform
    this.ctx.beginPath();
    this.ctx.moveTo(0, centerY);
    
    for (let i = 0; i < segments; i++) {
      const dataIndex = Math.floor((i / segments) * dataArray.length);
      const x = (i / segments) * this.width;
      const amplitude = (dataArray[dataIndex] / 255) * (this.height * 0.4);
      const y = centerY - amplitude * Math.sin(this.time * 2 + i * 0.1);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        const prevX = ((i - 1) / segments) * this.width;
        const midX = (prevX + x) / 2;
        this.ctx.quadraticCurveTo(prevX, y, midX, y);
      }
    }
    
    // Mirror for lower waveform
    for (let i = segments - 1; i >= 0; i--) {
      const dataIndex = Math.floor((i / segments) * dataArray.length);
      const x = (i / segments) * this.width;
      const amplitude = (dataArray[dataIndex] / 255) * (this.height * 0.4);
      const y = centerY + amplitude * Math.sin(this.time * 2 + i * 0.1);
      this.ctx.lineTo(x, y);
    }
    
    this.ctx.closePath();
    
    // Create gradient fill
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, `${this.colors.bigSis}20`);
    gradient.addColorStop(0.5, `${this.colors.bigSis}60`);
    gradient.addColorStop(1, `${this.colors.bigSis}20`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    // Draw outline with glow
    if (settings.glowEffects) {
      this.ctx.strokeStyle = this.colors.bigSis;
      this.ctx.lineWidth = 2;
      this.ctx.shadowBlur = settings.shadowBlur || 10;
      this.ctx.shadowColor = this.colors.bigSis;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }
  }
  
  // Visualization 3: Circle
  drawCircle(dataArray, settings) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const baseRadius = Math.min(this.width, this.height) * 0.2;
    const maxRadius = Math.min(this.width, this.height) * 0.4;
    const bars = dataArray.length;
    
    // Draw center circle
    const avgFreq = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const pulseScale = 1 + (avgFreq / 255) * 0.2;
    
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, baseRadius * pulseScale, 0, Math.PI * 2);
    const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * pulseScale);
    gradient.addColorStop(0, `${this.colors.bigSis}60`);
    gradient.addColorStop(1, `${this.colors.bigSis}10`);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    // Draw frequency bars around circle
    for (let i = 0; i < bars; i++) {
      const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
      const value = dataArray[i] / 255;
      const barHeight = value * (maxRadius - baseRadius);
      
      const x1 = centerX + Math.cos(angle) * (baseRadius * pulseScale + 5);
      const y1 = centerY + Math.sin(angle) * (baseRadius * pulseScale + 5);
      const x2 = centerX + Math.cos(angle) * (baseRadius * pulseScale + 5 + barHeight);
      const y2 = centerY + Math.sin(angle) * (baseRadius * pulseScale + 5 + barHeight);
      
      // Color based on frequency range
      let color;
      if (i < bars * 0.25) {
        color = this.colors.bigSis;
      } else if (i < bars * 0.5) {
        color = this.colors.bro;
      } else if (i < bars * 0.75) {
        color = this.colors.lilSis;
      } else {
        color = this.colors.cbo;
      }
      
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
      
      // Add glow for high values
      if (value > 0.7 && settings.glowEffects) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      }
    }
  }
  
  // Visualization 4: Particles
  drawParticles(dataArray, settings) {
    const avgFreq = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const intensity = avgFreq / 255;
    
    // Spawn new particles based on audio intensity
    const spawnCount = Math.floor(intensity * 5);
    for (let i = 0; i < spawnCount; i++) {
      if (this.particles.length < settings.particles) {
        const particle = this.particlePool.acquire();
        particle.x = this.width / 2;
        particle.y = this.height / 2;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + intensity * 3;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        particle.size = settings.particleSize || 2;
        particle.maxLife = 100;
        particle.life = particle.maxLife;
        
        // Color based on frequency
        const bass = this.audioProcessor ? this.audioProcessor.getBassFrequency() / 255 : 0;
        const mid = this.audioProcessor ? this.audioProcessor.getMidFrequency() / 255 : 0;
        const treble = this.audioProcessor ? this.audioProcessor.getTrebleFrequency() / 255 : 0;
        
        if (bass > mid && bass > treble) {
          particle.color = this.colors.bro;
        } else if (mid > treble) {
          particle.color = this.colors.bigSis;
        } else {
          particle.color = this.colors.lilSis;
        }
        
        this.particles.push(particle);
      }
    }
    
    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Apply gravity
      particle.vy += 0.1;
      
      // Update life
      particle.life--;
      particle.alpha = particle.life / particle.maxLife;
      
      // Draw particle
      this.ctx.save();
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw trail if enabled
      if (settings.particleTrails && particle.life > particle.maxLife * 0.7) {
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(particle.x - particle.vx * 3, particle.y - particle.vy * 3);
        this.ctx.stroke();
      }
      
      this.ctx.restore();
      
      // Remove dead particles
      if (particle.life <= 0 || particle.x < 0 || particle.x > this.width || 
          particle.y < 0 || particle.y > this.height) {
        this.particles.splice(i, 1);
        this.particlePool.release(particle);
      }
    }
    
    // Draw connections between nearby particles
    if (settings.particleConnections > 0) {
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const p1 = this.particles[i];
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < settings.particleConnections) {
            const alpha = (1 - distance / settings.particleConnections) * 0.5 * Math.min(p1.alpha, p2.alpha);
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.strokeStyle = this.colors.bigSis;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
            this.ctx.restore();
          }
        }
      }
    }
  }
  
  // Visualization 5: Galaxy
  drawGalaxy(dataArray, settings) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const avgFreq = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const intensity = avgFreq / 255;
    
    // Update rotation
    this.galaxyRotation += 0.01 + intensity * 0.02;
    
    // Draw galaxy arms
    const arms = 4;
    const stars = settings.galaxyStars || 200;
    
    for (let arm = 0; arm < arms; arm++) {
      const armAngle = (arm / arms) * Math.PI * 2;
      
      for (let i = 0; i < stars / arms; i++) {
        const distance = (i / (stars / arms)) * Math.min(this.width, this.height) * 0.4;
        const angle = armAngle + (i * 0.1) + this.galaxyRotation;
        const dataIndex = Math.floor((i / (stars / arms)) * dataArray.length);
        const value = dataArray[dataIndex] / 255;
        
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        // Star size based on frequency
        const size = 1 + value * 3;
        
        // Color based on distance
        let color;
        if (distance < 100) {
          color = this.colors.bigSis;
        } else if (distance < 200) {
          color = this.colors.bro;
        } else {
          color = this.colors.lilSis;
        }
        
        // Draw star
        this.ctx.save();
        this.ctx.globalAlpha = 0.8 + value * 0.2;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add glow for bright stars
        if (value > 0.6 && settings.glowEffects) {
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = color;
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
        }
        
        this.ctx.restore();
      }
    }
    
    // Draw center
    const centerGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
    centerGradient.addColorStop(0, `${this.colors.cbo}80`);
    centerGradient.addColorStop(1, `${this.colors.cbo}00`);
    this.ctx.fillStyle = centerGradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 50 + intensity * 20, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  // Visualization 6: DNA
  drawDNA(dataArray, settings) {
    const centerX = this.width / 2;
    const amplitude = 100;
    const wavelength = 50;
    const points = 100;
    
    // Update rotation
    this.dnaRotation += 0.03;
    
    // Draw two helixes
    for (let helix = 0; helix < 2; helix++) {
      const phaseShift = helix * Math.PI;
      
      this.ctx.beginPath();
      
      for (let i = 0; i < points; i++) {
        const y = (i / points) * this.height;
        const dataIndex = Math.floor((i / points) * dataArray.length);
        const value = dataArray[dataIndex] / 255;
        
        const x = centerX + Math.sin(y / wavelength + this.dnaRotation + phaseShift) * amplitude * (1 + value * 0.5);
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      // Style based on helix
      this.ctx.strokeStyle = helix === 0 ? this.colors.bigSis : this.colors.lilSis;
      this.ctx.lineWidth = 3;
      
      if (settings.glowEffects) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = helix === 0 ? this.colors.bigSis : this.colors.lilSis;
      }
      
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }
    
    // Draw connections between helixes
    for (let i = 0; i < points; i += 5) {
      const y = (i / points) * this.height;
      const dataIndex = Math.floor((i / points) * dataArray.length);
      const value = dataArray[dataIndex] / 255;
      
      const x1 = centerX + Math.sin(y / wavelength + this.dnaRotation) * amplitude * (1 + value * 0.5);
      const x2 = centerX + Math.sin(y / wavelength + this.dnaRotation + Math.PI) * amplitude * (1 + value * 0.5);
      
      this.ctx.strokeStyle = `${this.colors.cbo}${Math.floor(value * 255).toString(16).padStart(2, '0')}`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y);
      this.ctx.lineTo(x2, y);
      this.ctx.stroke();
    }
  }
  
  // Visualization 7: Ribbons
  drawRibbons(dataArray, settings) {
    const segments = settings.ribbonSegments || 150;
    const layers = settings.ribbonLayers || 4;
    
    // Update or create ribbons
    if (this.ribbons.length === 0) {
      for (let i = 0; i < layers; i++) {
        this.ribbons.push({
          points: [],
          color: Object.values(this.colors)[i % 4],
          offset: i * 0.2
        });
      }
    }
    
    // Update ribbon points
    for (let r = 0; r < this.ribbons.length; r++) {
      const ribbon = this.ribbons[r];
      
      // Add new point
      const dataIndex = Math.floor((r / layers) * dataArray.length);
      const value = dataArray[dataIndex] / 255;
      const y = this.height / 2 + Math.sin(this.time * 2 + ribbon.offset) * (this.height * 0.3) * value;
      
      ribbon.points.push({ x: this.width, y: y });
      
      // Remove old points
      if (ribbon.points.length > segments) {
        ribbon.points.shift();
      }
      
      // Move points left
      for (let i = 0; i < ribbon.points.length; i++) {
        ribbon.points[i].x -= this.width / segments;
      }
    }
    
    // Draw ribbons
    for (let r = 0; r < this.ribbons.length; r++) {
      const ribbon = this.ribbons[r];
      
      if (ribbon.points.length < 2) continue;
      
      this.ctx.beginPath();
      this.ctx.moveTo(ribbon.points[0].x, ribbon.points[0].y);
      
      for (let i = 1; i < ribbon.points.length; i++) {
        const prev = ribbon.points[i - 1];
        const curr = ribbon.points[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        
        this.ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
      }
      
      // Fill area under ribbon
      const lastPoint = ribbon.points[ribbon.points.length - 1];
      this.ctx.lineTo(lastPoint.x, this.height);
      this.ctx.lineTo(ribbon.points[0].x, this.height);
      this.ctx.closePath();
      
      // Create gradient
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
      gradient.addColorStop(0, `${ribbon.color}40`);
      gradient.addColorStop(1, `${ribbon.color}10`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      
      // Draw ribbon outline
      this.ctx.strokeStyle = ribbon.color;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = 0.8;
      
      if (settings.glowEffects) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = ribbon.color;
      }
      
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
      this.ctx.shadowBlur = 0;
    }
  }
  
  // Visualization 8: Fractal
  drawFractal(dataArray, settings) {
    const centerX = this.width / 2;
    const avgFreq = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const intensity = avgFreq / 255;
    
    // Update angle
    this.fractalAngle += 0.01 + intensity * 0.02;
    
    const drawBranch = (x, y, length, angle, depth) => {
      if (depth <= 0 || length < 2) return;
      
      const dataIndex = Math.floor((depth / settings.fractalDepth) * dataArray.length);
      const value = dataArray[dataIndex] / 255;
      
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      
      // Color based on depth
      const colorIndex = depth % 4;
      const color = Object.values(this.colors)[colorIndex];
      
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = depth / 2;
      this.ctx.globalAlpha = 0.8;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      
      // Recursively draw branches
      const angleVariation = Math.PI / 6 + value * Math.PI / 6;
      drawBranch(endX, endY, length * 0.7, angle - angleVariation, depth - 1);
      drawBranch(endX, endY, length * 0.7, angle + angleVariation, depth - 1);
    };
    
    // Draw main trunk
    const baseAngle = -Math.PI / 2 + Math.sin(this.fractalAngle) * 0.2;
    drawBranch(centerX, this.height - 50, 100 + intensity * 50, baseAngle, settings.fractalDepth || 6);
    
    this.ctx.globalAlpha = 1;
  }
  
  // Visualization 9: Neon Grid
  drawNeonGrid(dataArray, settings) {
    const gridLines = settings.gridLines || 15;
    const perspective = 400;
    const horizonY = this.height * 0.4;
    
    // Update grid offset
    const avgFreq = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const speed = 2 + (avgFreq / 255) * 5;
    this.gridOffset += speed;
    
    // Draw vertical lines
    for (let i = 0; i <= gridLines; i++) {
      const x = (i / gridLines) * this.width;
      
      this.ctx.strokeStyle = this.colors.bigSis;
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 0.5;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, horizonY);
      this.ctx.lineTo(x, this.height);
      
      if (settings.glowEffects) {
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = this.colors.bigSis;
      }
      
      this.ctx.stroke();
    }
    
    // Draw horizontal lines with perspective
    const lineSpacing = 30;
    const lineCount = 20;
    
    for (let i = 0; i < lineCount; i++) {
      const offset = (this.gridOffset % lineSpacing) / lineSpacing;
      const z = (i + offset) * lineSpacing;
      const scale = perspective / (perspective + z);
      const y = horizonY + (1 - scale) * (this.height - horizonY);
      const alpha = scale * 0.8;
      
      // Get frequency data for this line
      const dataIndex = Math.floor((i / lineCount) * dataArray.length);
      const value = dataArray[dataIndex] / 255;
      
      // Color based on frequency
      let color = this.colors.bigSis;
      if (value > 0.7) {
        color = this.colors.bro;
      } else if (value > 0.4) {
        color = this.colors.lilSis;
      }
      
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2 * scale;
      this.ctx.globalAlpha = alpha;
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      
      if (settings.glowEffects && value > 0.5) {
        this.ctx.shadowBlur = 10 * value;
        this.ctx.shadowColor = color;
      }
      
      this.ctx.stroke();
    }
    
    // Draw sun/moon
    const sunX = this.width / 2;
    const sunY = horizonY - 50;
    const sunRadius = 40 + avgFreq / 255 * 20;
    
    const sunGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
    sunGradient.addColorStop(0, this.colors.bro);
    sunGradient.addColorStop(0.5, `${this.colors.bro}80`);
    sunGradient.addColorStop(1, `${this.colors.bro}00`);
    
    this.ctx.fillStyle = sunGradient;
    this.ctx.globalAlpha = 1;
    this.ctx.beginPath();
    this.ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }
  
  // Cleanup
  destroy() {
    this.stop();
    this.particlePool.clear();
    this.particles = [];
    this.ribbons = [];
  }
}

// Export for use in other modules
window.Visualizer = Visualizer;