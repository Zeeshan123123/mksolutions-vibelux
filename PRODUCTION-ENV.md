# VibeLux Production Environment Configuration

## 🔧 **COMPLETE ENVIRONMENT VARIABLES**

Copy these exact environment variables to your production deployment platform (Vercel, Railway, etc.):

### **REQUIRED ENVIRONMENT VARIABLES:**

```bash
# Database
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL_HERE"

# Authentication & Security
NEXTAUTH_SECRET="9c55d902b522129058ad56754f0d0db3453d296792b1cf11895486ef4bdb7694"
JWT_SECRET="19a028bbbfff00826769c437b2925b983e583f92cb09d9461087581ccf33e4e9"
ADMIN_SETUP_SECRET="9887f06f08d7ca97db12c1efa07a14eeddd6b5ccbd3c9e8af9b77b1aaf77c841"
CSRF_SECRET="78b22b92e6bb2b4f1a26d51fa9793f4c916fe4d459864fdd88a8fc5ba16aa796"

# Clerk Authentication (Get from Clerk Dashboard)
CLERK_SECRET_KEY="YOUR_CLERK_SECRET_KEY_FROM_DASHBOARD"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="YOUR_CLERK_PUBLISHABLE_KEY"

# APIs
NEXT_PUBLIC_OPENWEATHER_API_KEY="d6343b4e505808c536058f99280ad0e5"

# Security & Backup
BACKUP_ENCRYPTION_KEY="2aeffc8af10aaa7ce7cd810589912056bdd471caae74a2ceac2e0cdd83474972"

# Production Settings
NODE_ENV="production"
NEXT_PUBLIC_DEMO_MODE="false"
ALLOW_ADMIN_SETUP="false"
```

## 📋 **WHAT YOU NEED TO FILL IN:**

### 1. **DATABASE_URL**
Replace `YOUR_PRODUCTION_DATABASE_URL_HERE` with your actual database connection string from:
- Neon (recommended)
- Supabase 
- PlanetScale
- etc.

### 2. **Clerk Keys** 
Get these from your Clerk Dashboard (https://clerk.com):
- `CLERK_SECRET_KEY` - From Clerk Dashboard → API Keys → Secret Key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk Dashboard → API Keys → Publishable Key

## 🚀 **DEPLOYMENT STEPS:**

### **For Vercel:**
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add each variable above (one by one)
4. Deploy

### **For Railway:**
1. Go to your Railway project
2. Variables tab
3. Add each variable above
4. Deploy

### **For Other Platforms:**
Add all the environment variables through your platform's environment configuration.

## ✅ **VERIFICATION:**

After deployment, the app will:
1. **Automatically validate** all security configurations
2. **Prevent startup** if critical secrets are missing
3. **Show security warnings** for any issues
4. **Log success** when properly configured

## 🔒 **SECURITY NOTES:**

- All secrets are **cryptographically secure** (generated with OpenSSL)
- **Never commit** these secrets to your repository
- **Rotate secrets** every 90 days for maximum security
- The **old hardcoded secrets** have been completely removed from the codebase

## 🛠 **OPTIONAL ENVIRONMENT VARIABLES:**

If you need these features, add:

```bash
# Optional APIs
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token"
AUTODESK_CLIENT_ID="your_autodesk_client_id"
AUTODESK_CLIENT_SECRET="your_autodesk_client_secret"

# Optional Integrations
STRIPE_SECRET_KEY="your_stripe_secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable"

# Optional Monitoring
SENTRY_DSN="your_sentry_dsn"
```

---

**✅ Your application is now PRODUCTION-READY with proper security!**

All critical vulnerabilities have been fixed and strong secrets generated.