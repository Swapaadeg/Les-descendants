-- ===========================
-- MIGRATION 010: Dinosaur Task Management System
-- Description: Auto-create tasks when dinosaur stats are modified
-- Date: 2026-01-04
-- ===========================

-- =====================================================
-- Table: dino_tasks
-- Stores collaborative tasks for dinosaur stat modifications
-- =====================================================
CREATE TABLE IF NOT EXISTS dino_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tribe_id INT NOT NULL,
    dino_id INT NOT NULL,
    created_by INT NOT NULL COMMENT 'Utilisateur qui a modifié la stat',
    stat_name VARCHAR(50) NOT NULL COMMENT 'Nom de la stat (health, stamina, etc)',
    stat_type ENUM('base', 'mutated') NOT NULL DEFAULT 'base',
    old_value INT DEFAULT NULL,
    new_value INT DEFAULT NULL,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    completed_by INT DEFAULT NULL,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (tribe_id) REFERENCES tribes(id) ON DELETE CASCADE,
    FOREIGN KEY (dino_id) REFERENCES dinosaurs(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_tribe_status (tribe_id, status),
    INDEX idx_dino (dino_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
