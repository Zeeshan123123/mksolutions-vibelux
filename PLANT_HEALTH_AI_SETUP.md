# Plant Health AI Setup Guide

## Overview
The Plant Health AI add-on ($29/month) uses multiple AI services to provide accurate pest and disease detection. This guide explains how to set up the required API keys.

## Current Status
- ✅ **Claude AI**: Already integrated (using Anthropic API)
- ✅ **Google Vision**: Code integrated, needs API key
- ✅ **AWS Rekognition**: Code integrated, optional enhancement

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Google Vision API (Required for Plant Health AI)
GOOGLE_VISION_API_KEY=your_google_vision_api_key_here

# AWS Services (Optional - enhances accuracy)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1

# Claude AI (Already configured)
ANTHROPIC_API_KEY=your_existing_key
```

## Setup Instructions

### 1. Google Vision API Setup (Required)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Vision API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key to `GOOGLE_VISION_API_KEY`

**Monthly Free Tier**: 1,000 units/month free
**Pricing**: $1.50 per 1,000 units after free tier

### 2. AWS Rekognition Setup (Optional - Recommended)

1. Sign in to [AWS Console](https://aws.amazon.com/console/)
2. Create an IAM user:
   - Go to IAM > Users > Add User
   - Enable "Programmatic access"
   - Attach policy: `AmazonRekognitionFullAccess`
3. Save the credentials:
   - Copy Access Key ID to `AWS_ACCESS_KEY_ID`
   - Copy Secret Access Key to `AWS_SECRET_ACCESS_KEY`
   - Set `AWS_REGION` (default: us-east-1)

**Pricing**: 
- First 5,000 images/month: $1.00 per 1,000 images
- Next 995,000 images/month: $0.80 per 1,000 images

### 3. Claude AI (Already Integrated)

The system already uses Claude AI through the Anthropic API for enhanced analysis and recommendations.

## How It Works

When a user uploads a plant image:

1. **Primary Analysis (Google Vision)**
   - Detects objects, labels, and text in image
   - Identifies potential pests and diseases
   - Provides confidence scores

2. **Enhanced Analysis (Claude AI)**
   - Interprets Vision API results
   - Provides detailed recommendations
   - Considers environmental context
   - Generates treatment plans

3. **Optional Enhancement (AWS Rekognition)**
   - Additional disease detection
   - Cross-validation of results
   - Improved accuracy for edge cases

## Cost Estimates

For a typical customer with 100 scans/month:
- Google Vision: ~$0.15/month
- AWS Rekognition: ~$0.10/month (if enabled)
- Claude AI: ~$0.50/month
- **Total API costs**: ~$0.75/month per customer

With the $29/month add-on price, this provides excellent margins while delivering real AI-powered analysis.

## Testing the Integration

Once API keys are configured, test the Plant Health AI:

```bash
# Check if environment variables are set
npm run check:env

# Run the plant health AI test
npm run test:plant-health

# Or test via the UI
# 1. Go to /design-advanced
# 2. Upload a plant image
# 3. Click "Analyze Plant Health"
```

## Monitoring Usage

Track API usage to ensure you stay within limits:

- **Google Cloud Console**: APIs & Services > Dashboard
- **AWS Console**: CloudWatch > Billing
- **Anthropic Console**: Usage dashboard

## Troubleshooting

### Common Issues

1. **"Google Vision API key not configured"**
   - Ensure `GOOGLE_VISION_API_KEY` is set in `.env.local`
   - Restart the development server

2. **"AWS credentials not found"**
   - AWS is optional, this warning can be ignored
   - To enable, add AWS credentials to `.env.local`

3. **"Rate limit exceeded"**
   - Implement caching for repeated images
   - Consider upgrading API tier if needed

## Production Deployment

For Vercel deployment:

1. Go to Vercel Dashboard > Settings > Environment Variables
2. Add all the API keys as production environment variables
3. Redeploy the application

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Set up billing alerts for all services