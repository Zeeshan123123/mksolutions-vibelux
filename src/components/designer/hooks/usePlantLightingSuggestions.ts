import { useEffect, useState } from 'react';
import { useDesigner } from '../context/DesignerContext';
import { ADVANCED_CROP_DATABASE } from '@/lib/plants/advanced-plant-system';
import { calculateInterLightingPositions, calculateUnderCanopyLighting } from '@/lib/plants/advanced-plant-system';
import { RESEARCH_BACKED_CROPS } from '@/lib/plants/research-backed-crop-data';

export interface LightingSuggestion {
  type: 'interlighting' | 'under-canopy' | 'top-lighting-adjustment';
  message: string;
  plantIds: string[];
  action: () => void;
}

export function usePlantLightingSuggestions() {
  const { state, addObject, updateObject, showNotification } = useDesigner();
  const [suggestions, setSuggestions] = useState<LightingSuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const plants = state.objects.filter(obj => obj.type === 'plant');
    const newSuggestions: LightingSuggestion[] = [];

    // Group plants by crop type and location
    const plantGroups: Record<string, any[]> = {};
    plants.forEach(plant => {
      const cropId = plant.cropId || plant.variety;
      if (!plantGroups[cropId]) plantGroups[cropId] = [];
      plantGroups[cropId].push(plant);
    });

    // Check each crop group for lighting needs
    Object.entries(plantGroups).forEach(([cropId, groupPlants]) => {
      const cropSpec = ADVANCED_CROP_DATABASE[cropId];
      if (!cropSpec) return;

      // Check for interlighting needs
      if (cropSpec.lightingStrategies.interLighting?.recommended) {
        const hasInterlighting = state.objects.some(obj => 
          obj.type === 'fixture' && obj.fixtureType === 'interlight'
        );

        if (!hasInterlighting) {
          const suggestionId = `interlight-${cropId}`;
          if (!dismissedSuggestions.has(suggestionId)) {
            newSuggestions.push({
              type: 'interlighting',
              message: `${cropSpec.commonName} plants benefit from interlighting at multiple heights${RESEARCH_BACKED_CROPS[cropId] ? ' (research verified)' : ''}`,
              plantIds: groupPlants.map(p => p.id),
              action: () => {
                // Add interlighting for these plants
                const plantRows = groupPlants.map(p => ({
                  x: p.x,
                  y: p.y,
                  height: p.height
                }));
                
                const placements = calculateInterLightingPositions(
                  plantRows,
                  cropSpec,
                  state.room || { width: 40, length: 40, height: 10 }
                );

                placements.forEach(placement => {
                  placement.fixtures.forEach(fixture => {
                    addObject({
                      type: 'fixture',
                      fixtureType: 'interlight',
                      x: fixture.x,
                      y: fixture.y,
                      z: fixture.z,
                      rotation: fixture.rotation,
                      width: 3,
                      length: 0.3,
                      height: 0.2,
                      enabled: true,
                      model: {
                        name: 'LED Interlight Bar',
                        wattage: 100,
                        ppf: 280,
                        beamAngle: 120,
                        efficacy: 2.8
                      },
                      dimmingLevel: 100,
                      customName: `Interlight ${cropId} ${fixture.z}ft`
                    });
                  });
                });

                showNotification('success', `Added interlighting for ${cropSpec.commonName}`);
                setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
              }
            });
          }
        }
      }

      // Check for under-canopy lighting needs
      if (cropSpec.lightingStrategies.underCanopy?.beneficial) {
        const hasUnderCanopy = state.objects.some(obj => 
          obj.type === 'fixture' && obj.fixtureType === 'under-canopy'
        );

        if (!hasUnderCanopy) {
          const suggestionId = `undercanopy-${cropId}`;
          if (!dismissedSuggestions.has(suggestionId)) {
            newSuggestions.push({
              type: 'under-canopy',
              message: `${cropSpec.commonName} benefits from ${cropSpec.lightingStrategies.underCanopy.spectrum} under-canopy lighting${RESEARCH_BACKED_CROPS[cropId] ? ' (research verified)' : ''}`,
              plantIds: groupPlants.map(p => p.id),
              action: () => {
                // Add under-canopy lighting
                const plantPositions = groupPlants.map(p => ({
                  x: p.x,
                  y: p.y,
                  canopyRadius: p.width / 2
                }));

                const placements = calculateUnderCanopyLighting(plantPositions, cropSpec);

                placements.forEach(placement => {
                  placement.fixtures.forEach(fixture => {
                    addObject({
                      type: 'fixture',
                      fixtureType: 'under-canopy',
                      x: fixture.x,
                      y: fixture.y,
                      z: fixture.z,
                      rotation: fixture.rotation,
                      width: 1,
                      length: 0.5,
                      height: 0.3,
                      enabled: true,
                      model: {
                        name: `Under-Canopy ${cropSpec.lightingStrategies.underCanopy!.spectrum}`,
                        wattage: 25,
                        ppf: 60,
                        beamAngle: 90,
                        efficacy: 2.4,
                        spectrum: cropSpec.lightingStrategies.underCanopy!.spectrum
                      },
                      dimmingLevel: 100,
                      customName: `UC-${fixture.fixtureType}`
                    });
                  });
                });

                showNotification('success', `Added under-canopy lighting for ${cropSpec.commonName}`);
                setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
              }
            });
          }
        }
      }

      // Check if top lighting needs adjustment for crop PPFD requirements
      const currentPPFD = state.calculations?.averagePPFD || 0;
      const targetPPFD = cropSpec.growthStages[cropSpec.growthStages.length - 1]
        .lightRequirements.topLighting.ppfd;

      if (currentPPFD > 0 && Math.abs(currentPPFD - targetPPFD) > targetPPFD * 0.2) {
        const suggestionId = `ppfd-adjust-${cropId}`;
        if (!dismissedSuggestions.has(suggestionId)) {
          newSuggestions.push({
            type: 'top-lighting-adjustment',
            message: `${cropSpec.commonName} needs ${targetPPFD} PPFD (current: ${currentPPFD.toFixed(0)})`,
            plantIds: groupPlants.map(p => p.id),
            action: () => {
              // Adjust fixture dimming levels
              const fixtures = state.objects.filter(obj => obj.type === 'fixture');
              const dimmingFactor = targetPPFD / currentPPFD;
              const newDimming = Math.round(100 * dimmingFactor);

              fixtures.forEach(fixture => {
                updateObject(fixture.id, { dimmingLevel: Math.min(100, Math.max(10, newDimming)) });
              });

              showNotification('info', `Adjusted lighting to ${targetPPFD} PPFD for ${cropSpec.commonName}`);
              setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
            }
          });
        }
      }
    });

    setSuggestions(newSuggestions);
  }, [state.objects, state.calculations]);

  const dismissSuggestion = (suggestion: LightingSuggestion) => {
    const suggestionId = `${suggestion.type}-${suggestion.plantIds.join('-')}`;
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  const dismissAll = () => {
    const allIds = suggestions.map(s => `${s.type}-${s.plantIds.join('-')}`);
    setDismissedSuggestions(new Set(allIds));
  };

  return {
    suggestions,
    dismissSuggestion,
    dismissAll,
    hasSuggestions: suggestions.length > 0
  };
}