import { eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/client.js';
import { characters } from '../../db/schema/characters.js';

const dashboardRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: [app.authenticate] }, async (request) => {
    const userId = request.user.sub;

    const myCharacters = await db
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
      .orderBy(characters.updatedAt);

    return {
      characters: myCharacters,
      adventures: [],
      joinedAdventures: [],
    };
  });
};

export default dashboardRoutes;
