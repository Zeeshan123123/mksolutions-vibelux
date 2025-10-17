"use client"

import React, { useEffect } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { HelpWrapper } from '../ContextualTooltip'
import { trackOnboardingEvent } from '@/lib/onboarding/utils'

export default function DesignStudioTour() {
  const { state, currentStep, isOnboardingActive } = useOnboarding()

  useEffect(() => {
    if (isOnboardingActive && currentStep?.page === '/design') {
      trackOnboardingEvent('step_complete', {
        stepId: currentStep.id,
        moduleId: state.currentModule || undefined
      })
    }
  }, [isOnboardingActive, currentStep, state.currentModule])

  return (
    <>
      {/* CAD Import */}
      <HelpWrapper
        elementId="design-cad-import"
        title="Import CAD Files"
        content="Upload your facility designs in 60+ formats including DWG, RVT, IFC, and more. The system automatically extracts room dimensions and electrical layouts."
        type="tip"
        learnMoreUrl="/docs/cad-import"
        position="bottom"
      />

      {/* Design Canvas */}
      <HelpWrapper
        elementId="design-canvas"
        title="Design Canvas"
        content="This is your main workspace for creating lighting designs. Use the tools to add fixtures, modify layouts, and visualize results."
        type="info"
        position="top"
      />

      {/* Fixture Library */}
      <HelpWrapper
        elementId="design-fixture-library"
        title="Fixture Library"
        content="Browse professional lighting fixtures with accurate IES photometric data. Filter by manufacturer, type, and performance characteristics."
        type="info"
        position="right"
      />

      {/* Room Editor */}
      <HelpWrapper
        elementId="design-room-editor"
        title="Room Editor"
        content="Define room dimensions, ceiling height, and surface reflectance values. These parameters affect lighting calculations and uniformity."
        type="info"
        position="left"
      />

      {/* Fixture Placement */}
      <HelpWrapper
        elementId="design-fixture-placement"
        title="Fixture Placement"
        content="Drag fixtures from the library to position them in your design. Use snap-to-grid for precise alignment and uniform spacing."
        type="tip"
        position="bottom"
      />

      {/* PPFD Analysis */}
      <HelpWrapper
        elementId="design-ppfd-analysis"
        title="PPFD Analysis"
        content="View real-time photosynthetic photon flux density calculations. The heat map shows light distribution and uniformity across your growing area."
        type="info"
        learnMoreUrl="/docs/ppfd-calculations"
        position="top"
      />

      {/* Uniformity Metrics */}
      <HelpWrapper
        elementId="design-uniformity"
        title="Uniformity Metrics"
        content="Monitor light uniformity ratios (U1 and U2) to ensure consistent coverage. Good uniformity prevents hot spots and ensures even plant growth."
        type="info"
        position="right"
      />

      {/* Energy Calculations */}
      <HelpWrapper
        elementId="design-energy-calc"
        title="Energy Calculations"
        content="Track total power consumption, energy efficiency (μmol/J), and operating costs. These metrics help optimize your lighting investment."
        type="info"
        position="left"
      />

      {/* 3D Visualization */}
      <HelpWrapper
        elementId="design-3d-view"
        title="3D Visualization"
        content="Switch to 3D view to see your lighting design from different angles. This helps visualize fixture mounting and light distribution."
        type="tip"
        position="bottom"
      />

      {/* AI Recommendations */}
      <HelpWrapper
        elementId="design-ai-recommendations"
        title="AI Recommendations"
        content="Get intelligent suggestions for fixture placement, spacing, and configuration based on your crop type and growing requirements."
        type="tip"
        learnMoreUrl="/docs/ai-design-assistant"
        position="top"
      />

      {/* Layer Controls */}
      <HelpWrapper
        elementId="design-layers"
        title="Layer Controls"
        content="Organize your design elements using layers. Toggle visibility of fixtures, measurements, and analysis overlays for cleaner views."
        type="info"
        position="right"
      />

      {/* Measurement Tools */}
      <HelpWrapper
        elementId="design-measurements"
        title="Measurement Tools"
        content="Use measurement tools to verify distances, angles, and dimensions. Critical for ensuring proper fixture spacing and compliance."
        type="info"
        position="left"
      />

      {/* Crop Selection */}
      <HelpWrapper
        elementId="design-crop-selection"
        title="Crop Selection"
        content="Choose your crop type to optimize lighting calculations. Different crops have specific PPFD requirements and spectral preferences."
        type="info"
        position="bottom"
      />

      {/* Growth Stage */}
      <HelpWrapper
        elementId="design-growth-stage"
        title="Growth Stage"
        content="Select the growth stage to adjust lighting targets. Seedling, vegetative, and flowering stages have different light requirements."
        type="info"
        position="bottom"
      />

      {/* Mounting Height */}
      <HelpWrapper
        elementId="design-mounting-height"
        title="Mounting Height"
        content="Adjust fixture mounting height to optimize light distribution. Higher mounting reduces intensity but improves uniformity."
        type="info"
        position="top"
      />

      {/* Spectrum Analysis */}
      <HelpWrapper
        elementId="design-spectrum-analysis"
        title="Spectrum Analysis"
        content="Analyze the spectral composition of your lighting design. View photon distribution across different wavelengths for optimal plant response."
        type="info"
        learnMoreUrl="/docs/spectrum-analysis"
        position="top"
      />

      {/* Export Options */}
      <HelpWrapper
        elementId="design-export"
        title="Export Options"
        content="Export your design as CAD files, PDF reports, or bill of materials. Professional subscribers get access to all export formats."
        type="info"
        position="left"
      />

      {/* Save/Load */}
      <HelpWrapper
        elementId="design-save-load"
        title="Save & Load Projects"
        content="Save your designs to continue working later. Projects are automatically backed up and synchronized across devices."
        type="info"
        position="right"
      />

      {/* Zoom Controls */}
      <HelpWrapper
        elementId="design-zoom-controls"
        title="Zoom Controls"
        content="Use zoom controls to navigate your design. Mouse wheel, pinch gestures, and keyboard shortcuts are supported for easy navigation."
        type="info"
        position="bottom"
      />

      {/* Grid Settings */}
      <HelpWrapper
        elementId="design-grid-settings"
        title="Grid Settings"
        content="Customize grid size and snap settings for precise fixture placement. Grid helps maintain consistent spacing and professional layouts."
        type="info"
        position="top"
      />

      {/* Performance Metrics */}
      <HelpWrapper
        elementId="design-performance-metrics"
        title="Performance Metrics"
        content="Monitor key performance indicators including average PPFD, min/max values, and energy efficiency metrics in real-time."
        type="info"
        position="right"
      />

      {/* Validation Checks */}
      <HelpWrapper
        elementId="design-validation"
        title="Design Validation"
        content="Automated validation checks ensure your design meets industry standards and best practices. Warnings highlight potential issues."
        type="warning"
        position="left"
      />

      {/* Templates */}
      <HelpWrapper
        elementId="design-templates"
        title="Design Templates"
        content="Start with pre-configured templates for common facility types. Templates include optimized layouts and fixture recommendations."
        type="tip"
        position="bottom"
      />

      {/* Collaboration Tools */}
      <HelpWrapper
        elementId="design-collaboration"
        title="Collaboration Tools"
        content="Share designs with team members and stakeholders. Add comments, annotations, and revision notes for better project management."
        type="info"
        position="top"
      />

      {/* Electrical Integration */}
      <HelpWrapper
        elementId="design-electrical"
        title="Electrical Integration"
        content="View electrical load calculations, circuit planning, and power distribution. Essential for electrical contractors and facility planning."
        type="info"
        learnMoreUrl="/docs/electrical-integration"
        position="right"
      />

      {/* DLC Compliance */}
      <HelpWrapper
        elementId="design-dlc-compliance"
        title="DLC Compliance"
        content="Ensure your design meets DesignLights Consortium requirements for energy rebates and incentive programs."
        type="info"
        position="left"
      />

      {/* Cost Estimation */}
      <HelpWrapper
        elementId="design-cost-estimation"
        title="Cost Estimation"
        content="Get real-time cost estimates for fixtures, installation, and ongoing energy costs. Helps with budgeting and ROI analysis."
        type="info"
        position="bottom"
      />
    </>
  )
}