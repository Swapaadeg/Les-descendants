-- Migration 005: Ajout colonne font_family pour les tribus
-- Date: 2025-12-31
-- Description: Ajoute la colonne font_family pour la personnalisation typographique

ALTER TABLE tribes
ADD COLUMN font_family VARCHAR(100) DEFAULT '"Orbitron", sans-serif' COMMENT 'Police de caractères de la tribu' AFTER secondary_color;
