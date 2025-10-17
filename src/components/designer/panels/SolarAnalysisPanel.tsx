'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Sun, MapPin, Calendar, Clock, Play, Pause, RotateCcw, Download, Building, Trees } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { SolarShadowAnalyzer, Location, ShadowGeometry, SolarPath } from '@/lib/shadow-analysis';
import * as d3 from 'd3';

interface SolarAnalysisPanelProps {
  onClose: () => void;
}

export function SolarAnalysisPanel({ onClose }: SolarAnalysisPanelProps) {
  const { state, showNotification } = useDesigner();
  const solarPathRef = useRef<SVGSVGElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSeason, setSelectedSeason] = useState<'current' | 'winter' | 'spring' | 'summer' | 'fall'>('current');
  const [solarPath, setSolarPath] = useState<SolarPath | null>(null);
  const [analyzer, setAnalyzer] = useState<SolarShadowAnalyzer | null>(null);

  // Get location from room or use default
  const location: Location = state.room?.location || {
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: -5,
    elevation: 10
  };

  useEffect(() => {
    const newAnalyzer = new SolarShadowAnalyzer(location);
    setAnalyzer(newAnalyzer);
    
    // Add nearby buildings/trees as shadow-casting objects
    if (state.room?.nearbyStructures) {
      state.room.nearbyStructures.forEach((structure: any) => {
        const geometry: ShadowGeometry = {
          id: structure.id,
          type: structure.type as 'building' | 'tree',
          name: structure.name,
          height: structure.height,
          vertices: structure.vertices
        };
        newAnalyzer.addGeometry(geometry);
      });
    }
  }, [location, state.room]);

  useEffect(() => {
    if (analyzer) {
      const date = selectedSeason === 'current' ? new Date() : getSeasonDate(selectedSeason);
      const path = analyzer.generateSolarPath(date, 15);
      setSolarPath(path);
    }
  }, [analyzer, selectedSeason]);

  const getSeasonDate = (season: string): Date => {
    const year = new Date().getFullYear();
    switch (season) {
      case 'winter': return new Date(year, 11, 21);
      case 'spring': return new Date(year, 2, 20);
      case 'summer': return new Date(year, 5, 21);
      case 'fall': return new Date(year, 8, 22);
      default: return new Date();
    }
  };

  useEffect(() => {
    if (!solarPath || !solarPathRef.current) return;

    const svg = d3.select(solarPathRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 360])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 90])
      .range([height - margin.bottom, margin.top]);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}°`))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('fill', 'currentColor')
      .style('text-anchor', 'middle')
      .text('Azimuth (degrees)');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}°`))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -25)
      .attr('x', -height / 2)
      .attr('fill', 'currentColor')
      .style('text-anchor', 'middle')
      .text('Elevation (degrees)');

    // Draw sun path
    const line = d3.line<any>()
      .x(d => xScale(d.azimuth))
      .y(d => yScale(d.elevation))
      .curve(d3.curveNatural);

    const dayLightPositions = solarPath.positions.filter(p => p.isDaylight);

    svg.append('path')
      .datum(dayLightPositions)
      .attr('fill', 'none')
      .attr('stroke', 'rgb(251 191 36)')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add sunrise/sunset markers
    if (dayLightPositions.length > 0) {
      const sunrise = dayLightPositions[0];
      const sunset = dayLightPositions[dayLightPositions.length - 1];
      const noon = dayLightPositions[Math.floor(dayLightPositions.length / 2)];

      // Sunrise
      svg.append('circle')
        .attr('cx', xScale(sunrise.azimuth))
        .attr('cy', yScale(sunrise.elevation))
        .attr('r', 4)
        .attr('fill', 'rgb(251 191 36)');

      svg.append('text')
        .attr('x', xScale(sunrise.azimuth))
        .attr('y', yScale(sunrise.elevation) + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'currentColor')
        .text('Sunrise');

      // Sunset
      svg.append('circle')
        .attr('cx', xScale(sunset.azimuth))
        .attr('cy', yScale(sunset.elevation))
        .attr('r', 4)
        .attr('fill', 'rgb(251 191 36)');

      svg.append('text')
        .attr('x', xScale(sunset.azimuth))
        .attr('y', yScale(sunset.elevation) + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'currentColor')
        .text('Sunset');

      // Solar noon
      svg.append('circle')
        .attr('cx', xScale(noon.azimuth))
        .attr('cy', yScale(noon.elevation))
        .attr('r', 4)
        .attr('fill', 'rgb(239 68 68)');

      svg.append('text')
        .attr('x', xScale(noon.azimuth))
        .attr('y', yScale(noon.elevation) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'currentColor')
        .text('Solar Noon');
    }

    // Current sun position
    if (selectedSeason === 'current' && analyzer) {
      const currentPos = analyzer.calculateSolarPosition(currentTime);
      if (currentPos.elevation > 0) {
        svg.append('circle')
          .attr('cx', xScale(currentPos.azimuth))
          .attr('cy', yScale(currentPos.elevation))
          .attr('r', 6)
          .attr('fill', 'rgb(234 179 8)')
          .attr('stroke', 'white')
          .attr('stroke-width', 2);
      }
    }
  }, [solarPath, currentTime, selectedSeason, analyzer]);

  const startAnimation = () => {
    if (!solarPath) return;
    setIsAnimating(true);
    
    let timeIndex = 0;
    const interval = setInterval(() => {
      if (timeIndex >= solarPath.positions.length) {
        setIsAnimating(false);
        clearInterval(interval);
        return;
      }
      
      setCurrentTime(solarPath.positions[timeIndex].time);
      timeIndex++;
    }, 100);
  };

  const exportData = () => {
    if (!analyzer || !solarPath) return;
    
    const data = {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone
      },
      date: solarPath.date.toISOString(),
      sunrise: solarPath.sunrise.toLocaleTimeString(),
      sunset: solarPath.sunset.toLocaleTimeString(),
      dayLength: `${solarPath.dayLength.toFixed(2)} hours`,
      solarNoon: solarPath.solarNoon.toLocaleTimeString(),
      positions: solarPath.positions.map(p => ({
        time: p.time.toLocaleTimeString(),
        azimuth: p.azimuth.toFixed(2),
        elevation: p.elevation.toFixed(2)
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-analysis-${selectedSeason}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Solar analysis data exported');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sun className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Solar Analysis & Shadow Tracking</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Location Info */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-medium text-white">Location</h3>
              </div>
              {!state.room?.location && (
                <span className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">
                  Using default location
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Latitude:</span>
                <div className="text-white font-medium">{location.latitude.toFixed(4)}°</div>
              </div>
              <div>
                <span className="text-gray-400">Longitude:</span>
                <div className="text-white font-medium">{location.longitude.toFixed(4)}°</div>
              </div>
              <div>
                <span className="text-gray-400">Timezone:</span>
                <div className="text-white font-medium">UTC{location.timezone >= 0 ? '+' : ''}{location.timezone}</div>
              </div>
            </div>
            {!state.room?.location && (
              <div className="mt-3 text-xs text-gray-400">
                💡 Tip: Set your actual location in Room/Greenhouse Configuration for accurate results
              </div>
            )}
          </div>

          {/* Season Selector */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Select Season</h3>
            <div className="grid grid-cols-5 gap-2">
              {(['current', 'winter', 'spring', 'summer', 'fall'] as const).map(season => (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSeason === season
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Solar Path Visualization */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-white mb-4">Solar Path</h3>
            <svg ref={solarPathRef} width="100%" height="200" className="w-full" />
          </div>

          {/* Solar Data */}
          {solarPath && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-gray-400">Sunrise</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  {solarPath.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-gray-400">Sunset</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  {solarPath.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Day Length</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  {solarPath.dayLength.toFixed(1)} hours
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-gray-400">Solar Noon</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  {solarPath.solarNoon.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={startAnimation}
                disabled={isAnimating || !solarPath}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isAnimating ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Animate Day</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setCurrentTime(new Date())}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
            
            <button
              onClick={exportData}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>

          {/* Practical Application Box */}
          <div className="mt-6 bg-green-900/20 border border-green-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-400 mb-2">How This Helps Your Design</h4>
            <div className="space-y-3">
              {solarPath && (
                <div className="bg-gray-800/50 rounded p-3 space-y-2">
                  <div className="text-xs text-gray-300">
                    <span className="text-gray-400">Natural Light Window:</span> {solarPath.dayLength.toFixed(1)} hours
                  </div>
                  <div className="text-xs text-gray-300">
                    <span className="text-gray-400">Supplemental Lighting Needed:</span> {(24 - solarPath.dayLength).toFixed(1)} hours/day
                  </div>
                  {state.room?.targetDLI && (
                    <>
                      <div className="text-xs text-gray-300">
                        <span className="text-gray-400">Your Target DLI:</span> {state.room.targetDLI} mol/m²/day
                      </div>
                      <div className="text-xs text-gray-300">
                        <span className="text-gray-400">Est. Natural DLI (summer):</span> {(solarPath.dayLength * 1.2).toFixed(1)} mol/m²/day
                      </div>
                      <div className="text-xs text-amber-300 font-medium mt-2">
                        💡 You'll need ~{Math.max(0, state.room.targetDLI - (solarPath.dayLength * 1.2)).toFixed(1)} mol/m²/day from LEDs
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <ul className="text-xs text-gray-300 space-y-1 mt-3">
                <li>• <span className="text-green-400">Morning:</span> East-facing walls get direct sun</li>
                <li>• <span className="text-amber-400">Noon:</span> Maximum light intensity from above</li>
                <li>• <span className="text-orange-400">Evening:</span> West-facing walls get direct sun</li>
                <li>• <span className="text-blue-400">Orientation Tip:</span> Align greenhouse N-S for even light distribution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}