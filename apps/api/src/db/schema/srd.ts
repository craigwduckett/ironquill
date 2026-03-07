import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// ── Edition tracking ──────────────────────────────────────────────────────────
// '2014' = SRD 5.1 (OGL), '2024' = SRD 5.2 (CC-BY-4.0)
// When 2024 data becomes available for a table the row is inserted with '2024'
// and the corresponding '2014' rows can be removed to avoid duplicates.

export const srdEditionEnum = pgEnum('srd_edition', ['2014', '2024']);

// ── Species (formerly Races) ──────────────────────────────────────────────────
// 2014 SRD called these "Races" (displayTerm = 'Race').
// 2024 SRD renamed them "Species" (displayTerm = 'Species') and removed fixed
// ability score bonuses — those moved to Backgrounds. The abilityBonuses column
// is kept for 2014 compatibility but will always be empty ({}) for 2024 rows.
// 2024 adds: sizeOptions (some species choose Small or Medium) and creatureType.

export const srdSpeciesDisplayTermEnum = pgEnum('srd_species_display_term', ['Race', 'Species']);

export const srdSpecies = pgTable(
  'srd_species',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceEdition: srdEditionEnum('source_edition').notNull().default('2014'),
    displayTerm: srdSpeciesDisplayTermEnum('display_term').notNull().default('Race'),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    traits: jsonb('traits')
      .$type<Array<{ name: string; description: string }>>()
      .notNull()
      .default([]),
    // Populated for 2014 rows only. Always {} for 2024 Species (ASIs come from Background).
    abilityBonuses: jsonb('ability_bonuses')
      .$type<Partial<Record<string, number>>>()
      .notNull()
      .default({}),
    // Each entry is "Name (Type) — script: X" for enriched display
    languages: text('languages').array().notNull().default([]),
    languageDesc: text('language_desc'),
    speed: integer('speed').notNull().default(30),
    size: varchar('size', { length: 20 }).notNull().default('Medium'),
    // 2024: some species choose their size (e.g. ['Small', 'Medium']). Empty = fixed to `size`.
    sizeOptions: text('size_options').array().notNull().default([]),
    // 2024: explicitly declared creature type. 2014 rows default to 'Humanoid'.
    creatureType: varchar('creature_type', { length: 50 }).notNull().default('Humanoid'),
  },
  (t) => [unique('srd_species_name_edition_uq').on(t.name, t.sourceEdition)],
);

// ── Classes ───────────────────────────────────────────────────────────────────
// 2024 adds: subclasses (listed at class level with gain level) and
// weaponMasteries (which Mastery properties the class can use).

export const srdClasses = pgTable(
  'srd_classes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceEdition: srdEditionEnum('source_edition').notNull().default('2014'),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    hitDie: varchar('hit_die', { length: 5 }).notNull(),
    primaryAbilities: text('primary_abilities').array().notNull().default([]),
    savingThrows: text('saving_throws').array().notNull().default([]),
    armorProficiencies: text('armor_proficiencies').array().notNull().default([]),
    weaponProficiencies: text('weapon_proficiencies').array().notNull().default([]),
    skillChoices: jsonb('skill_choices').$type<{
      choose: number;
      from: string[];
    }>(),
    featuresByLevel: jsonb('features_by_level')
      .$type<
        Array<{
          level: number;
          features: Array<{ name: string; description: string }>;
        }>
      >()
      .notNull()
      .default([]),
    spellcastingInfo: jsonb('spellcasting_info').$type<Record<string, unknown>>(),
    startingEquipment: jsonb('starting_equipment')
      .$type<Array<Record<string, unknown>>>()
      .notNull()
      .default([]),
    // 2024: subclasses listed at class level with the level they are gained.
    subclasses: jsonb('subclasses')
      .$type<Array<{ name: string; gainedAtLevel: number }>>()
      .notNull()
      .default([]),
    // 2024: Weapon Mastery properties available to this class.
    weaponMasteries: text('weapon_masteries').array().notNull().default([]),
  },
  (t) => [unique('srd_classes_name_edition_uq').on(t.name, t.sourceEdition)],
);

// ── Backgrounds ───────────────────────────────────────────────────────────────
// 2014: narrative Feature (featureName / featureDescription).
// 2024: Origin Feat (originFeat) + 3 ability score options (abilityScoreOptions).
// featureName and featureDescription are kept for 2014 rows; 2024 rows set
// featureName to '—' and featureDescription to '' (legacy columns).

export const srdBackgrounds = pgTable(
  'srd_backgrounds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceEdition: srdEditionEnum('source_edition').notNull().default('2014'),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    skillProficiencies: text('skill_proficiencies').array().notNull().default([]),
    toolProficiencies: text('tool_proficiencies').array().notNull().default([]),
    languagesCount: integer('languages_count').notNull().default(0),
    equipment: jsonb('equipment').$type<Array<Record<string, unknown>>>().notNull().default([]),
    // 2014-only: narrative feature name (e.g. "Shelter of the Faithful").
    featureName: varchar('feature_name', { length: 100 }).notNull(),
    // 2014-only: narrative feature description.
    featureDescription: text('feature_description').notNull(),
    // 2024: ability score options — player picks 2 of these 3 for +2/+1 or +1/+1/+1.
    abilityScoreOptions: text('ability_score_options').array().notNull().default([]),
    // 2024: the Origin Feat granted by this Background.
    originFeat: jsonb('origin_feat')
      .$type<{
        index: string;
        name: string;
        note?: string;
      } | null>()
      .default(null),
  },
  (t) => [unique('srd_backgrounds_name_edition_uq').on(t.name, t.sourceEdition)],
);

// ── Spells ────────────────────────────────────────────────────────────────────

export const srdSpells = pgTable(
  'srd_spells',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceEdition: srdEditionEnum('source_edition').notNull().default('2014'),
    name: varchar('name', { length: 200 }).notNull(),
    level: integer('level').notNull(),
    school: varchar('school', { length: 50 }).notNull(),
    castingTime: varchar('casting_time', { length: 100 }).notNull(),
    range: varchar('range', { length: 100 }).notNull(),
    components: jsonb('components')
      .$type<{ verbal: boolean; somatic: boolean; material: string | null }>()
      .notNull(),
    duration: varchar('duration', { length: 100 }).notNull(),
    concentration: boolean('concentration').notNull().default(false),
    ritual: boolean('ritual').notNull().default(false),
    description: text('description').notNull(),
    higherLevels: text('higher_levels'),
    classes: text('classes').array().notNull().default([]),
  },
  (t) => [unique('srd_spells_name_edition_uq').on(t.name, t.sourceEdition)],
);

// ── Monsters ──────────────────────────────────────────────────────────────────

export const srdMonsters = pgTable(
  'srd_monsters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceEdition: srdEditionEnum('source_edition').notNull().default('2014'),
    name: varchar('name', { length: 200 }).notNull(),
    size: varchar('size', { length: 20 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    alignment: varchar('alignment', { length: 100 }).notNull(),
    ac: integer('ac').notNull(),
    acType: varchar('ac_type', { length: 100 }),
    hp: integer('hp').notNull(),
    hpFormula: varchar('hp_formula', { length: 50 }).notNull(),
    speed: jsonb('speed').$type<Record<string, number | string>>().notNull(),
    abilityScores: jsonb('ability_scores').$type<Record<string, number>>().notNull(),
    savingThrows: jsonb('saving_throws').$type<Record<string, number>>(),
    skills: jsonb('skills').$type<Record<string, number>>(),
    damageResistances: text('damage_resistances').array(),
    damageImmunities: text('damage_immunities').array(),
    conditionImmunities: text('condition_immunities').array(),
    senses: text('senses').notNull(),
    languages: text('languages').notNull(),
    cr: real('cr').notNull(),
    xp: integer('xp').notNull(),
    actions: jsonb('actions').$type<Array<Record<string, unknown>>>().notNull().default([]),
    legendaryActions: jsonb('legendary_actions').$type<Array<Record<string, unknown>>>(),
    specialAbilities: jsonb('special_abilities').$type<Array<Record<string, unknown>>>(),
  },
  (t) => [unique('srd_monsters_name_edition_uq').on(t.name, t.sourceEdition)],
);

// ── Items ─────────────────────────────────────────────────────────────────────
// 2024 adds: weaponMastery — every 2024 weapon has exactly one Mastery property
// (e.g. 'Cleave', 'Nick', 'Push'). Null for non-weapons and all 2014 rows.

export const itemCategoryEnum = pgEnum('item_category', [
  'weapon',
  'armor',
  'adventuring_gear',
  'tool',
  'magic_item',
]);

export const srdItems = pgTable(
  'srd_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceEdition: srdEditionEnum('source_edition').notNull().default('2014'),
    name: varchar('name', { length: 200 }).notNull(),
    category: itemCategoryEnum('category').notNull(),
    cost: jsonb('cost').$type<{ amount: number; unit: string } | null>(),
    weight: real('weight'),
    properties: jsonb('properties').$type<Record<string, unknown>>(),
    description: text('description').notNull(),
    rarity: varchar('rarity', { length: 50 }),
    requiresAttunement: boolean('requires_attunement').notNull().default(false),
    // 2024: Weapon Mastery property (e.g. 'Topple', 'Nick', 'Cleave'). Null for 2014 rows.
    weaponMastery: varchar('weapon_mastery', { length: 50 }),
  },
  (t) => [unique('srd_items_name_edition_uq').on(t.name, t.sourceEdition)],
);

// ── Conditions ────────────────────────────────────────────────────────────────

export const srdConditions = pgTable(
  'srd_conditions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceEdition: srdEditionEnum('source_edition').notNull().default('2014'),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description').notNull(),
    mechanicalEffects: text('mechanical_effects').array().notNull().default([]),
  },
  (t) => [unique('srd_conditions_name_edition_uq').on(t.name, t.sourceEdition)],
);

// ── Rules ─────────────────────────────────────────────────────────────────────

export const srdRules = pgTable(
  'srd_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceEdition: srdEditionEnum('source_edition').notNull().default('2014'),
    category: varchar('category', { length: 100 }).notNull(),
    topic: varchar('topic', { length: 200 }).notNull(),
    description: text('description').notNull(),
    keywords: text('keywords').array().notNull().default([]),
  },
  // topic is the "name" equivalent for rules
  (t) => [unique('srd_rules_topic_edition_uq').on(t.topic, t.sourceEdition)],
);

// ── Feats ─────────────────────────────────────────────────────────────────────
// 2024 SRD introduces typed feats: origin (granted by Background), general,
// fighting-style, and epic-boon. Origin feats are mandatory — every Background
// grants one. The others are gained via class features or Ability Score Improvement.

export const srdFeatTypeEnum = pgEnum('srd_feat_type', [
  'origin',
  'general',
  'fighting-style',
  'epic-boon',
]);

export const srdFeats = pgTable(
  'srd_feats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceEdition: srdEditionEnum('source_edition').notNull().default('2024'),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description').notNull(),
    type: srdFeatTypeEnum('type').notNull(),
    prerequisites: jsonb('prerequisites')
      .$type<{
        minimumLevel?: number;
        featureNamed?: string;
        abilityScore?: { name: string; minimum: number };
      } | null>()
      .default(null),
    repeatable: text('repeatable'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('srd_feats_name_edition_uq').on(t.name, t.sourceEdition)],
);

// ── Types ─────────────────────────────────────────────────────────────────────

export type SrdSpecies = typeof srdSpecies.$inferSelect;
export type SrdClass = typeof srdClasses.$inferSelect;
export type SrdBackground = typeof srdBackgrounds.$inferSelect;
export type SrdSpell = typeof srdSpells.$inferSelect;
export type SrdMonster = typeof srdMonsters.$inferSelect;
export type SrdItem = typeof srdItems.$inferSelect;
export type SrdCondition = typeof srdConditions.$inferSelect;
export type SrdRule = typeof srdRules.$inferSelect;
export type SrdFeat = typeof srdFeats.$inferSelect;
