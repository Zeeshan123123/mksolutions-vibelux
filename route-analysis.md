# VibeLux Route Analysis - Navigation vs Implementation

## Routes Found in Navigation Components

### UnifiedNavigation.tsx Routes:
- /dashboard
- /demo
- /features
- /design/advanced
- /designer
- /mobile-designer
- /design/climate-integrated
- /digital-twin
- /vertical-farming-suite
- /lighting-tools
- /operations
- /settings/zones
- /operations/hmi
- /cultivation
- /cultivation/crop-steering
- /autopilot
- /automation
- /maintenance-tracker
- /equipment
- /schedule
- /multi-site
- /analytics
- /reports
- /monitoring
- /predictions
- /intelligence
- /yield-prediction
- /hyperspectral
- /plant-identifier
- /research-library
- /research
- /research/experiment-designer
- /research/statistical-analysis
- /research/data-logger
- /research-demo
- /calculators
- /climate-tools
- /spectrum-builder
- /spectrum
- /light-recipes
- /water-analysis
- /nutrient-dosing
- /thermal-management
- /investment
- /investment/operations
- /investment/cost-analysis
- /investment/deal-flow
- /tco-calculator
- /business-modeling
- /revenue-sharing
- /rebate-calculator
- /equipment-leasing
- /carbon-credits
- /battery-optimization
- /demand-response
- /bms
- /weather-adaptive
- /pid-control
- /sensors
- /sensors/wireless
- /iot-devices
- /dlc-compliance
- /thd-compliance
- /fixtures
- /marketplace
- /marketplace/produce-board
- /marketplace/produce
- /marketplace/produce/grower-dashboard
- /marketplace/produce/create-listing
- /marketplace/produce/orders
- /marketplace/produce/analytics
- /marketplace/produce/buyers
- /pricing
- /pricing/revenue-sharing
- /pricing/revenue-sharing/simulator
- /pricing/revenue-sharing/terms
- /pricing/compare
- /pricing/calculator
- /resources
- /docs
- /api-docs
- /tutorials
- /blog
- /case-studies
- /community-forum
- /developer-tools
- /integrations
- /templates
- /about
- /collaboration-demo
- /playground
- /sync
- /settings
- /help
- /sign-in

### DeveloperNavigation.tsx Routes:
- /design/advanced
- /calculators
- /fixtures
- /lighting-tools
- /digital-twin
- /cultivation
- /operations
- /vertical-farming-suite
- /autopilot
- /equipment
- /maintenance-tracker
- /sensors
- /monitoring
- /climate-tools
- /analytics
- /intelligence
- /predictions
- /hyperspectral
- /plant-identifier
- /yield-prediction
- /water-analysis
- /spectrum
- /thermal-management
- /bms
- /battery-optimization
- /demand-response
- /carbon-credits
- /weather-adaptive
- /investment
- /facility
- /multi-site
- /reports
- /schedule
- /community-forum
- /api-docs
- /developer-tools
- /dev/analytics
- /integrations
- /settings/api

### Navigation.tsx Routes:
- /unified-dashboard
- /features
- /fixtures
- /research
- /professional-reporting
- /marketplace
- /energy-optimization
- /climate-intelligence
- /pricing
- /resources
- /about
- /sensors
- /sensors/wireless
- /predictions
- /dashboard
- /energy-dashboard
- /dashboard-builder
- /3d-visualization
- /calculators
- /design/advanced
- /sop-library
- /troubleshoot
- /control-center
- /workplace-safety
- /ipm
- /collaboration-demo
- /battery-optimization
- /demand-response
- /operations
- /cultivation/crop-steering
- /automation/blueprints
- /marketplace
- /workforce
- /quality
- /seed-to-sale
- /security
- /compliance-calendar
- /compare
- /equipment/offers
- /equipment/matches
- /affiliates
- /monitoring/environmental-rtr
- /monitoring/rtr-lighting
- /monitoring/psi
- /calculators/energy-moisture-balance
- /rd
- /sign-in

### UnifiedMainNavigation.tsx Routes:
- /tools
- /automation
- /features
- /changelog
- /roadmap
- /solutions/cannabis
- /solutions/vertical-farming
- /solutions/greenhouse
- /energy-optimization
- /pricing
- /docs
- /api-docs
- /blog
- /support
- /about
- /careers
- /contact
- /dashboard
- /account
- /sign-in
- /sign-up

### PricingNavigation.tsx Routes:
- /pricing
- /pricing/revenue-sharing
- /pricing/revenue-sharing/simulator
- /pricing/compare
- /pricing/calculator

### MobileNavigation.tsx Routes:
- /dashboard
- /designer
- /designer/new
- /designer/projects
- /designer/templates
- /lighting
- /calculator
- /fixtures
- /spectrum
- /planning
- /calendar
- /growth
- /yield
- /facility
- /hvac
- /electrical
- /environmental
- /settings

### AnimatedNavigation.tsx Routes:
- /features
- /fixtures
- /marketplace
- /pricing
- /resources
- /about
- /sensors
- /sensors/wireless
- /predictions
- /dashboard
- /dashboard-builder
- /3d-visualization
- /calculators
- /design/advanced
- /collaboration-demo
- /battery-optimization
- /demand-response
- /operations
- /cultivation/crop-steering
- /automation/blueprints

## Existing Page.tsx Files:
(Based on the bash command output showing all existing pages)

## Missing Routes Analysis:

### High Priority Missing Pages (Referenced in multiple nav components):
1. `/playground` - Referenced in UnifiedNavigation.tsx
2. `/tutorials` - Referenced in UnifiedNavigation.tsx  
3. `/unified-dashboard` - Referenced in Navigation.tsx
4. `/professional-reporting` - Referenced in Navigation.tsx
5. `/energy-dashboard` - Referenced in Navigation.tsx
6. `/dashboard-builder` - Referenced in Navigation.tsx
7. `/troubleshoot` - Referenced in Navigation.tsx
8. `/control-center` - Referenced in Navigation.tsx
9. `/workplace-safety` - Referenced in Navigation.tsx
10. `/ipm` - Referenced in Navigation.tsx
11. `/tools` - Referenced in UnifiedMainNavigation.tsx
12. `/methodology` - Referenced in plant-biology page
13. `/publications` - Referenced in plant-biology page
14. `/collaboration` - Referenced in plant-biology page

### Medium Priority Missing Pages (Single references):
1. `/designer/new` - Referenced in MobileNavigation.tsx
2. `/designer/projects` - Referenced in MobileNavigation.tsx
3. `/designer/templates` - Referenced in MobileNavigation.tsx
4. `/lighting` - Referenced in MobileNavigation.tsx
5. `/calculator` - Referenced in MobileNavigation.tsx
6. `/planning` - Referenced in MobileNavigation.tsx
7. `/calendar` - Referenced in MobileNavigation.tsx
8. `/growth` - Referenced in MobileNavigation.tsx
9. `/yield` - Referenced in MobileNavigation.tsx
10. `/hvac` - Referenced in MobileNavigation.tsx
11. `/electrical` - Referenced in MobileNavigation.tsx
12. `/environmental` - Referenced in MobileNavigation.tsx

### Lower Priority Missing Pages (Navigation breadcrumbs/links):
1. `/docs/arduino-setup` - Referenced in sensors components
2. `/docs/troubleshooting` - Referenced in sensors components
3. `/docs/arduino-troubleshooting` - Referenced in sensors components
4. `/developer/docs` - Referenced in developer/api-keys page
5. `/developer/examples` - Referenced in developer/api-keys page

## Summary:
- **Total routes referenced in navigation:** ~150+ unique routes
- **Total existing page.tsx files:** ~350+ pages  
- **Estimated missing pages:** ~25-30 high/medium priority pages
- **Main areas needing implementation:** Dashboard variants, developer tools, planning tools, facility management pages

## Recommendations:
1. **Immediate Action:** Create placeholder pages for high-priority missing routes
2. **Navigation Cleanup:** Remove or redirect broken navigation links
3. **Route Consolidation:** Consider if some routes should redirect to existing pages
4. **Documentation:** Update navigation components to reflect actual available pages