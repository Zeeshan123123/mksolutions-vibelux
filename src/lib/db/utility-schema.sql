-- Utility connection tracking
CREATE TABLE IF NOT EXISTS utility_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  user_id TEXT NOT NULL,
  provider_id TEXT NOT NULL, -- 'utilityapi', 'pge', 'sce', etc.
  authorization_code TEXT,
  utilityapi_uid TEXT UNIQUE,
  utility_name TEXT,
  utility_account_id TEXT,
  connection_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Utility meters
CREATE TABLE IF NOT EXISTS utility_meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES utility_connections(id),
  meter_uid TEXT UNIQUE,
  meter_number TEXT,
  meter_type TEXT, -- 'electric', 'gas', 'water'
  service_class TEXT,
  service_address JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Utility bills
CREATE TABLE IF NOT EXISTS utility_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES utility_connections(id),
  meter_id UUID REFERENCES utility_meters(id),
  bill_uid TEXT UNIQUE,
  bill_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  usage_amount NUMERIC NOT NULL,
  usage_unit TEXT NOT NULL,
  demand_amount NUMERIC,
  demand_unit TEXT,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  rate_schedule TEXT,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Interval usage data (hourly/15-min)
CREATE TABLE IF NOT EXISTS utility_intervals (
  meter_id UUID NOT NULL REFERENCES utility_meters(id),
  timestamp TIMESTAMP NOT NULL,
  usage NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (meter_id, timestamp)
);

-- Indexes for performance
CREATE INDEX idx_utility_connections_facility ON utility_connections(facility_id);
CREATE INDEX idx_utility_connections_status ON utility_connections(connection_status);
CREATE INDEX idx_utility_meters_connection ON utility_meters(connection_id);
CREATE INDEX idx_utility_bills_connection ON utility_bills(connection_id);
CREATE INDEX idx_utility_bills_dates ON utility_bills(bill_date, start_date, end_date);
CREATE INDEX idx_utility_intervals_meter_time ON utility_intervals(meter_id, timestamp);