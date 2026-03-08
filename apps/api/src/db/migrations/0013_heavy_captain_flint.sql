ALTER TABLE "adventures" ADD CONSTRAINT "adventures_invite_code_unique" UNIQUE("invite_code");--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "scene_connections" ADD CONSTRAINT "scene_connections_from_to_unique" UNIQUE("from_scene_id","to_scene_id");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;--> statement-breakpoint
ALTER TABLE "character_spells" ADD CONSTRAINT "character_spells_character_spell_unique" UNIQUE("character_id","spell_id");--> statement-breakpoint
ALTER TABLE "session_npc_hp" ADD CONSTRAINT "session_npc_hp_session_npc_unique" UNIQUE("session_id","npc_id");--> statement-breakpoint
ALTER TABLE "scene_connections" ADD CONSTRAINT "scene_connections_no_self_loop" CHECK ("from_scene_id" != "to_scene_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "character_inventory_character_item_unique" ON "character_inventory" ("character_id","item_id") WHERE "item_id" IS NOT NULL;