#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Pages that have use client directive conflicts
const pagesToFix = [
  'src/app/register/page.tsx',
  'src/app/reset-password/page.tsx',
  'src/app/sell/page.tsx',
  'src/app/seller/verification/page.tsx',
  'src/app/settings/notifications/page.tsx',
  'src/app/settings/payment-methods/page.tsx',
  'src/app/settings/profile/page.tsx',
  'src/app/unsubscribe/page.tsx',
  'src/app/vendor-registration/page.tsx',
  'src/app/vendor/dashboard/page.tsx',
  'src/app/vendor/dashboard/create-listing/page.tsx',
  'src/app/vendor/dashboard/photo-guide/page.tsx',
  'src/app/vendor/dashboard/photo-management/page.tsx',
  'src/app/vendor/media-library/page.tsx',
  'src/app/vendor/onboarding/page.tsx',
  'src/app/vendor/onboarding/return/page.tsx',
  'src/app/vendor/settings/page.tsx',
  'src/app/verify-email/page.tsx'
];

pagesToFix.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file has both directives
      if (content.includes("export const dynamic = 'force-dynamic'") && 
          (content.includes("'use client'") || content.includes('"use client"'))) {
        
        // Remove the force-dynamic export
        content = content.replace(/export const dynamic = 'force-dynamic'\s*\n\s*\n?/, '');
        
        fs.writeFileSync(filePath, content);
        console.log(`✓ Fixed: ${filePath}`);
      } else {
        console.log(`⚠ No conflict found: ${filePath}`);
      }
    } else {
      console.log(`✗ File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
});

console.log('\nDone!');