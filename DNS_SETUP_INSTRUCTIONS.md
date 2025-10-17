# 🌐 Fix vibelux.ai DNS Configuration

## Current Issue
- Domain: vibelux.ai
- Error: DNS_PROBE_FINISHED_NXDOMAIN
- Problem: Domain not pointing to Vercel

## Step 1: Add Domain to Vercel

First, let's add the domain to your Vercel project:

```bash
vercel domains add vibelux.ai
```

If that doesn't work, do it via the Vercel Dashboard:
1. Go to https://vercel.com/vibelux/vibelux-app/settings/domains
2. Click "Add Domain"
3. Enter `vibelux.ai`
4. Vercel will give you DNS records to configure

## Step 2: Update GoDaddy DNS Settings

Go to GoDaddy DNS Management:
1. Login to GoDaddy
2. Go to "My Products"
3. Find vibelux.ai
4. Click "DNS" or "Manage DNS"

### Remove Current Records:
Delete any existing A records and CNAME records for:
- `@` (root domain)
- `www`

### Add Vercel DNS Records:

#### Option A: Using Vercel Nameservers (Recommended)
Change nameservers to Vercel's:
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

#### Option B: Using GoDaddy DNS with Vercel Records
Add these records:

**For vibelux.ai (root domain):**
- Type: A
- Name: @
- Value: 76.76.21.21
- TTL: 600

**For www.vibelux.ai:**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com
- TTL: 600

## Step 3: Configure in Vercel

### Via Command Line:
```bash
# Link the domain to your project
vercel domains add vibelux.ai --scope vibelux

# Verify domain configuration
vercel domains inspect vibelux.ai
```

### Via Dashboard:
1. Go to: https://vercel.com/vibelux/vibelux-app/settings/domains
2. Add `vibelux.ai`
3. Add `www.vibelux.ai`
4. Vercel will automatically configure SSL certificates

## Step 4: Deploy Your App

Once DNS is configured:

```bash
# Deploy to production
vercel --prod --yes

# Or with less memory usage (to avoid build errors)
NODE_OPTIONS='--max-old-space-size=8192' vercel --prod --yes
```

## Step 5: Verify DNS Propagation

DNS changes can take 0-48 hours to propagate. Check status:

```bash
# Check DNS records
nslookup vibelux.ai
dig vibelux.ai

# Test the domain
curl -I https://vibelux.ai
```

## Alternative: Quick Fix via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your `vibelux-app` project
3. Go to Settings → Domains
4. Click "Add Domain"
5. Enter `vibelux.ai`
6. Follow the instructions Vercel provides
7. Copy the DNS records shown
8. Add them to GoDaddy

## Current Vercel URL
Your app is currently accessible at:
- https://vibelux-app.vercel.app

## Expected Result
After DNS propagation:
- https://vibelux.ai → Your app
- https://www.vibelux.ai → Your app
- Automatic SSL certificates
- Automatic redirects configured

## Troubleshooting

If the build keeps failing with memory errors:
1. Try deploying with reduced build size:
```bash
# Clear cache
rm -rf .next node_modules/.cache

# Install fresh
yarn install

# Build with more memory
NODE_OPTIONS='--max-old-space-size=8192' yarn build

# Deploy
vercel --prod
```

2. Or use GitHub integration:
- Push to GitHub
- Vercel will auto-deploy from GitHub
- Has more memory available for builds

## Support
- Vercel Docs: https://vercel.com/docs/custom-domains
- GoDaddy Support: https://www.godaddy.com/help/manage-dns-680