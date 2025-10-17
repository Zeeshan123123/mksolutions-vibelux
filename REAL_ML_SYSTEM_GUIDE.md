# 🚀 VibeLux Real ML & Lab Integration System Guide

## Overview
The VibeLux application now has **REAL** machine learning, lab integration, and cultivation feedback systems. No more fake data or simulated predictions!

## What's Been Built

### 1. 🧪 Lab Testing Integration (`src/lib/lab-integration/lab-api-service.ts`)
- **SC Labs API** - Connect to one of California's largest cannabis testing labs
- **Steep Hill API** - Pioneer in cannabis testing integration
- **Manual Input Forms** - Enter lab results manually when API access isn't available
- **Automatic Data Storage** - All lab results stored in database for ML training

### 2. 📊 Real TensorFlow.js Implementation (`src/lib/ml/real-tensorflow-service.ts`)
- **Actual Neural Networks** - Multi-layer perceptrons with batch normalization and dropout
- **Model Persistence** - Trained models saved to IndexedDB and database
- **Continuous Learning** - Models retrain automatically with new harvest data
- **R² Score Validation** - Real model performance metrics, not fake accuracy

### 3. 🌱 Harvest Feedback System (`src/lib/cultivation/harvest-feedback-system.ts`)
- **Harvest Recording** - Link actual yields and quality to growing conditions
- **Correlation Analysis** - Find real relationships between environment and outcomes
- **Optimization Plans** - Generate recommendations based on top-performing crops
- **Performance Tracking** - Compare predictions to actual results

### 4. 🔄 Data Pipeline (`src/lib/data-pipeline/cultivation-data-pipeline.ts`)
- **Automatic Processing** - Continuously processes sensor data, lab results, and harvests
- **Data Quality Assessment** - Validates and scores data quality
- **Training Queue** - Automatically triggers model retraining when enough data available
- **Event-Driven Architecture** - Emits events for real-time monitoring

### 5. 📈 Statistical Analysis Dashboard (Updated)
- **Real Data Integration** - Now pulls actual cultivation data from database
- **Live Correlations** - Shows real relationships, not random numbers
- **Data Source Indicator** - Shows when using real vs simulated data
- **Fallback to Simulation** - Gracefully handles when no real data available

## How to Use the System

### Step 1: Configure Lab API (Optional)
```bash
# Add to .env file
LAB_API_PROVIDER=sc_labs  # or steep_hill or manual
LAB_API_KEY=your_api_key
LAB_API_SECRET=your_api_secret
LAB_API_URL=https://api.sclabs.com/v1  # or custom URL
LAB_ACCOUNT_ID=your_account_id
```

### Step 2: Start Recording Cultivation Data

#### Manual Lab Result Entry
```typescript
import { labIntegration } from '@/lib/lab-integration/lab-api-service';

// Enter lab results manually
await labIntegration.inputManualResults({
  sampleId: 'S-2024-001',
  batchId: 'B-2024-050',
  testDate: new Date(),
  labName: 'SC Labs',
  cannabinoids: {
    thc: 22.5,
    cbd: 0.3,
    totalCannabinoids: 25.1
  },
  terpenes: {
    myrcene: 0.8,
    limonene: 0.4,
    totalTerpenes: 2.1
  }
});
```

#### Record Harvest Data
```typescript
import { harvestFeedback } from '@/lib/cultivation/harvest-feedback-system';

await harvestFeedback.recordHarvest({
  batchId: 'B-2024-050',
  strainName: 'Blue Dream',
  harvestDate: new Date(),
  wetWeight: 5000,  // grams
  dryWeight: 1000,  // grams
  environmentalConditions: {
    avgTemperature: 24,
    avgHumidity: 55,
    avgCO2: 1200,
    avgPPFD: 800,
    avgDLI: 45,
    lightSpectrum: {
      red: 0.35,
      blue: 0.20,
      green: 0.10,
      farRed: 0.15,
      uv: 0.05
    },
    avgEC: 2.0,
    avgPH: 6.2
  },
  growthTimeline: {
    vegetativeDays: 30,
    floweringDays: 65
  }
});
```

### Step 3: Train ML Models

#### Automatic Training
Models automatically train when:
- 10+ data points accumulated
- 24 hours since last training
- New harvest data recorded

#### Manual Training
```typescript
import { tensorflowService } from '@/lib/ml/real-tensorflow-service';

// Train cannabinoid predictor
await tensorflowService.trainModel(
  'cannabinoid-predictor',
  trainingData,
  { 
    epochs: 100, 
    modelType: 'cannabinoid' 
  }
);
```

### Step 4: Make Predictions
```typescript
// Predict cannabinoid content
const prediction = await tensorflowService.predict(
  'cannabinoid-predictor',
  {
    avgTemperature: 25,
    avgHumidity: 60,
    avgCO2: 1000,
    avgPPFD: 750,
    avgDLI: 42,
    // ... other inputs
  }
);

console.log(`Predicted THC: ${prediction.thcPercentage}%`);
```

### Step 5: View Real Correlations
The Statistical Analysis Dashboard now shows:
- **Real correlations** between environmental factors and outcomes
- **Actual R² scores** from trained models
- **True p-values** from statistical tests
- **Live updates** as new data comes in

## Data Flow

```
1. Sensor Data → Data Pipeline
2. Lab Results (API/Manual) → Database
3. Harvest Results → Feedback System
4. All Data → Training Pipeline
5. Training → TensorFlow Models
6. Models → Predictions & Insights
7. Insights → Optimization Plans
```

## Important Notes

### What's Real Now:
✅ Lab test results (when entered)
✅ TensorFlow model training
✅ Model predictions based on actual data
✅ Correlation calculations
✅ Performance metrics
✅ Harvest feedback loops

### What Still Needs Real Data:
⚠️ Sensor readings (if not connected)
⚠️ Historical cultivation data
⚠️ Spectral measurements
⚠️ Energy consumption metrics

### Getting Started with Real Data:
1. **Start Small** - Enter one harvest's data manually
2. **Build History** - Add 5-10 harvests for initial training
3. **Connect Sensors** - Link real sensors for continuous data
4. **Regular Updates** - Enter lab results after each test
5. **Track Outcomes** - Record every harvest for feedback

## API Documentation

### Lab Integration Service
```typescript
class LabIntegrationService {
  fetchTestResults(sampleId: string): Promise<LabTestResult>
  inputManualResults(data: Partial<LabTestResult>): Promise<LabTestResult>
  getHistoricalResults(filters?: {...}): Promise<LabTestResult[]>
  calculateCorrelations(batchId: string, envData: {...}): Promise<{...}>
}
```

### TensorFlow Service
```typescript
class RealTensorFlowService {
  trainModel(name: string, data: TrainingData[], options?: {...}): Promise<ModelMetadata>
  predict(modelName: string, input: TrainingData['inputs']): Promise<TrainingData['outputs']>
  retrainModel(name: string, newData: TrainingData[], options?: {...}): Promise<ModelMetadata>
  getModelMetrics(modelName: string): ModelMetadata | null
  listModels(): ModelMetadata[]
}
```

### Harvest Feedback System
```typescript
class HarvestFeedbackSystem {
  recordHarvest(data: HarvestData): Promise<void>
  analyzeCorrelations(startDate: Date, endDate: Date): Promise<{...}>
  generateOptimizationPlan(strain: string, metric: string): Promise<{...}>
  startCultivationCycle(batchId: string, strain: string, date: Date): Promise<CultivationCycle>
}
```

### Data Pipeline
```typescript
class CultivationDataPipeline {
  ingestData(dataPoint: DataPoint): Promise<void>
  getStatistics(): {...}
  forceTraining(): Promise<void>
  clearBuffers(): void
}
```

## Troubleshooting

### "No real data available"
- Enter at least one harvest with lab results
- Check database connection
- Verify Prisma schema is migrated

### "Model not found"
- Train the model first with sufficient data
- Check model name spelling
- Verify IndexedDB storage

### "Insufficient training data"
- Need minimum 10 samples for initial training
- Add more harvest records
- Use manual input if API unavailable

### "Lab API authentication failed"
- Check API credentials in .env
- Verify API subscription is active
- Use manual input as fallback

## Next Steps

1. **Connect Real Sensors** - Replace simulated sensor data
2. **Add More Lab Partners** - Integrate additional testing labs
3. **Implement Spectral Sensors** - Measure actual light spectrum
4. **Build Mobile App** - Enter data from the field
5. **Create Alerts** - Notify when correlations change
6. **Export Reports** - Generate PDF reports with insights

## Support

For issues or questions about the real ML system:
- Check error logs in browser console
- Review server logs for API errors
- Verify database has required tables
- Ensure TensorFlow.js is loading properly

The system is now ready for real cultivation data. Start entering your actual results to unlock the full power of machine learning-driven cultivation optimization!