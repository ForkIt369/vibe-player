# Vibe Player - Production Deployment Guide

## 🚀 Deployment Status

**Live URL**: https://vibe-player.vercel.app  
**GitHub**: https://github.com/ForkIt369/vibe-player  
**Vercel Project**: https://vercel.com/will31s-projects/vibe-player

## 📦 Vercel Blob Storage Integration

The app now uses Vercel Blob Storage for serving preloaded songs, eliminating the need to store large audio files in the repository.

### Blob Storage URLs

All songs are stored in the Vercel Blob store: `store_9ULBa2TAdygajEBY`

Base URL: `https://9ulba2tadygajeby.public.blob.vercel-storage.com`

### Available Songs

1. **Robert DeLong - Global Concepts** (Featured)
2. **twenty one pilots - Chlorine**
3. **YUNGBLUD, Halsey - 11 Minutes**
4. **Halsey - Gasoline**
5. **K.Flay - High Enough**
6. **X Ambassadors, K.Flay - Zen**

## 🔧 Configuration

### Environment Variables

Set these in your Vercel project settings:

```env
BLOB_BASE_URL=https://9ulba2tadygajeby.public.blob.vercel-storage.com
```

### API Endpoints

- `/api/songs` - Returns the song library with Blob URLs
- `/api/telegram-webhook` - Handles Telegram bot webhooks

## 📱 Telegram Mini App Setup

1. **Bot Configuration**
   - Bot Name: @VibePlayerBot
   - Mini App URL: https://vibe-player.vercel.app

2. **Update Bot Settings**
   ```bash
   # Set the Mini App button
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton" \
     -H "Content-Type: application/json" \
     -d '{
       "menu_button": {
         "type": "web_app",
         "text": "🎵 Open Vibe Player",
         "web_app": {
           "url": "https://vibe-player.vercel.app"
         }
       }
     }'
   ```

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Update for production deployment with Blob storage"
git push origin main
```

### 2. Vercel Auto-Deploy

Vercel automatically deploys when you push to the main branch.

### 3. Verify Deployment

1. Visit https://vibe-player.vercel.app
2. Check that songs load from Blob storage
3. Test in Telegram Mini App

## 🔍 Monitoring

### Check Deployment Status

```bash
# View recent deployments
vercel list

# View logs
vercel logs
```

### Test API Endpoints

```bash
# Test song library endpoint
curl https://vibe-player.vercel.app/api/songs

# Should return JSON with song data and Blob URLs
```

## 🐛 Troubleshooting

### Songs Not Loading

1. Check Blob Storage URLs are accessible
2. Verify CORS headers in `vercel.json`
3. Check browser console for errors

### Telegram Integration Issues

1. Ensure bot token is correct
2. Verify Mini App URL in bot settings
3. Check webhook is properly configured

## 📊 Performance

- **Initial Load**: < 2s
- **Song Loading**: < 3s (from Blob storage)
- **Memory Usage**: < 150MB
- **Frame Rate**: 60 FPS target

## 🔄 Updates

To update songs in Blob storage:

1. Upload new files to Vercel Blob
2. Update `/api/songs.js` with new URLs
3. Deploy changes

## 📝 Notes

- All audio files are served from Vercel Blob Storage
- No large files in Git repository
- Automatic HTTPS and CDN via Vercel
- Mobile-optimized for Telegram Mini Apps