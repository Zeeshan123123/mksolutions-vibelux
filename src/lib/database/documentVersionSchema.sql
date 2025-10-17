-- Document Version Control Database Schema
-- Handles versioning, check-in/checkout, and collaborative editing for SOP documentation

-- Document Versions Table
CREATE TABLE document_versions (
    id VARCHAR(255) PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    author_id VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    change_description TEXT,
    change_type ENUM('major', 'minor', 'patch') NOT NULL,
    status ENUM('draft', 'pending_review', 'approved', 'published', 'archived') DEFAULT 'draft',
    parent_version_id VARCHAR(255),
    approved_by VARCHAR(255),
    approved_at TIMESTAMP NULL,
    tags JSON,
    metadata JSON,
    
    INDEX idx_document_id (document_id),
    INDEX idx_version (version),
    INDEX idx_author (author_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (parent_version_id) REFERENCES document_versions(id) ON DELETE SET NULL
);

-- Document Checkouts Table
CREATE TABLE document_checkouts (
    id VARCHAR(255) PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL,
    version_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    checked_out_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    lock_type ENUM('exclusive', 'shared') NOT NULL,
    purpose ENUM('edit', 'review', 'translate') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    working_content TEXT,
    last_saved_at TIMESTAMP,
    
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_active (is_active),
    INDEX idx_expires_at (expires_at),
    
    FOREIGN KEY (version_id) REFERENCES document_versions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_exclusive_checkout (document_id, is_active, lock_type)
);

-- Change Requests Table
CREATE TABLE change_requests (
    id VARCHAR(255) PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL,
    requester_id VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    proposed_changes TEXT NOT NULL,
    current_version_id VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'merged') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    reviewers JSON NOT NULL,
    approvals JSON DEFAULT '[]',
    rejections JSON DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    merged_at TIMESTAMP NULL,
    merged_by VARCHAR(255),
    
    INDEX idx_document_id (document_id),
    INDEX idx_requester (requester_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (current_version_id) REFERENCES document_versions(id) ON DELETE CASCADE
);

-- Document Activity Log Table
CREATE TABLE document_activity_log (
    id VARCHAR(255) PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    activity_type ENUM('CHECKOUT', 'CHECKIN', 'CHECKOUT_RELEASED', 'VERSION_CREATED', 'CHANGE_REQUEST', 'APPROVAL', 'REJECTION') NOT NULL,
    details JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_timestamp (timestamp)
);

-- Document Metadata Table
CREATE TABLE document_metadata (
    document_id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags JSON DEFAULT '[]',
    access_level ENUM('public', 'authenticated', 'premium', 'enterprise', 'internal') DEFAULT 'authenticated',
    required_tier JSON DEFAULT '[]',
    owner_id VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_version VARCHAR(50) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT TRUE,
    retention_days INT DEFAULT 2555, -- 7 years
    
    INDEX idx_owner (owner_id),
    INDEX idx_category (category),
    INDEX idx_access_level (access_level),
    INDEX idx_created_at (created_at)
);

-- Document Access History (Customer Privacy Protected)
CREATE TABLE document_access_history (
    id VARCHAR(255) PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    access_type ENUM('view', 'download', 'print', 'copy') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_level VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    INDEX idx_document_user (document_id, user_id),
    INDEX idx_user_timestamp (user_id, timestamp),
    INDEX idx_access_type (access_type)
);

-- Scheduled Cleanup Events
CREATE EVENT IF NOT EXISTS cleanup_expired_checkouts
ON SCHEDULE EVERY 1 HOUR
DO
    UPDATE document_checkouts 
    SET is_active = FALSE 
    WHERE expires_at < NOW() AND is_active = TRUE;

CREATE EVENT IF NOT EXISTS cleanup_old_access_history
ON SCHEDULE EVERY 1 DAY
DO
    DELETE FROM document_access_history 
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL 2555 DAY);

-- Triggers for automatic updates
DELIMITER //

CREATE TRIGGER update_document_version_timestamp
    BEFORE UPDATE ON document_versions
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_change_request_timestamp
    BEFORE UPDATE ON change_requests
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_document_metadata_timestamp
    BEFORE UPDATE ON document_metadata
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
    -- Update last_version from the latest version
    SELECT version INTO NEW.last_version 
    FROM document_versions 
    WHERE document_id = NEW.document_id 
    ORDER BY created_at DESC 
    LIMIT 1;
END//

DELIMITER ;

-- Initial Data for Testing
INSERT INTO document_metadata (
    document_id, 
    title, 
    description, 
    category, 
    access_level, 
    owner_id, 
    owner_email
) VALUES (
    'sop_cultivation_001',
    'LED Growth Protocol - Standard Operating Procedure', 
    'Complete guide for LED-based plant cultivation procedures',
    'cultivation',
    'premium',
    'admin_user_001',
    'admin@vibelux.ai'
);

INSERT INTO document_versions (
    id,
    document_id,
    version,
    title,
    content,
    checksum,
    author_id,
    author_email,
    change_description,
    change_type,
    status,
    tags,
    metadata
) VALUES (
    'version_001_sop_cultivation',
    'sop_cultivation_001',
    '1.0.0',
    'LED Growth Protocol - Standard Operating Procedure',
    '# LED Growth Protocol\n\n## Overview\nThis document outlines the standard operating procedures for LED-based plant cultivation...\n\n## Safety Requirements\n1. Always wear protective equipment\n2. Ensure proper ventilation\n3. Follow electrical safety protocols\n\n## Setup Procedures\n...',
    'a1b2c3d4e5f6',
    'admin_user_001',
    'admin@vibelux.ai',
    'Initial SOP document creation',
    'major',
    'published',
    '["sop", "cultivation", "led", "safety"]',
    '{"created_by": "system", "initial_version": true}'
);