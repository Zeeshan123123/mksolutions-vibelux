"use client"

import React, { useEffect } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { HelpWrapper } from '../ContextualTooltip'
import { trackOnboardingEvent } from '@/lib/onboarding/utils'

export default function CalculatorsTour() {
  const { state, currentStep, isOnboardingActive } = useOnboarding()

  useEffect(() => {
    if (isOnboardingActive && currentStep?.page === '/calculators') {
      trackOnboardingEvent('step_complete', {
        stepId: currentStep.id,
        moduleId: state.currentModule || undefined
      })
    }
  }, [isOnboardingActive, currentStep, state.currentModule])

  return (
    <>
      {/* Calculator Grid */}
      <HelpWrapper
        elementId="calculators-grid"
        title="Professional Calculator Suite"
        content="Access 25+ professional-grade calculators designed for controlled environment agriculture. Each calculator uses industry-standard formulas and research-backed methods."
        type="info"
        learnMoreUrl="/docs/calculator-suite"
        position="bottom"
      />

      {/* VPD Calculator */}
      <HelpWrapper
        elementId="calculators-vpd"
        title="VPD Calculator"
        content="Calculate Vapor Pressure Deficit to optimize plant transpiration and growth. Essential for maintaining proper environmental conditions."
        type="tip"
        learnMoreUrl="/docs/vpd-calculator"
        position="top"
      />

      {/* Light Requirements */}
      <HelpWrapper
        elementId="calculators-light-requirements"
        title="Light Requirements Calculator"
        content="Determine optimal PPFD values for your specific crops and growth stages. Based on published research and industry best practices."
        type="info"
        position="top"
      />

      {/* Coverage Area */}
      <HelpWrapper
        elementId="calculators-coverage-area"
        title="Coverage Area Calculator"
        content="Calculate lighting coverage patterns and uniformity ratios. Helps determine proper fixture spacing and mounting heights."
        type="info"
        position="top"
      />

      {/* Energy Calculator */}
      <HelpWrapper
        elementId="calculators-energy"
        title="Energy Calculations"
        content="Analyze energy consumption, efficiency metrics, and operating costs. Compare different lighting technologies and configurations."
        type="info"
        position="top"
      />

      {/* Nutrient Calculator */}
      <HelpWrapper
        elementId="calculators-nutrients"
        title="Nutrient Calculator"
        content="Formulate precise nutrient solutions with EC, pH, and concentration calculations. Supports multiple nutrient lines and custom recipes."
        type="info"
        position="top"
      />

      {/* Psychrometric Calculator */}
      <HelpWrapper
        elementId="calculators-psychrometric"
        title="Psychrometric Calculator"
        content="Calculate air properties including humidity, dew point, and enthalpy. Essential for HVAC design and climate control."
        type="info"
        position="top"
      />

      {/* CO2 Enrichment */}
      <HelpWrapper
        elementId="calculators-co2"
        title="CO2 Enrichment Calculator"
        content="Determine CO2 injection rates and system sizing for optimal photosynthesis enhancement. Includes ventilation and leakage calculations."
        type="info"
        position="top"
      />

      {/* Transpiration Calculator */}
      <HelpWrapper
        elementId="calculators-transpiration"
        title="Transpiration Calculator"
        content="Calculate plant water uptake and transpiration rates based on environmental conditions and crop characteristics."
        type="info"
        position="top"
      />

      {/* Heat Load Calculator */}
      <HelpWrapper
        elementId="calculators-heat-load"
        title="Heat Load Calculator"
        content="Calculate cooling requirements for lighting systems and facility design. Critical for HVAC sizing and energy planning."
        type="info"
        position="top"
      />

      {/* ROI Calculator */}
      <HelpWrapper
        elementId="calculators-roi"
        title="ROI Calculator"
        content="Analyze return on investment for lighting upgrades, energy efficiency improvements, and facility expansions."
        type="info"
        position="top"
      />

      {/* Environmental Simulator */}
      <HelpWrapper
        elementId="calculators-environmental"
        title="Environmental Simulator"
        content="Model complex environmental interactions including temperature, humidity, lighting, and CO2 effects on plant growth."
        type="tip"
        learnMoreUrl="/docs/environmental-simulator"
        position="top"
      />

      {/* Electrical Estimator */}
      <HelpWrapper
        elementId="calculators-electrical"
        title="Electrical Estimator"
        content="Calculate electrical loads, circuit requirements, and power distribution for lighting systems. Helps with electrical planning and compliance."
        type="info"
        position="top"
      />

      {/* Production Planner */}
      <HelpWrapper
        elementId="calculators-production"
        title="Production Planner"
        content="Plan crop rotations, harvest schedules, and space utilization for continuous production cycles."
        type="info"
        position="top"
      />

      {/* PPFD Map Generator */}
      <HelpWrapper
        elementId="calculators-ppfd-map"
        title="PPFD Map Generator"
        content="Create detailed photosynthetic photon flux density maps for your growing area. Visualize light distribution and uniformity."
        type="info"
        position="top"
      />

      {/* Fertilizer Calculator */}
      <HelpWrapper
        elementId="calculators-fertilizer"
        title="Fertilizer Calculator"
        content="Calculate precise fertilizer mixing ratios and concentrations. Supports both liquid and dry fertilizers with cost analysis."
        type="info"
        position="top"
      />

      {/* Environmental Control */}
      <HelpWrapper
        elementId="calculators-environmental-control"
        title="Environmental Control Calculator"
        content="Design and optimize environmental control systems including heating, cooling, ventilation, and humidity management."
        type="info"
        position="top"
      />

      {/* Crop Planning Simulator */}
      <HelpWrapper
        elementId="calculators-crop-planning"
        title="Crop Planning Simulator"
        content="Model different growing scenarios, crop rotations, and space utilization strategies to optimize facility productivity."
        type="info"
        position="top"
      />

      {/* Calculator History */}
      <HelpWrapper
        elementId="calculators-history"
        title="Calculation History"
        content="Access previous calculations and saved results. Export calculations to PDF or share with team members."
        type="info"
        position="left"
      />

      {/* Favorites */}
      <HelpWrapper
        elementId="calculators-favorites"
        title="Favorite Calculators"
        content="Mark frequently used calculators as favorites for quick access. Customize your dashboard with most-used tools."
        type="tip"
        position="right"
      />

      {/* Unit Converter */}
      <HelpWrapper
        elementId="calculators-unit-converter"
        title="Unit Converter"
        content="Convert between different units of measurement commonly used in horticulture and facility design."
        type="info"
        position="bottom"
      />

      {/* Formulas Reference */}
      <HelpWrapper
        elementId="calculators-formulas"
        title="Formulas Reference"
        content="View the scientific formulas and research sources used in each calculator. Understand the methodology behind calculations."
        type="info"
        learnMoreUrl="/docs/calculator-formulas"
        position="top"
      />

      {/* Mobile Optimization */}
      <HelpWrapper
        elementId="calculators-mobile"
        title="Mobile Friendly"
        content="All calculators are optimized for mobile devices. Perform calculations in the field with touch-friendly interfaces."
        type="tip"
        position="bottom"
      />

      {/* Batch Calculations */}
      <HelpWrapper
        elementId="calculators-batch"
        title="Batch Calculations"
        content="Run multiple calculations simultaneously with different parameters. Compare scenarios and optimize your growing strategy."
        type="info"
        position="top"
      />

      {/* API Integration */}
      <HelpWrapper
        elementId="calculators-api"
        title="API Integration"
        content="Access calculator functions through our API for custom integrations and automated workflows."
        type="info"
        learnMoreUrl="/docs/calculator-api"
        position="top"
      />

      {/* Search Function */}
      <HelpWrapper
        elementId="calculators-search"
        title="Search Calculators"
        content="Quickly find specific calculators using the search function. Filter by category, crop type, or calculation type."
        type="info"
        position="bottom"
      />

      {/* Educational Content */}
      <HelpWrapper
        elementId="calculators-education"
        title="Educational Resources"
        content="Access educational content, tutorials, and best practices for each calculator. Learn the science behind optimal growing conditions."
        type="tip"
        learnMoreUrl="/docs/calculator-education"
        position="top"
      />

      {/* Data Export */}
      <HelpWrapper
        elementId="calculators-export"
        title="Export Results"
        content="Export calculation results to various formats including PDF, Excel, and CSV. Professional subscribers get enhanced export options."
        type="info"
        position="left"
      />

      {/* Preset Management */}
      <HelpWrapper
        elementId="calculators-presets"
        title="Preset Management"
        content="Save and manage calculation presets for different crops, facilities, and scenarios. Streamline repetitive calculations."
        type="info"
        position="right"
      />

      {/* Collaboration Features */}
      <HelpWrapper
        elementId="calculators-collaboration"
        title="Team Collaboration"
        content="Share calculations with team members and stakeholders. Add notes, comments, and revision history for better project management."
        type="info"
        position="top"
      />

      {/* Validation Warnings */}
      <HelpWrapper
        elementId="calculators-validation"
        title="Input Validation"
        content="Automatic validation checks ensure realistic input values and warn about potential issues or suboptimal conditions."
        type="warning"
        position="bottom"
      />
    </>
  )
}