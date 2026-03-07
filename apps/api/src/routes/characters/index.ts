import { CharacterCreateSchema, CharacterUpdateSchema } from '@ironquill/shared';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import * as characterService from '../../services/characters.js';

const IdParamSchema = z.object({ id: z.string().uuid() });

const characterRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/', { preHandler: [app.authenticate] }, async (request) =>
    characterService.getByUser(request.user.sub),
  );

  app.get(
    '/:id',
    { preHandler: [app.authenticate], schema: { params: IdParamSchema } },
    async (request) => characterService.getById(request.params.id, request.user.sub),
  );

  app.post(
    '/',
    { preHandler: [app.authenticate], schema: { body: CharacterCreateSchema } },
    async (request, reply) => {
      const character = await characterService.create(request.user.sub, request.body);
      return reply.code(201).send(character);
    },
  );

  app.patch(
    '/:id',
    {
      preHandler: [app.authenticate],
      schema: { params: IdParamSchema, body: CharacterUpdateSchema },
    },
    async (request) => characterService.update(request.params.id, request.user.sub, request.body),
  );

  app.delete(
    '/:id',
    { preHandler: [app.authenticate], schema: { params: IdParamSchema } },
    async (request, reply) => {
      await characterService.remove(request.params.id, request.user.sub);
      return reply.code(204).send();
    },
  );
};

export default characterRoutes;
