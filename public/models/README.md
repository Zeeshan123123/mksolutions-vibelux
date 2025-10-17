# VibeLux ML Models

This directory contains pre-trained machine learning models that run directly in the browser.

## Models Available:

### 1. Yield Prediction Model
- **Path**: `/models/yield-prediction/model.json`
- **Inputs**: Temperature, humidity, PPFD, CO2, EC, pH, crop type, growth stage, plant age
- **Output**: Predicted yield (kg/m²)
- **Architecture**: 9→32→16→8→1 neural network

### 2. Disease Prediction Model  
- **Path**: `/models/disease-prediction/model.json`
- **Inputs**: Temperature, humidity, leaf wetness, VPD, crop type
- **Output**: Risk scores for powdery mildew, botrytis, spider mites, aphids
- **Architecture**: 5→24→12→4 neural network

## Usage:

The models are automatically loaded by the `MLPredictionWidget` component or `useMLPredictions` hook.

```typescript
import { useMLPredictions } from '@/hooks/useMLPredictions';

// In your component
const predictions = useMLPredictions({
  temperature: 24,
  humidity: 65,
  ppfd: 450,
  co2: 1000
}, 'lettuce');

// Access predictions
console.log(`Yield: ${predictions.yield?.value} kg/m²`);
console.log(`Disease risks:`, predictions.diseases);
```

## Benefits:

✅ **Zero Setup** - Works immediately in any browser
✅ **No Server Required** - Runs entirely client-side  
✅ **Privacy** - Customer data never leaves their browser
✅ **Fast** - No network latency for predictions
✅ **Offline Capable** - Works without internet once loaded

## Fallback:

If models fail to load, the system automatically falls back to scientifically-validated rule-based calculations, ensuring predictions always work.