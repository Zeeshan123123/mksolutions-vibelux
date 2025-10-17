"use client"

import React, { useEffect } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { HelpWrapper } from '../ContextualTooltip'
import { trackOnboardingEvent } from '@/lib/onboarding/utils'

export default function AnalyticsTour() {
  const { state, currentStep, isOnboardingActive } = useOnboarding()

  useEffect(() => {
    if (isOnboardingActive && currentStep?.page === '/analytics') {
      trackOnboardingEvent('step_complete', {
        stepId: currentStep.id,
        moduleId: state.currentModule || undefined
      })
    }
  }, [isOnboardingActive, currentStep, state.currentModule])

  return (
    <>
      {/* Analytics Dashboard */}
      <HelpWrapper
        elementId="analytics-dashboard"
        title="Analytics Dashboard"
        content="Comprehensive analytics platform for monitoring facility performance, energy usage, and crop production metrics in real-time."
        type="info"
        learnMoreUrl="/docs/analytics-dashboard"
        position="bottom"
      />

      {/* Performance Metrics */}
      <HelpWrapper
        elementId="analytics-performance"
        title="Performance Metrics"
        content="Track key performance indicators including energy efficiency, crop yields, and facility utilization rates across all your operations."
        type="info"
        position="top"
      />

      {/* Energy Monitoring */}
      <HelpWrapper
        elementId="analytics-energy-monitoring"
        title="Energy Monitoring"
        content="Monitor real-time energy consumption, peak demand, and cost analysis. Identify opportunities for energy savings and optimization."
        type="info"
        learnMoreUrl="/docs/energy-monitoring"
        position="right"
      />

      {/* Yield Tracking */}
      <HelpWrapper
        elementId="analytics-yield-tracking"
        title="Yield Tracking"
        content="Track crop yields, harvest schedules, and production efficiency. Compare performance across different zones and growing cycles."
        type="info"
        position="left"
      />

      {/* Environmental Trends */}
      <HelpWrapper
        elementId="analytics-environmental-trends"
        title="Environmental Trends"
        content="Analyze environmental data trends including temperature, humidity, CO2, and light levels. Identify patterns and optimize conditions."
        type="info"
        position="top"
      />

      {/* Predictive Analytics */}
      <HelpWrapper
        elementId="analytics-predictive"
        title="Predictive Analytics"
        content="AI-powered predictive models forecast crop yields, energy consumption, and equipment maintenance needs based on historical data."
        type="tip"
        learnMoreUrl="/docs/predictive-analytics"
        position="bottom"
      />

      {/* Cost Analysis */}
      <HelpWrapper
        elementId="analytics-cost-analysis"
        title="Cost Analysis"
        content="Detailed cost breakdown including energy, labor, materials, and operational expenses. Track ROI and profitability metrics."
        type="info"
        position="right"
      />

      {/* Comparative Analysis */}
      <HelpWrapper
        elementId="analytics-comparative"
        title="Comparative Analysis"
        content="Compare performance across different time periods, facilities, or growing methods. Identify best practices and improvement opportunities."
        type="info"
        position="left"
      />

      {/* Real-Time Alerts */}
      <HelpWrapper
        elementId="analytics-alerts"
        title="Real-Time Alerts"
        content="Configure intelligent alerts for critical conditions, equipment failures, or performance anomalies. Receive notifications via email or mobile."
        type="warning"
        position="bottom"
      />

      {/* Data Export */}
      <HelpWrapper
        elementId="analytics-export"
        title="Data Export"
        content="Export analytics data and reports in various formats including PDF, Excel, and CSV. Professional subscribers get enhanced export options."
        type="info"
        position="top"
      />

      {/* Custom Reports */}
      <HelpWrapper
        elementId="analytics-custom-reports"
        title="Custom Reports"
        content="Create custom reports with specific metrics, time ranges, and visualizations. Save and schedule reports for automated delivery."
        type="info"
        position="right"
      />

      {/* Dashboard Customization */}
      <HelpWrapper
        elementId="analytics-dashboard-customization"
        title="Dashboard Customization"
        content="Customize your analytics dashboard with widgets, charts, and metrics that matter most to your operation. Drag and drop interface."
        type="tip"
        position="left"
      />

      {/* Historical Data */}
      <HelpWrapper
        elementId="analytics-historical-data"
        title="Historical Data"
        content="Access historical data going back months or years. Analyze long-term trends and seasonal patterns in your facility performance."
        type="info"
        position="bottom"
      />

      {/* Equipment Performance */}
      <HelpWrapper
        elementId="analytics-equipment-performance"
        title="Equipment Performance"
        content="Monitor equipment efficiency, runtime hours, and maintenance schedules. Predict equipment failures and optimize maintenance timing."
        type="info"
        position="top"
      />

      {/* Benchmark Comparison */}
      <HelpWrapper
        elementId="analytics-benchmarks"
        title="Industry Benchmarks"
        content="Compare your facility performance against industry benchmarks and best practices. Identify areas for improvement and optimization."
        type="info"
        learnMoreUrl="/docs/industry-benchmarks"
        position="right"
      />

      {/* Weather Integration */}
      <HelpWrapper
        elementId="analytics-weather"
        title="Weather Integration"
        content="Correlate facility performance with weather data to optimize energy usage, ventilation, and supplemental lighting schedules."
        type="info"
        position="left"
      />

      {/* Carbon Footprint */}
      <HelpWrapper
        elementId="analytics-carbon-footprint"
        title="Carbon Footprint Tracking"
        content="Track and analyze your facility's carbon footprint, energy sources, and sustainability metrics. Generate ESG reports."
        type="info"
        position="bottom"
      />

      {/* Quality Metrics */}
      <HelpWrapper
        elementId="analytics-quality-metrics"
        title="Quality Metrics"
        content="Monitor crop quality indicators including potency, terpene profiles, and visual quality metrics. Track quality trends over time."
        type="info"
        position="top"
      />

      {/* Automation Analytics */}
      <HelpWrapper
        elementId="analytics-automation"
        title="Automation Analytics"
        content="Analyze the performance of automated systems including irrigation, lighting, and climate control. Optimize automation rules."
        type="info"
        position="right"
      />

      {/* Mobile Analytics */}
      <HelpWrapper
        elementId="analytics-mobile"
        title="Mobile Analytics"
        content="Access analytics on mobile devices with responsive design and touch-optimized interfaces. Monitor your facility from anywhere."
        type="tip"
        position="left"
      />

      {/* API Access */}
      <HelpWrapper
        elementId="analytics-api"
        title="API Access"
        content="Access analytics data through our REST API for custom integrations, third-party tools, and automated workflows."
        type="info"
        learnMoreUrl="/docs/analytics-api"
        position="bottom"
      />

      {/* Data Visualization */}
      <HelpWrapper
        elementId="analytics-visualization"
        title="Data Visualization"
        content="Advanced visualization tools including charts, graphs, heat maps, and 3D models to better understand your facility data."
        type="info"
        position="top"
      />

      {/* Anomaly Detection */}
      <HelpWrapper
        elementId="analytics-anomaly-detection"
        title="Anomaly Detection"
        content="AI-powered anomaly detection identifies unusual patterns, equipment issues, or environmental conditions that need attention."
        type="warning"
        position="right"
      />

      {/* Compliance Reporting */}
      <HelpWrapper
        elementId="analytics-compliance"
        title="Compliance Reporting"
        content="Generate compliance reports for regulatory requirements, energy audits, and certification programs. Automated report generation."
        type="info"
        position="left"
      />

      {/* Multi-Facility Analytics */}
      <HelpWrapper
        elementId="analytics-multi-facility"
        title="Multi-Facility Analytics"
        content="Compare and analyze performance across multiple facilities. Identify best practices and optimize resource allocation."
        type="info"
        position="bottom"
      />

      {/* Time Series Analysis */}
      <HelpWrapper
        elementId="analytics-time-series"
        title="Time Series Analysis"
        content="Advanced time series analysis with trend detection, seasonal adjustments, and forecasting capabilities for better planning."
        type="info"
        position="top"
      />

      {/* Statistical Analysis */}
      <HelpWrapper
        elementId="analytics-statistical"
        title="Statistical Analysis"
        content="Perform statistical analysis including correlation analysis, regression modeling, and hypothesis testing on your facility data."
        type="info"
        learnMoreUrl="/docs/statistical-analysis"
        position="right"
      />

      {/* Data Quality */}
      <HelpWrapper
        elementId="analytics-data-quality"
        title="Data Quality Monitoring"
        content="Monitor data quality, identify missing or erroneous data, and ensure the accuracy of your analytics and reports."
        type="warning"
        position="left"
      />

      {/* Collaboration Features */}
      <HelpWrapper
        elementId="analytics-collaboration"
        title="Team Collaboration"
        content="Share analytics dashboards, reports, and insights with team members. Add annotations and comments for better collaboration."
        type="info"
        position="bottom"
      />

      {/* Machine Learning */}
      <HelpWrapper
        elementId="analytics-machine-learning"
        title="Machine Learning Models"
        content="Advanced machine learning models for yield prediction, energy optimization, and equipment maintenance forecasting."
        type="tip"
        learnMoreUrl="/docs/machine-learning"
        position="top"
      />

      {/* Data Privacy */}
      <HelpWrapper
        elementId="analytics-data-privacy"
        title="Data Privacy & Security"
        content="Your analytics data is protected with enterprise-grade security, encryption, and privacy controls. GDPR compliant."
        type="info"
        position="right"
      />
    </>
  )
}