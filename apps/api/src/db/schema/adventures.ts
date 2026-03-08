import {
  doublePrecision,
  index,
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
import { srdEditionEnum, srdMonsters } from './srd.js';
import { users } from './users.js';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const adventureTypeEnum = pgEnum('adventure_type', ['campaign', 'one_shot']);
export const rulesetEnum = pgEnum('ruleset', ['standard', 'kids', 'custom']);
export const adventureStatusEnum = pgEnum('adventure_status', ['draft', 'active', 'completed']);
export const adventurePlayerRoleEnum = pgEnum('adventure_player_role', ['player', 'co_dm']);
export const sceneTypeEnum = pgEnum('scene_type', [
  'exploration',
  'social',
  'combat',
  'puzzle',
  'rest',
  'transition',
]);
export const encounterDifficultyEnum = pgEnum('encounter_difficulty', [
  'easy',
  'medium',
  'hard',
  'deadly',
]);

// ── Supporting types ──────────────────────────────────────────────────────────
// Declared before tables so JSONB column typings can reference them.

export type LootEntry = {
  type: 'item' | 'gold' | 'xp';
  itemId?: string | undefined;
  itemName?: string | undefined;
  quantity: number;
};

// ── Adventures ────────────────────────────────────────────────────────────────

export const adventures = pgTable(
  'adventures',
  {
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
    // Which SRD edition this adventure uses — drives which data is shown in character creation.
    preferredEdition: srdEditionEnum('preferred_edition').notNull().default('2024'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('adventures_owner_id_idx').on(t.ownerId),
    unique('adventures_invite_code_unique').on(t.inviteCode),
  ],
);

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
  (t) => [
    unique('adventure_players_adventure_user_unique').on(t.adventureId, t.userId),
    // user_id alone: "find all adventures I'm a player in"
    index('adventure_players_user_id_idx').on(t.userId),
    // character_id: "which adventure is this character in"
    index('adventure_players_character_id_idx').on(t.characterId),
  ],
);

// ── Scenes ────────────────────────────────────────────────────────────────────

export const scenes = pgTable(
  'scenes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    adventureId: uuid('adventure_id')
      .notNull()
      .references(() => adventures.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 200 }).notNull(),
    sceneType: sceneTypeEnum('scene_type').notNull().default('exploration'),
    narrativeReadAloud: text('narrative_read_aloud'),
    dmNotes: text('dm_notes'),
    dmTips: text('dm_tips'),
    loot: jsonb('loot').$type<LootEntry[]>(),
    orderIndex: integer('order_index').notNull().default(0),
    // Node positions for the visual flow graph editor.
    positionX: doublePrecision('position_x'),
    positionY: doublePrecision('position_y'),
    backgroundImageId: text('background_image_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('scenes_adventure_id_idx').on(t.adventureId)],
);

// ── Scene Connections ─────────────────────────────────────────────────────────
// Directed edges in the scene flow graph. Label describes the branching condition.

export const sceneConnections = pgTable(
  'scene_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fromSceneId: uuid('from_scene_id')
      .notNull()
      .references(() => scenes.id, { onDelete: 'cascade' }),
    toSceneId: uuid('to_scene_id')
      .notNull()
      .references(() => scenes.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 200 }),
    conditionNotes: text('condition_notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('scene_connections_from_scene_id_idx').on(t.fromSceneId),
    index('scene_connections_to_scene_id_idx').on(t.toSceneId),
    unique('scene_connections_from_to_unique').on(t.fromSceneId, t.toSceneId),
  ],
);

// ── Scene NPCs ────────────────────────────────────────────────────────────────
// NPCs placed in a scene. Can be based on an SRD monster or fully custom.

export const sceneNpcs = pgTable(
  'scene_npcs',
  {
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
  },
  (t) => [index('scene_npcs_scene_id_idx').on(t.sceneId)],
);

// ── Encounters ────────────────────────────────────────────────────────────────
// One encounter per scene (typically for combat scenes).
// scenes_id has a UNIQUE constraint which creates an implicit index — no extra index needed.

export const encounters = pgTable('encounters', {
  id: uuid('id').primaryKey().defaultRandom(),
  sceneId: uuid('scene_id')
    .notNull()
    .unique()
    .references(() => scenes.id, { onDelete: 'cascade' }),
  difficultyRating: encounterDifficultyEnum('difficulty_rating'),
  terrainNotes: text('terrain_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Encounter Monsters ────────────────────────────────────────────────────────

export const encounterMonsters = pgTable(
  'encounter_monsters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    encounterId: uuid('encounter_id')
      .notNull()
      .references(() => encounters.id, { onDelete: 'cascade' }),
    srdMonsterId: uuid('srd_monster_id').references(() => srdMonsters.id, {
      onDelete: 'set null',
    }),
    customStatBlock: jsonb('custom_stat_block').$type<Record<string, unknown>>(),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('encounter_monsters_encounter_id_idx').on(t.encounterId)],
);

// ── Inferred types ────────────────────────────────────────────────────────────

export type Adventure = typeof adventures.$inferSelect;
export type NewAdventure = typeof adventures.$inferInsert;
export type CharacterPreset = typeof characterPresets.$inferSelect;
export type AdventurePlayer = typeof adventurePlayers.$inferSelect;
export type Scene = typeof scenes.$inferSelect;
export type NewScene = typeof scenes.$inferInsert;
export type SceneNpc = typeof sceneNpcs.$inferSelect;
export type SceneConnection = typeof sceneConnections.$inferSelect;
export type Encounter = typeof encounters.$inferSelect;
export type EncounterMonster = typeof encounterMonsters.$inferSelect;
