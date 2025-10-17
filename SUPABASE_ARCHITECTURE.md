# Supabase-Only Architecture for VibeLux

## Why Supabase Instead of Redis + InfluxDB

### **Cost Comparison:**
```
Redis + InfluxDB + PostgreSQL:
- PostgreSQL: $20-50/month
- Redis: $15-30/month  
- InfluxDB: $25-60/month
- Total: $60-140/month

Supabase Only:
- Database + Realtime + Auth + Storage: $25/month
- TimescaleDB extension: FREE
- Edge Functions: $10/month
- Total: $35/month (75% savings!)
```

### **Technical Benefits:**
✅ Single database to manage
✅ Built-in realtime subscriptions (no Redis needed)
✅ TimescaleDB for time-series data (no InfluxDB needed)
✅ Automatic backups and scaling
✅ Edge Functions for background jobs
✅ Built-in auth integration
✅ Simpler deployment and maintenance

## **Implementation Plan:**

### 1. **Time-Series Data with TimescaleDB**
```sql
-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Convert sensor_readings to hypertable
SELECT create_hypertable('sensor_readings', 'created_at');

-- Add continuous aggregates for real-time analytics
CREATE MATERIALIZED VIEW sensor_hourly_avg
WITH (timescaledb.continuous) AS
SELECT sensor_id,
       time_bucket('1 hour', created_at) AS hour,
       AVG(value) as avg_value,
       MAX(value) as max_value,
       MIN(value) as min_value
FROM sensor_readings
GROUP BY sensor_id, hour;

-- Refresh policy for real-time updates
SELECT add_continuous_aggregate_policy('sensor_hourly_avg',
  start_offset => INTERVAL '1 day',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');
```

### 2. **Replace Redis with Supabase Realtime**
```typescript
// Instead of Redis pub/sub, use Supabase realtime
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Subscribe to real-time changes
const subscription = supabase
  .channel('sensor-updates')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
    (payload) => {
      // Broadcast to connected clients
      io.emit('sensor:update', payload.new)
    }
  )
  .subscribe()
```

### 3. **Background Jobs with Edge Functions**
```typescript
// supabase/functions/process-sensor-data/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Process sensor data batch
  const { sensorId, readings } = await req.json()
  
  // Insert readings
  await supabase
    .from('sensor_readings')
    .insert(readings)
  
  // Update sensor status
  await supabase
    .from('sensors')
    .update({ 
      last_reading: readings[readings.length - 1].value,
      updated_at: new Date()
    })
    .eq('id', sensorId)

  return new Response(JSON.stringify({ success: true }))
})
```

### 4. **WebSocket Scaling with Supabase**
```typescript
// No need for Redis adapter - Supabase handles scaling
export function createScalableWebSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer)
  
  // Subscribe to Supabase realtime
  const supabase = createClient(url, serviceKey)
  
  supabase
    .channel('database-changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
      // Broadcast to relevant clients
      io.to(`facility:${payload.new.facility_id}`).emit('update', payload)
    })
    .subscribe()
    
  return { io }
}
```

### 5. **Caching with PostgreSQL**
```sql
-- Use materialized views for caching
CREATE MATERIALIZED VIEW facility_dashboard_cache AS
SELECT 
  f.id,
  f.name,
  COUNT(s.id) as sensor_count,
  AVG(sr.value) as avg_sensor_value,
  MAX(sr.created_at) as last_reading
FROM facilities f
LEFT JOIN sensors s ON s.facility_id = f.id
LEFT JOIN sensor_readings sr ON sr.sensor_id = s.id
WHERE sr.created_at > NOW() - INTERVAL '1 hour'
GROUP BY f.id, f.name;

-- Refresh every 5 minutes
CREATE OR REPLACE FUNCTION refresh_dashboard_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY facility_dashboard_cache;
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron
SELECT cron.schedule('refresh-dashboard', '*/5 * * * *', 'SELECT refresh_dashboard_cache();');
```

### 6. **Migration Script**
```bash
#!/bin/bash
# migrate-to-supabase.sh

echo "Migrating to Supabase-only architecture..."

# 1. Enable TimescaleDB
psql $SUPABASE_DB_URL -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"

# 2. Convert tables to hypertables
psql $SUPABASE_DB_URL -c "SELECT create_hypertable('sensor_readings', 'created_at');"
psql $SUPABASE_DB_URL -c "SELECT create_hypertable('power_readings', 'timestamp');"

# 3. Create continuous aggregates
psql $SUPABASE_DB_URL -f supabase/migrations/continuous_aggregates.sql

# 4. Deploy edge functions
supabase functions deploy process-sensor-data
supabase functions deploy generate-reports
supabase functions deploy send-notifications

echo "Migration complete!"
```

## **Environment Variables (Simplified):**
```env
# Single Supabase setup instead of multiple services
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Remove these (no longer needed):
# REDIS_HOST=localhost
# REDIS_PORT=6379  
# INFLUXDB_URL=http://localhost:8086
# INFLUXDB_TOKEN=
```

## **Deployment Benefits:**
- **Single service** to deploy and monitor
- **Automatic scaling** handled by Supabase
- **Built-in backups** and point-in-time recovery
- **Global CDN** for edge functions
- **No infrastructure management**

## **Performance Comparison:**
```
TimescaleDB vs InfluxDB for sensor data:
- Insert performance: Similar (100k+ inserts/sec)
- Query performance: Faster for complex joins
- Storage efficiency: 90% compression
- SQL compatibility: Native PostgreSQL

Supabase Realtime vs Redis:
- Latency: <50ms globally
- Concurrent connections: 500+ per project
- Scaling: Automatic
- Cost: Included in base plan
```

This architecture is **simpler, cheaper, and more maintainable** while providing the same performance benefits.