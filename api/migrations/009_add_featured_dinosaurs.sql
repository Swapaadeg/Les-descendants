-- Migration 009: Ajouter la fonctionnalité "featured" pour les dinosaures
-- Les dinosaures "featured" sont visibles sur la page publique de la tribu
-- Les autres dinosaures restent privés à la tribu

ALTER TABLE dinosaurs
ADD COLUMN is_featured TINYINT(1) DEFAULT 0 COMMENT 'Dinosaure mis en avant sur la page tribu';

-- Index pour optimiser les requêtes
CREATE INDEX idx_dinosaurs_featured ON dinosaurs(tribe_id, is_featured);
