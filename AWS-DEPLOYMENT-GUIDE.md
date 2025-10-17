# VibeLux AWS Production Deployment Guide

This guide will help you deploy VibeLux to AWS with a professional, scalable architecture.

## 🏗️ Architecture Overview

```
Internet → Route 53 → CloudFront → ALB → ECS Fargate → RDS PostgreSQL
                   ↓
                 S3 (Static Assets)
```

### Components:
- **Route 53**: DNS management for vibelux.ai
- **CloudFront**: Global CDN for fast content delivery
- **Application Load Balancer**: Traffic distribution and SSL termination
- **ECS Fargate**: Containerized application hosting (serverless containers)
- **RDS PostgreSQL**: Managed database service
- **S3**: Static asset storage
- **CloudWatch**: Monitoring and logging
- **Systems Manager**: Secure parameter storage

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Docker** installed
4. **Domain ownership** of `vibelux.ai`
5. **Clerk account** for authentication
6. **Environment variables** configured

## 🚀 Deployment Steps

### Step 1: Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region (us-east-1)
```

### Step 2: Set up Environment Variables

1. Copy the production environment template:
```bash
cp .env.production .env.production.local
```

2. Update `.env.production.local` with your actual values:
- Clerk production keys
- Database credentials
- API keys (OpenAI, Stripe, etc.)

### Step 3: Store Secrets in AWS Systems Manager

```bash
# Store database URL
aws ssm put-parameter \
    --name "/vibelux/production/database-url" \
    --value "postgresql://username:password@your-db-endpoint:5432/vibelux" \
    --type "SecureString" \
    --region us-east-1

# Store Clerk keys
aws ssm put-parameter \
    --name "/vibelux/production/clerk-publishable-key" \
    --value "pk_live_your_key_here" \
    --type "SecureString" \
    --region us-east-1

aws ssm put-parameter \
    --name "/vibelux/production/clerk-secret-key" \
    --value "sk_live_your_secret_here" \
    --type "SecureString" \
    --region us-east-1

# Store other secrets...
```

### Step 4: Deploy Infrastructure

```bash
./deploy-aws.sh
```

This script will:
1. Create ECR repository
2. Build and push Docker image
3. Deploy CloudFormation stack
4. Set up VPC, subnets, security groups
5. Create RDS database
6. Set up Application Load Balancer
7. Configure ECS cluster

### Step 5: Configure Domain and SSL

1. **Route 53 Setup**:
   - Create hosted zone for `vibelux.ai`
   - Note the name servers
   - Update your domain registrar with these name servers

2. **SSL Certificate**:
   ```bash
   aws acm request-certificate \
       --domain-name vibelux.ai \
       --subject-alternative-names www.vibelux.ai \
       --validation-method DNS \
       --region us-east-1
   ```

3. **DNS Validation**:
   - Add the CNAME records provided by ACM to your Route 53 hosted zone

### Step 6: Deploy ECS Service

```bash
# Register task definition
aws ecs register-task-definition \
    --cli-input-json file://aws-infrastructure/ecs-task-definition.json \
    --region us-east-1

# Create ECS service
aws ecs create-service \
    --cli-input-json file://aws-infrastructure/ecs-service.json \
    --region us-east-1
```

### Step 7: Configure CloudFront

Update the CloudFront distribution to:
1. Use your SSL certificate
2. Set up custom error pages
3. Configure caching behaviors
4. Add custom headers

### Step 8: Set up Monitoring

1. **CloudWatch Dashboards**
2. **Alarms for**:
   - High CPU usage
   - Memory usage
   - Database connections
   - Error rates
   - Response times

3. **Log Groups**:
   - Application logs
   - ALB access logs
   - VPC flow logs

## 🔧 Post-Deployment Configuration

### Database Setup

1. **Run migrations**:
```bash
# Connect to ECS task and run migrations
aws ecs execute-command \
    --cluster production-vibelux-cluster \
    --task <task-id> \
    --container vibelux-app \
    --interactive \
    --command "/bin/sh"

# Inside container:
npm run db:migrate
npm run db:seed
```

### Clerk Configuration

1. Update Clerk dashboard with production domain
2. Configure webhooks endpoints
3. Set up user roles and permissions

### Monitoring Setup

1. Configure CloudWatch alerts
2. Set up log aggregation
3. Configure performance monitoring

## 🛡️ Security Checklist

- ✅ All secrets stored in Systems Manager Parameter Store
- ✅ Database in private subnets
- ✅ Security groups with minimal permissions
- ✅ WAF configured on CloudFront
- ✅ VPC Flow Logs enabled
- ✅ CloudTrail logging enabled
- ✅ Encryption at rest and in transit
- ✅ IAM roles with least privilege

## 📊 Cost Optimization

### Estimated Monthly Costs (Production):
- **ECS Fargate**: ~$50-100 (2 tasks, 1 vCPU, 2GB RAM)
- **RDS PostgreSQL**: ~$15-30 (db.t3.micro)
- **Application Load Balancer**: ~$25
- **CloudFront**: ~$10-50 (depending on traffic)
- **Route 53**: ~$0.50
- **S3**: ~$5-20 (depending on storage)
- **CloudWatch**: ~$10-30

**Total estimated cost**: $115-255/month

### Cost Optimization Tips:
1. Use Fargate Spot for development environments
2. Enable RDS storage autoscaling
3. Configure CloudFront caching properly
4. Use S3 Intelligent Tiering
5. Set up billing alerts

## 🔄 CI/CD Pipeline (Optional)

Set up GitHub Actions or AWS CodePipeline for automated deployments:

1. **GitHub Actions workflow**
2. **Automated testing**
3. **Docker image building**
4. **ECS service updates**
5. **Database migrations**

## 🆘 Troubleshooting

### Common Issues:

1. **ECS tasks failing to start**:
   - Check CloudWatch logs
   - Verify secrets in Parameter Store
   - Check security group rules

2. **Database connection issues**:
   - Verify security groups
   - Check database endpoint
   - Verify credentials in Parameter Store

3. **SSL certificate issues**:
   - Ensure DNS validation is complete
   - Check certificate status in ACM

4. **Domain not resolving**:
   - Verify Route 53 configuration
   - Check name servers at registrar
   - Verify CloudFront distribution

## 📞 Support

For deployment issues:
1. Check CloudWatch logs
2. Review AWS CloudFormation events
3. Verify all prerequisites are met
4. Check security group configurations

## 🎉 Success!

Once deployed, your VibeLux platform will be available at:
- **https://vibelux.ai** - Main application
- **https://www.vibelux.ai** - Redirects to main domain

The platform will be running on enterprise-grade AWS infrastructure with:
- **99.9% uptime SLA**
- **Auto-scaling capabilities**
- **Comprehensive monitoring**
- **Secure architecture**
- **Global CDN**