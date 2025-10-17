# Clerk Support Request - Domain Verification Issue

**Subject: Unable to Get TXT Verification Record for Custom Domain Setup**

---

**Issue Summary:**
I'm trying to set up a custom domain (`accounts.vibelux.ai`) for my Clerk authentication but cannot find the specific TXT verification record needed for domain verification.

**Current Setup:**
- **Domain**: vibelux.ai
- **Custom Authentication Domain**: accounts.vibelux.ai
- **DNS Provider**: GoDaddy
- **Clerk Application**: Vibelux (Production)

**What I've Done:**
1. ✅ Added CNAME record: `accounts.vibelux.ai` → `accounts.clerk.services`
2. ✅ CNAME record is resolving correctly
3. ❌ Need the specific TXT verification record for `_clerk.vibelux.ai`

**Current Status:**
- Clerk Dashboard shows "DNS Configuration - Unverified"
- When I click "Verify configuration", it doesn't show the specific TXT record value
- I can see the CNAME requirements but not the TXT verification code

**What I Need:**
Could you please provide the exact TXT record that needs to be added to my DNS? Specifically:
- **Record Name**: `_clerk` (or `_clerk.vibelux.ai`)
- **Record Value**: [Need the specific verification code for my domain]

**Additional Info:**
- I have access to modify DNS records in GoDaddy
- I do NOT want to add the email CNAME records as I use SendGrid for email services
- I only need the authentication domain (`accounts.vibelux.ai`) to work

**Expected Outcome:**
Once I have the correct TXT record, I can add it to GoDaddy DNS, verify the domain in Clerk, and have SSL certificates automatically provisioned.

**Screenshots:**
[I can provide screenshots of my current Clerk DNS configuration screen if needed]

Thank you for your assistance!

---

**Account Details:**
- Organization: Vibelux
- Domain: vibelux.ai
- Environment: Production