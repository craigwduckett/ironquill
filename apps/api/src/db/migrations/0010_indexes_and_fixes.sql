ALTER TABLE "srd_feats" DROP CONSTRAINT "srd_feats_name_edition_uq";--> statement-breakpoint
ALTER TABLE "characters" DROP CONSTRAINT "characters_preset_source_id_character_presets_id_fk";
--> statement-breakpoint
ALTER TABLE "srd_conditions" ALTER COLUMN "mechanical_effects" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "srd_backgrounds" ALTER COLUMN "skill_proficiencies" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "srd_backgrounds" ALTER COLUMN "tool_proficiencies" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "srd_backgrounds" ALTER COLUMN "ability_score_options" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "srd_backgrounds" ALTER COLUMN "origin_feat" SET DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "srd_rules" ALTER COLUMN "keywords" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "skill_proficiencies" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "session_combat" ALTER COLUMN "is_active" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "session_combat" ALTER COLUMN "is_active" SET DATA TYPE boolean USING is_active::boolean;--> statement-breakpoint
ALTER TABLE "session_combat" ALTER COLUMN "is_active" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "srd_spells" ALTER COLUMN "classes" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "srd_species" ALTER COLUMN "languages" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "srd_species" ALTER COLUMN "size_options" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "srd_classes" ALTER COLUMN "primary_abilities" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "srd_classes" ALTER COLUMN "saving_throws" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "srd_classes" ALTER COLUMN "armor_proficiencies" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "srd_classes" ALTER COLUMN "weapon_proficiencies" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "srd_classes" ALTER COLUMN "weapon_masteries" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "srd_feats" ALTER COLUMN "prerequisites" SET DEFAULT 'null'::jsonb;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "characters_user_id_idx" ON "characters" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "character_inventory_character_id_idx" ON "character_inventory" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "character_spells_character_id_idx" ON "character_spells" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_discord_id_idx" ON "users" USING btree ("discord_id") WHERE discord_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "adventure_players_user_id_idx" ON "adventure_players" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "adventure_players_character_id_idx" ON "adventure_players" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scene_npcs_scene_id_idx" ON "scene_npcs" USING btree ("scene_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_adventure_id_idx" ON "sessions" USING btree ("adventure_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_npc_hp_session_id_idx" ON "session_npc_hp" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_conditions_session_id_idx" ON "session_conditions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "roll_log_session_id_idx" ON "roll_log" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "roll_log_character_id_idx" ON "roll_log" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "adventures_owner_id_idx" ON "adventures" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scenes_adventure_id_idx" ON "scenes" USING btree ("adventure_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scene_connections_from_scene_id_idx" ON "scene_connections" USING btree ("from_scene_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scene_connections_to_scene_id_idx" ON "scene_connections" USING btree ("to_scene_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "encounter_monsters_encounter_id_idx" ON "encounter_monsters" USING btree ("encounter_id");--> statement-breakpoint
ALTER TABLE "srd_feats" ADD CONSTRAINT "srd_feats_name_edition_uq" UNIQUE("name","source_edition");
