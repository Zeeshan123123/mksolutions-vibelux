# VibeLux DNS Migration Guide: Vercel → AWS

## 🌐 **Current AWS Infrastructure**
- **CloudFront Distribution**: `d3psqoixohpfic.cloudfront.net`
- **Distribution ID**: `E2R6BWCZW9HXB4`
- **S3 Bucket**: `vibelux-enterprise-platform-1754217184`
- **Status**: ✅ Deployed and Ready

## 🔍 **Step 1: Identify Your Current Domain**

Check your current Vercel setup to identify the domain you're using:

```bash
# If you have Vercel CLI installed
vercel domains ls

# Or check your DNS provider (Cloudflare, Namecheap, GoDaddy, etc.)
```

**Common VibeLux domain patterns:**
- `vibelux.com` (main domain)
- `app.vibelux.com` (subdomain)
- `platform.vibelux.com` (subdomain)
- Custom domain

## 🚀 **Step 2: SSL Certificate Setup (Required for Custom Domain)**

### **Option A: AWS Certificate Manager (Recommended)**

```bash
# Request SSL certificate for your domain
aws acm request-certificate \
  --domain-name "vibelux.com" \
  --subject-alternative-names "*.vibelux.com" \
  --validation-method DNS \
  --region us-east-1

# Note: Certificate MUST be in us-east-1 for CloudFront
```

**Important**: You'll need to add DNS validation records to prove domain ownership.

### **Option B: Use Existing SSL Certificate**
If you have an existing SSL certificate, you can import it:

```bash
aws acm import-certificate \
  --certificate fileb://certificate.pem \
  --private-key fileb://private-key.pem \
  --certificate-chain fileb://certificate-chain.pem \
  --region us-east-1
```

## 🔧 **Step 3: Update CloudFront Distribution**

Once you have the SSL certificate ARN, update CloudFront:

```bash
# Get current distribution config
aws cloudfront get-distribution-config \
  --id E2R6BWCZW9HXB4 > current-config.json

# Update the configuration (you'll need to edit the JSON)
aws cloudfront update-distribution \
  --id E2R6BWCZW9HXB4 \
  --distribution-config file://updated-config.json \
  --if-match E3LJBKFLULCZNA
```

**Key changes needed in the config:**
```json
{
  "Aliases": {
    "Quantity": 1,
    "Items": ["vibelux.com"]
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "arn:aws:acm:us-east-1:700083211206:certificate/YOUR-CERT-ID",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021",
    "CertificateSource": "acm"
  }
}
```

## 📋 **Step 4: DNS Record Changes**

### **For Root Domain (vibelux.com)**

**If using Cloudflare, Route 53, or similar:**
```
Type: A
Name: @
Value: [Use ALIAS to d3psqoixohpfic.cloudfront.net]
TTL: 300 (5 minutes for testing)
```

**If your DNS provider doesn't support ALIAS:**
```
Type: CNAME
Name: www
Value: d3psqoixohpfic.cloudfront.net
TTL: 300

Type: A
Name: @
Value: [CloudFront IP - see note below]
TTL: 300
```

### **For Subdomain (app.vibelux.com, platform.vibelux.com)**

```
Type: CNAME
Name: app (or platform)
Value: d3psqoixohpfic.cloudfront.net
TTL: 300
```

### **Additional Recommended Records**
```
# Redirect www to non-www (or vice versa)
Type: CNAME
Name: www
Value: d3psqoixohpfic.cloudfront.net
TTL: 300

# Email security (if you use email)
Type: TXT
Name: @
Value: "v=spf1 include:_spf.google.com ~all"
TTL: 3600
```

## ⚡ **Step 5: Quick Migration Scripts**

### **Automated Certificate Request**
```bash
#!/bin/bash
# Request SSL certificate for your domain
DOMAIN="vibelux.com"  # Replace with your actual domain

echo "Requesting SSL certificate for $DOMAIN..."
CERT_ARN=$(aws acm request-certificate \
  --domain-name "$DOMAIN" \
  --subject-alternative-names "*.$DOMAIN" \
  --validation-method DNS \
  --region us-east-1 \
  --query 'CertificateArn' \
  --output text)

echo "Certificate ARN: $CERT_ARN"
echo "Please add the DNS validation records shown in the AWS Console"
echo "Certificate validation URL: https://console.aws.amazon.com/acm/home?region=us-east-1#/certificates/$CERT_ARN"
```

### **CloudFront Configuration Update**
```bash
#!/bin/bash
# Update CloudFront with custom domain
DISTRIBUTION_ID="E2R6BWCZW9HXB4"
DOMAIN="vibelux.com"  # Replace with your domain
CERT_ARN="arn:aws:acm:us-east-1:700083211206:certificate/YOUR-CERT-ID"

# This script will be provided once you share your domain
echo "Ready to update CloudFront distribution $DISTRIBUTION_ID"
echo "Domain: $DOMAIN"
echo "Certificate: $CERT_ARN"
```

## 🔄 **Step 6: Migration Strategy (Zero Downtime)**

### **Option A: Gradual Migration (Recommended)**
1. **Test First**: Point a test subdomain (e.g., `aws.vibelux.com`) to AWS
2. **Verify Functionality**: Ensure everything works correctly
3. **Update Main Domain**: Switch your primary domain to AWS
4. **Monitor**: Watch for any issues and be ready to rollback

### **Option B: Instant Migration**
1. **Prepare Everything**: SSL cert, CloudFront config, DNS records ready
2. **Update DNS**: Change records all at once
3. **Monitor**: Watch propagation and fix any issues

### **Rollback Plan**
Keep your Vercel configuration active until you're 100% confident:
```bash
# Quick rollback - change DNS back to Vercel
# (Keep original DNS records handy)
```

## 📊 **Step 7: Domain-Specific Instructions**

### **If your domain is vibelux.com:**
```bash
# SSL Certificate
aws acm request-certificate \
  --domain-name "vibelux.com" \
  --subject-alternative-names "*.vibelux.com" \
  --validation-method DNS \
  --region us-east-1

# DNS Records Needed:
# A record: @ → d3psqoixohpfic.cloudfront.net (ALIAS)
# CNAME: www → d3psqoixohpfic.cloudfront.net
```

### **If your domain is app.vibelux.com:**
```bash
# SSL Certificate (if you control vibelux.com)
aws acm request-certificate \
  --domain-name "*.vibelux.com" \
  --validation-method DNS \
  --region us-east-1

# DNS Records Needed:
# CNAME: app → d3psqoixohpfic.cloudfront.net
```

### **If using a different domain provider:**
The process is the same, but you'll make DNS changes in your provider's control panel:
- **Cloudflare**: DNS tab → Add/edit records
- **Namecheap**: Advanced DNS → Add/edit records  
- **GoDaddy**: DNS Management → Add/edit records
- **Route 53**: Hosted zone → Create/edit records

## ⚠️ **Important Notes**

### **DNS Propagation**
- DNS changes take 5-15 minutes to propagate
- Global propagation can take up to 48 hours
- Use short TTL (300 seconds) during migration

### **SSL Certificate Validation**
- AWS will provide DNS records to add for validation
- Certificate must be validated before CloudFront update
- Validation usually takes 5-30 minutes

### **Testing**
```bash
# Test your domain resolution
dig vibelux.com
nslookup vibelux.com

# Test HTTPS access
curl -I https://vibelux.com

# Check from different locations
# Use online tools like whatsmydns.net
```

## 🎯 **Next Steps**

1. **Tell me your current domain** (vibelux.com, app.vibelux.com, etc.)
2. **I'll provide exact commands** for your specific setup
3. **We'll request the SSL certificate** together
4. **Update CloudFront configuration** with your domain
5. **Make DNS changes** when you're ready
6. **Monitor and verify** everything works

## 📞 **Ready to Migrate?**

**Share your current domain with me and I'll:**
✅ Generate exact AWS commands for your domain  
✅ Create your SSL certificate request  
✅ Update CloudFront configuration  
✅ Provide specific DNS records to change  
✅ Help monitor the migration  

Your VibeLux platform will be running on enterprise AWS infrastructure with your custom domain! 🚀