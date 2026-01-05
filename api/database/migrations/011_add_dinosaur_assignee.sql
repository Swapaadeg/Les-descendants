-- Migration: Ajouter l'assignation de membre sur un dinosaure
-- Ajoute une FK vers users pour suivre quel membre travaille sur le dino

ALTER TABLE dinosaurs
  ADD COLUMN assigned_user_id INT NULL AFTER created_by,
  ADD INDEX idx_assigned_user (assigned_user_id),
  ADD CONSTRAINT fk_dinosaurs_assigned_user
    FOREIGN KEY (assigned_user_id) REFERENCES users(id)
    ON DELETE SET NULL;
