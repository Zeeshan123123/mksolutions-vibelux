# SendGrid API Key Permissions Issue

## Problem
Your SendGrid API key is returning "access forbidden" (403 error) when trying to create templates.

## Solution: Create New API Key with Proper Permissions

### 1. Go to SendGrid Dashboard
1. Visit https://app.sendgrid.com/settings/api_keys
2. Click "Create API Key"

### 2. Configure Permissions
**Name:** VibeLux Template Management

**Permissions:** Select "Restricted Access" and enable these specific permissions:

#### Required Permissions:
- **Mail Send** → Full Access
- **Template Engine** → Full Access  
- **Marketing Campaigns** → Full Access (for marketing emails)
- **Dynamic Templates** → Full Access

#### Optional but Recommended:
- **Stats** → Read Access (for email analytics)
- **Suppressions** → Full Access (for unsubscribe management)

### 3. Save the New Key
1. Click "Create & View"
2. **Copy the key immediately** (you can only see it once)
3. Replace the old key in your `.env.local` file

### 4. Update .env.local
```bash
# Replace the existing line with your new key
SENDGRID_API_KEY=SG.your_new_key_with_proper_permissions
```

### 5. Test the Upload Again
```bash
npm run upload-sendgrid-templates
```

## Why This Happened
The current API key likely has "Mail Send" access only, but creating dynamic templates requires "Template Engine" permissions.

## Alternative: Use Full Access (Easier)
If you prefer, you can create an API key with "Full Access" permissions, which includes all the required permissions for template management.

After updating the API key, the script should successfully upload all 50 templates!