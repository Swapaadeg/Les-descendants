-- Migration 002: Création du système de tribus
-- Date: 2025-12-30

-- =====================================================
-- Table: tribes (Tribus)
-- =====================================================
CREATE TABLE IF NOT EXISTS tribes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) NOT NULL UNIQUE,
    description TEXT,
    banner_url VARCHAR(255),
    logo_url VARCHAR(255),
    chief_id INT NOT NULL,
    max_members INT DEFAULT 10,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (chief_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_chief (chief_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: tribe_members (Membres et demandes)
-- =====================================================
CREATE TABLE IF NOT EXISTS tribe_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tribe_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    role ENUM('member', 'moderator', 'chief') DEFAULT 'member',
    joined_at TIMESTAMP NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tribe_id) REFERENCES tribes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tribe_user (tribe_id, user_id),
    INDEX idx_tribe (tribe_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Modifier la table dinosaurs pour ajouter tribe_id
-- =====================================================
ALTER TABLE dinosaurs
ADD COLUMN tribe_id INT NULL AFTER id,
ADD FOREIGN KEY (tribe_id) REFERENCES tribes(id) ON DELETE SET NULL,
ADD INDEX idx_tribe (tribe_id);

-- =====================================================
-- Modifier la table users pour ajouter current_tribe_id
-- =====================================================
ALTER TABLE users
ADD COLUMN current_tribe_id INT NULL AFTER email_verified,
ADD FOREIGN KEY (current_tribe_id) REFERENCES tribes(id) ON DELETE SET NULL,
ADD INDEX idx_current_tribe (current_tribe_id);
