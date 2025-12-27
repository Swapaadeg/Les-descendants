-- Base de données MySQL pour Les Descendants (ARK Tracker)
-- À exécuter dans PHPMyAdmin sur o2switch

-- Créer la table des dinosaures
CREATE TABLE IF NOT EXISTS dinosaurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  species VARCHAR(255) NOT NULL,
  type_ids VARCHAR(100) NOT NULL,
  is_mutated TINYINT(1) DEFAULT 0,
  photo_url TEXT,

  -- Stats de base
  stat_health INT DEFAULT 0,
  stat_stamina INT DEFAULT 0,
  stat_oxygen INT DEFAULT 0,
  stat_food INT DEFAULT 0,
  stat_weight INT DEFAULT 0,
  stat_damage INT DEFAULT 0,
  stat_crafting INT DEFAULT 0,

  -- Stats mutées
  mutated_stat_health INT DEFAULT 0,
  mutated_stat_stamina INT DEFAULT 0,
  mutated_stat_oxygen INT DEFAULT 0,
  mutated_stat_food INT DEFAULT 0,
  mutated_stat_weight INT DEFAULT 0,
  mutated_stat_damage INT DEFAULT 0,
  mutated_stat_crafting INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Créer un index sur l'espèce pour les recherches rapides
CREATE INDEX idx_dinosaurs_species ON dinosaurs(species);
