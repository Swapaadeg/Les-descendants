-- Migration: Ajouter les colonnes individuelles de stats
-- Les stats seront stockées dans des colonnes séparées au lieu de JSON

ALTER TABLE dinosaurs
-- Stats de base
ADD COLUMN stat_health INT DEFAULT 0 AFTER type_ids,
ADD COLUMN stat_stamina INT DEFAULT 0 AFTER stat_health,
ADD COLUMN stat_oxygen INT DEFAULT 0 AFTER stat_stamina,
ADD COLUMN stat_food INT DEFAULT 0 AFTER stat_oxygen,
ADD COLUMN stat_weight INT DEFAULT 0 AFTER stat_food,
ADD COLUMN stat_damage INT DEFAULT 0 AFTER stat_weight,
ADD COLUMN stat_crafting INT DEFAULT 0 AFTER stat_damage,

-- Stats mutées
ADD COLUMN mutated_stat_health INT DEFAULT 0 AFTER stat_crafting,
ADD COLUMN mutated_stat_stamina INT DEFAULT 0 AFTER mutated_stat_health,
ADD COLUMN mutated_stat_oxygen INT DEFAULT 0 AFTER mutated_stat_stamina,
ADD COLUMN mutated_stat_food INT DEFAULT 0 AFTER mutated_stat_oxygen,
ADD COLUMN mutated_stat_weight INT DEFAULT 0 AFTER mutated_stat_food,
ADD COLUMN mutated_stat_damage INT DEFAULT 0 AFTER mutated_stat_weight,
ADD COLUMN mutated_stat_crafting INT DEFAULT 0 AFTER mutated_stat_damage;
