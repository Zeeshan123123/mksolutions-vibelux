# VibeLux Onboarding System

A comprehensive, progressive onboarding system for the VibeLux platform that guides new users through key features with contextual help, interactive tours, and facility setup.

## Features

- **Progressive Onboarding**: Step-by-step guided tours that can be skipped or completed at user's pace
- **Welcome Sequence**: Comprehensive introduction to platform capabilities
- **Facility Setup Wizard**: Interactive configuration for facility type, crops, equipment, and zones
- **Contextual Help**: Tooltips and hints throughout the application
- **Progress Tracking**: Visual progress indicators with completion rewards
- **Page-Specific Tours**: Tailored tours for Dashboard, Design Studio, Calculators, and Analytics
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **Analytics Integration**: Track user engagement and completion rates

## Architecture

### Core Components

```
src/
├── contexts/
│   └── OnboardingContext.tsx          # Main context provider
├── hooks/
│   └── useOnboardingTour.ts           # Tour management hook
├── lib/onboarding/
│   └── utils.ts                       # Utility functions
└── components/onboarding/
    ├── OnboardingController.tsx       # Main controller
    ├── WelcomeSequence.tsx           # Welcome modal
    ├── OnboardingTooltip.tsx         # Guided tour tooltip
    ├── OnboardingProgress.tsx        # Progress tracking
    ├── FacilitySetupWizard.tsx       # Setup wizard
    ├── ContextualTooltip.tsx         # Contextual help
    ├── OnboardingSettings.tsx        # Settings panel
    ├── OnboardingPageWrapper.tsx     # Page integration
    └── tours/
        ├── DashboardTour.tsx          # Dashboard-specific help
        ├── DesignStudioTour.tsx       # Design studio help
        ├── CalculatorsTour.tsx        # Calculator help
        └── AnalyticsTour.tsx          # Analytics help
```

## Quick Start

### 1. Setup Provider

Wrap your application with the OnboardingProvider:

```tsx
// app/layout.tsx
import { OnboardingProvider } from '@/components/onboarding'

export default function RootLayout({ children }) {
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  )
}
```

### 2. Add Page Integration

Wrap your pages with OnboardingPageWrapper:

```tsx
// pages/dashboard.tsx
import { OnboardingPageWrapper } from '@/components/onboarding'

export default function Dashboard() {
  return (
    <OnboardingPageWrapper showOnboarding={true} autoStart={true}>
      <div data-onboarding="dashboard">
        {/* Your dashboard content */}
      </div>
    </OnboardingPageWrapper>
  )
}
```

### 3. Add Data Attributes

Add data attributes to target elements:

```tsx
// For guided tours
<button data-onboarding="new-design-button">
  New Design
</button>

// For contextual help
<div data-onboarding-help="ppfd-analysis">
  PPFD Analysis
</div>
```

## Components

### OnboardingController

Main controller that manages the entire onboarding experience.

```tsx
<OnboardingController 
  autoStart={true}           // Auto-start for new users
  showProgress={true}        // Show progress indicator
/>
```

### WelcomeSequence

Introduction modal with platform overview and module selection.

```tsx
<WelcomeSequence
  isOpen={showWelcome}
  onClose={() => setShowWelcome(false)}
  onStartOnboarding={handleStart}
  onSkipOnboarding={handleSkip}
/>
```

### HelpWrapper

Contextual help wrapper for UI elements.

```tsx
<HelpWrapper
  elementId="my-feature"
  title="Feature Name"
  content="Description of the feature"
  type="tip"                 // info, tip, warning, help
  position="bottom"          // top, bottom, left, right
  learnMoreUrl="/docs/feature"
>
  <button data-onboarding-help="my-feature">
    My Feature
  </button>
</HelpWrapper>
```

### FacilitySetupWizard

Interactive facility configuration wizard.

```tsx
<FacilitySetupWizard 
  onComplete={(config) => {
    // Handle facility configuration
    console.log('Facility config:', config)
  }}
  onSkip={() => {
    // Handle skip
  }}
/>
```

## Onboarding Modules

The system includes pre-configured modules:

### Welcome Module
- Platform introduction
- Dashboard overview
- Navigation tour

### Design Studio Module
- CAD import
- Fixture placement
- PPFD analysis
- 3D visualization

### Calculators Module
- VPD calculator
- Light requirements
- Coverage analysis
- Professional tools

### Facility Setup Module
- Facility information
- Crop selection
- Equipment setup
- Zone configuration

### Analytics Module
- Performance metrics
- Energy monitoring
- Alerts setup
- Data visualization

## Customization

### Creating Custom Tours

```tsx
import { useOnboarding } from '@/components/onboarding'

const customModule = {
  id: 'custom-tour',
  title: 'Custom Feature Tour',
  description: 'Learn about custom features',
  category: 'advanced',
  steps: [
    {
      id: 'step-1',
      title: 'First Step',
      description: 'This is the first step',
      targetElement: '[data-onboarding="step-1"]',
      position: 'bottom',
      order: 1
    }
  ]
}

export function CustomTour() {
  const { startOnboarding } = useOnboarding()
  
  return (
    <button onClick={() => startOnboarding('custom-tour')}>
      Start Custom Tour
    </button>
  )
}
```

### Tooltip Types

- **info**: General information tooltips (blue)
- **tip**: Helpful tips and suggestions (yellow)
- **warning**: Important warnings (orange)
- **help**: Help and documentation links (blue)

### Positioning Options

- **top**: Above the element
- **bottom**: Below the element
- **left**: Left of the element
- **right**: Right of the element
- **center**: Centered modal overlay

## User Preferences

Users can customize their onboarding experience:

- **Show Tooltips**: Enable/disable contextual help
- **Auto Progress**: Automatically advance tours
- **Contextual Help**: Show/hide help hints
- **Completion Rewards**: Enable achievement notifications

## Analytics & Tracking

The system tracks user engagement:

```tsx
import { trackOnboardingEvent } from '@/lib/onboarding/utils'

// Track events
trackOnboardingEvent('start', { moduleId: 'welcome' })
trackOnboardingEvent('complete', { completionRate: 85 })
trackOnboardingEvent('skip', { stepId: 'facility-setup' })
```

## Mobile Optimization

The system is fully responsive with mobile-specific adjustments:

- Touch-friendly interfaces
- Optimized tooltip sizes
- Simplified navigation
- Gesture support

## Accessibility

- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Focus management
- ARIA labels

## API Reference

### OnboardingContext

```tsx
interface OnboardingContextType {
  state: OnboardingState
  modules: OnboardingModule[]
  isOnboardingActive: boolean
  currentStep: OnboardingStep | null
  
  startOnboarding: (moduleId?: string) => void
  skipOnboarding: () => void
  completeOnboarding: () => void
  nextStep: () => void
  previousStep: () => void
  skipStep: (stepId: string) => void
  completeStep: (stepId: string) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
}
```

### OnboardingStep

```tsx
interface OnboardingStep {
  id: string
  title: string
  description: string
  targetElement?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  page?: string
  action?: string
  isCompleted?: boolean
  isOptional?: boolean
  order: number
}
```

### OnboardingModule

```tsx
interface OnboardingModule {
  id: string
  title: string
  description: string
  icon: string
  estimatedTime: string
  steps: OnboardingStep[]
  isCompleted?: boolean
  isOptional?: boolean
  prerequisite?: string[]
  category: 'getting-started' | 'design-studio' | 'dashboard' | 'calculators' | 'analytics' | 'advanced'
}
```

## Best Practices

### 1. Progressive Disclosure
- Start with essential features
- Introduce advanced features gradually
- Allow users to skip or return later

### 2. Contextual Relevance
- Show help when relevant
- Provide just-in-time guidance
- Avoid overwhelming users

### 3. Clear Navigation
- Provide clear next/previous actions
- Show progress indicators
- Allow easy exit

### 4. Accessibility
- Support keyboard navigation
- Provide screen reader compatibility
- Ensure sufficient color contrast

### 5. Performance
- Lazy load tour components
- Optimize for mobile devices
- Cache user preferences

## Testing

### Unit Tests
```bash
npm test -- --testPathPattern=onboarding
```

### Integration Tests
```bash
npm run test:integration -- --testNamePattern="onboarding"
```

### E2E Tests
```bash
npm run test:e2e -- --spec="onboarding/*"
```

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
```env
NEXT_PUBLIC_ONBOARDING_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

## Support

For questions or issues:
- Documentation: `/docs/onboarding`
- Support: `support@vibelux.ai`
- Community: `https://community.vibelux.ai`

## License

Copyright © 2025 VibeLux. All rights reserved.