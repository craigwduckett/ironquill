import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { adventurePlayers, adventures } from '../db/schema/adventures.js';
import type { InitiativeEntry } from '../db/schema/sessions.js';
import { sessionCombat, sessions } from '../db/schema/sessions.js';
import { AppError } from '../lib/errors.js';

// ── Ownership / access helpers ─────────────────────────────────────────────────

async function assertDm(sessionId: string, userId: string): Promise<void> {
  const [row] = await db
    .select({ ownerId: adventures.ownerId })
    .from(sessions)
    .innerJoin(adventures, eq(sessions.adventureId, adventures.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!row) throw AppError.notFound('Session');
  if (row.ownerId !== userId) throw AppError.forbidden();
}

async function assertParticipant(sessionId: string, userId: string): Promise<void> {
  const [row] = await db
    .select({ ownerId: adventures.ownerId })
    .from(sessions)
    .innerJoin(adventures, eq(sessions.adventureId, adventures.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!row) throw AppError.notFound('Session');
  if (row.ownerId === userId) return;

  const [player] = await db
    .select({ id: adventurePlayers.id })
    .from(adventurePlayers)
    .innerJoin(adventures, eq(adventurePlayers.adventureId, adventures.id))
    .where(and(eq(adventurePlayers.userId, userId), eq(sessions.adventureId, adventures.id)))
    .limit(1);

  if (!player) throw AppError.forbidden();
}

// ── Session CRUD ───────────────────────────────────────────────────────────────

export async function listByAdventure(adventureId: string, userId: string) {
  const [adventure] = await db
    .select({ ownerId: adventures.ownerId })
    .from(adventures)
    .where(eq(adventures.id, adventureId))
    .limit(1);

  if (!adventure) throw AppError.notFound('Adventure');
  if (adventure.ownerId !== userId) throw AppError.forbidden();

  return db.select().from(sessions).where(eq(sessions.adventureId, adventureId));
}

export async function create(adventureId: string, userId: string) {
  const [adventure] = await db
    .select({ ownerId: adventures.ownerId })
    .from(adventures)
    .where(eq(adventures.id, adventureId))
    .limit(1);

  if (!adventure) throw AppError.notFound('Adventure');
  if (adventure.ownerId !== userId) throw AppError.forbidden();

  const [session] = await db.insert(sessions).values({ adventureId }).returning();

  return session;
}

export async function getById(sessionId: string, userId: string) {
  await assertParticipant(sessionId, userId);

  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);

  if (!session) throw AppError.notFound('Session');
  return session;
}

export async function start(sessionId: string, userId: string) {
  await assertDm(sessionId, userId);

  const [session] = await db
    .update(sessions)
    .set({ status: 'active', startedAt: new Date() })
    .where(eq(sessions.id, sessionId))
    .returning();

  return session;
}

export async function pause(sessionId: string, userId: string) {
  await assertDm(sessionId, userId);

  const [session] = await db
    .update(sessions)
    .set({ status: 'paused' })
    .where(eq(sessions.id, sessionId))
    .returning();

  return session;
}

export async function end(sessionId: string, userId: string, summary?: string) {
  await assertDm(sessionId, userId);

  const [session] = await db
    .update(sessions)
    .set({ status: 'ended', endedAt: new Date(), summary: summary ?? null })
    .where(eq(sessions.id, sessionId))
    .returning();

  return session;
}

export async function setScene(sessionId: string, sceneId: string, userId: string) {
  await assertDm(sessionId, userId);

  const [session] = await db
    .update(sessions)
    .set({ currentSceneId: sceneId })
    .where(eq(sessions.id, sessionId))
    .returning();

  return session;
}

// ── Combat ─────────────────────────────────────────────────────────────────────

export async function getCombat(sessionId: string, userId: string) {
  await assertParticipant(sessionId, userId);

  const [combat] = await db
    .select()
    .from(sessionCombat)
    .where(eq(sessionCombat.sessionId, sessionId))
    .limit(1);

  return combat ?? null;
}

export async function startCombat(
  sessionId: string,
  userId: string,
  initiativeOrder: InitiativeEntry[],
) {
  await assertDm(sessionId, userId);

  const [existing] = await db
    .select()
    .from(sessionCombat)
    .where(eq(sessionCombat.sessionId, sessionId))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(sessionCombat)
      .set({ initiativeOrder, round: 1, isActive: 1 })
      .where(eq(sessionCombat.sessionId, sessionId))
      .returning();
    if (!updated) throw AppError.notFound('Combat');
    return updated;
  }

  const [combat] = await db
    .insert(sessionCombat)
    .values({ sessionId, initiativeOrder })
    .returning();

  if (!combat) throw AppError.badRequest('Failed to create combat');
  return combat;
}

export async function advanceTurn(sessionId: string, userId: string) {
  await assertDm(sessionId, userId);

  const [combat] = await db
    .select()
    .from(sessionCombat)
    .where(eq(sessionCombat.sessionId, sessionId))
    .limit(1);

  if (!combat) throw AppError.notFound('Combat');

  const order = combat.initiativeOrder;
  const currentIdx = order.findIndex((e) => e.isCurrent);
  const nextIdx = (currentIdx + 1) % order.length;
  const isNewRound = nextIdx === 0;

  const updated = order.map((entry, i) => ({
    ...entry,
    isCurrent: i === nextIdx,
  }));

  const [result] = await db
    .update(sessionCombat)
    .set({
      initiativeOrder: updated,
      round: isNewRound ? combat.round + 1 : combat.round,
    })
    .where(eq(sessionCombat.sessionId, sessionId))
    .returning();

  if (!result) throw AppError.notFound('Combat');
  return result;
}

export async function endCombat(sessionId: string, userId: string) {
  await assertDm(sessionId, userId);
  await db.delete(sessionCombat).where(eq(sessionCombat.sessionId, sessionId));
}
