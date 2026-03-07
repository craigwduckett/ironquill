import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { refreshTokenNonces } from '../db/schema/users.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function issueNonce(userId: string): Promise<string> {
  const nonce = randomUUID();
  const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS);

  await db
    .insert(refreshTokenNonces)
    .values({ userId, nonce, expiresAt })
    .onConflictDoUpdate({
      target: refreshTokenNonces.userId,
      set: { nonce, expiresAt, createdAt: new Date() },
    });

  return nonce;
}

export async function verifyNonce(userId: string, nonce: string): Promise<boolean> {
  const [row] = await db
    .select()
    .from(refreshTokenNonces)
    .where(eq(refreshTokenNonces.userId, userId))
    .limit(1);

  if (!row) return false;
  if (row.nonce !== nonce) return false;
  if (row.expiresAt < new Date()) return false;

  return true;
}

export async function revokeNonce(userId: string): Promise<void> {
  await db.delete(refreshTokenNonces).where(eq(refreshTokenNonces.userId, userId));
}
