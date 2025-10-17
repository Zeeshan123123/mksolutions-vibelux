/**
 * Advanced Scheduling for HLP
 * Supports multiple daily setpoints with spectral transitions
 */

import { HLPChannelType } from './types';

export interface SpectralSetpoint {
  time: string; // HH:MM format
  spectrum: {
    [key in HLPChannelType]?: number; // 0-100%
  };
  intensity: number; // Master intensity 0-100%
  transitionMinutes: number; // Time to transition from previous setpoint
  name?: string; // Optional label like "Morning", "Peak", "EOD"
}

export interface DimmingConfig {
  type: '0-10V' | 'PWM' | 'DALI' | 'Phase';
  voltageMin: number; // Minimum voltage (typically 1V for 0-10V)
  voltageMax: number; // Maximum voltage (typically 10V)
  dimmingCurve: 'linear' | 'logarithmic' | 'square' | 'custom';
  customCurve?: Array<{ input: number; output: number }>; // For custom curves
  inverseLogic?: boolean; // Some dimmers use 10V = off, 0V = full
}

export interface AdvancedSchedule {
  id: string;
  name: string;
  enabled: boolean;
  
  // Multiple setpoints throughout the day
  dailySetpoints: SpectralSetpoint[];
  
  // Special events
  specialEvents?: {
    sunrise?: {
      enabled: boolean;
      duration: number; // minutes
      startOffset: number; // minutes before first setpoint
      spectrum: { [key in HLPChannelType]?: number };
    };
    sunset?: {
      enabled: boolean;
      duration: number; // minutes
      endOffset: number; // minutes after last setpoint
      spectrum: { [key in HLPChannelType]?: number };
    };
    endOfDayFarRed?: {
      enabled: boolean;
      duration: number; // minutes
      intensity: number; // Far-red intensity
      startTime?: string; // Override time or use sunset
    };
    nightInterruption?: {
      enabled: boolean;
      time: string; // HH:MM
      duration: number; // minutes
      spectrum: { [key in HLPChannelType]?: number };
      intensity: number;
    };
  };
  
  // Repeat pattern
  repeatDays: number[]; // 0=Sunday, 6=Saturday
  
  // Dimming configuration
  dimmingConfig?: DimmingConfig;
  
  // Advanced options
  adaptiveDLI?: {
    enabled: boolean;
    targetDLI: number;
    sensorFeedback: boolean;
  };
  
  // Season adjustment
  seasonalAdjustment?: {
    enabled: boolean;
    summerOffset: number; // Hours to extend
    winterOffset: number; // Hours to reduce
  };
}

export interface ScheduleExecution {
  scheduleId: string;
  currentSetpointIndex: number;
  nextTransitionTime: Date;
  isTransitioning: boolean;
  transitionProgress: number; // 0-100%
  currentSpectrum: { [key in HLPChannelType]?: number };
  currentIntensity: number;
  actualVoltageOutput?: { [key: string]: number }; // Channel to voltage mapping
}

/**
 * Calculate current spectrum based on schedule and time
 */
export function calculateCurrentSpectrum(
  schedule: AdvancedSchedule,
  currentTime: Date = new Date()
): {
  spectrum: { [key in HLPChannelType]?: number };
  intensity: number;
  activeSetpoint: string;
  nextTransition: Date | null;
} {
  const timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
  const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  // Find active setpoint
  let activeIndex = 0;
  for (let i = 0; i < schedule.dailySetpoints.length; i++) {
    const setpointMinutes = timeToMinutes(schedule.dailySetpoints[i].time);
    if (minutes >= setpointMinutes) {
      activeIndex = i;
    } else {
      break;
    }
  }
  
  const currentSetpoint = schedule.dailySetpoints[activeIndex];
  const nextSetpoint = schedule.dailySetpoints[activeIndex + 1] || schedule.dailySetpoints[0];
  
  // Check if we're in a transition
  const currentSetpointMinutes = timeToMinutes(currentSetpoint.time);
  const nextSetpointMinutes = timeToMinutes(nextSetpoint.time);
  const transitionDuration = nextSetpoint.transitionMinutes;
  
  let spectrum = { ...currentSetpoint.spectrum };
  let intensity = currentSetpoint.intensity;
  
  // Calculate if we're in transition
  if (nextSetpointMinutes > currentSetpointMinutes) {
    const transitionStart = nextSetpointMinutes - transitionDuration;
    if (minutes >= transitionStart && minutes < nextSetpointMinutes) {
      // We're in transition
      const progress = (minutes - transitionStart) / transitionDuration;
      spectrum = interpolateSpectrum(currentSetpoint.spectrum, nextSetpoint.spectrum, progress);
      intensity = interpolate(currentSetpoint.intensity, nextSetpoint.intensity, progress);
    }
  }
  
  // Apply special events
  spectrum = applySpecialEvents(schedule, spectrum, intensity, currentTime);
  
  // Calculate next transition
  const nextTransitionMinutes = activeIndex < schedule.dailySetpoints.length - 1
    ? timeToMinutes(schedule.dailySetpoints[activeIndex + 1].time) - schedule.dailySetpoints[activeIndex + 1].transitionMinutes
    : 24 * 60 + timeToMinutes(schedule.dailySetpoints[0].time) - schedule.dailySetpoints[0].transitionMinutes;
    
  const nextTransition = new Date(currentTime);
  nextTransition.setHours(Math.floor(nextTransitionMinutes / 60));
  nextTransition.setMinutes(nextTransitionMinutes % 60);
  
  return {
    spectrum,
    intensity,
    activeSetpoint: currentSetpoint.name || `Setpoint ${activeIndex + 1}`,
    nextTransition
  };
}

/**
 * Convert intensity percentage to voltage based on dimming configuration
 */
export function intensityToVoltage(
  intensity: number, // 0-100%
  config: DimmingConfig
): number {
  // Normalize intensity to 0-1
  let normalized = intensity / 100;
  
  // Apply dimming curve
  switch (config.dimmingCurve) {
    case 'logarithmic':
      // Logarithmic curve for better perceived linearity
      normalized = Math.log10(normalized * 9 + 1) / Math.log10(10);
      break;
    case 'square':
      // Square law dimming
      normalized = normalized * normalized;
      break;
    case 'custom':
      if (config.customCurve) {
        // Interpolate custom curve
        normalized = interpolateCustomCurve(normalized, config.customCurve);
      }
      break;
    // 'linear' uses normalized as-is
  }
  
  // Apply inverse logic if needed
  if (config.inverseLogic) {
    normalized = 1 - normalized;
  }
  
  // Map to voltage range
  const voltage = config.voltageMin + (normalized * (config.voltageMax - config.voltageMin));
  
  return Math.round(voltage * 100) / 100; // Round to 2 decimal places
}

/**
 * Generate example schedules for different crop types
 */
export function generateCropSchedule(cropType: string): AdvancedSchedule {
  const schedules: { [key: string]: AdvancedSchedule } = {
    'lettuce': {
      id: 'lettuce-standard',
      name: 'Lettuce Production',
      enabled: true,
      dailySetpoints: [
        {
          time: '06:00',
          spectrum: { BLUE: 25, RED: 70, FAR_RED: 5 },
          intensity: 80,
          transitionMinutes: 30,
          name: 'Morning'
        },
        {
          time: '08:00',
          spectrum: { BLUE: 20, RED: 75, FAR_RED: 5 },
          intensity: 100,
          transitionMinutes: 60,
          name: 'Peak Growth'
        },
        {
          time: '20:00',
          spectrum: { BLUE: 15, RED: 60, FAR_RED: 25 },
          intensity: 60,
          transitionMinutes: 30,
          name: 'Evening'
        },
        {
          time: '22:00',
          spectrum: { BLUE: 0, RED: 0, FAR_RED: 0 },
          intensity: 0,
          transitionMinutes: 15,
          name: 'Night'
        }
      ],
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      dimmingConfig: {
        type: '0-10V',
        voltageMin: 1,
        voltageMax: 10,
        dimmingCurve: 'logarithmic',
        inverseLogic: false
      }
    },
    'cannabis-veg': {
      id: 'cannabis-veg',
      name: 'Cannabis Vegetative',
      enabled: true,
      dailySetpoints: [
        {
          time: '06:00',
          spectrum: { BLUE: 35, RED: 60, FAR_RED: 5 },
          intensity: 100,
          transitionMinutes: 15,
          name: 'Day Start'
        },
        {
          time: '00:00',
          spectrum: { BLUE: 0, RED: 0, FAR_RED: 0 },
          intensity: 0,
          transitionMinutes: 5,
          name: 'Night'
        }
      ],
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      dimmingConfig: {
        type: '0-10V',
        voltageMin: 1,
        voltageMax: 10,
        dimmingCurve: 'linear',
        inverseLogic: false
      }
    },
    'cannabis-flower': {
      id: 'cannabis-flower',
      name: 'Cannabis Flowering',
      enabled: true,
      dailySetpoints: [
        {
          time: '08:00',
          spectrum: { BLUE: 15, RED: 80, FAR_RED: 5 },
          intensity: 100,
          transitionMinutes: 15,
          name: 'Day Start'
        },
        {
          time: '19:45',
          spectrum: { BLUE: 10, RED: 60, FAR_RED: 30 },
          intensity: 80,
          transitionMinutes: 15,
          name: 'Pre-EOD'
        },
        {
          time: '20:00',
          spectrum: { BLUE: 0, RED: 0, FAR_RED: 0 },
          intensity: 0,
          transitionMinutes: 5,
          name: 'Night'
        }
      ],
      specialEvents: {
        endOfDayFarRed: {
          enabled: true,
          duration: 15,
          intensity: 100,
          startTime: '19:45'
        }
      },
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      dimmingConfig: {
        type: '0-10V',
        voltageMin: 1,
        voltageMax: 10,
        dimmingCurve: 'linear',
        inverseLogic: false
      }
    }
  };
  
  return schedules[cropType] || schedules['lettuce'];
}

// Helper functions
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function interpolateSpectrum(
  start: { [key in HLPChannelType]?: number },
  end: { [key in HLPChannelType]?: number },
  progress: number
): { [key in HLPChannelType]?: number } {
  const result: { [key in HLPChannelType]?: number } = {};
  
  // Get all channel types
  const allChannels = new Set([...Object.keys(start), ...Object.keys(end)]) as Set<HLPChannelType>;
  
  allChannels.forEach(channel => {
    const startVal = start[channel] || 0;
    const endVal = end[channel] || 0;
    result[channel] = interpolate(startVal, endVal, progress);
  });
  
  return result;
}

function interpolateCustomCurve(
  input: number,
  curve: Array<{ input: number; output: number }>
): number {
  // Find surrounding points
  let lower = curve[0];
  let upper = curve[curve.length - 1];
  
  for (let i = 0; i < curve.length - 1; i++) {
    if (input >= curve[i].input && input <= curve[i + 1].input) {
      lower = curve[i];
      upper = curve[i + 1];
      break;
    }
  }
  
  // Linear interpolation between points
  const range = upper.input - lower.input;
  const progress = range > 0 ? (input - lower.input) / range : 0;
  return interpolate(lower.output, upper.output, progress);
}

function applySpecialEvents(
  schedule: AdvancedSchedule,
  spectrum: { [key in HLPChannelType]?: number },
  intensity: number,
  currentTime: Date
): { [key in HLPChannelType]?: number } {
  // Implementation for special events would go here
  // This is a placeholder that returns the spectrum unchanged
  return spectrum;
}