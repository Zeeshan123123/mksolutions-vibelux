# VibeLux AWS Deployment - Quick Start Guide

## 🚀 Get VibeLux Running on AWS in 30 Minutes

Your VibeLux platform is **enterprise-ready** with 495+ pages and 4,400+ TypeScript files. AWS is the perfect home for your scale.

### Prerequisites ✅

```bash
# 1. Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# 2. Configure AWS credentials
aws configure
# Enter your AWS Access Key ID, Secret Key, Region (us-east-1), and output format (json)

# 3. Verify setup
aws sts get-caller-identity
```

### Option 1: Full Automated Setup (Recommended)

```bash
# Run the complete AWS setup (creates everything)
npm run setup:aws

# This creates:
# ✅ S3 bucket for hosting
# ✅ CloudFront CDN for global distribution  
# ✅ CodeBuild project for enterprise builds (145GB memory!)
# ✅ IAM roles and permissions
# ✅ Deployment automation
```

### Option 2: Manual Step-by-Step Setup

```bash
# 1. Set up AWS infrastructure
./scripts/aws-setup.sh

# 2. Deploy your platform
npm run deploy:aws

# 3. Access your live platform!
```

## 🎯 What Gets Created

### AWS Resources
- **S3 Bucket**: `vibelux-platform-prod` (static hosting)
- **CloudFront**: Global CDN with 200+ edge locations
- **CodeBuild**: Enterprise build pipeline (145GB memory, 72 vCPUs)
- **IAM Roles**: Secure access permissions

### Build Specifications
- **Memory**: 145GB (handles your 4,400+ files easily)
- **Compute**: 72 vCPUs (parallel processing)
- **Timeout**: 120 minutes (plenty of time)
- **Cache**: S3-based build caching

## 💰 Cost Breakdown

**Monthly Estimates:**
- CodeBuild: ~$50-100 (pay per build minute)
- S3 Storage: ~$20-50 (depends on traffic)
- CloudFront: ~$50-200 (global CDN)
- **Total: ~$120-350/month**

*Compare to Vercel Enterprise: $2000+/month with limitations*

## 🛠️ Key Commands

```bash
# Setup AWS infrastructure
npm run setup:aws

# Deploy to AWS
npm run deploy:aws  

# Build for AWS (local testing)
npm run build:aws

# Check AWS resources
aws s3 ls s3://vibelux-platform-prod
aws cloudfront list-distributions
```

## 🔧 Environment Variables

Update `.env.production` with your settings:

```bash
# AWS Configuration
AWS_REGION=us-east-1
S3_BUCKET=vibelux-platform-prod

# Application URLs  
NEXT_PUBLIC_APP_URL=https://your-cloudfront-domain.cloudfront.net
NEXT_PUBLIC_API_URL=https://api.vibelux.ai

# Feature Flags
NEXT_PUBLIC_ENABLE_3D_VISUALIZATION=true
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ENTERPRISE_FEATURES=true
```

## 🚨 Troubleshooting

### Build Memory Issues?
```bash
# The buildspec.yml allocates 128GB heap automatically
# If you still get memory errors, contact AWS for larger instances
```

### Deployment Fails?
```bash
# Check AWS permissions
aws iam get-role --role-name vibelux-codebuild-role

# Verify S3 bucket exists
aws s3 ls s3://vibelux-platform-prod
```

### Can't Access Site?
```bash
# Check CloudFront distribution status
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Distributions take 15-20 minutes to deploy initially
```

## 🎉 Success Indicators

✅ **Build Completes**: No more memory errors!  
✅ **Files Uploaded**: All 495+ pages deployed  
✅ **CDN Active**: Global distribution working  
✅ **Site Accessible**: Platform live and fast  

## 🔄 CI/CD Integration

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to AWS
        run: |
          aws codebuild start-build --project-name vibelux-enterprise-build
```

## 📞 Support

- **AWS Documentation**: https://docs.aws.amazon.com/
- **Next.js Static Export**: https://nextjs.org/docs/pages/building-your-application/deploying/static-exports
- **VibeLux Build Issues**: Check `buildspec.yml` configuration

---

**Your VibeLux platform is enterprise-scale. AWS is built for exactly this. Let's get you deployed! 🚀**