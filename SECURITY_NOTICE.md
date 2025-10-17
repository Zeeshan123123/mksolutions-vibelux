# 🚨 SECURITY NOTICE

## Environment Files

All `.env` files have been removed from this repository for security reasons.

### Setup Instructions

1. Copy `.env.local.template` to `.env.local`
2. Fill in your actual credentials
3. NEVER commit `.env` files to the repository

### Files to Create Locally:
- `.env.local` - Your main environment file
- `.env.development` - Development-specific variables (optional)
- `.env.production` - Production-specific variables (optional)

### Security Best Practices:
- Use a password manager for storing credentials
- Rotate all credentials regularly (quarterly minimum)
- Use least-privilege access for all API keys
- Enable 2FA on all service accounts
- Use separate keys for dev/staging/prod environments
- Never share credentials in chat, email, or tickets

### If You Accidentally Commit Secrets:
1. Immediately rotate the exposed credentials
2. Remove the file from git history
3. Force push to update the repository
4. Notify the security team
5. Update all deployed environments

### Generating Secure Keys:
```bash
# Generate secure 32-byte keys for JWT_SECRET and ENCRYPTION_KEY
openssl rand -base64 32

# Generate secure random strings
openssl rand -hex 32
```

### Credential Sources:
- **Clerk**: https://dashboard.clerk.com/
- **Neon Database**: https://console.neon.tech/
- **Upstash Redis**: https://console.upstash.com/
- **SendGrid**: https://app.sendgrid.com/settings/api_keys
- **UtilityAPI**: https://utilityapi.com/dashboard/api-tokens
- **Stack Analytics**: https://stack.so/

Remember: Once a secret is in git history, it's compromised forever!