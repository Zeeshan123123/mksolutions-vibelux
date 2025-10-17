# ML Training API Endpoint

This API endpoint provides machine learning model training and management capabilities for predictive maintenance.

## Authentication

All endpoints require authentication using Clerk. Include the authentication token in your request headers.

## Endpoints

### GET /api/maintenance/ml-training

Retrieve trained models and their performance history.

#### Query Parameters

- `modelId` (optional): Get specific model's performance history
- `includeHistory` (optional): Include performance history for all models (true/false)

#### Example Requests

```bash
# Get all models
GET /api/maintenance/ml-training

# Get specific model's performance history
GET /api/maintenance/ml-training?modelId=model-123

# Get all models with performance history
GET /api/maintenance/ml-training?includeHistory=true
```

#### Response

```json
{
  "models": [
    {
      "modelId": "model-default-1",
      "version": "1.0.0",
      "algorithm": "gradient-boosting",
      "trainedAt": "2024-01-15T10:30:00Z",
      "accuracy": 0.92,
      "status": "active",
      "performanceHistory": [
        {
          "date": "2024-01-15T00:00:00Z",
          "accuracy": 0.91,
          "predictions": 45,
          "failures": 2
        }
      ]
    }
  ]
}
```

### POST /api/maintenance/ml-training

Train a new ML model or perform actions on existing models.

#### Actions

##### 1. Train New Model (default action)

```json
{
  "trainingData": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "equipmentId": "equipment-123",
      "sensorData": {
        "temperature": 75.5,
        "vibration": 0.02,
        "current": 15.3,
        "runtime": 1250,
        "efficiency": 92.5
      },
      "maintenanceEvents": [
        {
          "type": "preventive",
          "date": "2024-01-10T08:00:00Z",
          "component": "bearing",
          "cost": 150
        }
      ],
      "environmentalFactors": {
        "ambientTemp": 72,
        "humidity": 45,
        "dustLevel": 25
      }
    }
  ],
  "parameters": {
    "algorithm": "gradient-boosting",
    "validationSplit": 0.2,
    "hyperparameters": {
      "n_estimators": 100,
      "learning_rate": 0.1,
      "max_depth": 5
    }
  }
}
```

##### 2. Update Model (Incremental Learning)

```bash
POST /api/maintenance/ml-training?action=update
```

```json
{
  "modelId": "model-123",
  "newData": [
    {
      "timestamp": "2024-01-16T10:30:00Z",
      "equipmentId": "equipment-123",
      "sensorData": {
        "temperature": 76.0,
        "vibration": 0.025,
        "current": 15.5,
        "runtime": 1275,
        "efficiency": 91.8
      },
      "maintenanceEvents": [],
      "environmentalFactors": {
        "ambientTemp": 73,
        "humidity": 48,
        "dustLevel": 28
      }
    }
  ]
}
```

##### 3. Export Model

```bash
POST /api/maintenance/ml-training?action=export
```

```json
{
  "modelId": "model-123"
}
```

#### Response

```json
{
  "success": true,
  "model": {
    "modelId": "model-123",
    "version": "1.0.0",
    "trainedAt": "2024-01-15T10:30:00Z",
    "metrics": {
      "accuracy": 0.92,
      "precision": 0.874,
      "recall": 0.8464,
      "f1Score": 0.8600,
      "mse": 4.25,
      "confidenceInterval": {
        "lower": 2.1,
        "upper": 6.4
      }
    },
    "parameters": {
      "algorithm": "gradient-boosting",
      "features": ["age_days", "runtime_hours", "temp_avg", ...],
      "hyperparameters": {
        "n_estimators": 100,
        "learning_rate": 0.1,
        "max_depth": 5
      },
      "trainingDataSize": 800,
      "validationSplit": 0.2
    },
    "validationResults": [...]
  }
}
```

### DELETE /api/maintenance/ml-training

Deactivate a trained model.

#### Query Parameters

- `modelId` (required): The ID of the model to deactivate

#### Example Request

```bash
DELETE /api/maintenance/ml-training?modelId=model-123
```

#### Response

```json
{
  "success": true,
  "message": "Model model-123 has been deactivated"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `400 Bad Request`: Invalid request data or parameters
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Model not found
- `500 Internal Server Error`: Server-side error

Error response format:

```json
{
  "error": "Error message",
  "details": [...] // Optional, includes validation errors
}
```

## Supported ML Algorithms

1. **Gradient Boosting** (default)
   - Best for general predictive maintenance
   - Good balance of accuracy and interpretability

2. **Random Forest**
   - Robust to outliers
   - Good for mixed data types

3. **Neural Network**
   - Best for complex patterns
   - Requires more training data

4. **LSTM**
   - Best for time-series patterns
   - Captures sequential dependencies

## Integration Example

```typescript
// Example using the ML Training API with fetch
const trainModel = async () => {
  const response = await fetch('/api/maintenance/ml-training', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      trainingData: trainingDataArray,
      parameters: {
        algorithm: 'gradient-boosting',
        validationSplit: 0.2
      }
    })
  });

  if (!response.ok) {
    throw new Error('Training failed');
  }

  const result = await response.json();
  console.log('Model trained:', result.model);
};
```