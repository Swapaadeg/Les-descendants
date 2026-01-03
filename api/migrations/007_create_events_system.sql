-- ===========================
-- MIGRATION 007: Système d'événements
-- Description: Créé les tables pour gérer les événements du serveur Ark avec images multiples
-- Date: 2025-01-31
-- ===========================

-- =====================================================
-- Table: events
-- Stocke les informations principales des événements
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(191) NOT NULL,
    description TEXT DEFAULT NULL,
    event_date DATE NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_at (created_at),
    INDEX idx_event_date (event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: event_images
-- Stocke les images associées aux événements (relation 1-N)
-- =====================================================
CREATE TABLE IF NOT EXISTS event_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
