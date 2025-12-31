-- Migration 006: Ajout colonne title_font_family pour les tribus
-- Date: 2025-12-31
-- Description: Ajoute la colonne title_font_family pour différencier police des titres et du texte

ALTER TABLE tribes
ADD COLUMN title_font_family VARCHAR(100) DEFAULT '"Orbitron", sans-serif' COMMENT 'Police de caractères pour les titres' AFTER font_family;
