// Feature flag system for gradually restoring complex components
// This allows us to enable real components one at a time without breaking builds

export const RESTORED_COMPONENTS = {
  // Charts and Visualizations
  coverageVisualization: true,
  enhancedChartRenderer: false,
  sensorDataVisualization: false,
  
  // Dashboards
  energyOptimizationDashboard: false,
  sustainabilityDashboard: false,
  referralDashboard: false,
  creditDashboard: false,
  
  // 3D Components
  simple3DView: false,
  verticalFarmLayout3D: false,
  cfdVisualization: false,
  
  // Advanced Analytics
  advancedAnalyticsDashboard: false,
  pilotProgramDashboard: false,
  revenueSharingDashboard: false,
  
  // Admin Features
  userAnalyticsDashboard: false,
  debugDashboard: false,
  adminDashboardOverview: false,
  
  // Interactive Tools
  interactivePsychrometricChart: false,
  verticalFarmingEconomicsChart: false,
  
  // Mobile Components
  mobileFieldDashboard: false,
  
  // Service Monitoring
  serviceHealthDashboard: false,
  energyVerificationDashboard: false
} as const;

export type RestorableComponent = keyof typeof RESTORED_COMPONENTS;

export function isComponentRestored(component: RestorableComponent): boolean {
  return RESTORED_COMPONENTS[component];
}

export function getComponentImportPath(component: RestorableComponent, stubPath: string, realPath: string): string {
  return isComponentRestored(component) ? realPath : stubPath;
}