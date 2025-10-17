// Trial design types and templates
export interface TrialTemplate {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  parameters: TrialParameter[];
  measurements: TrialMeasurement[];
}

export interface TrialParameter {
  id: string;
  name: string;
  type: 'light' | 'nutrient' | 'environment' | 'substrate';
  values: string[];
  unit: string;
}

export interface TrialMeasurement {
  id: string;
  name: string;
  type: 'growth' | 'yield' | 'quality' | 'efficiency';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'final';
  unit: string;
}

export const MICROGREENS_TRIAL_TEMPLATES: TrialTemplate[] = [
  {
    id: 'light-spectrum-microgreens',
    name: 'Light Spectrum Optimization',
    description: 'Compare different LED spectra for microgreen production',
    duration: 14,
    parameters: [
      {
        id: 'spectrum',
        name: 'Light Spectrum',
        type: 'light',
        values: ['Full Spectrum', 'Red/Blue', 'Red/Blue/White', 'Control (Fluorescent)'],
        unit: 'spectrum type'
      }
    ],
    measurements: [
      {
        id: 'height',
        name: 'Plant Height',
        type: 'growth',
        frequency: 'daily',
        unit: 'mm'
      }
    ]
  }
];