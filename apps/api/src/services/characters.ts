import type { CharacterCreateInput, CharacterUpdateInput } from '@ironquill/shared';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { characters } from '../db/schema/characters.js';
import { AppError } from '../lib/errors.js';

export async function getByUser(userId: string) {
  return db
    .select()
    .from(characters)
    .where(eq(characters.userId, userId))
    .orderBy(characters.createdAt);
}

export async function getById(id: string, requestingUserId: string) {
  const character = await db.query.characters.findFirst({
    where: eq(characters.id, id),
    with: {
      inventory: true,
      spells: true,
    },
  });

  if (!character) throw AppError.notFound('Character');
  if (character.userId !== requestingUserId) throw AppError.forbidden();

  return character;
}

export async function create(userId: string, input: CharacterCreateInput) {
  const [character] = await db
    .insert(characters)
    .values({
      userId,
      name: input.name,
      raceId: input.raceId,
      classId: input.classId,
      backgroundId: input.backgroundId,
      level: input.level,
      abilityScores: input.abilityScores,
      alignment: input.alignment,
      personality: input.personality,
      appearance: input.appearance,
      portraitId: input.portraitId,
      notes: input.notes,
      hpCurrent: 0,
      hpMax: 0,
      ac: 10,
      speed: 30,
      proficiencyBonus: 2,
    })
    .returning();

  return character;
}

export async function update(id: string, userId: string, input: CharacterUpdateInput) {
  const existing = await db.query.characters.findFirst({
    where: and(eq(characters.id, id), eq(characters.userId, userId)),
  });
  if (!existing) throw AppError.notFound('Character');

  const [updated] = await db
    .update(characters)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(characters.id, id))
    .returning();

  return updated;
}

export async function remove(id: string, userId: string) {
  const existing = await db.query.characters.findFirst({
    where: and(eq(characters.id, id), eq(characters.userId, userId)),
  });
  if (!existing) throw AppError.notFound('Character');

  await db.delete(characters).where(eq(characters.id, id));
}
