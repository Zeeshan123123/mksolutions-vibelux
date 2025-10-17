// Quick test to verify TensorFlow is working
const tf = require('@tensorflow/tfjs-node');

async function testTensorFlow() {
  console.log('Testing TensorFlow installation...');
  
  // Create a simple model
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ units: 10, activation: 'relu', inputShape: [5] }),
      tf.layers.dense({ units: 1 })
    ]
  });
  
  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError'
  });
  
  // Create dummy data
  const xs = tf.randomNormal([100, 5]);
  const ys = tf.randomNormal([100, 1]);
  
  // Train briefly
  console.log('Training model...');
  await model.fit(xs, ys, {
    epochs: 5,
    verbose: 0
  });
  
  // Make prediction
  const prediction = model.predict(tf.randomNormal([1, 5]));
  const result = await prediction.data();
  
  console.log('✅ TensorFlow is working!');
  console.log('Sample prediction:', result[0]);
  
  // Cleanup
  xs.dispose();
  ys.dispose();
  prediction.dispose();
}

testTensorFlow().catch(console.error);