import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { adventures, sceneNpcs, scenes } from './adventures.js';
import { characters } from './characters.js';
import { srdConditions } from './srd.js';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const sessionStatusEnum = pgEnum('session_status', ['lobby', 'active', 'paused', 'ended']);

// ── Sessions ──────────────────────────────────────────────────────────────────
// A live run of an adventure. Campaigns have many sessions; one-shots typically one.

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  adventureId: uuid('adventure_id')
    .notNull()
    .references(() => adventures.id, { onDelete: 'cascade' }),
  currentSceneId: uuid('current_scene_id').references(() => scenes.id, {
    onDelete: 'set null',
  }),
  status: sessionStatusEnum('status').notNull().default('lobby'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  summary: text('summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Session Combat ────────────────────────────────────────────────────────────
// Ephemeral combat state. One row per active session (deleted when combat ends).
// initiative_order holds ordering + turn state only — NPC HP lives in session_npc_hp.

export type InitiativeEntry = {
  id: string;
  label: string;
  initiative: number;
  characterId: string | null;
  npcId: string | null;
  isCurrent: boolean;
};

export const sessionCombat = pgTable('session_combat', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .unique()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  round: integer('round').notNull().default(1),
  isActive: integer('is_active').notNull().default(1),
  initiativeOrder: jsonb('initiative_order').$type<InitiativeEntry[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Session NPC HP ────────────────────────────────────────────────────────────
// Tracks live HP for each NPC during a session. Separate from initiative_order JSONB
// so that HP updates don't rewrite the entire combat column.

export const sessionNpcHp = pgTable('session_npc_hp', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  npcId: uuid('npc_id')
    .notNull()
    .references(() => sceneNpcs.id, { onDelete: 'cascade' }),
  hpCurrent: integer('hp_current').notNull(),
  hpMax: integer('hp_max').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Session Conditions ────────────────────────────────────────────────────────
// Active conditions on characters or NPCs during a session.
// Rows are deleted when the condition is removed (no end timestamp).

export const sessionConditions = pgTable('session_conditions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id').references(() => characters.id, {
    onDelete: 'cascade',
  }),
  npcId: uuid('npc_id').references(() => sceneNpcs.id, { onDelete: 'cascade' }),
  conditionId: uuid('condition_id')
    .notNull()
    .references(() => srdConditions.id),
  appliedAt: timestamp('applied_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Roll Log ──────────────────────────────────────────────────────────────────
// Append-only audit trail of dice rolls during a session.

export const rollLog = pgTable('roll_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id').references(() => characters.id, {
    onDelete: 'set null',
  }),
  rollType: varchar('roll_type', { length: 100 }).notNull(),
  result: integer('result').notNull(),
  rolledAt: timestamp('rolled_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type SessionCombat = typeof sessionCombat.$inferSelect;
export type SessionCondition = typeof sessionConditions.$inferSelect;
export type RollLogEntry = typeof rollLog.$inferSelect;
