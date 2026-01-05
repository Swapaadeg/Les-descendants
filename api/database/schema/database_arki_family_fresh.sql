-- ===========================
-- ARKI'FAMILY - DATABASE SCHEMA (Fresh Install)
-- Pour nouvelle base de données vide
-- ===========================

-- Désactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================
-- TABLE: users
-- ===========================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100) DEFAULT NULL,
    reset_token VARCHAR(100) DEFAULT NULL,
    reset_token_expires TIMESTAMP NULL DEFAULT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL DEFAULT NULL,
    is_banned BOOLEAN DEFAULT FALSE,
    banned_reason TEXT DEFAULT NULL,
    banned_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_verification_token (verification_token),
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- TABLE: tribes
-- ===========================
CREATE TABLE IF NOT EXISTS tribes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_validated BOOLEAN DEFAULT FALSE,
    validated_at TIMESTAMP NULL DEFAULT NULL,
    validated_by INT DEFAULT NULL,
    dino_of_month_id INT DEFAULT NULL,
    base_photo_url VARCHAR(500) DEFAULT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_owner (owner_id),
    INDEX idx_validated (is_validated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- TABLE: tribe_members
-- ===========================
CREATE TABLE IF NOT EXISTS tribe_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tribe_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invited_by INT DEFAULT NULL,
    is_validated BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (tribe_id) REFERENCES tribes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_tribe_user (tribe_id, user_id),
    INDEX idx_tribe (tribe_id),
    INDEX idx_user (user_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- TABLE: dinosaurs
-- ===========================
CREATE TABLE IF NOT EXISTS dinosaurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tribe_id INT NOT NULL,
    species VARCHAR(100) NOT NULL,
    type_ids JSON NOT NULL,
    stats JSON NOT NULL,
    mutated_stats JSON DEFAULT NULL,
    is_mutated BOOLEAN DEFAULT FALSE,
    photo_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    FOREIGN KEY (tribe_id) REFERENCES tribes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_species_per_tribe (tribe_id, species),
    INDEX idx_tribe (tribe_id),
    INDEX idx_species (species),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- TABLE: tribe_join_requests
-- ===========================
CREATE TABLE IF NOT EXISTS tribe_join_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tribe_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT DEFAULT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL DEFAULT NULL,
    processed_by INT DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    FOREIGN KEY (tribe_id) REFERENCES tribes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_pending_request (tribe_id, user_id, status),
    INDEX idx_tribe (tribe_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- TABLE: tribe_creation_requests
-- ===========================
CREATE TABLE IF NOT EXISTS tribe_creation_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    requested_by INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL DEFAULT NULL,
    processed_by INT DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_requested_by (requested_by),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- TABLE: sessions
-- ===========================
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- TABLE: activity_logs
-- ===========================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) DEFAULT NULL,
    entity_id INT DEFAULT NULL,
    details JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Réactiver les contraintes
SET FOREIGN_KEY_CHECKS = 1;

-- ===========================
-- VIEWS UTILES
-- ===========================

-- Vue pour obtenir les stats complètes d'une tribu
CREATE OR REPLACE VIEW tribe_stats AS
SELECT
    t.id AS tribe_id,
    t.name AS tribe_name,
    t.slug,
    COUNT(DISTINCT d.id) AS total_dinos,
    COUNT(DISTINCT tm.user_id) AS total_members,
    AVG(JSON_EXTRACT(d.stats, '$.health')) AS avg_health,
    AVG(JSON_EXTRACT(d.stats, '$.stamina')) AS avg_stamina,
    AVG(JSON_EXTRACT(d.stats, '$.oxygen')) AS avg_oxygen,
    AVG(JSON_EXTRACT(d.stats, '$.food')) AS avg_food,
    AVG(JSON_EXTRACT(d.stats, '$.weight')) AS avg_weight,
    AVG(JSON_EXTRACT(d.stats, '$.melee')) AS avg_melee,
    AVG(JSON_EXTRACT(d.stats, '$.speed')) AS avg_speed,
    SUM(CASE WHEN d.is_mutated = 1 THEN 1 ELSE 0 END) AS mutated_count
FROM tribes t
LEFT JOIN dinosaurs d ON t.id = d.tribe_id
LEFT JOIN tribe_members tm ON t.id = tm.tribe_id
WHERE t.is_validated = TRUE
GROUP BY t.id, t.name, t.slug;

-- ===========================
-- TRIGGERS
-- ===========================

-- Trigger pour auto-créer le slug lors de la création d'une tribu
DELIMITER //
CREATE TRIGGER before_tribe_insert
BEFORE INSERT ON tribes
FOR EACH ROW
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.name, ' ', '-'), 'é', 'e'), 'è', 'e'));
    END IF;
END//
DELIMITER ;

-- Trigger pour logger les actions importantes
DELIMITER //
CREATE TRIGGER after_dinosaur_insert
AFTER INSERT ON dinosaurs
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (NEW.created_by, 'dino_created', 'dinosaur', NEW.id, JSON_OBJECT('species', NEW.species, 'tribe_id', NEW.tribe_id));
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER after_tribe_validated
AFTER UPDATE ON tribes
FOR EACH ROW
BEGIN
    IF OLD.is_validated = FALSE AND NEW.is_validated = TRUE THEN
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
        VALUES (NEW.validated_by, 'tribe_validated', 'tribe', NEW.id, JSON_OBJECT('tribe_name', NEW.name, 'owner_id', NEW.owner_id));
    END IF;
END//
DELIMITER ;

-- ===========================
-- FIN DU SCHÉMA
-- ===========================
