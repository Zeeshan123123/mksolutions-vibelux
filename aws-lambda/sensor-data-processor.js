/**
 * VibeLux IoT Sensor Data Processor
 * Processes incoming sensor data from IoT devices and stores in DynamoDB
 * ADDITIVE: Does not modify existing functionality
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('Processing VibeLux sensor data:', JSON.stringify(event, null, 2));
    
    try {
        // Parse IoT message
        const sensorData = JSON.parse(event.body || event.Records?.[0]?.body || '{}');
        
        // Validate required fields
        if (!sensorData.facilityId || !sensorData.sensorId || !sensorData.readings) {
            throw new Error('Missing required fields: facilityId, sensorId, or readings');
        }
        
        // Prepare DynamoDB item
        const timestamp = Date.now();
        const item = {
            FacilityId: sensorData.facilityId,
            Timestamp: timestamp,
            SensorId: sensorData.sensorId,
            SensorType: sensorData.sensorType || 'environmental',
            Readings: sensorData.readings, // PPFD, temperature, humidity, CO2, etc.
            Location: sensorData.location || {},
            Metadata: {
                deviceVersion: sensorData.deviceVersion,
                batteryLevel: sensorData.batteryLevel,
                signalStrength: sensorData.signalStrength,
                processedAt: new Date().toISOString()
            }
        };
        
        // Store in DynamoDB
        await dynamodb.put({
            TableName: 'VibeLuxSensorData',
            Item: item
        }).promise();
        
        // Check for alerts (optional enhancement)
        await checkAlertConditions(sensorData);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Sensor data processed successfully',
                facilityId: sensorData.facilityId,
                timestamp: timestamp
            })
        };
        
    } catch (error) {
        console.error('Error processing sensor data:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to process sensor data',
                message: error.message
            })
        };
    }
};

/**
 * Check for alert conditions based on sensor readings
 * ADDITIVE: Enhances existing monitoring without replacing it
 */
async function checkAlertConditions(sensorData) {
    const { readings, facilityId, sensorId } = sensorData;
    const alerts = [];
    
    // PPFD (light) alerts
    if (readings.ppfd !== undefined) {
        if (readings.ppfd < 200) {
            alerts.push({
                type: 'LOW_LIGHT',
                severity: 'WARNING',
                message: `Low PPFD detected: ${readings.ppfd} µmol/m²/s`
            });
        } else if (readings.ppfd > 2000) {
            alerts.push({
                type: 'HIGH_LIGHT',
                severity: 'WARNING', 
                message: `High PPFD detected: ${readings.ppfd} µmol/m²/s`
            });
        }
    }
    
    // Temperature alerts
    if (readings.temperature !== undefined) {
        if (readings.temperature < 15 || readings.temperature > 35) {
            alerts.push({
                type: 'TEMPERATURE_ALERT',
                severity: readings.temperature < 10 || readings.temperature > 40 ? 'CRITICAL' : 'WARNING',
                message: `Temperature out of range: ${readings.temperature}°C`
            });
        }
    }
    
    // Humidity alerts
    if (readings.humidity !== undefined) {
        if (readings.humidity < 30 || readings.humidity > 80) {
            alerts.push({
                type: 'HUMIDITY_ALERT',
                severity: 'WARNING',
                message: `Humidity out of range: ${readings.humidity}%`
            });
        }
    }
    
    // CO2 alerts
    if (readings.co2 !== undefined) {
        if (readings.co2 < 300 || readings.co2 > 1500) {
            alerts.push({
                type: 'CO2_ALERT',
                severity: readings.co2 > 2000 ? 'CRITICAL' : 'WARNING',
                message: `CO2 level out of range: ${readings.co2} ppm`
            });
        }
    }
    
    // Send alerts if any detected
    if (alerts.length > 0) {
        await sendAlerts(facilityId, sensorId, alerts);
    }
}

/**
 * Send alerts via SNS (optional enhancement)
 */
async function sendAlerts(facilityId, sensorId, alerts) {
    try {
        const sns = new AWS.SNS();
        
        for (const alert of alerts) {
            await sns.publish({
                TopicArn: `arn:aws:sns:us-east-1:700083211206:vibelux-alerts`,
                Subject: `VibeLux Alert: ${alert.type}`,
                Message: JSON.stringify({
                    facilityId,
                    sensorId,
                    alert,
                    timestamp: new Date().toISOString()
                })
            }).promise();
        }
        
        console.log(`Sent ${alerts.length} alerts for facility ${facilityId}`);
    } catch (error) {
        console.error('Failed to send alerts:', error);
        // Don't throw - alert failure shouldn't break data processing
    }
}