'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wind,
  Activity,
  Thermometer,
  Droplets,
  ArrowRight,
  Play,
  Pause,
  Settings,
  Download,
  Upload,
  BarChart3,
  Zap,
  CloudRain,
  Gauge
} from 'lucide-react';

export default function CFDPage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationMode, setSimulationMode] = useState<'airflow' | 'temperature' | 'humidity'>('airflow');

  const features = [
    {
      icon: Wind,
      title: 'Airflow Simulation',
      description: 'Model air circulation patterns and optimize ventilation',
      metrics: { velocity: '2.3 m/s', uniformity: '94%' }
    },
    {
      icon: Thermometer,
      title: 'Thermal Mapping',
      description: 'Identify hot spots and optimize cooling distribution',
      metrics: { range: '72-78°F', variance: '±2°F' }
    },
    {
      icon: Droplets,
      title: 'Humidity Analysis',
      description: 'Prevent microclimates and condensation zones',
      metrics: { average: '55%', variation: '±5%' }
    },
    {
      icon: Zap,
      title: 'Energy Optimization',
      description: 'Reduce HVAC energy consumption through CFD insights',
      metrics: { savings: '23%', roi: '8 months' }
    }
  ];

  const simulationResults = {
    airflow: {
      avgVelocity: 2.3,
      maxVelocity: 3.8,
      minVelocity: 0.5,
      uniformityIndex: 0.94,
      recommendations: [
        'Add circulation fan in northwest corner',
        'Adjust HVAC damper to 70% open',
        'Relocate intake vent 2ft higher'
      ]
    },
    temperature: {
      avgTemp: 75,
      maxTemp: 78,
      minTemp: 72,
      uniformityIndex: 0.91,
      recommendations: [
        'Increase cooling capacity by 15%',
        'Add thermal barrier on south wall',
        'Adjust canopy height by 6 inches'
      ]
    },
    humidity: {
      avgHumidity: 55,
      maxHumidity: 60,
      minHumidity: 50,
      uniformityIndex: 0.89,
      recommendations: [
        'Install dehumidifier in flower room',
        'Improve drainage in tray systems',
        'Increase air exchanges to 8/hour'
      ]
    }
  };

  const currentResults = simulationResults[simulationMode];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Wind className="w-10 h-10 text-blue-400" />
            Computational Fluid Dynamics (CFD)
          </h1>
          <p className="text-gray-400 text-lg">
            Advanced airflow and environmental modeling for optimal growing conditions
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Active Simulations</span>
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold">{isSimulating ? '1' : '0'}</div>
            <div className="text-sm text-gray-500">Real-time analysis</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Energy Savings</span>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold">23%</div>
            <div className="text-sm text-gray-500">vs baseline</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Uniformity</span>
              <Gauge className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold">94%</div>
            <div className="text-sm text-gray-500">Environmental consistency</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Optimizations</span>
              <Settings className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-gray-500">Implemented this month</div>
          </div>
        </div>

        {/* Simulation Control */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Live CFD Simulation</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isSimulating 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start
                  </>
                )}
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4" />
                Import Model
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />
                Export Results
              </button>
            </div>
          </div>

          {/* Simulation Mode Selector */}
          <div className="flex gap-2 mb-6">
            {(['airflow', 'temperature', 'humidity'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSimulationMode(mode)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  simulationMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Simulation Visualization */}
          <div className="bg-gray-900 rounded-lg p-8 mb-6 flex items-center justify-center h-96">
            {isSimulating ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Running {simulationMode} simulation...</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Wind className="w-16 h-16 mx-auto mb-4" />
                <p>Click "Start" to begin CFD simulation</p>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Simulation Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Average {simulationMode === 'airflow' ? 'Velocity' : simulationMode === 'temperature' ? 'Temperature' : 'Humidity'}</span>
                  <span className="font-bold">
                    {simulationMode === 'airflow' ? `${(currentResults as any).avgVelocity} m/s` : 
                     simulationMode === 'temperature' ? `${(currentResults as any).avgTemp}°F` : 
                     `${(currentResults as any).avgHumidity}%`}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Maximum</span>
                  <span className="font-bold">
                    {simulationMode === 'airflow' ? `${(currentResults as any).maxVelocity} m/s` : 
                     simulationMode === 'temperature' ? `${(currentResults as any).maxTemp}°F` : 
                     `${(currentResults as any).maxHumidity}%`}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Minimum</span>
                  <span className="font-bold">
                    {simulationMode === 'airflow' ? `${(currentResults as any).minVelocity} m/s` : 
                     simulationMode === 'temperature' ? `${(currentResults as any).minTemp}°F` : 
                     `${(currentResults as any).minHumidity}%`}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Uniformity Index</span>
                  <span className="font-bold text-green-400">{((currentResults as any).uniformityIndex * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
              <div className="space-y-2">
                {(currentResults as any).recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-gray-700 rounded-lg">
                    <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <feature.icon className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{feature.description}</p>
              <div className="space-y-1">
                {Object.entries(feature.metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-500 capitalize">{key}:</span>
                    <span className="text-gray-300 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Integration Section */}
        <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-blue-600/30">
          <h3 className="text-xl font-semibold mb-4">System Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/hvac" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <CloudRain className="w-6 h-6 text-blue-400" />
              <div>
                <div className="font-medium">HVAC Control</div>
                <div className="text-sm text-gray-400">Auto-adjust based on CFD</div>
              </div>
            </Link>
            <Link href="/bms" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <Settings className="w-6 h-6 text-green-400" />
              <div>
                <div className="font-medium">BMS Integration</div>
                <div className="text-sm text-gray-400">Real-time adjustments</div>
              </div>
            </Link>
            <Link href="/analytics" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <div>
                <div className="font-medium">Analytics</div>
                <div className="text-sm text-gray-400">Historical patterns</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}