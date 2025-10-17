// Stub for control systems catalog
export const CONTROL_SYSTEMS = []

export interface ControlSystem {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  protocols: string[];
  apiType: string;
  features: string[];
  integration: {
    method: string;
    requirements: string[];
    dataAvailable: string[];
    controlCapabilities: string[];
  };
}

export default CONTROL_SYSTEMS