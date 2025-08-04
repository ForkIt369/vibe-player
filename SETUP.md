# Vibe Player Setup Guide

## Current Deployment Information

### Production URLs
- **Live App**: https://vibe-player-will31s-projects.vercel.app/standalone.html
- **GitHub Repository**: https://github.com/ForkIt369/vibe-player (Private)
- **Vercel Project**: Under Will's workspace (team_hWHY2ydinOXs8iuD326e3fLC)

### Project IDs
- **Vercel Project ID**: prj_CCXd5U1UN70E5r1ogmxzmSdeeMrr
- **Vercel Org ID**: team_hWHY2ydinOXs8iuD326e3fLC
- **GitHub Repository**: ForkIt369/vibe-player

## Local Development

### Prerequisites
- Node.js (for Vercel CLI)
- Git
- Modern web browser

### Getting Started
```bash
# Clone the repository (if you have access)
git clone https://github.com/ForkIt369/vibe-player.git
cd vibe-player

# Install dependencies (only Vercel CLI)
npm install

# Open locally
open standalone.html  # Works with file:// protocol
# OR
open index.html      # Requires local server for ES6 modules
```

### Running Local Server
```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx serve

# Vercel Dev
npm run dev
```

## Deployment

### Vercel Deployment (Connected to GitHub)
The project is configured for automatic deployment on push to main branch.

```bash
# Manual deployment
vercel --prod

# Or use npm script
npm run deploy
```

### Vercel Configuration
- **Framework**: Other (static site)
- **Output Directory**: . (root)
- **Install Command**: npm install
- **Build Command**: (none - static files)
- **Development Command**: (none)

## File Structure

### Main Files
- `standalone.html` - Production entry point (no modules, works anywhere)
- `index.html` - Development entry with ES6 modules
- `vibe-player.js` - Core visualization engine (non-modular)
- `vibe-player-modular.js` - Modular version with imports
- `app.js` - Application bootstrap for modular version

### Supporting Files
- `demo.html` - Live preview with test audio generator
- `preview.html` - Telegram Mini App simulator
- `test.html` - Module testing page

### Performance Modules
```
src/
├── core/
│   ├── adaptive-quality.js    # Dynamic quality adjustment
│   ├── performance-monitor.js # FPS monitoring
│   └── quality-profiles.js    # Device profiles
└── utils/
    ├── circular-buffer.js     # Performance history
    ├── object-pool.js         # Object recycling
    ├── particle-pool.js       # Particle management
    └── vector-pool.js         # Vector math optimization
```

## Version Selection

### For Production
Use `standalone.html` - it's self-contained and works everywhere:
- No module loading issues
- Works with file:// protocol
- No CORS restrictions
- All code in one file

### For Development
Use `index.html` with modules:
- Better code organization
- Easier debugging
- Module hot reloading
- Performance optimizations

## Troubleshooting

### CORS Issues
If you see CORS errors with `index.html`:
1. Use `standalone.html` instead
2. Or run a local server
3. Or deploy to Vercel

### Module Loading Errors
If modules fail to load:
1. Check file paths in imports
2. Ensure server sets correct MIME types
3. Use `test.html` to debug

### Audio Not Playing
1. Check browser console for errors
2. Ensure file is MP3/audio format
3. Try different browser
4. Check audio context state

## Environment Variables

None required. The app is fully static.

## API Keys & Secrets

None required. Pure client-side application.

## Monitoring

### Performance Metrics
- Target: 60 FPS
- Memory: < 150MB
- CPU: < 30%
- Check console for adaptive quality logs

### Error Tracking
Currently logs to browser console. Check for:
- Audio loading errors
- Canvas rendering errors
- Module import failures

## Maintenance

### Updating Visualizations
1. Edit visualization methods in `vibe-player.js`
2. Test locally with various audio files
3. Check performance on mobile devices
4. Deploy via git push or `vercel --prod`

### Adding New Features
1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Merge to main for auto-deploy

## Support

For issues or questions:
1. Check browser console
2. Review this setup guide
3. Test with `standalone.html`
4. Create GitHub issue (if you have access)