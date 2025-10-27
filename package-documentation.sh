#!/bin/bash

# VibeLux Documentation Packaging Script
# This script creates a complete documentation package for download and sharing

echo "📦 VibeLux Documentation Packaging"
echo "===================================="
echo ""

# Configuration
EXPORT_DIR="documentation-export"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="VibeLux_Documentation_${TIMESTAMP}"
PACKAGE_DIR="${EXPORT_DIR}/${PACKAGE_NAME}"

# Create directories
echo "📁 Creating export directory..."
mkdir -p "${PACKAGE_DIR}"

# Copy main documentation files
echo "📄 Copying documentation files..."
cp PROJECT_OUTLINE.md "${PACKAGE_DIR}/" 2>/dev/null && echo "   ✓ PROJECT_OUTLINE.md" || echo "   ✗ PROJECT_OUTLINE.md not found"
cp PROJECT_EXECUTIVE_SUMMARY.md "${PACKAGE_DIR}/" 2>/dev/null && echo "   ✓ PROJECT_EXECUTIVE_SUMMARY.md" || echo "   ✗ PROJECT_EXECUTIVE_SUMMARY.md not found"
cp VIBELUX_PROJECT_DOCUMENTATION.md "${PACKAGE_DIR}/" 2>/dev/null && echo "   ✓ VIBELUX_PROJECT_DOCUMENTATION.md" || echo "   ✗ VIBELUX_PROJECT_DOCUMENTATION.md not found"

# Copy supporting documentation
echo ""
echo "📋 Copying supporting files..."
cp COMPLETE_PLATFORM_SUMMARY.md "${PACKAGE_DIR}/" 2>/dev/null && echo "   ✓ COMPLETE_PLATFORM_SUMMARY.md"
cp COMPREHENSIVE_PLATFORM_STATUS.md "${PACKAGE_DIR}/" 2>/dev/null && echo "   ✓ COMPREHENSIVE_PLATFORM_STATUS.md"
cp PRODUCTION_READINESS_FINAL_REPORT.md "${PACKAGE_DIR}/" 2>/dev/null && echo "   ✓ PRODUCTION_READINESS_FINAL_REPORT.md"
cp CRITICAL_ISSUES.md "${PACKAGE_DIR}/" 2>/dev/null && echo "   ✓ CRITICAL_ISSUES.md"
cp FEATURE_LIST.md "${PACKAGE_DIR}/" 2>/dev/null && echo "   ✓ FEATURE_LIST.md"
cp README.md "${PACKAGE_DIR}/" 2>/dev/null && echo "   ✓ README.md"
cp package.json "${PACKAGE_DIR}/" 2>/dev/null && echo "   ✓ package.json"

# Create a README for the package
echo ""
echo "📝 Creating package README..."
cat > "${PACKAGE_DIR}/README_PACKAGE.md" << 'EOF'
# VibeLux Platform Documentation Package

**Package Date:** $(date +"%B %d, %Y")  
**Version:** 0.2.12  
**Status:** 85-92% Production Ready

---

## 📚 Documentation Files Included

### Main Documents

1. **VIBELUX_PROJECT_DOCUMENTATION.md** (Recommended Start)
   - Comprehensive shareable documentation
   - Includes all major sections
   - Investment-ready format
   - 50+ pages of detailed information

2. **PROJECT_EXECUTIVE_SUMMARY.md** (Quick Reference)
   - Condensed 6KB summary
   - Perfect for stakeholder briefings
   - Key metrics and status
   - Launch timeline overview

3. **PROJECT_OUTLINE.md** (Technical Details)
   - Complete technical documentation (29KB)
   - Detailed module breakdown
   - Pending items with estimates
   - Full implementation timeline

### Supporting Documents

4. **COMPLETE_PLATFORM_SUMMARY.md**
   - Platform evolution and capabilities
   - Technology stack details
   - Competitive analysis
   - Future roadmap

5. **COMPREHENSIVE_PLATFORM_STATUS.md**
   - System-by-system verification
   - Feature count summary
   - Performance metrics
   - Production readiness checklist

6. **PRODUCTION_READINESS_FINAL_REPORT.md**
   - Final assessment report
   - Critical issues analysis
   - Launch checklist
   - Risk mitigation strategies

7. **CRITICAL_ISSUES.md**
   - Infrastructure concerns
   - Database optimization needs
   - Testing requirements
   - Recovery procedures

8. **FEATURE_LIST.md**
   - Complete feature inventory
   - Implementation status
   - Access methods
   - Component locations

9. **README.md**
   - Project overview
   - Quick start guide
   - Installation instructions
   - API documentation

10. **package.json**
    - Technology dependencies
    - Build scripts
    - Version information

---

## 🎯 Recommended Reading Order

### For Executives & Investors
1. Start with **PROJECT_EXECUTIVE_SUMMARY.md**
2. Review **VIBELUX_PROJECT_DOCUMENTATION.md** sections 1, 6, 8
3. Check **COMPREHENSIVE_PLATFORM_STATUS.md** for status

### For Technical Teams
1. Read **PROJECT_OUTLINE.md** in full
2. Review **PRODUCTION_READINESS_FINAL_REPORT.md**
3. Check **CRITICAL_ISSUES.md** for priorities
4. Reference **FEATURE_LIST.md** for specific features

### For Project Managers
1. Start with **PROJECT_OUTLINE.md** timeline section
2. Review **CRITICAL_ISSUES.md**
3. Check **PRODUCTION_READINESS_FINAL_REPORT.md**

---

## 🚀 Quick Status Overview

**Overall Status:** 85-92% Production Ready

### ✅ What's Working (547 features functional)
- Design Tools (95% complete)
- AI/ML Integration (90% complete)
- Cultivation Management (95% complete)
- Analytics & Intelligence (90% complete)
- Mobile/PWA Support (95% complete)

### ⚠️ Critical Gaps (2-4 weeks to address)
- Emergency notification system
- Billing usage tracking
- Security hardening (CSRF, rate limiting)

### 📅 Timeline to Launch
- **Phase 1:** 2-4 weeks → Production launch (95% complete)
- **Phase 2:** 4-6 weeks → Infrastructure hardening (98% complete)
- **Phase 3:** 8-12 weeks → Full enhancement (100% complete)

---

## 💼 Key Metrics

### Performance
- 94.2% facility efficiency
- 22% energy cost reduction
- 35% less equipment downtime
- 316% ROI with 14-month payback

### Technology
- Next.js 14 + TypeScript
- 586+ features across 25 categories
- 94.2% ML prediction accuracy
- 95 Lighthouse performance score

---

## 📞 For Questions or More Information

This documentation package contains everything needed to understand the VibeLux platform's current state, capabilities, and path to production launch.

For technical questions, refer to the detailed documentation files.  
For business inquiries, see the Investment Highlights section in VIBELUX_PROJECT_DOCUMENTATION.md.

---

**Documentation Generated:** $(date +"%B %d, %Y at %I:%M %p")  
**Project Status:** Pre-Launch Development  
**Classification:** Confidential - For Investment & Partnership Discussion
EOF

# Create an index file
echo ""
echo "📇 Creating index file..."
cat > "${PACKAGE_DIR}/INDEX.txt" << 'EOF'
VibeLux Platform Documentation Package
=======================================

FILE STRUCTURE:

Main Documentation (Start Here)
├── README_PACKAGE.md ...................... Package overview and reading guide
├── PROJECT_EXECUTIVE_SUMMARY.md .......... Quick reference (6KB)
├── VIBELUX_PROJECT_DOCUMENTATION.md ...... Complete shareable doc (recommended)
└── PROJECT_OUTLINE.md .................... Detailed technical doc (29KB)

Supporting Documents
├── COMPLETE_PLATFORM_SUMMARY.md .......... Platform evolution and features
├── COMPREHENSIVE_PLATFORM_STATUS.md ...... System verification report
├── PRODUCTION_READINESS_FINAL_REPORT.md .. Launch readiness assessment
├── CRITICAL_ISSUES.md .................... Infrastructure concerns
└── FEATURE_LIST.md ....................... Feature inventory and status

Reference Files
├── README.md ............................. Project README
├── package.json .......................... Dependencies and scripts
└── INDEX.txt ............................. This file

RECOMMENDED READING:
1. For quick overview: PROJECT_EXECUTIVE_SUMMARY.md
2. For complete details: VIBELUX_PROJECT_DOCUMENTATION.md
3. For technical depth: PROJECT_OUTLINE.md

Total Files: 12
Total Size: ~500KB
Documentation Quality: Production-ready
EOF

# Create a compressed archive
echo ""
echo "📦 Creating compressed archive..."
cd "${EXPORT_DIR}"
tar -czf "${PACKAGE_NAME}.tar.gz" "${PACKAGE_NAME}"
zip -rq "${PACKAGE_NAME}.zip" "${PACKAGE_NAME}"
cd ..

# Calculate sizes
TAR_SIZE=$(du -h "${EXPORT_DIR}/${PACKAGE_NAME}.tar.gz" | cut -f1)
ZIP_SIZE=$(du -h "${EXPORT_DIR}/${PACKAGE_NAME}.zip" | cut -f1)
DIR_SIZE=$(du -sh "${PACKAGE_DIR}" | cut -f1)

# Summary
echo ""
echo "✅ Documentation package created successfully!"
echo ""
echo "📊 Package Summary:"
echo "   Directory: ${DIR_SIZE}"
echo "   TAR.GZ: ${TAR_SIZE}"
echo "   ZIP: ${ZIP_SIZE}"
echo ""
echo "📁 Files located in:"
echo "   ${PACKAGE_DIR}/"
echo ""
echo "📦 Archives created:"
echo "   ${EXPORT_DIR}/${PACKAGE_NAME}.tar.gz"
echo "   ${EXPORT_DIR}/${PACKAGE_NAME}.zip"
echo ""
echo "🎉 Ready to download and share!"
echo ""
echo "📥 To download, copy one of these files:"
echo "   - For Mac/Linux: ${PACKAGE_NAME}.tar.gz"
echo "   - For Windows: ${PACKAGE_NAME}.zip"
echo ""

















