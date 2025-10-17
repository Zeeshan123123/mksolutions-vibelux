# VibeLux Site Architecture Plan

## Simplified Navigation Structure

### Primary Navigation
```
VibeLux Logo | Product | Solutions | Pricing | Resources | Company | [Sign In] [Get Started]
```

### Navigation Breakdown

#### Product (Dropdown)
- **Design Tools**
  - 3D Design Studio → `/design`
  - PPFD Calculator → `/calculators/ppfd`
  - DLI Calculator → `/calculators/dli`
  - View All Tools → `/tools`
  
- **Automation**
  - Greenhouse Controls → `/automation`
  - Energy Optimization → `/energy`
  - Equipment Platform → `/equipment-board`
  
- **Features Overview** → `/features`
- **What's New** → `/changelog`
- **Roadmap** → `/roadmap`

#### Solutions (Dropdown)
- **By Industry**
  - Cannabis Cultivation → `/solutions/cannabis`
  - Vertical Farming → `/solutions/vertical-farming`
  - Greenhouse Production → `/solutions/greenhouse`
  - Research Facilities → `/solutions/research`
  
- **By Use Case**
  - Lighting Design → `/solutions/lighting-design`
  - Energy Management → `/solutions/energy-management`
  - Crop Optimization → `/solutions/crop-optimization`

#### Pricing
- Single page → `/pricing`
- No complex variations

#### Resources (Dropdown)
- Documentation → `/docs`
- API Reference → `/api-docs`
- Blog → `/blog`
- Support → `/support`
- Contact → `/contact`

#### Company (Dropdown)
- About → `/about`
- Careers → `/careers`
- Partners → `/partners`
- Press → `/press`

## Pages to Consolidate/Remove

### Dashboard Variants (Keep only one)
- Keep: `/dashboard`
- Remove: `/dashboard-demo`, `/dashboard-test`, `/dashboard-working`, `/dashboard-simple`

### Calculator Consolidation
- Create calculator hub at `/calculators` with categories:
  - Environmental (DLI, PPFD, VPD, etc.)
  - Financial (ROI, Energy Cost, etc.)
  - Electrical (Load, Wire Size, etc.)

### Feature Pages
- Consolidate 40+ individual feature pages into organized sections
- Create feature category pages instead of individual pages

## User Flows

### 1. Visitor → Trial User
- Landing → Product Overview → Pricing → Sign Up
- Landing → Use Calculator (Free) → See Benefits → Sign Up

### 2. Trial → Paid User
- Dashboard → Hit Limits → Upgrade Prompt → Pricing → Purchase
- Feature Usage → Need More → Upgrade

### 3. User → Power User
- Dashboard → Discover Features → Training Resources → Advanced Tools

## Content Strategy

### Hero Messaging
**Primary Value Prop**: "Professional Lighting Design Made Simple"
**Supporting Points**:
- Save 20-40% on energy costs
- Design in minutes, not hours
- Backed by scientific research

### Trust Building (Without Fake Testimonials)
- Show real metrics: "15+ Beta Facilities Testing"
- Display certifications/partnerships
- Highlight research backing
- Show calculation accuracy/methodology

### Call-to-Actions
- Primary: "Start Free Trial" / "Try Calculator"
- Secondary: "Book a Demo" / "See How It Works"
- Tertiary: "Contact Sales" / "Learn More"

## Technical Implementation

### 1. Create New Layout Components
- `MarketingLayout` - For all public pages
- `AppLayout` - For authenticated app pages
- `UnifiedNavigation` - Works in both contexts

### 2. Route Organization
```
/app
  /(marketing)
    - about/
    - pricing/
    - contact/
    - [other public pages]
  /(app)
    - dashboard/
    - design/
    - calculators/
    - [authenticated pages]
  /(auth)
    - sign-in/
    - sign-up/
```

### 3. Redirects for Old Pages
Set up redirects from old URLs to new consolidated pages

## Metrics to Track
- Conversion rate: Visitor → Trial
- Activation rate: Trial → Active User
- Upgrade rate: Trial → Paid
- Feature adoption rates
- Support ticket volume by page

## Phase 1 Implementation (Immediate)
1. Implement unified navigation
2. Consolidate duplicate pages
3. Set up redirects
4. Update all page imports

## Phase 2 (Next Sprint)
1. Create solution pages
2. Build feature hub pages
3. Improve onboarding flow
4. Add in-app upgrade prompts

## Phase 3 (Future)
1. Add interactive demos
2. Build resource center
3. Implement personalization
4. A/B test CTAs