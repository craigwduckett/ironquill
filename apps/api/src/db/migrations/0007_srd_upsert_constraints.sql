-- Add unique constraints on (name, source_edition) to all SRD tables.
-- This enables idempotent upserts in the seed script — rows are identified
-- by their logical key (name + edition) rather than the UUID PK, so the
-- seed can safely run against a live database without deleting user data.

ALTER TABLE srd_species
  ADD CONSTRAINT srd_species_name_edition_uq UNIQUE (name, source_edition);

ALTER TABLE srd_classes
  ADD CONSTRAINT srd_classes_name_edition_uq UNIQUE (name, source_edition);

ALTER TABLE srd_backgrounds
  ADD CONSTRAINT srd_backgrounds_name_edition_uq UNIQUE (name, source_edition);

ALTER TABLE srd_spells
  ADD CONSTRAINT srd_spells_name_edition_uq UNIQUE (name, source_edition);

ALTER TABLE srd_monsters
  ADD CONSTRAINT srd_monsters_name_edition_uq UNIQUE (name, source_edition);

ALTER TABLE srd_items
  ADD CONSTRAINT srd_items_name_edition_uq UNIQUE (name, source_edition);

ALTER TABLE srd_conditions
  ADD CONSTRAINT srd_conditions_name_edition_uq UNIQUE (name, source_edition);

-- Rules use topic as the name equivalent
ALTER TABLE srd_rules
  ADD CONSTRAINT srd_rules_topic_edition_uq UNIQUE (topic, source_edition);
