'use client';

import React from 'react';
import MobileDataLogger from '@/components/research/MobileDataLogger';
import { Thermometer, Droplets, Ruler, Eye } from 'lucide-react';
import { logger } from '@/lib/client-logger';

export default function DataLoggerPage() {
  const experimentId = 'demo-experiment-123';
  
  const treatments = [
    { id: 'treatment-1', name: 'Control' },
    { id: 'treatment-2', name: 'High Light' },
    { id: 'treatment-3', name: 'Low Light' },
    { id: 'treatment-4', name: 'Variable Light' },
  ];

  const blocks = [
    { id: 'block-1', name: 'Block A' },
    { id: 'block-2', name: 'Block B' },
    { id: 'block-3', name: 'Block C' },
  ];

  const measurementFields = [
    {
      name: 'height',
      type: 'number' as const,
      label: 'Plant Height',
      required: true,
      unit: 'cm',
      min: 0,
      max: 200,
      icon: Ruler,
    },
    {
      name: 'weight',
      type: 'number' as const,
      label: 'Fresh Weight',
      required: true,
      unit: 'g',
      min: 0,
      max: 5000,
      icon: Droplets,
    },
    {
      name: 'leafCount',
      type: 'number' as const,
      label: 'Leaf Count',
      required: false,
      min: 0,
      max: 100,
      icon: Eye,
    },
    {
      name: 'temperature',
      type: 'number' as const,
      label: 'Temperature',
      required: false,
      unit: '°C',
      min: -10,
      max: 50,
      icon: Thermometer,
    },
    {
      name: 'quality',
      type: 'select' as const,
      label: 'Quality Rating',
      required: false,
      options: ['Poor', 'Fair', 'Good', 'Excellent'],
    },
    {
      name: 'flowering',
      type: 'boolean' as const,
      label: 'Flowering',
      required: false,
    },
  ];

  const validationRules = [
    {
      field: 'height',
      type: 'range' as const,
      min: 1,
      max: 150,
      message: 'Height must be between 1 and 150 cm',
    },
    {
      field: 'weight',
      type: 'range' as const,
      min: 0.1,
      max: 1000,
      message: 'Weight must be between 0.1 and 1000 g',
    },
  ];

  const handleDataSaved = (entry: any) => {
    logger.info('system', 'Data entry saved:', { data: entry });
    // Here you would typically sync to your backend
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 bg-blue-600 text-white">
          <h1 className="text-xl font-bold">Research Data Logger</h1>
          <p className="text-blue-100">Demo Experiment: Plant Growth Study</p>
        </div>
        
        <MobileDataLogger
          experimentId={experimentId}
          treatments={treatments}
          blocks={blocks}
          measurementFields={measurementFields}
          validationRules={validationRules}
          onDataSaved={handleDataSaved}
        />
      </div>
    </div>
  );
}