# 🎨 VibeLux Theme Consistency Guide

## Current Theme Status

### **✅ What's Working:**
- **Dark/Light Mode:** Fully functional
- **Responsive Design:** Mobile-friendly
- **Component Library:** Consistent UI components
- **Typography:** Clean, readable fonts

### **⚠️ Inconsistencies Found:**

| Component | Current Colors | Should Be |
|-----------|---------------|-----------|
| **Main App** | Purple (#8B5CF6) + Green (#22C55E) | ✅ Correct |
| **CAD/Documents** | Green (#00A86B) only | Should include Purple |
| **Title Blocks** | Green theme only | Should match app theme |

---

## 🎨 **Unified VibeLux Brand Guidelines**

### **Primary Palette:**
```css
/* VibeLux Brand Colors */
--vibelux-purple: #8B5CF6;      /* Primary - Innovation */
--vibelux-purple-dark: #7C3AED; /* Primary Dark */
--vibelux-green: #22C55E;       /* Secondary - Growth */
--vibelux-green-dark: #16A34A;  /* Secondary Dark */
--vibelux-accent: #00A86B;      /* Accent - Professional */
```

### **UI Colors:**
```css
/* Backgrounds */
--vibelux-dark: #0f0d1f;        /* Dark mode primary */
--vibelux-darker: #0a0012;      /* Dark mode secondary */
--vibelux-light: #FFFFFF;       /* Light mode primary */
--vibelux-gray: #F3F4F6;        /* Light mode secondary */

/* Text */
--text-primary: #1F2937;        /* Light mode text */
--text-primary-dark: #F9FAFB;   /* Dark mode text */
--text-secondary: #6B7280;      /* Muted text */
```

### **Typography:**
```css
/* Font Stack */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Helvetica Neue', 'Arial', sans-serif;
--font-mono: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

---

## 🎯 **Where Theme Appears:**

### **1. Main Application UI**
- **Location:** `/src/app/globals.css`
- **Status:** ✅ Using correct Purple/Green theme
- **Action:** None needed

### **2. Tailwind Configuration**
- **Location:** `/tailwind.config.js`
- **Status:** ✅ Properly configured
- **Action:** None needed

### **3. Component Library**
- **Location:** `/src/components/*`
- **Status:** ✅ Using Tailwind classes
- **Action:** None needed

### **4. Professional Documents**
- **Locations:** 
  - `/src/lib/professional-standards/title-block-system.ts`
  - `/src/lib/ui/material-database-integration.ts`
  - `/src/lib/rendering/construction-detail-renderer.ts`
- **Status:** ⚠️ Using Green-only theme
- **Action:** Update to include Purple accent

### **5. CAD UI**
- **Location:** `/public/vibelux-cad-ui.css`
- **Status:** ⚠️ Using different color scheme
- **Action:** Align with main theme

---

## 🛠️ **Quick Fix Guide:**

### **To Unify All Themes:**

1. **Update Document Colors** in title-block files:
```typescript
brandColors: {
  primary: '#8B5CF6',    // Purple (was green)
  secondary: '#22C55E',  // Green
  accent: '#00A86B',     // Jade accent
  neutral: '#6B7280',    // Gray
  text: '#1F2937'        // Dark gray
}
```

2. **Update CAD UI** colors:
```css
:root {
  --vb-primary: #8B5CF6;     /* Purple */
  --vb-secondary: #22C55E;   /* Green */
  --vb-primary-hover: #7C3AED;
  --vb-secondary-hover: #16A34A;
}
```

---

## ✨ **Brand Usage Guidelines:**

### **Primary (Purple) - Use for:**
- CTAs and primary buttons
- Active states and selections
- Innovation and technology features
- AI/Advanced features

### **Secondary (Green) - Use for:**
- Success states
- Growth/agriculture features
- Environmental/sustainability
- Positive metrics

### **Accent (Jade) - Use for:**
- Professional documents
- Certifications
- Compliance features
- Trust indicators

### **Neutral (Grays) - Use for:**
- Body text
- Borders and dividers
- Disabled states
- Background layers

---

## 📱 **Responsive Considerations:**

- **Mobile:** Increase tap targets to 44px minimum
- **Tablet:** Optimize for touch with 8px spacing grid
- **Desktop:** Use hover states and tooltips
- **Print:** Use high contrast for documents

---

## 🔍 **Testing Theme Consistency:**

Run these checks:
1. Toggle dark/light mode on each page
2. Check hover/active states
3. Verify color contrast (WCAG AA minimum)
4. Test on different screen sizes
5. Print preview for documents

---

## ✅ **Theme Checklist:**

- [ ] Update document generator colors
- [ ] Align CAD UI with main theme
- [ ] Update logo if needed
- [ ] Test dark mode throughout
- [ ] Verify accessibility contrast
- [ ] Update marketing materials
- [ ] Check email templates
- [ ] Review error/success states

---

*Theme Guide v1.0 - VibeLux Platform*  
*Purple + Green = Innovation + Growth*