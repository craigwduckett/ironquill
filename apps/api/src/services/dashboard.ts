import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { adventurePlayers, adventures } from '../db/schema/adventures.js';
import { characters } from '../db/schema/characters.js';

export async function getDashboard(userId: string) {
  const [myCharacters, myAdventures, myJoined] = await Promise.all([
    db
      .select({
        id: characters.id,
        name: characters.name,
        level: characters.level,
        hpCurrent: characters.hpCurrent,
        hpMax: characters.hpMax,
        ac: characters.ac,
        portraitId: characters.portraitId,
        speciesId: characters.speciesId,
        classId: characters.classId,
      })
      .from(characters)
      .where(eq(characters.userId, userId))
      .orderBy(characters.updatedAt),

    db
      .select({
        id: adventures.id,
        title: adventures.title,
        adventureType: adventures.adventureType,
        ruleset: adventures.ruleset,
        status: adventures.status,
        levelRangeMin: adventures.levelRangeMin,
        levelRangeMax: adventures.levelRangeMax,
        coverImageId: adventures.coverImageId,
        updatedAt: adventures.updatedAt,
      })
      .from(adventures)
      .where(eq(adventures.ownerId, userId))
      .orderBy(adventures.updatedAt),

    db
      .select({
        id: adventures.id,
        title: adventures.title,
        adventureType: adventures.adventureType,
        ruleset: adventures.ruleset,
        status: adventures.status,
        coverImageId: adventures.coverImageId,
        role: adventurePlayers.role,
      })
      .from(adventurePlayers)
      .innerJoin(adventures, eq(adventurePlayers.adventureId, adventures.id))
      .where(eq(adventurePlayers.userId, userId)),
  ]);

  return {
    characters: myCharacters,
    adventures: myAdventures,
    joinedAdventures: myJoined,
  };
}
