-- Enable pg_trgm for GIN trigram indexes on SRD name columns.
-- These enable ilike '%foo%' (leading wildcard) to use an index,
-- which is required by the SRD search endpoints.

CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS srd_monsters_name_trgm_idx
  ON srd_monsters USING gin (name gin_trgm_ops);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS srd_spells_name_trgm_idx
  ON srd_spells USING gin (name gin_trgm_ops);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS srd_feats_name_trgm_idx
  ON srd_feats USING gin (name gin_trgm_ops);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS srd_rules_topic_trgm_idx
  ON srd_rules USING gin (topic gin_trgm_ops);
