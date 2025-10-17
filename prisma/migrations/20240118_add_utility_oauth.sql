-- OAuth Sessions Table
CREATE TABLE IF NOT EXISTS oauth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id VARCHAR(255) NOT NULL,
  provider_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  state VARCHAR(255) UNIQUE NOT NULL,
  code_verifier VARCHAR(255),
  redirect_uri TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  INDEX idx_oauth_sessions_state (state),
  INDEX idx_oauth_sessions_facility (facility_id),
  INDEX idx_oauth_sessions_status (status)
);

-- Utility OAuth Tokens Table
CREATE TABLE IF NOT EXISTS utility_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id VARCHAR(255) NOT NULL,
  provider_id VARCHAR(100) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_facility_provider (facility_id, provider_id),
  INDEX idx_tokens_facility (facility_id),
  INDEX idx_tokens_expires (expires_at)
);

-- Utility Account Connections Table
CREATE TABLE IF NOT EXISTS utility_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id VARCHAR(255) NOT NULL,
  provider_id VARCHAR(100) NOT NULL,
  account_number VARCHAR(255),
  meter_numbers TEXT[], -- Array of meter numbers
  service_address TEXT,
  customer_name VARCHAR(255),
  connection_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  connection_method VARCHAR(50) NOT NULL, -- 'oauth', 'api_key', 'manual'
  last_sync_date TIMESTAMP WITH TIME ZONE,
  sync_frequency_hours INTEGER DEFAULT 24,
  sync_status VARCHAR(50),
  sync_error TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_facility_utility (facility_id, provider_id, account_number),
  INDEX idx_connections_facility (facility_id),
  INDEX idx_connections_status (connection_status),
  INDEX idx_connections_sync (last_sync_date)
);

-- Utility Bills Table
CREATE TABLE IF NOT EXISTS utility_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES utility_connections(id),
  facility_id VARCHAR(255) NOT NULL,
  provider_id VARCHAR(100) NOT NULL,
  bill_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  due_date DATE,
  statement_date DATE,
  account_number VARCHAR(255),
  meter_number VARCHAR(255),
  service_address TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  usage_amount DECIMAL(12, 3),
  usage_unit VARCHAR(20),
  demand_amount DECIMAL(10, 3),
  demand_unit VARCHAR(20),
  energy_charges DECIMAL(10, 2),
  demand_charges DECIMAL(10, 2),
  delivery_charges DECIMAL(10, 2),
  other_charges DECIMAL(10, 2),
  taxes DECIMAL(10, 2),
  credits DECIMAL(10, 2),
  rate_schedule VARCHAR(100),
  billing_days INTEGER,
  pdf_url TEXT,
  raw_data JSONB,
  verification_status VARCHAR(50) DEFAULT 'unverified',
  verified_by VARCHAR(255),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_bill (connection_id, bill_date, account_number),
  INDEX idx_bills_facility (facility_id),
  INDEX idx_bills_dates (bill_date, start_date, end_date),
  INDEX idx_bills_verification (verification_status)
);

-- Utility Interval Data Table (for high-volume time-series data)
CREATE TABLE IF NOT EXISTS utility_intervals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES utility_connections(id),
  facility_id VARCHAR(255) NOT NULL,
  meter_number VARCHAR(255),
  interval_start TIMESTAMP WITH TIME ZONE NOT NULL,
  interval_end TIMESTAMP WITH TIME ZONE NOT NULL,
  interval_seconds INTEGER NOT NULL,
  usage_value DECIMAL(10, 3) NOT NULL,
  usage_unit VARCHAR(20) NOT NULL,
  demand_value DECIMAL(10, 3),
  demand_unit VARCHAR(20),
  power_factor DECIMAL(4, 3),
  voltage DECIMAL(6, 2),
  quality VARCHAR(20), -- 'actual', 'estimated', 'validated'
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_intervals_facility_time (facility_id, interval_start),
  INDEX idx_intervals_meter_time (meter_number, interval_start),
  INDEX idx_intervals_connection (connection_id)
) PARTITION BY RANGE (interval_start);

-- Create monthly partitions for interval data
CREATE TABLE utility_intervals_2024_01 PARTITION OF utility_intervals
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE utility_intervals_2024_02 PARTITION OF utility_intervals
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Add more partitions as needed...

-- Utility Sync Jobs Table
CREATE TABLE IF NOT EXISTS utility_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES utility_connections(id),
  job_type VARCHAR(50) NOT NULL, -- 'usage', 'billing', 'full'
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_sync_jobs_connection (connection_id),
  INDEX idx_sync_jobs_status (status),
  INDEX idx_sync_jobs_created (created_at)
);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_oauth_sessions_updated_at BEFORE UPDATE
  ON oauth_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utility_oauth_tokens_updated_at BEFORE UPDATE
  ON utility_oauth_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utility_connections_updated_at BEFORE UPDATE
  ON utility_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utility_bills_updated_at BEFORE UPDATE
  ON utility_bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();