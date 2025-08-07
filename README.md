# 🎵 Vibe Player - Telegram Mini App Audio Visualizer

A high-performance audio visualizer built as a Telegram Mini App. Features 9 stunning visualization modes that react to your music in real-time.

## 🚀 Live Links

- **Telegram Bot:** [@VibeVizDemobot](https://t.me/VibeVizDemobot)
- **Production App:** https://vibe-player-flame.vercel.app
- **GitHub Repo:** https://github.com/ForkIt369/vibe-player

## ✨ Features

- **9 Visualization Modes**: Bars, Wave, Circle, Particles, Galaxy, DNA, Ribbons, Fractal, and Neon Grid
- **High Performance**: 60 FPS target with adaptive quality system
- **Mobile Optimized**: Touch-friendly controls and responsive design
- **Telegram Integration**: Built for Telegram Mini Apps platform
- **Zero Dependencies**: Pure vanilla JavaScript with Web Audio API

## 🚀 Quick Start

### Local Development

```bash
# Clone and navigate to project
cd apps/vibe-player

# Install dependencies (only needed for deployment)
npm install

# Open directly in browser
open index.html
```

### Deployment

```bash
# Deploy to Vercel
vercel --prod

# Or use npm script
npm run deploy
```

## 🏗️ Architecture

### Core Structure

```
vibe-player/
├── index.html          # Main app entry point
├── app.js              # Application bootstrap
├── vibe-player-modular.js  # Main visualization engine
├── src/
│   ├── core/           # Performance & quality management
│   │   ├── adaptive-quality.js    # Dynamic quality adjustment
│   │   ├── performance-monitor.js # FPS and memory tracking
│   │   └── quality-profiles.js    # Device-specific settings
│   └── utils/          # Memory optimization utilities
│       ├── circular-buffer.js  # Efficient data storage
│       ├── object-pool.js      # Object reuse pattern
│       ├── particle-pool.js    # Particle system pooling
│       └── vector-pool.js      # Vector math pooling
```

### Key Components

1. **VibePlayer Class** (`vibe-player-modular.js`)
   - Main visualization engine
   - Handles audio loading and playback
   - Manages visualization switching
   - Controls UI state

2. **Adaptive Quality System**
   - Monitors performance in real-time
   - Adjusts quality settings dynamically
   - 4 quality profiles: Ultra, High, Medium, Low
   - Maintains 60 FPS on various devices

3. **Object Pooling**
   - Pre-allocates particles and vectors
   - Prevents garbage collection stutters
   - Improves memory efficiency

## 🎨 Visualization Modes

### 1. **Bars** - Classic frequency spectrum
### 2. **Wave** - Smooth waveform oscilloscope
### 3. **Circle** - Radial frequency visualization
### 4. **Particles** - Dynamic particle system
### 5. **Galaxy** - Spiral galaxy simulation
### 6. **DNA** - Double helix visualization
### 7. **Ribbons** - Flowing ribbon effects
### 8. **Fractal** - Mathematical tree patterns
### 9. **Neon Grid** - Retro synthwave grid

## 📱 Usage

1. **Upload Audio**: Click/tap the upload zone or drag & drop an MP3 file
2. **Play/Pause**: Use the central play button
3. **Switch Visualizations**: Click the grid button to see all modes
4. **Share**: Use the share button to export (coming soon)

## ⚡ Performance

### Optimization Features

- **Adaptive Quality**: Automatically adjusts based on device performance
- **Object Pooling**: Reuses objects to minimize garbage collection
- **Efficient Rendering**: Canvas 2D with hardware acceleration
- **Smart FFT**: Optimized frequency analysis settings

### Performance Targets

- 60 FPS on mid-range devices
- < 150MB memory usage
- < 100ms audio latency
- < 10% battery drain per hour

## 🛠️ Development

### Adding New Visualizations

1. Add draw method to `VibePlayer` class:
```javascript
drawMyVisualization(dataArray, bufferLength) {
  // Your visualization code
}
```

2. Add case to switch statement in `drawVisualizationType`:
```javascript
case 'myvisualization':
  this.drawMyVisualization(dataArray, bufferLength);
  break;
```

3. Add button to visualization selector in HTML

### Quality Profiles

Edit `src/core/quality-profiles.js` to adjust performance settings:

```javascript
high: {
  particles: 200,
  fftSize: 1024,
  smoothing: 0.8,
  // ... other settings
}
```

## 🔧 Configuration

### Audio Settings

- **FFT Size**: 256 (128 frequency bins)
- **Smoothing**: 0.8 (temporal smoothing)
- **Sample Rate**: Default system rate

### Canvas Settings

- **Resolution**: Device pixel ratio aware
- **Alpha**: Disabled for performance
- **Desynchronized**: Enabled for smooth rendering

## 📦 Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Follow prompts

### Static Hosting

The app is purely static and can be hosted anywhere:
- Upload all files to your web server
- Ensure `.js` files are served with `Content-Type: application/javascript`
- No build process required

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Test on multiple devices
5. Submit a pull request

## 📄 License

MIT License - feel free to use in your own projects!

## 🙏 Credits

Built with ❤️ by Digital DaVinci for the {BRO}VER$E ecosystem.