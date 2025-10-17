# Missing Pages Analysis - VibeLux App

## Critical Missing Pages (404 Errors)

### From UnifiedNavigation.tsx (Main Navigation)
1. **`/playground`** - Quick Access section
2. **`/tutorials`** - Resources section  
3. **`/sync`** - Quick Access section

### From Navigation.tsx (Legacy Navigation)
1. **`/unified-dashboard`** - Main nav link
2. **`/professional-reporting`** - Main nav link
3. **`/energy-dashboard`** - Safe Features section
4. **`/dashboard-builder`** - Safe Features section
5. **`/troubleshoot`** - Safe Features section
6. **`/control-center`** - Safe Features section
7. **`/workplace-safety`** - Safe Features section
8. **`/ipm`** - Safe Features section (IPM = Integrated Pest Management)

### From UnifiedMainNavigation.tsx (Marketing Nav)
1. **`/tools`** - Product dropdown
2. **`/changelog`** - Product dropdown
3. **`/roadmap`** - Product dropdown

### From MobileNavigation.tsx (Mobile Specific)
1. **`/designer/new`** - Designer submenu
2. **`/designer/projects`** - Designer submenu
3. **`/designer/templates`** - Designer submenu
4. **`/lighting`** - Main nav item
5. **`/calculator`** - Lighting submenu (conflicts with `/calculators`)
6. **`/planning`** - Main nav item
7. **`/calendar`** - Planning submenu
8. **`/growth`** - Planning submenu
9. **`/yield`** - Planning submenu
10. **`/hvac`** - Facility submenu
11. **`/electrical`** - Facility submenu
12. **`/environmental`** - Facility submenu

### From DeveloperNavigation.tsx
1. **`/dev/analytics`** - Developer Resources (marked as NEW)

## Pages That Exist But May Have Different Routes

### Potential Route Conflicts/Redirects Needed:
1. **`/calculator`** vs **`/calculators`** - Mobile nav uses singular, main app uses plural
2. **`/yield`** vs **`/yield-prediction`** - Mobile nav uses short form
3. **`/fixtures`** vs **`/fixtures/[id]`** - Base vs dynamic route

## Missing Supporting Pages

### Documentation & Help:
1. **`/docs/arduino-setup`** - Hardware setup guide
2. **`/docs/troubleshooting`** - General troubleshooting
3. **`/docs/arduino-troubleshooting`** - Arduino specific help
4. **`/developer/docs`** - Developer documentation
5. **`/developer/examples`** - Code examples

### External Links (Not 404s but referenced):
- Various research papers and external resources in `/research-library`
- Social media links in investor pages
- Email links throughout the app

## Recommendations for Implementation

### Immediate Priority (High Traffic Routes):
1. **`/playground`** - Create interactive demo/sandbox page
2. **`/tools`** - Create tools overview page or redirect to `/calculators`
3. **`/changelog`** - Create product updates/changelog page
4. **`/roadmap`** - Create product roadmap page
5. **`/unified-dashboard`** - Create comprehensive dashboard or redirect to `/dashboard`

### Medium Priority (Feature-Specific):
1. **`/professional-reporting`** - Create professional reports page
2. **`/energy-dashboard`** - Create energy-specific dashboard
3. **`/dashboard-builder`** - Create dashboard customization tool
4. **`/troubleshoot`** - Create troubleshooting assistant
5. **`/control-center`** - Create facility control center

### Lower Priority (Mobile/Specific Features):
1. **`/designer/new`** - Create new project page
2. **`/designer/projects`** - Create project management page
3. **`/designer/templates`** - Create template library
4. **`/planning`** - Create planning tools page
5. **`/calendar`** - Create crop calendar
6. **`/growth`** - Create growth tracking page

### Development/Documentation:
1. **`/dev/analytics`** - Create page analytics for developers
2. **`/docs/*`** - Create documentation pages
3. **`/developer/docs`** - Create developer documentation
4. **`/developer/examples`** - Create code examples

## Implementation Strategy

### Phase 1 (Week 1):
- Create placeholder pages for all high-priority missing routes
- Add "Coming Soon" overlays with email capture
- Fix navigation to prevent 404s

### Phase 2 (Week 2-3):
- Implement core functionality for high-priority pages
- Create proper redirect rules for conflicting routes
- Add proper error handling and fallbacks

### Phase 3 (Week 4+):
- Implement medium and lower priority pages
- Add full functionality and content
- Optimize and polish user experience

## Quick Fix Options:

### Redirect Solutions:
```javascript
// Next.js redirects in next.config.js
'/calculator': '/calculators',
'/yield': '/yield-prediction',
'/tools': '/calculators',
'/unified-dashboard': '/dashboard',
'/professional-reporting': '/reports'
```

### Placeholder Page Template:
Create a reusable component for "Coming Soon" pages that:
- Shows the intended page title and description
- Provides email signup for notifications
- Links to related existing pages
- Maintains consistent design with the app

## Total Missing Pages: ~25-30 routes need implementation or redirection