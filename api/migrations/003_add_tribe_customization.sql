-- Migration 003: Ajout colonnes de personnalisation pour les tribus
-- Date: 2025-12-30
-- Description: Ajoute les colonnes banner_url, logo_url, primary_color, secondary_color

ALTER TABLE tribes
ADD COLUMN banner_url VARCHAR(500) NULL COMMENT 'URL de la bannière de la tribu' AFTER base_photo_url,
ADD COLUMN logo_url VARCHAR(500) NULL COMMENT 'URL du logo de la tribu' AFTER banner_url,
ADD COLUMN primary_color VARCHAR(7) DEFAULT '#00f0ff' COMMENT 'Couleur primaire (format hex)' AFTER logo_url,
ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#b842ff' COMMENT 'Couleur secondaire (format hex)' AFTER primary_color;
