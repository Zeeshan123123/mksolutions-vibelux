# VibeLux GTM Container Implementation Guide

## Quick Setup (One-Click Import)

### Step 1: Import the Container
1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Create a new container or select existing one
3. Go to **Admin** → **Import Container**
4. Click **Choose container file** and select `vibelux-gtm-container.json`
5. Choose workspace: **Existing** or **New**
6. Choose import option: **Overwrite** (if new) or **Merge** (if existing)
7. Click **Confirm**

### Step 2: Update Variables with Your IDs
After import, update these variables with your actual tracking IDs:

1. **GA4 Measurement ID** → Replace `G-XXXXXXXXXX` with your GA4 ID
2. **Google Ads Conversion ID** → Replace `AW-XXXXXXXXXX` with your Ads ID
3. **Google Ads Lead Label** → Replace with your conversion label
4. **Facebook Pixel ID** → Replace with your Facebook Pixel ID
5. **LinkedIn Partner ID** → Replace with your LinkedIn ID
6. **Hotjar ID** → Replace with your Hotjar site ID

### Step 3: Publish the Container
1. Click **Submit** in the top right
2. Add version name: "VibeLux Initial Setup"
3. Click **Publish**

## What's Included

### 📊 Analytics Tags (11 Total)
- **GA4 Configuration** - Base analytics setup
- **GA4 Design Tool Started** - Track design tool usage
- **GA4 AI Design Generated** - Track AI design generation
- **GA4 CAD Export** - Track CAD/DWG exports
- **GA4 Purchase Credits** - E-commerce tracking
- **GA4 Signup** - User registration tracking
- **GA4 ROI Calculator** - Track calculator usage
- **Google Ads Conversion** - Lead tracking
- **Facebook Pixel** - Social media tracking
- **LinkedIn Insight Tag** - B2B tracking
- **Hotjar Tracking** - Heatmaps & recordings

### 🎯 Triggers (7 Total)
- All Pages (Pageview)
- Design Tool Started
- AI Design Generated
- CAD Export
- Purchase Complete
- User Signup
- ROI Calculator Submit
- Lead Form Submit

### 📦 Variables (20 Total)
**Configuration Variables:**
- GA4 Measurement ID
- Google Ads Conversion ID
- Google Ads Lead Label
- Facebook Pixel ID
- LinkedIn Partner ID
- Hotjar ID

**Data Layer Variables:**
- Facility Type
- Facility Size
- Design Complexity
- Credits Used
- Export Format
- Drawing Type
- Transaction Value
- Transaction ID
- User ID

**Built-in Variables:**
- Page Path
- Page URL
- Click Classes
- Click Text
- Form ID

## Implementation in VibeLux Code

Add these dataLayer pushes to your VibeLux application:

### Design Tool Started
```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  'event': 'design_tool_started',
  'facility_type': 'greenhouse', // or 'indoor', 'vertical_farm'
  'facility_size': '10000' // square feet
});
```

### AI Design Generated
```javascript
window.dataLayer.push({
  'event': 'ai_design_generated',
  'design_complexity': 'complex', // or 'simple', 'optimization'
  'credits_used': 25
});
```

### CAD Export
```javascript
window.dataLayer.push({
  'event': 'cad_export',
  'export_format': 'dwg', // or 'dxf', 'pdf', 'ifc'
  'drawing_type': 'electrical' // or 'mechanical', 'architectural'
});
```

### Purchase Complete
```javascript
window.dataLayer.push({
  'event': 'purchase',
  'transaction_value': 299.00,
  'transaction_id': 'TXN-123456',
  'items': [{
    'item_name': '6500 Credits Package',
    'item_id': 'CREDITS-6500',
    'price': 299.00,
    'quantity': 1
  }]
});
```

### User Signup
```javascript
window.dataLayer.push({
  'event': 'sign_up',
  'method': 'email' // or 'google', 'microsoft'
});
```

### ROI Calculator Submit
```javascript
window.dataLayer.push({
  'event': 'roi_calculator_submit',
  'estimated_savings': 125000,
  'payback_period': 18 // months
});
```

## Enhanced E-commerce Setup

For full e-commerce tracking, add these events:

### View Item (Credit Package)
```javascript
gtag('event', 'view_item', {
  currency: 'USD',
  value: 299.00,
  items: [{
    item_id: 'CREDITS-6500',
    item_name: '6500 Credits Package',
    item_category: 'AI_Credits',
    price: 299.00,
    quantity: 1
  }]
});
```

### Add to Cart
```javascript
gtag('event', 'add_to_cart', {
  currency: 'USD',
  value: 299.00,
  items: [{
    item_id: 'CREDITS-6500',
    item_name: '6500 Credits Package',
    item_category: 'AI_Credits',
    price: 299.00,
    quantity: 1
  }]
});
```

### Begin Checkout
```javascript
gtag('event', 'begin_checkout', {
  currency: 'USD',
  value: 299.00,
  items: [{
    item_id: 'CREDITS-6500',
    item_name: '6500 Credits Package',
    item_category: 'AI_Credits',
    price: 299.00,
    quantity: 1
  }]
});
```

## Custom Events for VibeLux Features

### Lighting Simulation
```javascript
window.dataLayer.push({
  'event': 'lighting_simulation',
  'ppfd_target': 800,
  'dli_target': 40,
  'fixture_count': 120
});
```

### ESG Report Generated
```javascript
window.dataLayer.push({
  'event': 'esg_report_generated',
  'scope2_reduction': 45, // percentage
  'carbon_credits_earned': 1200
});
```

### BMS Integration
```javascript
window.dataLayer.push({
  'event': 'bms_integrated',
  'integration_type': 'bacnet', // or 'modbus', 'mqtt'
  'device_count': 45
});
```

## Testing Your Implementation

1. **Install GTM Preview Chrome Extension**
2. Click **Preview** in GTM
3. Navigate through VibeLux and verify:
   - Tags fire correctly
   - Variables populate
   - Events track in GA4 Real-time

## Conversion Tracking Setup

### Google Ads
1. Create conversion action in Google Ads
2. Copy conversion ID and label
3. Update GTM variables
4. Test with Google Ads Tag Assistant

### Facebook
1. Create pixel in Facebook Business Manager
2. Copy pixel ID
3. Update GTM variable
4. Test with Facebook Pixel Helper

### LinkedIn
1. Get Insight Tag from Campaign Manager
2. Copy partner ID
3. Update GTM variable
4. Test with LinkedIn Insight Tag Helper

## Support & Questions

For implementation support or custom tracking needs:
- Documentation: `/docs/analytics`
- Support: support@vibelux.com
- GTM Template Gallery: Coming soon

---

**Note:** This container is optimized for VibeLux's unique features including AI design generation, CAD exports, and cannabis cultivation tracking.