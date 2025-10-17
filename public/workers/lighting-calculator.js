// Web Worker for heavy lighting calculations
self.addEventListener('message', function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'calculate':
      performCalculations(data);
      break;
    case 'optimize':
      optimizeLayout(data);
      break;
    default:
      console.error('Unknown worker message type:', type);
  }
});

function performCalculations({ fixtures, room }) {
  try {
    const startTime = performance.now();
    
    // Convert fixtures to light sources
    const lightSources = fixtures.map(f => ({
      id: f.id,
      x: f.position.x,
      y: f.position.y,
      z: f.position.z,
      ppf: f.model.specifications.ppf,
      wattage: f.model.specifications.power,
      spectrum: f.model.specifications.spectrum
    }));
    
    // Calculate heatmap
    const heatmap = calculateDetailedHeatmap(
      lightSources,
      room.dimensions.length,
      room.dimensions.width,
      room.dimensions.height,
      room.unit
    );
    
    // Calculate power metrics
    const metrics = calculatePowerMetrics(lightSources, room);
    
    // Generate spectrum data
    const spectrum = generateSpectrumData(lightSources);
    
    const duration = performance.now() - startTime;
    
    // Send results back to main thread
    self.postMessage({
      type: 'heatmap',
      data: heatmap
    });
    
    self.postMessage({
      type: 'metrics',
      data: { ...metrics, calculationTime: duration }
    });
    
    self.postMessage({
      type: 'spectrum',
      data: spectrum
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
}

function calculateDetailedHeatmap(sources, length, width, height, unit) {
  const resolution = 50; // Grid resolution
  const points = [];
  
  // Convert to meters if needed
  const factor = unit === 'feet' ? 0.3048 : 1;
  const lengthM = length * factor;
  const widthM = width * factor;
  const heightM = height * factor;
  
  // Calculate grid
  for (let x = 0; x <= resolution; x++) {
    for (let y = 0; y <= resolution; y++) {
      const xPos = (x / resolution) * length;
      const yPos = (y / resolution) * width;
      
      let totalPPFD = 0;
      
      // Calculate contribution from each light source
      sources.forEach(source => {
        const distance = Math.sqrt(
          Math.pow(xPos - source.x, 2) +
          Math.pow(yPos - source.y, 2) +
          Math.pow(source.z - (heightM * 0.75), 2) // Assume canopy at 75% height
        );
        
        // Inverse square law with beam angle consideration
        const ppfd = (source.ppf / (4 * Math.PI * Math.pow(distance, 2))) * 4.6; // μmol to PPFD conversion
        totalPPFD += ppfd;
      });
      
      points.push({
        x: xPos,
        y: yPos,
        value: totalPPFD
      });
    }
  }
  
  return points;
}

function calculatePowerMetrics(sources, room) {
  const totalPower = sources.reduce((sum, s) => sum + s.wattage, 0);
  const areaM2 = (room.dimensions.length * room.dimensions.width) * 
                 (room.unit === 'feet' ? 0.092903 : 1);
  
  const ppfdValues = [];
  // Sample grid for average PPFD
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * room.dimensions.length;
    const y = Math.random() * room.dimensions.width;
    
    let ppfd = 0;
    sources.forEach(source => {
      const distance = Math.sqrt(
        Math.pow(x - source.x, 2) +
        Math.pow(y - source.y, 2) +
        Math.pow(source.z - (room.dimensions.height * 0.75), 2)
      );
      ppfd += (source.ppf / (4 * Math.PI * Math.pow(distance, 2))) * 4.6;
    });
    ppfdValues.push(ppfd);
  }
  
  const avgPPFD = ppfdValues.reduce((a, b) => a + b, 0) / ppfdValues.length;
  const minPPFD = Math.min(...ppfdValues);
  const maxPPFD = Math.max(...ppfdValues);
  
  return {
    totalPower,
    powerDensity: totalPower / areaM2,
    avgPPFD: Math.round(avgPPFD),
    minPPFD: Math.round(minPPFD),
    maxPPFD: Math.round(maxPPFD),
    uniformity: minPPFD / avgPPFD,
    dli: (avgPPFD * 0.0864 * 12).toFixed(1), // 12 hour photoperiod
    efficacy: (avgPPFD / (totalPower / areaM2)).toFixed(2)
  };
}

function generateSpectrumData(sources) {
  const wavelengths = [];
  for (let w = 380; w <= 780; w += 5) {
    wavelengths.push(w);
  }
  
  const combinedSpectrum = wavelengths.map(wavelength => {
    let totalIntensity = 0;
    
    sources.forEach(source => {
      if (source.spectrum && source.spectrum[wavelength]) {
        totalIntensity += source.spectrum[wavelength];
      }
    });
    
    return {
      wavelength,
      intensity: totalIntensity / sources.length
    };
  });
  
  return combinedSpectrum;
}

function optimizeLayout(data) {
  const { room, targetPPFD, fixtureModel } = data;
  
  try {
    // Calculate optimal spacing
    const fixtureFootprint = Math.sqrt(fixtureModel.ppf / targetPPFD) * 2;
    const rows = Math.floor(room.dimensions.length / fixtureFootprint);
    const cols = Math.floor(room.dimensions.width / fixtureFootprint);
    
    const positions = [];
    const xSpacing = room.dimensions.length / (rows + 1);
    const ySpacing = room.dimensions.width / (cols + 1);
    
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= cols; col++) {
        positions.push({
          x: row * xSpacing,
          y: col * ySpacing,
          z: room.dimensions.height - 2
        });
      }
    }
    
    self.postMessage({
      type: 'optimized',
      data: positions
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
}