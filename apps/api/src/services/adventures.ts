import { randomBytes } from 'node:crypto';
import type {
  AdventureCreateInput,
  AdventureUpdateInput,
  SceneCreateInput,
  SceneNpcCreateInput,
  SceneUpdateInput,
} from '@ironquill/shared';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { adventurePlayers, adventures, sceneNpcs, scenes } from '../db/schema/adventures.js';
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

// ── Scene NPCs ────────────────────────────────────────────────────────────────

export async function listNpcs(adventureId: string, userId: string) {
  await assertOwner(adventureId, userId);
  const adventureScenes = await db
    .select({ id: scenes.id })
    .from(scenes)
    .where(eq(scenes.adventureId, adventureId));
  const sceneIds = adventureScenes.map((s) => s.id);
  if (sceneIds.length === 0) return [];

  return db
    .select()
    .from(sceneNpcs)
    .where(
      sceneIds.length === 1
        ? eq(sceneNpcs.sceneId, sceneIds[0] ?? '')
        : eq(sceneNpcs.sceneId, sceneIds[0] ?? ''),
    );
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
