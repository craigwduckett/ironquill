import { z } from 'zod';
import { SrdEditionSchema } from './srd.js';

export const AdventureTypeSchema = z.enum(['campaign', 'one_shot']);
export const RulesetSchema = z.enum(['standard', 'kids', 'custom']);
export const AdventureStatusSchema = z.enum(['draft', 'active', 'completed']);
export const AdventurePlayerRoleSchema = z.enum(['player', 'co_dm']);
export const SceneTypeSchema = z.enum([
  'exploration',
  'social',
  'combat',
  'puzzle',
  'rest',
  'transition',
]);
export const EncounterDifficultySchema = z.enum(['easy', 'medium', 'hard', 'deadly']);

export const RulesetOverridesSchema = z.object({
  simplifiedRolls: z.boolean(),
  weakerEnemies: z.boolean(),
  forgivingCombat: z.boolean(),
  simplifiedSpellcasting: z.boolean(),
  streamlinedInventory: z.boolean(),
});

export const LootEntrySchema = z.object({
  type: z.enum(['item', 'gold', 'xp']),
  itemId: z.string().uuid().optional(),
  itemName: z.string().optional(),
  quantity: z.number().int().min(0),
});

// ── Adventure ─────────────────────────────────────────────────────────────────

export const AdventureCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  setting: z.string().optional(),
  adventureType: AdventureTypeSchema,
  ruleset: RulesetSchema,
  levelRangeMin: z.number().int().min(1).max(20),
  levelRangeMax: z.number().int().min(1).max(20),
  playerCapacityMin: z.number().int().min(1),
  playerCapacityMax: z.number().int().min(1).max(10),
  rulesetOverrides: RulesetOverridesSchema.optional(),
  preferredEdition: SrdEditionSchema.optional(),
});

// Update only allows the fields that make sense to patch; status and cover are
// update-only fields (not present on create).
export const AdventureUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  setting: z.string().optional(),
  adventureType: AdventureTypeSchema.optional(),
  ruleset: RulesetSchema.optional(),
  levelRangeMin: z.number().int().min(1).max(20).optional(),
  levelRangeMax: z.number().int().min(1).max(20).optional(),
  playerCapacityMin: z.number().int().min(1).optional(),
  playerCapacityMax: z.number().int().min(1).max(10).optional(),
  rulesetOverrides: RulesetOverridesSchema.optional(),
  preferredEdition: SrdEditionSchema.optional(),
  status: AdventureStatusSchema.optional(),
  coverImageId: z.string().optional(),
});

// ── Scene ─────────────────────────────────────────────────────────────────────

export const SceneCreateSchema = z.object({
  title: z.string().min(1).max(200),
  sceneType: SceneTypeSchema,
  narrativeReadAloud: z.string().optional(),
  dmNotes: z.string().optional(),
  dmTips: z.string().optional(),
  loot: z.array(LootEntrySchema).optional(),
  orderIndex: z.number().int().min(0).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  backgroundImageId: z.string().optional(),
});

export const SceneUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  sceneType: SceneTypeSchema.optional(),
  narrativeReadAloud: z.string().optional(),
  dmNotes: z.string().optional(),
  dmTips: z.string().optional(),
  loot: z.array(LootEntrySchema).optional(),
  orderIndex: z.number().int().min(0).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  backgroundImageId: z.string().optional(),
});

// ── Scene connection ───────────────────────────────────────────────────────────

export const SceneConnectionCreateSchema = z.object({
  toSceneId: z.string().uuid(),
  label: z.string().max(200).optional(),
  conditionNotes: z.string().optional(),
});

// ── Scene NPC ─────────────────────────────────────────────────────────────────

export const SceneNpcCreateSchema = z.object({
  monsterId: z.string().uuid().optional(),
  customName: z.string().max(200).optional(),
  customHpMax: z.number().int().min(1).optional(),
  notes: z.string().optional(),
});

export const SceneNpcUpdateSchema = z.object({
  monsterId: z.string().uuid().optional(),
  customName: z.string().max(200).optional(),
  customHpMax: z.number().int().min(1).optional(),
  notes: z.string().optional(),
});

// ── Encounter ─────────────────────────────────────────────────────────────────

export const EncounterCreateSchema = z.object({
  terrainNotes: z.string().optional(),
});

export const EncounterUpdateSchema = z.object({
  terrainNotes: z.string().optional(),
  difficultyRating: EncounterDifficultySchema.optional(),
});

export const EncounterMonsterCreateSchema = z.object({
  srdMonsterId: z.string().uuid().optional(),
  customStatBlock: z.record(z.string(), z.unknown()).optional(),
  quantity: z.number().int().min(1).optional(),
});

// ── Kids Mode Preset ──────────────────────────────────────────────────────────

export const CharacterPresetCreateSchema = z.object({
  name: z.string().min(1).max(100),
  levelOverride: z.number().int().min(1).max(20).optional(),
  baseCharacterData: z.record(z.string(), z.unknown()).optional(),
});

export const CharacterPresetUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  levelOverride: z.number().int().min(1).max(20).optional(),
  baseCharacterData: z.record(z.string(), z.unknown()).optional(),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type AdventureType = z.infer<typeof AdventureTypeSchema>;
export type Ruleset = z.infer<typeof RulesetSchema>;
export type AdventureStatus = z.infer<typeof AdventureStatusSchema>;
export type AdventurePlayerRole = z.infer<typeof AdventurePlayerRoleSchema>;
export type SceneType = z.infer<typeof SceneTypeSchema>;
export type EncounterDifficulty = z.infer<typeof EncounterDifficultySchema>;
export type RulesetOverrides = z.infer<typeof RulesetOverridesSchema>;
export type LootEntry = z.infer<typeof LootEntrySchema>;
export type AdventureCreateInput = z.infer<typeof AdventureCreateSchema>;
export type AdventureUpdateInput = z.infer<typeof AdventureUpdateSchema>;
export type SceneCreateInput = z.infer<typeof SceneCreateSchema>;
export type SceneUpdateInput = z.infer<typeof SceneUpdateSchema>;
export type SceneConnectionCreateInput = z.infer<typeof SceneConnectionCreateSchema>;
export type SceneNpcCreateInput = z.infer<typeof SceneNpcCreateSchema>;
export type SceneNpcUpdateInput = z.infer<typeof SceneNpcUpdateSchema>;
export type EncounterCreateInput = z.infer<typeof EncounterCreateSchema>;
export type EncounterUpdateInput = z.infer<typeof EncounterUpdateSchema>;
export type EncounterMonsterCreateInput = z.infer<typeof EncounterMonsterCreateSchema>;
export type CharacterPresetCreateInput = z.infer<typeof CharacterPresetCreateSchema>;
export type CharacterPresetUpdateInput = z.infer<typeof CharacterPresetUpdateSchema>;
