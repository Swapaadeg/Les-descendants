-- Migration 015: Fix activity_logs table structure
-- Adds the 'level' column that is missing in production

-- Si la table existe déjà, ajouter simplement la colonne level
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS level VARCHAR(20) DEFAULT 'INFO' AFTER action;

-- Si la table n'existe pas, la créer complète
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    level VARCHAR(20) DEFAULT 'INFO',
    entity_type VARCHAR(50) DEFAULT NULL,
    entity_id INT DEFAULT NULL,
    details JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_action (action),
    INDEX idx_level (level),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
