-- Migration 014: Add is_validated column to tribe_members
-- This column is used to track whether a join request has been validated by the owner

ALTER TABLE tribe_members
ADD COLUMN is_validated TINYINT(1) DEFAULT 0 AFTER role;

-- Set existing members as validated (they're already in the tribe)
UPDATE tribe_members SET is_validated = 1 WHERE joined_at IS NOT NULL;
