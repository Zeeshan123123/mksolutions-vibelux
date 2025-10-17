# VibeLux AWS Deployment Plan

## Phase 1: Immediate Deployment (This Week)

### AWS CodeBuild Configuration
```yaml
# buildspec.yml
version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 20
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - npm ci
  build:
    commands:
      - echo Build started on `date`
      - NODE_OPTIONS="--max-old-space-size=24576" npm run build
  post_build:
    commands:
      - echo Build completed on `date`
artifacts:
  files:
    - '**/*'
  name: vibelux-build-$(date +%Y-%m-%d)

# Compute Type: BUILD_GENERAL1_2XLARGE
# Memory: 145 GB
# vCPUs: 72
```

### S3 + CloudFront Setup
```bash
# Static hosting with global CDN
aws s3 mb s3://vibelux-platform-prod
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## Phase 2: Enterprise Architecture (Next Month)

### Container Deployment
```dockerfile
# Dockerfile for ECS/Fargate
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Database & Analytics
```bash
# RDS for PostgreSQL
# DynamoDB for session storage
# S3 for file storage
# CloudWatch for monitoring
```

## Cost Estimation
- **CodeBuild**: ~$50-100/month for builds
- **S3 + CloudFront**: ~$20-50/month for assets
- **ECS/Fargate**: ~$100-300/month for compute
- **Total**: ~$200-500/month (scales with usage)

**Compare to Enterprise Vercel: $2000+/month with limitations**