import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { characters } from './characters.js';
import { srdMonsters } from './srd.js';
import { users } from './users.js';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const adventureTypeEnum = pgEnum('adventure_type', ['campaign', 'one_shot']);
export const rulesetEnum = pgEnum('ruleset', ['standard', 'kids', 'custom']);
export const adventureStatusEnum = pgEnum('adventure_status', ['draft', 'active', 'completed']);
export const adventurePlayerRoleEnum = pgEnum('adventure_player_role', ['player', 'co_dm']);

// ── Adventures ────────────────────────────────────────────────────────────────

export const adventures = pgTable('adventures', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  setting: text('setting'),
  coverImageId: text('cover_image_id'),
  adventureType: adventureTypeEnum('adventure_type').notNull().default('campaign'),
  ruleset: rulesetEnum('ruleset').notNull().default('standard'),
  rulesetOverrides: jsonb('ruleset_overrides').$type<Record<string, unknown>>(),
  levelRangeMin: integer('level_range_min').notNull().default(1),
  levelRangeMax: integer('level_range_max').notNull().default(5),
  playerCapacityMin: integer('player_capacity_min').notNull().default(1),
  playerCapacityMax: integer('player_capacity_max').notNull().default(6),
  inviteCode: varchar('invite_code', { length: 16 }),
  status: adventureStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Character Presets (Kids Mode) ─────────────────────────────────────────────
// DM-authored template characters. Instantiated as real characters for kid seats.

export const characterPresets = pgTable('character_presets', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  adventureId: uuid('adventure_id').references(() => adventures.id, {
    onDelete: 'cascade',
  }),
  name: varchar('name', { length: 100 }).notNull(),
  levelOverride: integer('level_override'),
  baseCharacterData: jsonb('base_character_data')
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Adventure Players ─────────────────────────────────────────────────────────
// Join table: who is in an adventure, and with which character.
// user_id is nullable for DM-managed kids seats (no account required).

export const adventurePlayers = pgTable(
  'adventure_players',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    adventureId: uuid('adventure_id')
      .notNull()
      .references(() => adventures.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id').references(() => characters.id, {
      onDelete: 'set null',
    }),
    presetId: uuid('preset_id').references(() => characterPresets.id, {
      onDelete: 'set null',
    }),
    role: adventurePlayerRoleEnum('role').notNull().default('player'),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('adventure_players_adventure_user_unique').on(t.adventureId, t.userId)],
);

// ── Scenes ────────────────────────────────────────────────────────────────────

export const scenes = pgTable('scenes', {
  id: uuid('id').primaryKey().defaultRandom(),
  adventureId: uuid('adventure_id')
    .notNull()
    .references(() => adventures.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  narrativeReadAloud: text('narrative_read_aloud'),
  dmNotes: text('dm_notes'),
  orderIndex: integer('order_index').notNull().default(0),
  backgroundImageId: text('background_image_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Scene NPCs ────────────────────────────────────────────────────────────────
// NPCs placed in a scene. Can be based on an SRD monster or fully custom.

export const sceneNpcs = pgTable('scene_npcs', {
  id: uuid('id').primaryKey().defaultRandom(),
  sceneId: uuid('scene_id')
    .notNull()
    .references(() => scenes.id, { onDelete: 'cascade' }),
  monsterId: uuid('monster_id').references(() => srdMonsters.id, {
    onDelete: 'set null',
  }),
  customName: varchar('custom_name', { length: 200 }),
  customHpMax: integer('custom_hp_max'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type Adventure = typeof adventures.$inferSelect;
export type NewAdventure = typeof adventures.$inferInsert;
export type CharacterPreset = typeof characterPresets.$inferSelect;
export type AdventurePlayer = typeof adventurePlayers.$inferSelect;
export type Scene = typeof scenes.$inferSelect;
export type NewScene = typeof scenes.$inferInsert;
export type SceneNpc = typeof sceneNpcs.$inferSelect;
