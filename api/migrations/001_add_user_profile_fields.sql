-- ===========================
-- MIGRATION: Ajout des champs de profil utilisateur
-- Date: 2025-12-29
-- ===========================

-- Ajouter les champs de profil à la table users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS nom VARCHAR(100) DEFAULT NULL AFTER username,
ADD COLUMN IF NOT EXISTS prenom VARCHAR(100) DEFAULT NULL AFTER nom,
ADD COLUMN IF NOT EXISTS photo_profil VARCHAR(500) DEFAULT NULL AFTER prenom,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL DEFAULT NULL AFTER email_verified;

-- Ajouter un index sur email_verified_at pour les requêtes de vérification
ALTER TABLE users
ADD INDEX IF NOT EXISTS idx_email_verified_at (email_verified_at);

-- ===========================
-- FIN DE LA MIGRATION
-- ===========================
