"use client"

import React, { useEffect } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { HelpWrapper } from '../ContextualTooltip'
import { trackOnboardingEvent } from '@/lib/onboarding/utils'

export default function DashboardTour() {
  const { state, currentStep, isOnboardingActive } = useOnboarding()

  useEffect(() => {
    if (isOnboardingActive && currentStep?.page === '/dashboard') {
      trackOnboardingEvent('step_complete', {
        stepId: currentStep.id,
        moduleId: state.currentModule || undefined
      })
    }
  }, [isOnboardingActive, currentStep, state.currentModule])

  return (
    <>
      {/* Quick Stats Section */}
      <HelpWrapper
        elementId="dashboard-quick-stats"
        title="Quick Stats Overview"
        content="Monitor your key performance indicators at a glance. These metrics update in real-time and help you track facility performance."
        type="info"
        learnMoreUrl="/docs/dashboard-stats"
        position="bottom"
      />

      {/* Recent Projects */}
      <HelpWrapper
        elementId="dashboard-recent-projects"
        title="Recent Projects"
        content="View and manage your recent design projects. Click on any project to resume work or view detailed analysis."
        type="info"
        position="top"
      />

      {/* Quick Actions */}
      <HelpWrapper
        elementId="dashboard-quick-actions"
        title="Quick Actions"
        content="Access frequently used tools and features. These shortcuts help you navigate efficiently through common tasks."
        type="tip"
        position="left"
      />

      {/* Plant Monitoring Toggle */}
      <HelpWrapper
        elementId="dashboard-plant-monitoring"
        title="Advanced Plant Monitoring"
        content="Toggle the plant communication system to view real-time plant health metrics, stress indicators, and AI-powered insights."
        type="tip"
        learnMoreUrl="/docs/plant-monitoring"
        position="bottom"
      />

      {/* Notifications */}
      <HelpWrapper
        elementId="dashboard-notifications"
        title="Notification Center"
        content="Stay informed about alerts, system updates, and important facility events. Click to view detailed notifications."
        type="info"
        position="left"
      />

      {/* New Design Button */}
      <HelpWrapper
        elementId="dashboard-new-design"
        title="Create New Design"
        content="Start a new lighting design project. This opens the AI-powered design studio where you can create optimized lighting layouts."
        type="tip"
        position="left"
      />

      {/* Subscription Status */}
      <HelpWrapper
        elementId="dashboard-subscription"
        title="Subscription Status"
        content="Your current plan determines available features. Free plans have limitations on fixture count and export capabilities."
        type="info"
        position="bottom"
      />

      {/* Energy Efficiency Metric */}
      <HelpWrapper
        elementId="dashboard-energy-efficiency"
        title="Energy Efficiency"
        content="Track your lighting system's energy efficiency in μmol/J. Higher values indicate better energy performance."
        type="info"
        learnMoreUrl="/docs/energy-efficiency"
        position="top"
      />

      {/* Cost Savings Metric */}
      <HelpWrapper
        elementId="dashboard-cost-savings"
        title="Cost Savings"
        content="Monitor cumulative cost savings from energy optimizations, automated controls, and efficiency improvements."
        type="info"
        position="top"
      />

      {/* Recent Activity */}
      <HelpWrapper
        elementId="dashboard-recent-activity"
        title="Activity Feed"
        content="View recent system activities, completed calculations, and automated events. This helps you stay informed about facility operations."
        type="info"
        position="right"
      />

      {/* Multi-Site Manager (Enterprise) */}
      <HelpWrapper
        elementId="dashboard-multi-site"
        title="Multi-Site Manager"
        content="Manage multiple facilities from a single dashboard. Available for Enterprise subscribers to monitor all locations centrally."
        type="info"
        position="top"
      />

      {/* Admin Tools */}
      <HelpWrapper
        elementId="dashboard-admin-tools"
        title="Admin Tools"
        content="Access administrative functions including user management, system settings, and analytics. Only visible to administrators."
        type="info"
        position="left"
      />

      {/* PSI Score */}
      <HelpWrapper
        elementId="dashboard-psi-score"
        title="PSI Score"
        content="Plant Stress Index combines multiple physiological indicators to provide a comprehensive health score for your plants."
        type="info"
        learnMoreUrl="/docs/psi-monitoring"
        position="top"
      />

      {/* Sap Flow Monitor */}
      <HelpWrapper
        elementId="dashboard-sap-flow"
        title="Sap Flow Monitoring"
        content="Real-time sap flow measurements indicate plant hydration status and water transport efficiency."
        type="info"
        position="top"
      />

      {/* Stomatal Conductance */}
      <HelpWrapper
        elementId="dashboard-stomatal"
        title="Stomatal Conductance"
        content="Monitor gas exchange efficiency through stomatal conductance measurements. Critical for photosynthesis optimization."
        type="info"
        position="top"
      />

      {/* Growth Rate */}
      <HelpWrapper
        elementId="dashboard-growth-rate"
        title="Growth Rate Tracking"
        content="Track daily growth expansion rates to monitor plant development and optimize growing conditions."
        type="info"
        position="top"
      />

      {/* Leaf Wetness */}
      <HelpWrapper
        elementId="dashboard-leaf-wetness"
        title="Leaf Wetness Monitoring"
        content="Monitor leaf surface moisture to predict disease risk and optimize irrigation timing."
        type="warning"
        position="top"
      />

      {/* AI Analysis */}
      <HelpWrapper
        elementId="dashboard-ai-analysis"
        title="AI Health Analysis"
        content="Machine learning algorithms analyze all plant data to provide comprehensive health assessments and recommendations."
        type="tip"
        learnMoreUrl="/docs/ai-plant-analysis"
        position="top"
      />
    </>
  )
}