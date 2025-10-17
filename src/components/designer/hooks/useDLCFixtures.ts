import { useState, useEffect } from 'react';
import type { FixtureModel } from '@/components/FixtureLibrary';
import { logger } from '@/lib/logging/production-logger';

export function useDLCFixtures() {
  const [fixtures, setFixtures] = useState<FixtureModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDLCFixtures();
  }, []);

  const loadDLCFixtures = async () => {
    try {
      setLoading(true);
      
      // Load fixtures from API endpoint instead of direct CSV access
      const response = await fetch('/api/fixtures?limit=1000');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch fixtures: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to FixtureModel format
      const transformedFixtures: FixtureModel[] = data.fixtures.map((fixture: any) => ({
        id: fixture.id,
        brand: fixture.brand || fixture.manufacturer,
        model: fixture.modelNumber || fixture.productName,
        category: 'DLC Qualified',
        wattage: fixture.reportedWattage || fixture.testedWattage || 0,
        ppf: fixture.reportedPPF || fixture.testedPPF || 0,
        efficacy: fixture.reportedPPE || fixture.testedPPE || 0,
        spectrum: categorizeSpectrum(fixture),
        spectrumData: {
          blue: Math.round((fixture.blueFlux || 0) / (fixture.reportedPPF || 1) * 100),
          green: Math.round((fixture.greenFlux || 0) / (fixture.reportedPPF || 1) * 100),
          red: Math.round((fixture.redFlux || 0) / (fixture.reportedPPF || 1) * 100),
          farRed: Math.round((fixture.farRedFlux || 0) / (fixture.reportedPPF || 1) * 100)
        },
        coverage: estimateCoverage(fixture.reportedWattage || fixture.testedWattage || 0),
        price: estimatePrice(fixture.reportedWattage || fixture.testedWattage || 0),
        voltage: fixture.voltage || '120-277V',
        dimmable: fixture.dimmable || true,
        warranty: fixture.warranty || 5,
        beamAngle: getBeamAngle(fixture),
        dlcData: fixture
      }));
      
      setFixtures(transformedFixtures);
      setError(null);
    } catch (err) {
      logger.error('api', 'Error loading DLC fixtures:', err);
      setError('Failed to load DLC fixtures');
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const categorizeSpectrum = (fixture: any): string => {
    const red = fixture.redFlux || 0;
    const blue = fixture.blueFlux || 0;
    const farRed = fixture.farRedFlux || 0;
    const total = fixture.reportedPPF || 1;
    
    const redPercent = (red / total) * 100;
    const bluePercent = (blue / total) * 100;
    const farRedPercent = (farRed / total) * 100;
    
    if (redPercent > 70) return 'Full Spectrum + Far Red';
    if (bluePercent > 25) return 'Vegetative';
    if (redPercent > 60 && farRedPercent > 5) return 'Full Spectrum + Far Red';
    if (redPercent > 60) return 'Flowering';
    return 'Full Spectrum';
  };

  const estimateCoverage = (wattage: number): number => {
    // Estimate coverage area based on wattage (rough calculation)
    return Math.max(4, Math.round(wattage / 35)); // ~35W per sq ft average
  };

  const estimatePrice = (wattage: number): number => {
    // Rough price estimation based on wattage
    return Math.round(wattage * 2.25);
  };

  const getBeamAngle = (fixture: any): number => {
    // Check if beam angle is provided in DLC data
    if (fixture.reportedBeamAngle && fixture.reportedBeamAngle > 0) {
      return fixture.reportedBeamAngle;
    }
    
    // For Philips GreenPower LED Production Modules, use 140 degrees
    const brand = (fixture.brand || fixture.manufacturer || '').toLowerCase();
    const model = (fixture.modelNumber || fixture.productName || '').toLowerCase();
    
    if (brand.includes('philips') && 
        (model.includes('production module') || model.includes('gpl pm'))) {
      return 140; // 140-degree beam angle for Philips Production Modules
    }
    
    // For Acuity XWD (eXtra-Wide Distribution) fixtures, use 135 degrees
    if (brand.includes('acuity') && model.includes('xwd')) {
      return 135; // 135-degree beam angle for Acuity XWD fixtures
    }
    
    // Default beam angle for other linear fixtures
    if (model.includes('linear') || model.includes('bar') || model.includes('strip')) {
      return 120;
    }
    
    // Default beam angle for most fixtures (as requested by user)
    return 120;
  };

  return { fixtures, loading, error, reload: loadDLCFixtures };
}