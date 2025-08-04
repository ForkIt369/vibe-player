# Vibe Player - Tech Stack & Visualization System

## Overview
Vibe Player is a high-performance audio visualizer built as a Telegram Mini App using vanilla JavaScript and modern web APIs. The system creates real-time, audio-reactive visualizations with smooth 60fps animations.

## Core Technology Stack

### Frontend Technologies
- **Vanilla JavaScript (ES6+)** - No framework dependencies for maximum performance
- **HTML5 Canvas API** - Hardware-accelerated 2D graphics rendering
- **Web Audio API** - Real-time audio analysis and frequency data extraction
- **Telegram Mini Apps SDK** - Integration with Telegram's native features

### Audio Processing Pipeline
```
Audio File → Audio Element → Web Audio Context → Analyser Node → Frequency Data → Visualizations
```

### Key APIs Used
1. **AudioContext** - Core audio processing interface
2. **AnalyserNode** - FFT (Fast Fourier Transform) for frequency analysis
3. **Canvas 2D Context** - Graphics rendering with hardware acceleration
4. **requestAnimationFrame** - Smooth 60fps animation loop
5. **File API** - Local file handling and blob URLs

## Visualization System Architecture

### Core Components

#### 1. Audio Analysis System
```javascript
// FFT Configuration
analyser.fftSize = 256; // 128 frequency bins
analyser.smoothingTimeConstant = 0.8; // Temporal smoothing
```

#### 2. Animation Engine
- Time-based animations with `this.time` accumulator
- Frame-independent timing for consistent motion
- Transition system with alpha blending for smooth visualization switching

#### 3. Color System (DDV Codex)
```javascript
colors = {
  bigSis: '#00D4FF', // Analytics, data
  bro: '#FF9500',    // Action, energy
  lilSis: '#D946EF', // Creative, playful
  cbo: '#30D158'     // Business, growth
}
```

## Visualization Types & Techniques

### 1. **Frequency Bars** (`drawBars`)
- **Technique**: Direct frequency magnitude mapping
- **Features**: Gradient coloring based on frequency ranges
- **Performance**: O(n) where n = bar count

### 2. **Waveform** (`drawWave`)
- **Technique**: Mirrored waveform with quadratic curves
- **Features**: Smooth interpolation, gradient fill
- **Performance**: O(n) for frequency bins

### 3. **Circular** (`drawCircle`)
- **Technique**: Radial frequency mapping
- **Features**: Dynamic radius based on average intensity
- **Performance**: O(360) for smooth circle

### 4. **Particle Flow** (`drawParticles`)
- **Technique**: Particle system with proximity connections
- **Features**: 200 particles, distance-based line rendering
- **Performance**: O(n²) for connections

### 5. **Galaxy Spiral** (`drawGalaxy`)
- **Technique**: Rotating spiral arms with time-based animation
- **Features**: 4 spiral arms, frequency-modulated width
- **Performance**: O(arms × points)

### 6. **DNA Helix** (`drawDNA`)
- **Technique**: Sine wave modulation in 3D projection
- **Features**: Double helix with connecting bridges
- **Performance**: O(height)

### 7. **Ribbon Flow** (`drawRibbons`)
- **Technique**: Multi-layered sine waves with audio modulation
- **Features**: 5 ribbons, gradient fills, shadow effects
- **Performance**: O(ribbons × segments)

### 8. **Fractal Tree** (`drawFractal`)
- **Technique**: Recursive branch generation
- **Features**: Audio-reactive branching angles
- **Performance**: O(2^depth) - limited to depth 8

### 9. **Neon Grid** (`drawNeonGrid`)
- **Technique**: Perspective projection with vanishing point
- **Features**: Synthwave aesthetic, audio-reactive sun
- **Performance**: O(grid lines)

## Performance Optimizations

### Canvas Optimizations
```javascript
// Hardware acceleration hints
ctx = canvas.getContext('2d', {
  alpha: false,         // No transparency
  desynchronized: true  // Reduce latency
});
```

### Rendering Techniques
1. **Batch Drawing** - Minimize state changes
2. **Path Caching** - Reuse complex paths
3. **Gradient Caching** - Store frequently used gradients
4. **Shadow Optimization** - Toggle shadows strategically

### Memory Management
- Particle pooling for consistent memory usage
- Fixed-size arrays for frequency data
- Minimal object creation in render loop

## Mathematical Foundations

### Audio Analysis
- **FFT Size**: 256 samples → 128 frequency bins
- **Frequency Range**: 0-22kHz (at 44.1kHz sample rate)
- **Bin Resolution**: ~172Hz per bin

### Animation Timing
- **Base Unit**: 280ms (DDV Codex standard)
- **Golden Ratio**: 1.618 for proportions
- **8px Grid**: All measurements align to 8px units

### Waveform Mathematics
```javascript
// Multi-harmonic wave synthesis
wave = sin(x * f) + sin(x * 2f) * 0.5 + sin(x * 0.5f) * 0.3
```

## Browser Compatibility

### Required Features
- ES6 Support (const, arrow functions, template literals)
- Web Audio API
- Canvas 2D
- File API
- requestAnimationFrame

### Supported Browsers
- Chrome 80+
- Safari 14+
- Firefox 75+
- Edge 80+
- Mobile: iOS Safari 14+, Chrome Android 80+

## Integration Points

### Telegram Mini App Features
- `tg.ready()` - Initialize app
- `tg.expand()` - Full screen mode
- `tg.HapticFeedback` - Tactile responses
- Theme integration with `tg.themeParams`

### File Handling
- Drag & drop support
- Click to upload
- MP3/MPEG audio format support
- Blob URL management for memory efficiency

## Future Extensibility

### Modular Visualization System
Each visualization follows the pattern:
```javascript
drawVisualizationType(dataArray, width, height) {
  // 1. Extract frequency data
  // 2. Apply time-based animations
  // 3. Render with Canvas API
  // 4. Clean up state
}
```

### Adding New Visualizations
1. Add to switch statement in `drawVisualizationType`
2. Create draw method following the pattern
3. Add icon to `updateVisualizationButton`
4. Add button to HTML selector

## Performance Metrics

- **Target FPS**: 60fps (16.67ms per frame)
- **Audio Latency**: < 50ms
- **Memory Usage**: ~50-100MB depending on canvas size
- **CPU Usage**: 10-30% on modern devices

## Security Considerations

- No external dependencies (security through simplicity)
- Sandboxed file access via File API
- No network requests for audio processing
- Content Security Policy compatible