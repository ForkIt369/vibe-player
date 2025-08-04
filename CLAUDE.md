# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vibe Player is a high-performance audio visualizer built as a Telegram Mini App using vanilla JavaScript. It features 9 visualization modes with smooth transitions and is optimized for mobile devices.

## Key Architecture

### Core Files
- `vibe-player.js` - Main visualization engine with all 9 visualization modes
- `vibe-player-modular.js` - Modular version with performance optimizations
- `index.html` - Main app entry point
- `preview.html` - Mobile preview wrapper
- `test.html` - Module testing page

### Module Structure
```
src/
├── audio/          # Advanced audio analysis (future)
├── core/           # Performance and quality management
│   ├── adaptive-quality.js    # Dynamic quality adjustment
│   ├── performance-monitor.js # FPS and memory tracking
│   └── quality-profiles.js    # Device-specific settings
└── utils/          # Memory optimization utilities
    ├── circular-buffer.js  # Efficient data storage
    ├── object-pool.js      # Object reuse pattern
    ├── particle-pool.js    # Particle system pooling
    └── vector-pool.js      # Vector math pooling
```

## Development Commands

### Running the Application
```bash
# Open directly in browser (no build step required)
open index.html

# For mobile preview
open preview.html

# Run module tests
open test.html
```

### Testing
- Manual testing via `test.html` which loads all modules and runs basic tests
- No automated test framework currently configured

## Key Technical Concepts

### Visualization System
Each visualization follows this pattern:
1. Extract frequency data from Web Audio API
2. Apply time-based animations using `this.time`
3. Render with Canvas 2D API
4. Clean up state for next frame

### Performance Optimization
- **Adaptive Quality Engine**: Automatically adjusts quality based on FPS
- **Object Pooling**: Pre-allocated objects to prevent garbage collection
- **Circular Buffers**: Fixed-size arrays for performance history
- **Quality Profiles**: Device-specific settings (ultra/high/medium/low)

### Adding New Visualizations
1. Add draw method to `VibePlayer` class (e.g., `drawMyVisualization`)
2. Add case to `drawVisualizationType` switch statement
3. Update `updateVisualizationButton` with new icon
4. Add button to visualization selector in HTML

### Audio Processing
- Uses Web Audio API with AnalyserNode
- FFT size: 256 (128 frequency bins)
- Smoothing: 0.8 for temporal consistency

## Integration Points

### Telegram Mini App
- Uses `window.Telegram.WebApp` for native integration
- Haptic feedback on interactions
- Theme color integration
- Full screen expansion on load

### File Handling
- Drag & drop support
- Click to upload
- MP3/audio file support only
- Memory-efficient blob URL management

## Performance Targets
- 60 FPS on mid-range devices
- < 150MB memory usage
- < 10% battery drain per hour
- < 100ms audio latency

## Future Enhancements (from ARCHITECTURE_SUMMARY.md)
- Phase 1: Core performance optimizations (completed)
- Phase 2: Advanced audio analysis (beat detection, spectral features)
- Phase 3: Next-gen visualizations (fluid dynamics, quantum particles)
- Phase 4: UX enhancements (gestures, AI presets, recording)