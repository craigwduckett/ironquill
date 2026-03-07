-- Add missing foreign key constraints:
-- 1. characters.background_id → srd_backgrounds.id
-- 2. character_spells.spell_id → srd_spells.id

ALTER TABLE "characters"
  ADD CONSTRAINT "characters_background_id_srd_backgrounds_id_fk"
  FOREIGN KEY ("background_id") REFERENCES "public"."srd_backgrounds"("id")
  ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "character_spells"
  ADD CONSTRAINT "character_spells_spell_id_srd_spells_id_fk"
  FOREIGN KEY ("spell_id") REFERENCES "public"."srd_spells"("id")
  ON DELETE no action ON UPDATE no action;
