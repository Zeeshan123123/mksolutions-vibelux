# Clerk SSL Certificate Fix

## Problem
The `accounts.vibelux.ai` subdomain is showing SSL certificate errors:
- `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` 
- Clerk authentication failing to load
- API endpoints returning 500 errors due to failed authentication

## Root Cause
The Clerk-managed subdomain `accounts.vibelux.ai` doesn't have a valid SSL certificate, likely due to:
1. Missing DNS records in GoDaddy
2. Incorrect Clerk domain configuration
3. SSL certificate not properly provisioned

## Fix Steps

### 1. Verify Clerk Dashboard Settings
1. Log into [Clerk Dashboard](https://dashboard.clerk.com)
2. Go to your VibeLux project
3. Navigate to **Configure** > **Domains**
4. Verify the domain is set to `accounts.vibelux.ai`
5. Check the status - should show "Active" with a green checkmark

### 2. Check Required DNS Records in GoDaddy
In your GoDaddy DNS management, you need:

**CNAME Record:**
- Name: `accounts`
- Value: `clerk.vibelux.ai` (or the value shown in Clerk dashboard)
- TTL: 1 hour

**TXT Record (for verification):**
- Name: `_clerk-challenge.accounts`
- Value: (the verification token from Clerk dashboard)
- TTL: 1 hour

### 3. Alternative: Use clerk.vibelux.ai
If the above doesn't work, try using `clerk.vibelux.ai` instead:

1. In Clerk Dashboard, change domain to `clerk.vibelux.ai`
2. Update DNS records to point `clerk` subdomain to Clerk
3. Update your environment variables if needed

### 4. Temporary Fix: Use Clerk's Default Domain
As a last resort, you can temporarily use Clerk's default domain:
1. In Clerk Dashboard, disable custom domain
2. Use the default domain like `pleased-ostrich-70.clerk.accounts.dev`
3. This will work immediately but users will see the default domain

## Environment Variables to Check
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cGxlYXNlZC1vc3RyaWNoLTcwLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_IZuAb6YBmFclG7GOVi4nrfkdw9f7Kdre3pDzrdbU8x
```

## Testing
After making changes:
1. Wait 10-15 minutes for DNS propagation
2. Test in incognito browser window
3. Check browser console for SSL errors
4. Verify sign-in flow works properly

## Status
- [ ] Check Clerk Dashboard domain settings
- [ ] Verify GoDaddy DNS records  
- [ ] Test SSL certificate validity
- [ ] Confirm authentication works
- [ ] Update documentation

## Notes
- SSL certificates can take up to 24 hours to provision
- DNS changes may take time to propagate
- Clear browser cache when testing
- Use SSL checker tools to verify certificate status