# 🏗️ Vibe Player Architecture

## Overview

Vibe Player is a high-performance audio visualizer built with a modular ES6 architecture. It uses Web Audio API for audio processing and Canvas 2D for rendering, with an advanced performance optimization system.

## Core Architecture

### Module Structure

```
┌─────────────────────────────────────────────────────────┐
│                      app.js (Entry)                       │
│                           │                               │
│                  vibe-player-modular.js                   │
│                    (Main Engine)                          │
│                           │                               │
│          ┌────────────────┴────────────────┐            │
│          │                                  │            │
│    Adaptive Quality                   Utility Modules    │
│       Manager                               │            │
│          │                                  │            │
│   ┌──────┴──────┐                   ┌──────┴──────┐    │
│   │ Performance │                   │  Object     │    │
│   │  Monitor    │                   │   Pools     │    │
│   └─────────────┘                   └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Key Components

### 1. VibePlayer Class (`vibe-player-modular.js`)

The main visualization engine that orchestrates all components.

**Responsibilities:**
- Audio file loading and playback
- Web Audio API setup and management
- Visualization rendering pipeline
- UI state management
- Event handling

**Key Methods:**
```javascript
loadAudioFile(file)        // Handles audio loading
startVisualization()       // Main render loop
drawVisualizationType()    // Visualization dispatcher
switchVisualization(type)  // Smooth transitions
```

### 2. Adaptive Quality Manager (`src/core/adaptive-quality.js`)

Dynamically adjusts rendering quality based on device performance.

**Features:**
- Real-time FPS monitoring
- Automatic quality profile switching
- Battery level awareness
- Memory usage tracking

**Quality Profiles:**
- **Ultra**: Maximum quality for high-end devices
- **High**: Default balanced settings
- **Medium**: Reduced particles and effects
- **Low**: Minimal effects for older devices

### 3. Performance Monitor (`src/core/performance-monitor.js`)

Tracks system performance metrics.

**Metrics Tracked:**
- Frame rate (FPS)
- Frame time (ms)
- Memory usage
- Battery level

**Implementation:**
```javascript
recordFrame()          // Called each animation frame
getMetrics()          // Returns current performance data
shouldDowngrade()     // Suggests quality changes
```

### 4. Object Pooling System

Prevents garbage collection stutters by reusing objects.

**Pool Types:**
- **ParticlePool**: Pre-allocated particles for effects
- **VectorPool**: Reusable vector math objects
- **ObjectPool**: Generic object recycling

**Benefits:**
- Zero allocation during animation
- Consistent frame times
- Lower memory pressure

## Visualization Pipeline

### Audio Processing

```
Audio File → Audio Element → Web Audio API
                                │
                                ├─→ AnalyserNode (FFT)
                                │      │
                                │      └─→ Frequency Data
                                │
                                └─→ Audio Output
```

### Rendering Pipeline

```
requestAnimationFrame → Performance Check
                            │
                            ├─→ Get Audio Data
                            │
                            ├─→ Clear Canvas
                            │
                            ├─→ Draw Visualization
                            │
                            └─→ Update UI
```

## Visualization Modes

### 1. Frequency Bars
- Classic spectrum analyzer
- 128 frequency bins
- HSL color mapping

### 2. Waveform
- Time-domain visualization
- Mirrored display
- Smooth interpolation

### 3. Circle
- Radial frequency mapping
- 360° distribution
- Gradient fills

### 4. Particles
- Physics-based movement
- Audio-reactive connections
- Object pooling

### 5. Galaxy
- Spiral arm generation
- Star particle system
- Rotation based on bass

### 6. DNA Helix
- Double helix mathematics
- Frequency-based radius
- Smooth rotation

### 7. Ribbons
- Flowing ribbon simulation
- Multiple layers
- Audio-reactive width

### 8. Fractal Tree
- Recursive branching
- Bass-driven growth
- Mathematical beauty

### 9. Neon Grid
- Synthwave aesthetics
- Perspective projection
- Reactive sun element

## Performance Optimizations

### 1. Canvas Optimizations
- Hardware acceleration via `desynchronized`
- No alpha channel for better performance
- Optimal canvas size based on device

### 2. Rendering Optimizations
- Dirty rectangle tracking
- State batching
- Path caching for complex shapes

### 3. Audio Optimizations
- FFT size adjustment per quality
- Smoothing time constant tuning
- Frequency band optimization

### 4. Memory Optimizations
- Object pooling for all dynamic objects
- Circular buffers for history
- Lazy initialization

## State Management

### UI States
```
UPLOAD → LOADING → PLAYING ⟷ PAUSED
           ↓          ↓
        ERROR    VISUALIZING
```

### Visualization State
- Current visualization type
- Transition progress
- Quality profile
- Performance metrics

## Event Flow

### User Interactions
```
User Action → Event Handler → State Update → UI Update
                                   ↓
                            Animation Update
```

### Audio Events
```
Audio Load → Metadata → Context Setup → Visualization Start
                ↓
            Error Handling
```

## Extension Points

### Adding New Visualizations

1. Create draw method in VibePlayer
2. Add to visualization switch
3. Update UI selector
4. Optional: Add to quality profiles

### Custom Quality Profiles

Edit `quality-profiles.js` to add device-specific settings:

```javascript
custom: {
  particles: 150,
  fftSize: 512,
  smoothing: 0.75,
  // ... other settings
}
```

## Security Considerations

- No external dependencies
- Sandboxed file access
- CORS-compliant audio loading
- No data collection

## Browser Compatibility

### Required APIs
- Web Audio API
- Canvas 2D
- ES6 Modules
- RequestAnimationFrame

### Fallbacks
- AudioContext prefix handling
- DevicePixelRatio detection
- Touch event normalization

## Future Enhancements

### Phase 2: Advanced Audio Analysis
- Beat detection
- Onset detection
- Spectral features
- Genre classification

### Phase 3: New Visualizations
- 3D visualizations (WebGL)
- Shader-based effects
- AI-generated patterns

### Phase 4: Social Features
- Visualization sharing
- Collaborative playlists
- Real-time sync