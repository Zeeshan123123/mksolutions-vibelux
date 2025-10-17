/**
 * Generate and save pre-trained models for browser use
 * Run this server-side to create models that browsers can download
 */

import * as tf from '@tensorflow/tfjs';
import { logger } from '@/lib/logging/production-logger';

export async function generateYieldPredictionModel() {
  // Create a simple but effective yield prediction model
  const model = tf.sequential({
    layers: [
      // Input layer - 9 features
      tf.layers.dense({ 
        units: 32, 
        activation: 'relu', 
        inputShape: [9],
        kernelInitializer: 'glorotNormal'
      }),
      tf.layers.dropout({ rate: 0.2 }),
      
      // Hidden layers
      tf.layers.dense({ 
        units: 16, 
        activation: 'relu',
        kernelInitializer: 'glorotNormal'
      }),
      tf.layers.dropout({ rate: 0.1 }),
      
      tf.layers.dense({ 
        units: 8, 
        activation: 'relu',
        kernelInitializer: 'glorotNormal'
      }),
      
      // Output layer - single yield value
      tf.layers.dense({ 
        units: 1, 
        activation: 'sigmoid' // 0-1 normalized yield
      })
    ]
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['mae']
  });

  // Generate synthetic training data based on agricultural science
  const trainingData = generateYieldTrainingData(1000);
  
  // Train the model
  await model.fit(trainingData.features, trainingData.labels, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (epoch % 10 === 0) {
          logger.info('api', `Yield model training - Epoch ${epoch}: loss=${logs?.loss?.toFixed(4)}`);
        }
      }
    }
  });

  // Save model for browser use
  await model.save('file://./public/models/yield-prediction');
  logger.info('api', 'Yield prediction model saved to public/models/yield-prediction');

  // Cleanup
  trainingData.features.dispose();
  trainingData.labels.dispose();
  
  return model;
}

export async function generateDiseasePredictionModel() {
  // Disease prediction model - multi-class classification
  const model = tf.sequential({
    layers: [
      // Input layer - 5 features
      tf.layers.dense({ 
        units: 24, 
        activation: 'relu', 
        inputShape: [5],
        kernelInitializer: 'glorotNormal'
      }),
      tf.layers.dropout({ rate: 0.3 }),
      
      tf.layers.dense({ 
        units: 12, 
        activation: 'relu',
        kernelInitializer: 'glorotNormal'
      }),
      tf.layers.dropout({ rate: 0.2 }),
      
      // Output layer - 4 disease probabilities
      tf.layers.dense({ 
        units: 4, 
        activation: 'sigmoid' // Multiple diseases can occur
      })
    ]
  });

  model.compile({
    optimizer: tf.train.adam(0.005),
    loss: 'binaryCrossentropy', // Each disease is independent
    metrics: ['accuracy']
  });

  // Generate training data
  const trainingData = generateDiseaseTrainingData(2000);
  
  // Train the model
  await model.fit(trainingData.features, trainingData.labels, {
    epochs: 100,
    batchSize: 64,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (epoch % 20 === 0) {
          logger.info('api', `Disease model training - Epoch ${epoch}: loss=${logs?.loss?.toFixed(4)}`);
        }
      }
    }
  });

  // Save model
  await model.save('file://./public/models/disease-prediction');
  logger.info('api', 'Disease prediction model saved to public/models/disease-prediction');

  // Cleanup
  trainingData.features.dispose();
  trainingData.labels.dispose();
  
  return model;
}

function generateYieldTrainingData(samples: number) {
  const features: number[][] = [];
  const labels: number[][] = [];

  for (let i = 0; i < samples; i++) {
    // Generate realistic environmental conditions
    const temp = 18 + Math.random() * 12; // 18-30°C
    const humidity = 40 + Math.random() * 40; // 40-80%
    const ppfd = 200 + Math.random() * 600; // 200-800
    const co2 = 400 + Math.random() * 1200; // 400-1600
    const ec = 0.5 + Math.random() * 3; // 0.5-3.5
    const ph = 5 + Math.random() * 2; // 5-7
    const cropType = Math.random(); // 0-1 encoded
    const growthStage = Math.random(); // 0-1 encoded
    const plantAge = Math.random(); // 0-1 normalized

    // Calculate yield based on environmental factors
    let yieldScore = 0.5; // Base yield
    
    // Temperature impact
    if (temp >= 20 && temp <= 25) yieldScore += 0.1;
    else if (temp < 18 || temp > 28) yieldScore -= 0.2;
    
    // Humidity impact
    if (humidity >= 60 && humidity <= 70) yieldScore += 0.1;
    else if (humidity > 80) yieldScore -= 0.15;
    
    // Light impact (most important)
    yieldScore += (ppfd / 1000) * 0.3;
    
    // CO2 impact
    if (co2 > 800) yieldScore += 0.1;
    if (co2 > 1200) yieldScore += 0.05;
    
    // Nutrient impact
    if (ec >= 1.5 && ec <= 2.5) yieldScore += 0.1;
    if (ph >= 5.8 && ph <= 6.5) yieldScore += 0.05;
    
    // Growth stage impact
    yieldScore *= (0.5 + growthStage * 0.5);
    
    // Add noise
    yieldScore += (Math.random() - 0.5) * 0.1;
    
    // Clamp to 0-1
    yieldScore = Math.max(0, Math.min(1, yieldScore));

    features.push([
      temp / 40,
      humidity / 100,
      ppfd / 1000,
      co2 / 2000,
      ec / 5,
      ph / 14,
      cropType,
      growthStage,
      plantAge
    ]);
    
    labels.push([yieldScore]);
  }

  return {
    features: tf.tensor2d(features),
    labels: tf.tensor2d(labels)
  };
}

function generateDiseaseTrainingData(samples: number) {
  const features: number[][] = [];
  const labels: number[][] = [];

  for (let i = 0; i < samples; i++) {
    const temp = 15 + Math.random() * 20; // 15-35°C
    const humidity = 30 + Math.random() * 60; // 30-90%
    const leafWetness = Math.random() * 24; // 0-24 hours
    const vpd = 0.3 + Math.random() * 2.5; // 0.3-2.8 kPa
    const cropType = Math.random();

    // Disease probabilities based on conditions
    const diseases = [0, 0, 0, 0]; // [powdery_mildew, botrytis, spider_mites, aphids]
    
    // Powdery mildew (likes moderate humidity, warm temps)
    if (humidity > 40 && humidity < 70 && temp > 20 && temp < 28) {
      diseases[0] = 0.6 + Math.random() * 0.3;
    }
    
    // Botrytis (likes high humidity, cool temps)
    if (humidity > 80 && leafWetness > 6 && temp < 25) {
      diseases[1] = 0.7 + Math.random() * 0.3;
    }
    
    // Spider mites (likes hot, dry conditions)
    if (humidity < 50 && temp > 25 && vpd > 1.5) {
      diseases[2] = 0.5 + Math.random() * 0.4;
    }
    
    // Aphids (moderate conditions)
    if (temp > 18 && temp < 26 && humidity > 50) {
      diseases[3] = 0.3 + Math.random() * 0.3;
    }

    features.push([
      temp / 40,
      humidity / 100,
      leafWetness / 24,
      vpd / 3,
      cropType
    ]);
    
    labels.push(diseases);
  }

  return {
    features: tf.tensor2d(features),
    labels: tf.tensor2d(labels)
  };
}

// Script to generate models
export async function generateAllModels() {
  logger.info('api', 'Starting model generation...');
  
  // Create directories
  const fs = await import('fs');
  const path = await import('path');
  
  const modelsDir = path.join(process.cwd(), 'public', 'models');
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }
  
  // Generate models
  await generateYieldPredictionModel();
  await generateDiseasePredictionModel();
  
  logger.info('api', 'All models generated successfully!');
}