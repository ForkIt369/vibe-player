const QualityProfiles = {
  ultra: {
    particles: 500,
    particleSize: 3,
    particleTrails: true,
    particleConnections: 150,
    
    fftSize: 2048,
    smoothing: 0.85,
    frequencyBands: 128,
    
    canvasScale: 1.0,
    shadowBlur: 20,
    glowEffects: true,
    
    galaxyArms: 6,
    galaxyStars: 300,
    
    fractalDepth: 8,
    fractalBranches: 5,
    
    gridLines: 20,
    gridPerspective: true,
    
    ribbonSegments: 200,
    ribbonLayers: 5,
    
    waveSegments: 512,
    waveSmoothing: 3
  },
  
  high: {
    particles: 200,
    particleSize: 2.5,
    particleTrails: true,
    particleConnections: 80,
    
    fftSize: 1024,
    smoothing: 0.8,
    frequencyBands: 64,
    
    canvasScale: 1.0,
    shadowBlur: 15,
    glowEffects: true,
    
    galaxyArms: 4,
    galaxyStars: 200,
    
    fractalDepth: 6,
    fractalBranches: 4,
    
    gridLines: 15,
    gridPerspective: true,
    
    ribbonSegments: 150,
    ribbonLayers: 4,
    
    waveSegments: 256,
    waveSmoothing: 2
  },
  
  medium: {
    particles: 100,
    particleSize: 2,
    particleTrails: false,
    particleConnections: 50,
    
    fftSize: 512,
    smoothing: 0.75,
    frequencyBands: 32,
    
    canvasScale: 0.8,
    shadowBlur: 10,
    glowEffects: false,
    
    galaxyArms: 3,
    galaxyStars: 100,
    
    fractalDepth: 5,
    fractalBranches: 3,
    
    gridLines: 10,
    gridPerspective: true,
    
    ribbonSegments: 100,
    ribbonLayers: 3,
    
    waveSegments: 128,
    waveSmoothing: 1
  },
  
  low: {
    particles: 50,
    particleSize: 2,
    particleTrails: false,
    particleConnections: 0,
    
    fftSize: 256,
    smoothing: 0.7,
    frequencyBands: 16,
    
    canvasScale: 0.6,
    shadowBlur: 0,
    glowEffects: false,
    
    galaxyArms: 2,
    galaxyStars: 50,
    
    fractalDepth: 4,
    fractalBranches: 2,
    
    gridLines: 8,
    gridPerspective: false,
    
    ribbonSegments: 50,
    ribbonLayers: 2,
    
    waveSegments: 64,
    waveSmoothing: 0
  }
};

export default QualityProfiles;