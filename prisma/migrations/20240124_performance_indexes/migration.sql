-- Performance indexes for VibeLux database
-- Run this migration to improve query performance

-- Sensor readings composite index for time-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sensor_readings_composite 
ON sensor_readings(sensor_id, created_at DESC);

-- Power readings time-based index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_power_readings_time 
ON power_readings(timestamp DESC, facility_id);

-- Experiments status index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_experiments_status 
ON experiments(status, updated_at DESC);

-- API logs user lookup index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_logs_user 
ON api_logs(user_id, created_at DESC);

-- Notifications user lookup with read status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user 
ON notifications(user_id, read_at, created_at DESC);

-- Fixtures room lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fixtures_room 
ON fixtures(room_id, is_active);

-- Projects user and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_user_status 
ON projects(user_id, status, updated_at DESC);

-- Sensor data aggregation helper
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sensor_readings_aggregation 
ON sensor_readings(sensor_id, created_at DESC) 
INCLUDE (value, unit);

-- Compliance checks facility lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_facility 
ON compliance_checks(facility_id, created_at DESC, status);

-- Marketplace equipment search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_equipment_search 
ON equipment(category, condition, is_available, created_at DESC);

-- Service requests status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_requests 
ON service_requests(status, created_at DESC);

-- Energy optimization lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_energy_settings 
ON energy_optimization_settings(facility_id, is_active);

-- Batch operations facility lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_batches_facility 
ON batches(facility_id, status, created_at DESC);

-- Inventory tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_sku 
ON inventory(sku, facility_id, quantity);

-- User sessions for auth
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_clerk 
ON users(clerk_id) WHERE clerk_id IS NOT NULL;

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_experiments 
ON experiments(facility_id, created_at DESC) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_unread_notifications 
ON notifications(user_id, created_at DESC) 
WHERE read_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pending_service_bids 
ON service_bids(service_request_id, created_at DESC) 
WHERE status = 'pending';

-- Text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sop_search 
ON sop_documents USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_search 
ON recipes USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- JSON indexes for metadata queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sensor_metadata 
ON sensors USING gin(metadata);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fixture_specs 
ON fixtures USING gin(specifications);

-- Analyze tables to update statistics
ANALYZE sensor_readings;
ANALYZE power_readings;
ANALYZE notifications;
ANALYZE experiments;
ANALYZE fixtures;
ANALYZE equipment;
ANALYZE service_requests;