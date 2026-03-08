import { randomBytes } from 'node:crypto';
import type {
  AdventureCreateInput,
  AdventureUpdateInput,
  CharacterPresetCreateInput,
  CharacterPresetUpdateInput,
  EncounterCreateInput,
  EncounterMonsterCreateInput,
  EncounterUpdateInput,
  SceneConnectionCreateInput,
  SceneCreateInput,
  SceneNpcCreateInput,
  SceneNpcUpdateInput,
  SceneUpdateInput,
} from '@ironquill/shared';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import {
  adventurePlayers,
  adventures,
  characterPresets,
  encounterMonsters,
  encounters,
  sceneConnections,
  sceneNpcs,
  scenes,
} from '../db/schema/adventures.js';
import { AppError } from '../lib/errors.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function assertOwner(adventureId: string, userId: string): Promise<void> {
  const [row] = await db
    .select({ id: adventures.id })
    .from(adventures)
    .where(and(eq(adventures.id, adventureId), eq(adventures.ownerId, userId)))
    .limit(1);
  if (!row) throw AppError.forbidden();
}

function generateInviteCode(): string {
  return randomBytes(5).toString('hex').toUpperCase();
}

// ── Adventures ────────────────────────────────────────────────────────────────

export async function listByOwner(userId: string) {
  return db
    .select()
    .from(adventures)
    .where(eq(adventures.ownerId, userId))
    .orderBy(adventures.updatedAt);
}

export async function getById(adventureId: string, userId: string) {
  const [adventure] = await db
    .select()
    .from(adventures)
    .where(eq(adventures.id, adventureId))
    .limit(1);

  if (!adventure) throw AppError.notFound('Adventure');
  if (adventure.ownerId !== userId) throw AppError.forbidden();

  return adventure;
}

export async function create(userId: string, input: AdventureCreateInput) {
  const [adventure] = await db
    .insert(adventures)
    .values({
      ownerId: userId,
      title: input.title,
      description: input.description,
      setting: input.setting,
      adventureType: input.adventureType,
      ruleset: input.ruleset,
      rulesetOverrides: input.rulesetOverrides as Record<string, unknown> | undefined,
      levelRangeMin: input.levelRangeMin,
      levelRangeMax: input.levelRangeMax,
      playerCapacityMin: input.playerCapacityMin,
      playerCapacityMax: input.playerCapacityMax,
    })
    .returning();

  return adventure;
}

export async function update(adventureId: string, userId: string, input: AdventureUpdateInput) {
  await assertOwner(adventureId, userId);

  const [updated] = await db
    .update(adventures)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(adventures.id, adventureId))
    .returning();

  return updated;
}

export async function remove(adventureId: string, userId: string): Promise<void> {
  await assertOwner(adventureId, userId);
  await db.delete(adventures).where(eq(adventures.id, adventureId));
}

export async function generateInvite(adventureId: string, userId: string) {
  await assertOwner(adventureId, userId);
  const inviteCode = generateInviteCode();

  await db
    .update(adventures)
    .set({ inviteCode, updatedAt: new Date() })
    .where(eq(adventures.id, adventureId));

  return { inviteCode };
}

export async function joinByInviteCode(code: string, userId: string, characterId?: string) {
  const [adventure] = await db
    .select()
    .from(adventures)
    .where(eq(adventures.inviteCode, code))
    .limit(1);

  if (!adventure) throw AppError.notFound('Adventure');
  if (adventure.status === 'completed') {
    throw AppError.badRequest('This adventure has already ended');
  }

  const [existing] = await db
    .select()
    .from(adventurePlayers)
    .where(and(eq(adventurePlayers.adventureId, adventure.id), eq(adventurePlayers.userId, userId)))
    .limit(1);

  if (existing) throw AppError.conflict('Already joined this adventure', 'ALREADY_JOINED');

  const [player] = await db
    .insert(adventurePlayers)
    .values({
      adventureId: adventure.id,
      userId,
      characterId: characterId ?? null,
      role: 'player',
    })
    .returning();

  return { adventure, player };
}

// ── Scenes ────────────────────────────────────────────────────────────────────

export async function listScenes(adventureId: string, userId: string) {
  await assertOwner(adventureId, userId);
  return db
    .select()
    .from(scenes)
    .where(eq(scenes.adventureId, adventureId))
    .orderBy(scenes.orderIndex);
}

export async function createScene(adventureId: string, userId: string, input: SceneCreateInput) {
  await assertOwner(adventureId, userId);
  const [scene] = await db
    .insert(scenes)
    .values({ adventureId, ...input })
    .returning();
  return scene;
}

export async function updateScene(
  adventureId: string,
  sceneId: string,
  userId: string,
  input: SceneUpdateInput,
) {
  await assertOwner(adventureId, userId);
  const [updated] = await db
    .update(scenes)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(scenes.id, sceneId), eq(scenes.adventureId, adventureId)))
    .returning();
  if (!updated) throw AppError.notFound('Scene');
  return updated;
}

export async function removeScene(
  adventureId: string,
  sceneId: string,
  userId: string,
): Promise<void> {
  await assertOwner(adventureId, userId);
  await db.delete(scenes).where(and(eq(scenes.id, sceneId), eq(scenes.adventureId, adventureId)));
}

// ── Scene Connections ─────────────────────────────────────────────────────────

export async function listConnections(adventureId: string, userId: string) {
  await assertOwner(adventureId, userId);
  return db
    .select({
      id: sceneConnections.id,
      fromSceneId: sceneConnections.fromSceneId,
      toSceneId: sceneConnections.toSceneId,
      label: sceneConnections.label,
      conditionNotes: sceneConnections.conditionNotes,
      createdAt: sceneConnections.createdAt,
    })
    .from(sceneConnections)
    .innerJoin(scenes, eq(sceneConnections.fromSceneId, scenes.id))
    .where(eq(scenes.adventureId, adventureId));
}

export async function createConnection(
  adventureId: string,
  sceneId: string,
  userId: string,
  input: SceneConnectionCreateInput,
) {
  await assertOwner(adventureId, userId);
  const [connection] = await db
    .insert(sceneConnections)
    .values({
      fromSceneId: sceneId,
      toSceneId: input.toSceneId,
      label: input.label,
      conditionNotes: input.conditionNotes,
    })
    .returning();
  return connection;
}

export async function removeConnection(
  adventureId: string,
  connectionId: string,
  userId: string,
): Promise<void> {
  await assertOwner(adventureId, userId);
  await db.delete(sceneConnections).where(eq(sceneConnections.id, connectionId));
}

// ── Scene NPCs ────────────────────────────────────────────────────────────────

export async function listNpcs(adventureId: string, userId: string) {
  await assertOwner(adventureId, userId);
  return db
    .select({
      id: sceneNpcs.id,
      sceneId: sceneNpcs.sceneId,
      monsterId: sceneNpcs.monsterId,
      customName: sceneNpcs.customName,
      customHpMax: sceneNpcs.customHpMax,
      notes: sceneNpcs.notes,
      createdAt: sceneNpcs.createdAt,
      updatedAt: sceneNpcs.updatedAt,
    })
    .from(sceneNpcs)
    .innerJoin(scenes, eq(sceneNpcs.sceneId, scenes.id))
    .where(eq(scenes.adventureId, adventureId));
}

export async function createNpc(
  adventureId: string,
  sceneId: string,
  userId: string,
  input: SceneNpcCreateInput,
) {
  await assertOwner(adventureId, userId);
  const [npc] = await db
    .insert(sceneNpcs)
    .values({ sceneId, ...input })
    .returning();
  return npc;
}

export async function updateNpc(
  adventureId: string,
  npcId: string,
  userId: string,
  input: SceneNpcUpdateInput,
) {
  await assertOwner(adventureId, userId);
  const [updated] = await db
    .update(sceneNpcs)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(sceneNpcs.id, npcId))
    .returning();
  if (!updated) throw AppError.notFound('NPC');
  return updated;
}

export async function removeNpc(adventureId: string, npcId: string, userId: string): Promise<void> {
  await assertOwner(adventureId, userId);
  await db.delete(sceneNpcs).where(eq(sceneNpcs.id, npcId));
}

// ── Encounters ────────────────────────────────────────────────────────────────

export async function getEncounter(adventureId: string, sceneId: string, userId: string) {
  await assertOwner(adventureId, userId);
  const [encounter] = await db
    .select()
    .from(encounters)
    .where(eq(encounters.sceneId, sceneId))
    .limit(1);
  return encounter ?? null;
}

export async function createEncounter(
  adventureId: string,
  sceneId: string,
  userId: string,
  input: EncounterCreateInput,
) {
  await assertOwner(adventureId, userId);
  const [encounter] = await db
    .insert(encounters)
    .values({ sceneId, ...input })
    .returning();
  return encounter;
}

export async function updateEncounter(
  adventureId: string,
  sceneId: string,
  userId: string,
  input: EncounterUpdateInput,
) {
  await assertOwner(adventureId, userId);
  const [updated] = await db
    .update(encounters)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(encounters.sceneId, sceneId))
    .returning();
  if (!updated) throw AppError.notFound('Encounter');
  return updated;
}

export async function listEncounterMonsters(adventureId: string, sceneId: string, userId: string) {
  await assertOwner(adventureId, userId);
  const [encounter] = await db
    .select({ id: encounters.id })
    .from(encounters)
    .where(eq(encounters.sceneId, sceneId))
    .limit(1);
  if (!encounter) return [];

  return db.select().from(encounterMonsters).where(eq(encounterMonsters.encounterId, encounter.id));
}

export async function addEncounterMonster(
  adventureId: string,
  sceneId: string,
  userId: string,
  input: EncounterMonsterCreateInput,
) {
  await assertOwner(adventureId, userId);

  const existing = await db
    .select()
    .from(encounters)
    .where(eq(encounters.sceneId, sceneId))
    .limit(1);

  const encounter = existing[0] ?? (await db.insert(encounters).values({ sceneId }).returning())[0];

  if (!encounter) throw AppError.notFound('Encounter');

  const [monster] = await db
    .insert(encounterMonsters)
    .values({ encounterId: encounter.id, ...input })
    .returning();
  return monster;
}

export async function removeEncounterMonster(
  adventureId: string,
  monsterId: string,
  userId: string,
): Promise<void> {
  await assertOwner(adventureId, userId);
  await db.delete(encounterMonsters).where(eq(encounterMonsters.id, monsterId));
}

// ── Character Presets (Kids Mode) ─────────────────────────────────────────────

export async function listPresets(adventureId: string, userId: string) {
  await assertOwner(adventureId, userId);
  return db
    .select()
    .from(characterPresets)
    .where(eq(characterPresets.adventureId, adventureId))
    .orderBy(characterPresets.createdAt);
}

export async function createPreset(
  adventureId: string,
  userId: string,
  input: CharacterPresetCreateInput,
) {
  await assertOwner(adventureId, userId);
  const [preset] = await db
    .insert(characterPresets)
    .values({ adventureId, ownerId: userId, ...input })
    .returning();
  return preset;
}

export async function updatePreset(
  adventureId: string,
  presetId: string,
  userId: string,
  input: CharacterPresetUpdateInput,
) {
  await assertOwner(adventureId, userId);
  const [updated] = await db
    .update(characterPresets)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(characterPresets.id, presetId), eq(characterPresets.adventureId, adventureId)))
    .returning();
  if (!updated) throw AppError.notFound('Preset');
  return updated;
}

export async function removePreset(
  adventureId: string,
  presetId: string,
  userId: string,
): Promise<void> {
  await assertOwner(adventureId, userId);
  await db
    .delete(characterPresets)
    .where(and(eq(characterPresets.id, presetId), eq(characterPresets.adventureId, adventureId)));
}
