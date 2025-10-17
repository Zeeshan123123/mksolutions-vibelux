# Missing API Endpoints Report

This report identifies API calls in the codebase that don't have corresponding backend endpoints.

## Summary

After analyzing the codebase, I found several API calls that appear to be missing their backend implementations:

## Missing Endpoints

### 1. Credits Management
- `/api/credits/balance` - Used in `src/store/credit-store.ts:96`
- `/api/credits/purchase` - Used in multiple credit purchase modals

### 2. Notifications
- `/api/notifications/acknowledge` - Used in `public/sw.js:376`
- `/api/notifications/subscribe` - Used in `public/sw.js:532` and push notifications
- `/api/notifications/marketplace` - Used in marketplace notifications hook
- `/api/notifications/mark-all-read` - Used in marketplace notifications
- `/api/analytics/notification-dismissed` - Used in service worker

### 3. Maintenance & Alerts
- `/api/maintenance/alerts` - Used in service worker and equipment diagnostics
- `/api/maintenance/analyze-equipment` - Used in equipment diagnostics
- `/api/maintenance/upload-photo` - Used in equipment diagnostics
- `/api/maintenance/equipment-photos` - Used in equipment diagnostics
- `/api/maintenance/work-orders` - Used in equipment diagnostics

### 4. User & Team Management
- `/api/user/pending-onboarding` - Used in subscription onboarding hook
- `/api/user/subscription-status` - Used in SubscriptionContext
- `/api/user/onboarding` - Used in get-started page
- `/api/user/subscriptions` - Used in account page
- `/api/team/members` - Used in team data hook
- `/api/team/invites` - Used in team data hook
- `/api/team/invite` - Used for sending invites
- `/api/subscription` - Used in team data hook

### 5. Monitoring & Health
- `/api/monitoring/client-errors` - Used in client logger
- `/api/version` - Used in system update strategy
- `/api/health/db` - Used in ServiceHealthDashboard
- `/api/health/redis` - Used in ServiceHealthDashboard
- `/api/health/influxdb` - Used in ServiceHealthDashboard
- `/api/stripe/health` - Used in ServiceHealthDashboard
- `/api/cron/status` - Used in ServiceHealthDashboard

### 6. AI & Analytics
- `/api/ai-assistant/command` - Used in RL engine
- `/api/ai-assistant/globalgap` - Used in GlobalGap assistant
- `/api/google-vision/analyze` - Used in advanced AI analysis
- `/api/analytics/reports/generate` - Used in report generator
- `/api/analytics/reports` - Used in report generator
- `/api/analytics/reports/schedule` - Used in report generator
- `/api/analytics/metrics` - Used in data input manager
- `/api/analytics/import` - Used in data input manager
- `/api/analytics/affiliate-click` - Used in Amazon affiliate

### 7. Equipment & Service
- `/api/service-requests` - Used in maintenance service page
- `/api/equipment/offers` - Used in equipment offers
- `/api/equipment/enhance-photo` - Used in equipment photo enhancer

### 8. Integrations
- `/api/integrations/track-trace/sync` - Used in data input manager
- `/api/utility/authorize` - Used in onboarding success
- `/api/autodesk/auth` - Used in Autodesk auth

### 9. Reports & Documents
- `/api/reports/generate` - Used in lighting report builder
- `/api/upload/scouting-photo` - Used in mobile scouting
- `/api/photos/extract-text` - Used in photo storage
- `/api/photos/compare` - Used in photo storage
- `/api/photos/upload` - Used in photo storage

### 10. Stripe & Billing
- `/api/stripe/customer-portal` - Used in subscription manager
- `/api/stripe/create-setup-intent` - Used in payment method manager
- `/api/stripe/payment-methods` - Used in payment method manager
- `/api/stripe/checkout` - Used in pricing page

### 11. Energy & Revenue
- `/api/energy/real-time` - Used in ServiceHealthDashboard
- `/api/revenue-sharing/performance` - Used in ServiceHealthDashboard

### 12. Tracking & Location
- `/api/tracking/scan` - Used in track page
- `/api/tracking/alerts` - Used in realtime tracker
- `/api/tracking/geofences` - Used in realtime tracker
- `/api/tracking/location/share` - Used in realtime tracker

### 13. Push Notifications
- `/api/push/subscribe` - Used in push notifications lib

### 14. Admin & Debug
- `/api/debug/errors` - Used in error tracker
- `/api/debug/sessions` - Used in user impersonation
- `/api/admin/impersonation-log` - Used in user impersonation
- `/api/admin/email/campaigns` - Used in admin email page
- `/api/admin/email/templates` - Used in admin email page
- `/api/admin/credits/give` - Used in admin credits page
- `/api/admin/analytics/export` - Used in admin analytics
- `/api/admin/backups` - Used in disaster recovery
- `/api/admin/recovery-points` - Used in disaster recovery
- `/api/admin/test-recovery` - Used in disaster recovery

### 15. Settings
- `/api/settings/notifications` - Used in notification settings page

### 16. IPM (Integrated Pest Management)
- `/api/ipm/analyze-photo` - Used in IPM documentation
- `/api/ipm/upload-photo` - Used in IPM documentation
- `/api/ipm/photos` - Used in IPM documentation
- `/api/ipm/alerts` - Used in IPM documentation

### 17. ML & Training
- `/api/ml/train` - Used in YieldPredictionML
- `/api/ml/predict` - Used in YieldPredictionML
- `/api/ml/training-data` - Used in YieldPredictionML
- `/api/ml/platform-intelligence` - Used in hybrid ML service

### 18. SCADA Integration
- `/api/scada/ab/connect` - Allen-Bradley connection
- `/api/scada/ab/disconnect` - Allen-Bradley disconnection
- `/api/scada/ab/read` - Allen-Bradley read operations
- `/api/scada/ab/write` - Allen-Bradley write operations
- `/api/scada/ab/read-multiple` - Allen-Bradley bulk read
- `/api/scada/ab/browse-tags` - Allen-Bradley tag browsing
- `/api/scada/s7/connect` - Siemens S7 connection
- `/api/scada/s7/disconnect` - Siemens S7 disconnection
- `/api/scada/s7/read` - Siemens S7 read operations
- `/api/scada/s7/write` - Siemens S7 write operations
- `/api/scada/s7/read-multi` - Siemens S7 bulk read

### 19. Other
- `/api/facilities` - Used in multiple pages for facility data
- `/api/benchmarks/subscription` - Used in benchmarks pages
- `/api/benchmarks/generate` - Used in benchmarks
- `/api/benchmarks/generate-advanced` - Used in advanced benchmarks
- `/api/benchmarks/export` - Used in benchmarks export
- `/api/cloudinary/generate-portfolio` - Used in design pages
- `/api/feature-request` - Used in feature request page
- `/api/investment/onboarding` - Used in investment onboarding

## Recommendations

1. **Priority 1 - Core Functionality**: Implement missing endpoints for credits, notifications, user management, and subscription functionality as these are critical for the application.

2. **Priority 2 - Integration Points**: Implement Stripe, analytics, and monitoring endpoints to ensure proper billing and observability.

3. **Priority 3 - Feature-Specific**: Implement equipment, SCADA, ML, and other feature-specific endpoints based on business priorities.

4. **Consider Consolidation**: Some endpoints might be consolidated or renamed for better organization (e.g., all photo-related endpoints under a common path).

5. **Add Error Handling**: Ensure all frontend code that calls these endpoints has proper error handling for when endpoints are not available.