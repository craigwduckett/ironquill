-- Reusable trigger function: automatically stamps updated_at on any UPDATE.
-- Applied to all mutable tables so that updated_at is always accurate,
-- regardless of whether the application layer remembered to set it.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

CREATE TRIGGER trg_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

CREATE TRIGGER trg_adventures_updated_at
  BEFORE UPDATE ON adventures
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

CREATE TRIGGER trg_character_presets_updated_at
  BEFORE UPDATE ON character_presets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

CREATE TRIGGER trg_scenes_updated_at
  BEFORE UPDATE ON scenes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

CREATE TRIGGER trg_scene_npcs_updated_at
  BEFORE UPDATE ON scene_npcs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

CREATE TRIGGER trg_encounters_updated_at
  BEFORE UPDATE ON encounters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

CREATE TRIGGER trg_session_combat_updated_at
  BEFORE UPDATE ON session_combat
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

CREATE TRIGGER trg_session_npc_hp_updated_at
  BEFORE UPDATE ON session_npc_hp
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
