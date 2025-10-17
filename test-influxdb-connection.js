#!/usr/bin/env node

/**
 * Test InfluxDB Cloud Connection
 * This script tests the connection to your new InfluxDB Cloud instance
 */

const { InfluxDB, Point } = require('@influxdata/influxdb-client')

// Your InfluxDB Cloud credentials
const url = 'https://us-east-1-1.aws.cloud2.influxdata.com'
const token = 'CNgxTJPBTyK98wFuyFV_L0GXKLiOKfOBdvWnBIldi3B1hu4Oci8InvuaAfacIgn9BzVSe4iRfgFFh59_X5yFfA=='
const org = '21b9d85add06d92f'
const bucket = 'vibelux-sensors'

async function testConnection() {
  console.log('🔌 Testing InfluxDB Cloud connection...')
  console.log(`📍 URL: ${url}`)
  console.log(`🏢 Org: ${org}`)
  console.log(`🪣 Bucket: ${bucket}`)
  console.log('')

  const client = new InfluxDB({ url, token })

  try {
    // Test 1: Test write permissions (this also validates connectivity)
    console.log('1️⃣  Testing write permissions...')
    const writeApi = client.getWriteApi(org, bucket)
    
    const testPoint = new Point('test_measurement')
      .tag('source', 'connection_test')
      .tag('application', 'vibelux')
      .floatField('temperature', 22.5)
      .floatField('humidity', 65.0)
      .timestamp(new Date())

    writeApi.writePoint(testPoint)
    await writeApi.close()
    console.log('✅ Write test successful')

    // Test 2: Test read permissions
    console.log('2️⃣  Testing read permissions...')
    const queryApi = client.getQueryApi(org)
    
    const query = `
      from(bucket: "${bucket}")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == "test_measurement")
        |> limit(n: 5)
    `

    const results = []
    await new Promise((resolve, reject) => {
      queryApi.queryRows(query, {
        next: (row, tableMeta) => {
          const record = tableMeta.toObject(row)
          results.push(record)
        },
        error: reject,
        complete: resolve
      })
    })

    console.log('✅ Read test successful')
    console.log(`📊 Found ${results.length} test records`)

    console.log('')
    console.log('🎉 All tests passed! Your InfluxDB Cloud is ready for VibeLux sensor data.')
    console.log('')
    console.log('Next steps:')
    console.log('• Add environment variables to your production deployment')
    console.log('• Start sending sensor data from your devices')
    console.log('• Monitor data in the InfluxDB UI')

  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    console.log('')
    console.log('Troubleshooting:')
    console.log('• Check your API token permissions')
    console.log('• Verify the bucket name exists: vibelux-sensors')
    console.log('• Ensure your organization ID is correct')
    process.exit(1)
  } finally {
    // InfluxDB client doesn't need explicit close
  }
}

testConnection()