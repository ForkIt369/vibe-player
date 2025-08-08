# Audio Folder

Place your default song file here:
- Name it: `default-song.mp3`
- Or configure the path in `index.html`

## Option 1: Local File (Development)
Copy your MP3 file to this folder:
```bash
cp "/Users/digitaldavinci/Downloads/Robert DeLong - Global Concepts.mp3" ./default-song.mp3
```

## Option 2: External URL (Production)
Update the configuration in index.html to point to a hosted MP3 file.

## Option 3: Data URL (Small Files)
For small files, you can convert to base64 and embed directly.