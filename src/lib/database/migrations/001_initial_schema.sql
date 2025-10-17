-- VibeLux CAD Database - Initial Schema Migration
-- Professional-grade database schema for CAD projects and collaboration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'engineer', 'designer', 'viewer', 'collaborator');
CREATE TYPE project_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE analysis_type AS ENUM ('linear', 'nonlinear', 'modal', 'buckling', 'dynamic');
CREATE TYPE export_format AS ENUM ('dwg', 'dxf', 'step', 'iges', 'ifc', 'obj', 'stl', 'gltf', 'pdf', 'svg');
CREATE TYPE backup_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE activity_type AS ENUM ('create', 'update', 'delete', 'export', 'import', 'share', 'collaborate');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    company VARCHAR(255),
    role user_role NOT NULL DEFAULT 'designer',
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project collaborators
CREATE TABLE project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP,
    accepted_at TIMESTAMP,
    last_active TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Models table
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    parameters JSONB NOT NULL,
    geometry JSONB DEFAULT '{}',
    layers JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Components table
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    geometry JSONB DEFAULT '{}',
    material_id VARCHAR(255),
    material JSONB DEFAULT '{}',
    properties JSONB DEFAULT '{}',
    connections JSONB DEFAULT '[]',
    assembly JSONB DEFAULT '{}',
    layer VARCHAR(100),
    sub_layer VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drawings table
CREATE TABLE drawings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    scale DECIMAL(10,4) DEFAULT 1.0,
    units VARCHAR(20) DEFAULT 'ft',
    paper_size VARCHAR(20) DEFAULT 'ANSI_D',
    elements JSONB DEFAULT '[]',
    dimensions JSONB DEFAULT '[]',
    notes JSONB DEFAULT '[]',
    export_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Structural analyses table
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    analysis_type analysis_type NOT NULL,
    load_conditions JSONB DEFAULT '[]',
    members JSONB DEFAULT '[]',
    results JSONB DEFAULT '{}',
    code_compliance JSONB DEFAULT '{}',
    optimization JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bill of Materials table
CREATE TABLE boms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    greenhouse_id UUID REFERENCES models(id) ON DELETE CASCADE,
    summary JSONB DEFAULT '{}',
    categories JSONB DEFAULT '[]',
    line_items JSONB DEFAULT '[]',
    assemblies JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project versions table
CREATE TABLE project_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    major_version INTEGER NOT NULL,
    minor_version INTEGER NOT NULL,
    patch_version INTEGER NOT NULL,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    changes JSONB DEFAULT '[]',
    snapshot JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, version_number)
);

-- Project branches table
CREATE TABLE project_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_branch VARCHAR(100),
    current_version UUID REFERENCES project_versions(id),
    is_default BOOLEAN DEFAULT FALSE,
    is_protected BOOLEAN DEFAULT FALSE,
    permissions JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    last_commit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, name)
);

-- Materials library table
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    properties JSONB DEFAULT '{}',
    specifications JSONB DEFAULT '{}',
    availability JSONB DEFAULT '{}',
    suppliers JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Export history table
CREATE TABLE export_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    format export_format NOT NULL,
    type VARCHAR(50) NOT NULL,
    options JSONB DEFAULT '{}',
    result JSONB DEFAULT '{}',
    file_size BIGINT,
    duration INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity logging table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    action activity_type NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration table
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backup management table
CREATE TABLE backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP NOT NULL,
    path TEXT NOT NULL,
    size BIGINT NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    storage_type VARCHAR(50) NOT NULL,
    status backup_status DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance metrics table
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50),
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File storage table
CREATE TABLE file_storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    path TEXT NOT NULL,
    bucket VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(64) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{}',
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks table
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company ON users(company);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_created_at ON projects(created_at);

CREATE INDEX idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX idx_project_collaborators_role ON project_collaborators(role);

CREATE INDEX idx_models_project_id ON models(project_id);
CREATE INDEX idx_models_name ON models(name);

CREATE INDEX idx_components_model_id ON components(model_id);
CREATE INDEX idx_components_category ON components(category);
CREATE INDEX idx_components_material_id ON components(material_id);

CREATE INDEX idx_drawings_project_id ON drawings(project_id);
CREATE INDEX idx_drawings_type ON drawings(type);
CREATE INDEX idx_drawings_name ON drawings(name);

CREATE INDEX idx_analyses_project_id ON analyses(project_id);
CREATE INDEX idx_analyses_model_id ON analyses(model_id);
CREATE INDEX idx_analyses_type ON analyses(analysis_type);

CREATE INDEX idx_boms_project_id ON boms(project_id);
CREATE INDEX idx_boms_greenhouse_id ON boms(greenhouse_id);

CREATE INDEX idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX idx_project_versions_version_number ON project_versions(version_number);
CREATE INDEX idx_project_versions_label ON project_versions(label);

CREATE INDEX idx_project_branches_project_id ON project_branches(project_id);
CREATE INDEX idx_project_branches_name ON project_branches(name);
CREATE INDEX idx_project_branches_created_by ON project_branches(created_by);

CREATE INDEX idx_materials_name ON materials(name);
CREATE INDEX idx_materials_manufacturer ON materials(manufacturer);
CREATE INDEX idx_materials_category ON materials(category);

CREATE INDEX idx_export_history_project_id ON export_history(project_id);
CREATE INDEX idx_export_history_user_id ON export_history(user_id);
CREATE INDEX idx_export_history_format ON export_history(format);
CREATE INDEX idx_export_history_created_at ON export_history(created_at);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_project_id ON activities(project_id);
CREATE INDEX idx_activities_action ON activities(action);
CREATE INDEX idx_activities_created_at ON activities(created_at);

CREATE INDEX idx_system_config_key ON system_config(key);

CREATE INDEX idx_backups_timestamp ON backups(timestamp);
CREATE INDEX idx_backups_status ON backups(status);

CREATE INDEX idx_metrics_name ON metrics(name);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);

CREATE INDEX idx_file_storage_project_id ON file_storage(project_id);
CREATE INDEX idx_file_storage_filename ON file_storage(filename);
CREATE INDEX idx_file_storage_uploaded_by ON file_storage(uploaded_by);
CREATE INDEX idx_file_storage_created_at ON file_storage(created_at);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

CREATE INDEX idx_webhooks_project_id ON webhooks(project_id);
CREATE INDEX idx_webhooks_is_active ON webhooks(is_active);

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_projects_metadata_gin ON projects USING gin(metadata);
CREATE INDEX idx_projects_settings_gin ON projects USING gin(settings);
CREATE INDEX idx_models_parameters_gin ON models USING gin(parameters);
CREATE INDEX idx_components_properties_gin ON components USING gin(properties);
CREATE INDEX idx_materials_properties_gin ON materials USING gin(properties);

-- Create full-text search indexes
CREATE INDEX idx_projects_name_trgm ON projects USING gin(name gin_trgm_ops);
CREATE INDEX idx_models_name_trgm ON models USING gin(name gin_trgm_ops);
CREATE INDEX idx_materials_name_trgm ON materials USING gin(name gin_trgm_ops);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_modified_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_collaborators_updated_at BEFORE UPDATE ON project_collaborators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drawings_updated_at BEFORE UPDATE ON drawings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boms_updated_at BEFORE UPDATE ON boms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id, old_values, ip_address, user_agent
        ) VALUES (
            current_setting('app.current_user_id', true)::uuid,
            'delete',
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD),
            inet_client_addr(),
            current_setting('app.user_agent', true)
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent
        ) VALUES (
            current_setting('app.current_user_id', true)::uuid,
            'update',
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW),
            inet_client_addr(),
            current_setting('app.user_agent', true)
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id, new_values, ip_address, user_agent
        ) VALUES (
            current_setting('app.current_user_id', true)::uuid,
            'insert',
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(NEW),
            inet_client_addr(),
            current_setting('app.user_agent', true)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for critical tables
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_models AFTER INSERT OR UPDATE OR DELETE ON models FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_components AFTER INSERT OR UPDATE OR DELETE ON components FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_analyses AFTER INSERT OR UPDATE OR DELETE ON analyses FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Insert default system configuration
INSERT INTO system_config (key, value, description, is_public) VALUES
('app.name', '"VibeLux CAD System"', 'Application name', true),
('app.version', '"1.0.0"', 'Application version', true),
('database.version', '"1.0.0"', 'Database schema version', false),
('backup.retention_days', '30', 'Backup retention period in days', false),
('export.max_file_size', '104857600', 'Maximum export file size in bytes (100MB)', false),
('collaboration.max_users_per_project', '50', 'Maximum collaborators per project', false),
('storage.max_project_size', '1073741824', 'Maximum project size in bytes (1GB)', false);

-- Create default admin user (password should be changed immediately)
INSERT INTO users (id, email, name, role, is_active) VALUES
(uuid_generate_v4(), 'admin@vibelux.com', 'System Administrator', 'admin', true);

-- Create default material categories
INSERT INTO materials (name, category, properties, specifications) VALUES
('Galvanized Steel Tube 4x4x0.125', 'metal', 
 '{"structural": {"elasticModulus": 29000000, "yieldStrength": 50000, "density": 490}}',
 '{"dimensions": {"width": 4, "height": 4, "thickness": 0.125}}'),
('Aluminum Tube 4x4x0.125', 'metal',
 '{"structural": {"elasticModulus": 10000000, "yieldStrength": 35000, "density": 168}}',
 '{"dimensions": {"width": 4, "height": 4, "thickness": 0.125}}'),
('Polycarbonate Sheet 8mm', 'plastic',
 '{"thermal": {"uValue": 0.7, "lightTransmission": 0.85}}',
 '{"dimensions": {"thickness": 8}, "finish": "Clear"}'),
('Tempered Glass 6mm', 'glass',
 '{"thermal": {"uValue": 1.1, "lightTransmission": 0.91}}',
 '{"dimensions": {"thickness": 6}, "finish": "Clear"}');

COMMIT;