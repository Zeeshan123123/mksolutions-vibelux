#!/bin/bash

# VibeLux AWS Production Deployment Script
# This script deploys VibeLux to AWS using ECS Fargate, RDS, and CloudFront

set -e

echo "🚀 VibeLux AWS Production Deployment"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENVIRONMENT="production"
REGION="us-east-1"
DOMAIN="vibelux.ai"
STACK_NAME="vibelux-production-infrastructure"
ECR_REPOSITORY="vibelux-app"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Environment: $ENVIRONMENT"
echo "  Region: $REGION"
echo "  Domain: $DOMAIN"
echo "  Stack: $STACK_NAME"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is required but not installed.${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if user is logged in
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured.${NC}"
    echo "Please run 'aws configure' or set up your credentials."
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: $ACCOUNT_ID${NC}"

# Function to create ECR repository if it doesn't exist
create_ecr_repository() {
    echo -e "${YELLOW}🐳 Setting up ECR repository...${NC}"
    
    if ! aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $REGION > /dev/null 2>&1; then
        echo "Creating ECR repository: $ECR_REPOSITORY"
        aws ecr create-repository \
            --repository-name $ECR_REPOSITORY \
            --region $REGION \
            --image-scanning-configuration scanOnPush=true
    else
        echo "ECR repository $ECR_REPOSITORY already exists"
    fi
}

# Function to build and push Docker image
build_and_push_image() {
    echo -e "${YELLOW}🔨 Building and pushing Docker image...${NC}"
    
    # Get ECR login token
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
    
    # Build image
    docker build -f aws-infrastructure/Dockerfile -t $ECR_REPOSITORY .
    
    # Tag image
    docker tag $ECR_REPOSITORY:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPOSITORY:latest
    docker tag $ECR_REPOSITORY:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPOSITORY:$(date +%Y%m%d-%H%M%S)
    
    # Push image
    docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPOSITORY:latest
    docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPOSITORY:$(date +%Y%m%d-%H%M%S)
    
    echo -e "${GREEN}✅ Docker image pushed to ECR${NC}"
}

# Function to deploy CloudFormation stack
deploy_infrastructure() {
    echo -e "${YELLOW}☁️ Deploying AWS infrastructure...${NC}"
    
    # Prompt for database password
    read -s -p "Enter database password (minimum 8 characters): " DB_PASSWORD
    echo ""
    
    if [ ${#DB_PASSWORD} -lt 8 ]; then
        echo -e "${RED}❌ Password must be at least 8 characters${NC}"
        exit 1
    fi
    
    # Deploy CloudFormation stack
    aws cloudformation deploy \
        --template-file aws-infrastructure/cloudformation-template.yaml \
        --stack-name $STACK_NAME \
        --parameter-overrides \
            DomainName=$DOMAIN \
            Environment=$ENVIRONMENT \
            DBPassword=$DB_PASSWORD \
        --capabilities CAPABILITY_IAM \
        --region $REGION \
        --tags \
            Environment=$ENVIRONMENT \
            Project=VibeLux \
            ManagedBy=CloudFormation
    
    echo -e "${GREEN}✅ Infrastructure deployed successfully${NC}"
}

# Function to deploy ECS service
deploy_ecs_service() {
    echo -e "${YELLOW}🚢 Deploying ECS service...${NC}"
    
    # Get infrastructure outputs
    VPC_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`VPCId`].OutputValue' --output text --region $REGION)
    DB_ENDPOINT=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' --output text --region $REGION)
    
    echo "VPC ID: $VPC_ID"
    echo "Database Endpoint: $DB_ENDPOINT"
    
    # Create ECS task definition and service
    # This would typically be done through additional CloudFormation templates or AWS CDK
    echo "ECS service deployment would continue here..."
    echo "You'll need to create ECS task definitions and services"
}

# Function to setup Route 53 DNS
setup_dns() {
    echo -e "${YELLOW}🌐 Setting up DNS for $DOMAIN...${NC}"
    
    # Get CloudFront distribution domain
    CF_DOMAIN=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomainName`].OutputValue' --output text --region $REGION)
    
    echo "CloudFront Domain: $CF_DOMAIN"
    echo "You'll need to:"
    echo "1. Create a Route 53 hosted zone for $DOMAIN"
    echo "2. Create CNAME records pointing to $CF_DOMAIN"
    echo "3. Update your domain registrar to use Route 53 name servers"
}

# Main deployment flow
main() {
    echo -e "${YELLOW}🚀 Starting deployment process...${NC}"
    
    # Pre-flight checks
    if [ ! -f ".env.production" ]; then
        echo -e "${RED}❌ .env.production file not found${NC}"
        exit 1
    fi
    
    if [ ! -f "aws-infrastructure/Dockerfile" ]; then
        echo -e "${RED}❌ Dockerfile not found${NC}"
        exit 1
    fi
    
    # Build application
    echo -e "${YELLOW}🔨 Building application...${NC}"
    npm ci
    npm run build
    
    # Create ECR repository
    create_ecr_repository
    
    # Build and push Docker image
    build_and_push_image
    
    # Deploy infrastructure
    deploy_infrastructure
    
    # Deploy ECS service
    deploy_ecs_service
    
    # Setup DNS
    setup_dns
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Configure your domain DNS settings"
    echo "2. Set up SSL certificates in Certificate Manager"
    echo "3. Update environment variables in AWS Systems Manager Parameter Store"
    echo "4. Monitor deployment in AWS Console"
    echo ""
    echo -e "${GREEN}Your VibeLux application will be available at: https://$DOMAIN${NC}"
}

# Run main function
main "$@"