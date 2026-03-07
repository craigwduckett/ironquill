-- Add language_desc column to srd_species table
-- Stores the raw language description paragraph from the source data
-- (e.g. "You can speak, read, and write Common and Dwarvish...")
ALTER TABLE srd_species ADD COLUMN IF NOT EXISTS language_desc text;
