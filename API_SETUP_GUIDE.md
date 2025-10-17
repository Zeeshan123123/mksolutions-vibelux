# API Setup Guide for Enhanced Location-Based Analysis

The Location-Based Analysis (LBA) system uses multiple APIs to provide professional-grade climate and site analysis. Here's how to set them up:

## 🔑 Required API Keys

### 1. OpenWeather API (Primary Weather Data)
**Cost**: Free tier: 1,000 calls/day • Paid: $40/month for 100,000 calls
**Setup**:
1. Go to [OpenWeatherMap.org](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to "API keys" in your dashboard
4. Copy your API key
5. Add to `.env.local`: `NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key_here`

**What it provides**:
- Current weather conditions
- Temperature, humidity, pressure
- Cloud cover and visibility
- Wind speed and direction

### 2. Visual Crossing Weather API (Historical Climate Data)
**Cost**: Free tier: 1,000 records/day • Paid: $35/month for 100,000 records
**Setup**:
1. Go to [VisualCrossing.com](https://www.visualcrossing.com/weather-api)
2. Sign up for a free account
3. Go to "Account" → "API Keys"
4. Copy your API key
5. Add to `.env.local`: `NEXT_PUBLIC_VISUAL_CROSSING_API_KEY=your_key_here`

**What it provides**:
- 30+ year historical climate data
- Growing degree day calculations
- Frost date statistics
- Seasonal weather patterns
- Solar radiation estimates

## 🔄 Automatic Fallbacks

**Good News**: The system works without API keys! It will:
- Use realistic mock data based on geographic location
- Provide all LBA functionality with simulated climate data
- Automatically upgrade to real data when API keys are added
- Show data quality indicators so users know the source

## 🎯 API Usage Optimization

The system is designed to minimize API calls:
- **Caching**: Results cached for 1 hour per location
- **Batching**: Multiple data points requested in single calls
- **Smart Fallbacks**: Uses cached/mock data if APIs are unavailable
- **Progressive Enhancement**: Works with partial API availability

## 💰 Cost Estimates

For a typical greenhouse consulting business:

**Free Tier Usage** (adequate for most users):
- OpenWeather: 1,000 calls/day = ~30 locations/day
- Visual Crossing: 1,000 records/day = ~10 detailed analyses/day

**Paid Tier** (for high-volume consulting):
- OpenWeather: $40/month = ~3,300 calls/day
- Visual Crossing: $35/month = ~3,300 analyses/day
- **Total**: ~$75/month for unlimited professional analysis

## 🔒 Security Notes

- API keys are stored in environment variables (not in code)
- Keys are prefixed with `NEXT_PUBLIC_` only for client-side APIs
- Historical weather API calls are server-side for security
- Never commit API keys to version control

## 🚀 Quick Start

1. **Start immediately**: System works without any setup
2. **Add OpenWeather key**: Get current conditions for enhanced accuracy
3. **Add Visual Crossing key**: Get professional 30-year climate normals
4. **Monitor usage**: Track API calls in respective dashboards

## 🔧 Optional Enhancements

### USGS Elevation API
- **Free** government service
- No API key required
- Provides precise elevation data for microclimate analysis

### NREL Solar API (Future Enhancement)
- More precise solar radiation data
- Free with registration
- Setup: [developer.nrel.gov](https://developer.nrel.gov/signup/)

### USDA Soil Survey API (Future Enhancement)
- Professional soil analysis
- Free government data
- More complex authentication setup

## 📊 Data Quality Levels

The system automatically adapts to available data sources:

1. **Professional**: Real historical + elevation + current weather
2. **Good**: Historical climate data + current weather  
3. **Standard**: Current weather + geographic estimates
4. **Basic**: Geographic-based simulation (always available)

## ⚡ Testing Your Setup

1. Go to Dashboard → Location Analysis
2. Select any location
3. Check data quality indicators in the report
4. Green badges = real API data, Gray badges = simulated data

## 🆘 Troubleshooting

**"API key invalid" errors**:
- Verify key is correct in `.env.local`
- Restart development server after adding keys
- Check API key permissions in provider dashboard

**Rate limit errors**:
- System automatically falls back to cached/mock data
- Consider upgrading to paid tier for high usage
- Monitor usage in API provider dashboards

**No data returned**:
- Check network connectivity
- Verify location coordinates are valid
- System will use fallback data automatically

The system is designed to be professional-grade while remaining accessible and cost-effective for all users.