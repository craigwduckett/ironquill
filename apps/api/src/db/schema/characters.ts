import type { AbilityScores, Appearance, Personality } from '@ironquill/shared';
import {
  boolean,
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
import { srdBackgrounds, srdClasses, srdSpecies, srdSpells } from './srd.js';
import { users } from './users.js';

export const managedByEnum = pgEnum('managed_by', ['self', 'dm']);

export const characters = pgTable(
  'characters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    managedBy: managedByEnum('managed_by').notNull().default('self'),
    presetSourceId: uuid('preset_source_id'),
    name: varchar('name', { length: 100 }).notNull(),
    speciesId: uuid('species_id').references(() => srdSpecies.id),
    classId: uuid('class_id').references(() => srdClasses.id),
    backgroundId: uuid('background_id').references(() => srdBackgrounds.id),
    level: integer('level').notNull().default(1),
    xp: integer('xp').notNull().default(0),
    alignment: varchar('alignment', { length: 30 }),
    abilityScores: jsonb('ability_scores').$type<AbilityScores>().notNull(),
    hpCurrent: integer('hp_current').notNull().default(0),
    hpMax: integer('hp_max').notNull().default(0),
    hpTemp: integer('hp_temp').notNull().default(0),
    ac: integer('ac').notNull().default(10),
    speed: integer('speed').notNull().default(30),
    proficiencyBonus: integer('proficiency_bonus').notNull().default(2),
    skillProficiencies: text('skill_proficiencies').array().notNull().default([]),
    personality: jsonb('personality').$type<Personality>(),
    appearance: jsonb('appearance').$type<Appearance>(),
    portraitId: text('portrait_id'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('characters_user_id_idx').on(t.userId)],
);

export const characterInventory = pgTable(
  'character_inventory',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id'),
    customItemName: varchar('custom_item_name', { length: 200 }),
    quantity: integer('quantity').notNull().default(1),
    equipped: boolean('equipped').notNull().default(false),
    notes: varchar('notes', { length: 500 }),
  },
  (t) => [index('character_inventory_character_id_idx').on(t.characterId)],
);

export const characterSpells = pgTable(
  'character_spells',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    spellId: uuid('spell_id')
      .notNull()
      .references(() => srdSpells.id),
    prepared: boolean('prepared').notNull().default(false),
  },
  (t) => [
    index('character_spells_character_id_idx').on(t.characterId),
    unique('character_spells_character_spell_unique').on(t.characterId, t.spellId),
  ],
);

export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
export type CharacterInventoryItem = typeof characterInventory.$inferSelect;
export type CharacterSpell = typeof characterSpells.$inferSelect;
