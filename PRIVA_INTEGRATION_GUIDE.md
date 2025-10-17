# 🏭 Priva Climate Computer Integration Guide

## Overview
VibeLux now supports full integration with Priva climate control systems, allowing real-time monitoring and control of your greenhouse environment directly from the VibeLux platform.

## Features

### ✅ What's Working
- **Demo Mode** - Fully functional simulation without hardware
- **OAuth Authentication** - Secure connection to Priva systems
- **Real-time Monitoring** - Live climate data every 30 seconds
- **Remote Control** - Adjust setpoints from VibeLux
- **Historical Data** - Access past climate records
- **Multi-compartment Support** - Monitor all greenhouse zones
- **Alarm Notifications** - Instant alerts for critical events
- **Fallback Mode** - Automatic switch to demo if connection fails

### 🔧 Implementation Details

#### 1. Configuration Service (`src/lib/integrations/priva/priva-config-service.ts`)
- Handles credential management (encrypted storage)
- Connection testing and validation
- Demo data generation for testing
- Real-time data polling
- Setpoint control commands
- Historical data retrieval

#### 2. Setup Wizard UI (`src/components/integrations/PrivaSetupWizard.tsx`)
- 3-step configuration process
- Connection testing interface
- Real-time data display
- Equipment status monitoring
- Demo/Real mode toggle

#### 3. API Routes (`src/app/api/priva/route.ts`)
- RESTful endpoints for all Priva operations
- Authentication via Clerk
- Error handling and logging
- Support for polling control

#### 4. Integration Page (`src/app/integrations/priva/page.tsx`)
- User-friendly dashboard
- System status overview
- Feature explanations
- Requirements and pricing info

## How to Use

### Option 1: Demo Mode (No Hardware Required)

1. Navigate to `/integrations/priva`
2. Click "Configure Priva"
3. Toggle "Use Demo Mode" ON
4. Click "Save Configuration"
5. View simulated greenhouse data

Demo mode provides:
- Realistic temperature fluctuations (22-28°C)
- Day/night cycles
- Equipment status changes
- Random alarms for testing
- 3 pre-configured compartments

### Option 2: Real Priva Connection

#### Prerequisites
- ✅ Priva Connext or Compact CC climate computer
- ✅ Priva Digital Services subscription
- ✅ OAuth application registered with Priva
- ✅ Network access to Priva API

#### Configuration Steps

1. **Obtain Credentials from Priva**
   ```
   Username: your.name@company.com
   Password: ********
   Farm Code: NL-GH-001
   API URL: https://api.priva.com (or your on-premise URL)
   OAuth Client ID: vibelux-app (if custom OAuth app)
   OAuth Client Secret: ******** (if custom OAuth app)
   ```

2. **Configure in VibeLux**
   - Navigate to `/integrations/priva`
   - Click "Configure Priva"
   - Toggle "Use Demo Mode" OFF
   - Enter your credentials
   - Click "Save Configuration"

3. **Test Connection**
   - Click "Test Connection"
   - Verify facilities are detected
   - Check for any error messages

4. **Start Monitoring**
   - Select a compartment
   - Click "Start" to begin polling
   - View real-time data updates

## API Endpoints

### GET /api/priva
```typescript
// Get configuration
?action=config

// Get real-time data
?action=realtime&compartmentId=comp-1

// Get historical data
?action=historical&compartmentId=comp-1&startDate=2024-01-01&endDate=2024-01-31&resolution=hour
```

### POST /api/priva
```typescript
// Save configuration
{
  "action": "saveConfig",
  "credentials": { ... },
  "isDemo": false
}

// Test connection
{
  "action": "testConnection"
}

// Update setpoint
{
  "action": "updateSetpoint",
  "compartmentId": "comp-1",
  "parameter": "temperatureDay",
  "value": 25
}

// Start polling
{
  "action": "startPolling",
  "compartmentId": "comp-1",
  "interval": 30000
}
```

## Data Structure

### Real-time Data Format
```typescript
{
  compartmentId: string,
  timestamp: Date,
  climate: {
    temperature: number,  // °C
    humidity: number,     // %RH
    co2: number,         // ppm
    radiation: number,   // W/m²
    vpd: number         // kPa
  },
  setpoints: {
    temperatureDay: number,
    temperatureNight: number,
    humidityMax: number,
    humidityMin: number,
    co2Target: number
  },
  equipment: {
    heating: number,     // 0-100%
    cooling: number,     // 0-100%
    vents: number,       // 0-100%
    screens: number,     // 0-100%
    lights: boolean,
    irrigation: boolean
  },
  alarms: string[]
}
```

## Database Schema

Add to your `schema.prisma`:

```prisma
model PrivaConfiguration {
  id                String    @id @default(cuid())
  userId            String    @unique
  credentials       Json
  isDemo            Boolean   @default(false)
  isActive          Boolean   @default(true)
  connectionStatus  String    @default("disconnected")
  lastConnected     DateTime?
  lastError         String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model PrivaRealtimeData {
  id            String   @id @default(cuid())
  compartmentId String
  timestamp     DateTime
  climate       Json
  setpoints     Json
  equipment     Json
  alarms        String[]
  createdAt     DateTime @default(now())
}
```

Run migration:
```bash
npx prisma migrate dev --name add-priva-integration
```

## Environment Variables

Add to `.env`:
```bash
# Optional - for default configuration
PRIVA_API_URL=https://api.priva.com
PRIVA_API_VERSION=v3
PRIVA_OAUTH_CLIENT_ID=vibelux-app
PRIVA_OAUTH_CLIENT_SECRET=your-secret

# Encryption key for credentials
ENCRYPTION_KEY=your-32-character-encryption-key
```

## Security Considerations

1. **Credential Storage**
   - Credentials should be encrypted before database storage
   - Currently using placeholder encryption (implement real encryption in production)
   - Consider using AWS KMS or similar for key management

2. **API Security**
   - All endpoints require authentication via Clerk
   - Rate limiting should be implemented
   - CORS configuration for API access

3. **Network Security**
   - HTTPS required for all API communications
   - VPN may be required for on-premise Priva systems
   - Firewall rules for Priva API access

## Troubleshooting

### Connection Fails
- Verify credentials are correct
- Check network connectivity to Priva API
- Ensure OAuth app is properly registered
- Check firewall rules

### No Data Received
- Verify compartment ID is correct
- Check Priva system is online
- Ensure sensors are properly configured
- Review Priva system logs

### Demo Mode Issues
- Clear browser cache
- Check console for errors
- Verify database migrations completed
- Restart polling if needed

## Cost Breakdown

### Priva Hardware & Software
- Climate Computer: €50,000 - €200,000
- Sensors & Installation: €20,000 - €100,000
- Software License: €2,000 - €10,000/year
- Digital Services: €1,000 - €5,000/year
- API Access: €500 - €5,000/year

### Total Investment
- **Small Greenhouse (< 1000m²)**: €75,000 - €150,000
- **Medium Greenhouse (1000-5000m²)**: €150,000 - €350,000
- **Large Greenhouse (> 5000m²)**: €350,000 - €500,000+

### VibeLux Integration
- **FREE** with any VibeLux subscription
- Demo mode available at no cost
- No additional fees for API usage

## Future Enhancements

1. **Advanced Analytics**
   - ML-based climate predictions
   - Energy optimization algorithms
   - Yield correlation analysis

2. **Automation**
   - Rule-based setpoint adjustments
   - Predictive alarm management
   - Automated reporting

3. **Multi-site Support**
   - Connect multiple Priva systems
   - Centralized dashboard
   - Cross-facility comparisons

4. **Mobile App**
   - Real-time notifications
   - Remote control
   - Offline data caching

## Support

For Priva integration support:
1. Check this documentation
2. Review error logs in VibeLux
3. Contact Priva support for hardware issues
4. Open a VibeLux support ticket for integration issues

## Conclusion

The Priva integration provides professional greenhouse operators with seamless climate control monitoring within VibeLux. Whether using demo mode for testing or connecting real hardware, the system offers comprehensive environmental data management and control capabilities.