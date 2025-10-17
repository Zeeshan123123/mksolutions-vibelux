-- Create energy integrations table
CREATE TABLE IF NOT EXISTS energy_integrations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    facility_id TEXT NOT NULL UNIQUE,
    integration_type TEXT NOT NULL CHECK (integration_type IN ('modbus', 'mqtt', 'api', 'csv')),
    connection_details JSONB NOT NULL,
    polling_interval INTEGER DEFAULT 60000,
    active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create load shedding schedules table
CREATE TABLE IF NOT EXISTS load_shedding_schedules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    facility_id TEXT NOT NULL,
    zone_id TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    target_reduction_kw DOUBLE PRECISION NOT NULL,
    priority INTEGER NOT NULL CHECK (priority IN (1, 2, 3)),
    reason TEXT NOT NULL CHECK (reason IN ('peak_demand', 'grid_event', 'cost_optimization', 'manual')),
    actual_reduction_kw DOUBLE PRECISION,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_energy_integrations_facility ON energy_integrations(facility_id);
CREATE INDEX idx_energy_integrations_active ON energy_integrations(active);

CREATE INDEX idx_load_shedding_facility ON load_shedding_schedules(facility_id);
CREATE INDEX idx_load_shedding_zone ON load_shedding_schedules(zone_id);
CREATE INDEX idx_load_shedding_time ON load_shedding_schedules(start_time, end_time);
CREATE INDEX idx_load_shedding_status ON load_shedding_schedules(status);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_energy_integrations_updated_at BEFORE UPDATE
    ON energy_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();