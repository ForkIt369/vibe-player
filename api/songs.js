// Vercel Serverless Function to serve songs from Blob Storage
// This endpoint provides the song library data with Blob URLs

module.exports = async function handler(req, res) {
  // Enable CORS for the Telegram Mini App
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Vercel Blob Storage URLs for the songs
  // These are the public URLs from your Blob store
  const blobBaseUrl = process.env.BLOB_BASE_URL || 'https://9ulba2tadygajeby.public.blob.vercel-storage.com';
  
  // Song library with Blob URLs
  const songLibrary = {
    featured: {
      title: "Global Concepts",
      artist: "Robert DeLong",
      url: `${blobBaseUrl}/Robert_DeLong-Global_Concepts-N6mHksyR7BewGlW7oJGMSAM7aILCy2.mp3`,
      duration: "3:42",
      genre: "Electronic",
      visualization: "neon"
    },
    library: [
      {
        id: "chlorine",
        title: "Chlorine",
        artist: "twenty one pilots",
        url: `${blobBaseUrl}/Twenty_One_Pilots-Chlorine-8bHVBBUZkpKFxCWNLRGJE0jKyD6Bkl.mp3`,
        duration: "5:24",
        genre: "Alternative",
        visualization: "particles"
      },
      {
        id: "11minutes",
        title: "11 Minutes",
        artist: "YUNGBLUD, Halsey ft. Travis Barker",
        url: `${blobBaseUrl}/YUNGBLUD_Halsey-11_Minutes-xaykyRQGTILcj9bkXC0FLhf6VUAjBr.mp3`,
        duration: "3:41",
        genre: "Rock",
        visualization: "fractal"
      },
      {
        id: "gasoline",
        title: "Gasoline",
        artist: "Halsey",
        url: `${blobBaseUrl}/Halsey-Gasoline-2GF0XJ8TJcSKQxVHqiMhcJUMSJX1EW.mp3`,
        duration: "3:17",
        genre: "Electropop",
        visualization: "dna"
      },
      {
        id: "high-enough",
        title: "High Enough",
        artist: "K.Flay",
        url: `${blobBaseUrl}/K_Flay-High_Enough-cJdxFRFxCBN7cCvzBOGZCGcKDN6VMs.mp3`,
        duration: "3:50",
        genre: "Alternative",
        visualization: "wave"
      },
      {
        id: "zen",
        title: "Zen",
        artist: "X Ambassadors, K.Flay, grandson",
        url: `${blobBaseUrl}/X_Ambassadors_K_Flay-Zen-vGwKrYZFUcrLUV1k6KjRyZWnQuMvCB.mp3`,
        duration: "3:37",
        genre: "Alternative Rock",
        visualization: "bars"
      },
      {
        id: "global-concepts",
        title: "Global Concepts",
        artist: "Robert DeLong",
        url: `${blobBaseUrl}/Robert_DeLong-Global_Concepts-N6mHksyR7BewGlW7oJGMSAM7aILCy2.mp3`,
        duration: "3:42",
        genre: "Electronic",
        visualization: "galaxy"
      }
    ]
  };
  
  // Return the song library
  return res.status(200).json(songLibrary);
};