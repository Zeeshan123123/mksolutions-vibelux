# Deprecated Marketing Components

## Overview
The following marketing components have been consolidated into `ConsolidatedMarketing.tsx` and `SimplifiedFAQ.tsx` to reduce overlap and maintain consistency.

## Deprecated Components (Do Not Use)

### Replaced by ConsolidatedMarketing.tsx:
- `ImprovedHomepage.tsx` - Overlapping value propositions and features
- `HowItWorksGuide.tsx` - Duplicate how-it-works content
- `ValueProposition.tsx` - Conflicting savings claims
- `FeatureHighlights.tsx` - Redundant feature lists

### Replaced by SimplifiedFAQ.tsx:
- `ImprovedFAQ.tsx` - Duplicate FAQ content with inconsistent answers

### Still Active (Specialized Use Cases):
- `CustomerJourneyOptimizer.tsx` - Interactive journey mapping (updated with realistic claims)
- `CustomerTestimonials.tsx` - Testimonials component
- `ROICalculator.tsx` - Interactive calculator tool
- `MarketingAnalyticsDashboard.tsx` - Analytics tracking
- `BiomassOptimizationHowItWorks.tsx` - Specific feature deep-dive
- `THCLightCorrelationHowItWorks.tsx` - Specific feature deep-dive
- `FunctionalFoodsHowItWorks.tsx` - Specific feature deep-dive
- `DocumentManagementFeatures.tsx` - Specific feature showcase
- `FeatureDeepDive.tsx` - Detailed feature exploration
- `FeatureComparison.tsx` - Competitive comparison
- `PricingComparison.tsx` - Pricing tables
- `ProcessFlow.tsx` - Process visualization
- `TechnicalFlowChart.tsx` - Technical diagrams
- `IntegrationDiagram.tsx` - Integration visualization
- `OperationsComparison.tsx` - Operations feature comparison
- `OperationalFeaturesAnnouncement.tsx` - Feature announcements
- `RegressionAnalysisShowcase.tsx` - Statistical feature showcase
- `UtilityConnectionDemo.tsx` - Utility integration demo
- `MarketingInitializer.tsx` - Marketing setup utility
- `HowItWorksTechnical.tsx` - Technical implementation guide

## Migration Guide

### For Energy Savings Claims:
```typescript
import { ENERGY_SAVINGS } from '@/components/marketing/ConsolidatedMarketing'
// Use: ENERGY_SAVINGS.percentage, ENERGY_SAVINGS.monthlyAverage, etc.
```

### For Yield Improvements:
```typescript
import { YIELD_IMPROVEMENTS } from '@/components/marketing/ConsolidatedMarketing'
// Use: YIELD_IMPROVEMENTS.percentage, YIELD_IMPROVEMENTS.typical, etc.
```

### For Core Features:
```typescript
import { CORE_FEATURES } from '@/components/marketing/ConsolidatedMarketing'
// Use: CORE_FEATURES array for consistent feature listing
```

### For How It Works:
```typescript
import { HOW_IT_WORKS } from '@/components/marketing/ConsolidatedMarketing'
// Use: HOW_IT_WORKS array for consistent process steps
```

### For Customer Types:
```typescript
import { CUSTOMER_TYPES } from '@/components/marketing/ConsolidatedMarketing'
// Use: CUSTOMER_TYPES array for consistent customer segments
```

## Benefits of Consolidation

1. **Single Source of Truth**: All claims and features defined in one place
2. **Consistency**: Same messaging across all pages
3. **Maintainability**: Update once, reflect everywhere
4. **Performance**: Less duplicate code to load
5. **Accuracy**: Realistic claims with proper disclaimers

## Notes

- Keep deprecated components for reference but do not use in new development
- All new marketing content should use the consolidated components
- Update any existing pages still using deprecated components
- Ensure all claims include appropriate disclaimers