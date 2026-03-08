import {
  AdventureCreateSchema,
  AdventureUpdateSchema,
  CharacterPresetCreateSchema,
  CharacterPresetUpdateSchema,
  EncounterCreateSchema,
  EncounterMonsterCreateSchema,
  EncounterUpdateSchema,
  SceneConnectionCreateSchema,
  SceneCreateSchema,
  SceneNpcCreateSchema,
  SceneNpcUpdateSchema,
  SceneUpdateSchema,
} from '@ironquill/shared';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import * as storage from '../../lib/storage.js';
import * as adventureService from '../../services/adventures.js';

const IdParam = z.object({ id: z.string().uuid() });
const SceneParam = z.object({
  id: z.string().uuid(),
  sceneId: z.string().uuid(),
});
const PresetParam = z.object({
  id: z.string().uuid(),
  presetId: z.string().uuid(),
});
const ConnectionParam = z.object({
  id: z.string().uuid(),
  sceneId: z.string().uuid(),
  connectionId: z.string().uuid(),
});
const MonsterEntryParam = z.object({
  id: z.string().uuid(),
  sceneId: z.string().uuid(),
  monsterId: z.string().uuid(),
});
const NpcParam = z.object({
  id: z.string().uuid(),
  sceneId: z.string().uuid(),
  npcId: z.string().uuid(),
});

const adventureRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // ── Adventures ────────────────────────────────────────────────────────────

  app.get('/', { preHandler: [app.authenticate] }, async (request) =>
    adventureService.listByOwner(request.user.sub),
  );

  app.get(
    '/:id',
    { preHandler: [app.authenticate], schema: { params: IdParam } },
    async (request) => adventureService.getById(request.params.id, request.user.sub),
  );

  app.post(
    '/',
    { preHandler: [app.authenticate], schema: { body: AdventureCreateSchema } },
    async (request, reply) => {
      const adventure = await adventureService.create(request.user.sub, request.body);
      return reply.code(201).send(adventure);
    },
  );

  app.patch(
    '/:id',
    {
      preHandler: [app.authenticate],
      schema: { params: IdParam, body: AdventureUpdateSchema },
    },
    async (request) => adventureService.update(request.params.id, request.user.sub, request.body),
  );

  app.delete(
    '/:id',
    { preHandler: [app.authenticate], schema: { params: IdParam } },
    async (request, reply) => {
      await adventureService.remove(request.params.id, request.user.sub);
      return reply.code(204).send();
    },
  );

  // ── Invite code ───────────────────────────────────────────────────────────

  app.post(
    '/:id/invite',
    { preHandler: [app.authenticate], schema: { params: IdParam } },
    async (request) => adventureService.generateInvite(request.params.id, request.user.sub),
  );

  app.post(
    '/join',
    {
      preHandler: [app.authenticate],
      schema: {
        body: z.object({
          inviteCode: z.string().min(1),
          characterId: z.string().uuid().optional(),
        }),
      },
    },
    async (request, reply) => {
      const result = await adventureService.joinByInviteCode(
        request.body.inviteCode,
        request.user.sub,
        request.body.characterId,
      );
      return reply.code(201).send(result);
    },
  );

  // ── Scenes ────────────────────────────────────────────────────────────────

  app.get(
    '/:id/scenes',
    { preHandler: [app.authenticate], schema: { params: IdParam } },
    async (request) => adventureService.listScenes(request.params.id, request.user.sub),
  );

  app.post(
    '/:id/scenes',
    {
      preHandler: [app.authenticate],
      schema: { params: IdParam, body: SceneCreateSchema },
    },
    async (request, reply) => {
      const scene = await adventureService.createScene(
        request.params.id,
        request.user.sub,
        request.body,
      );
      return reply.code(201).send(scene);
    },
  );

  app.patch(
    '/:id/scenes/:sceneId',
    {
      preHandler: [app.authenticate],
      schema: { params: SceneParam, body: SceneUpdateSchema },
    },
    async (request) =>
      adventureService.updateScene(
        request.params.id,
        request.params.sceneId,
        request.user.sub,
        request.body,
      ),
  );

  app.delete(
    '/:id/scenes/:sceneId',
    {
      preHandler: [app.authenticate],
      schema: { params: SceneParam },
    },
    async (request, reply) => {
      await adventureService.removeScene(
        request.params.id,
        request.params.sceneId,
        request.user.sub,
      );
      return reply.code(204).send();
    },
  );

  // Returns a presigned URL for direct client-to-storage scene background upload.
  // The client uploads directly to R2/MinIO — binary never passes through the API.
  app.post(
    '/:id/scenes/:sceneId/background/upload-url',
    {
      preHandler: [app.authenticate],
      schema: {
        params: SceneParam,
        body: z.object({
          contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
        }),
      },
    },
    async (request) => {
      await adventureService.getById(request.params.id, request.user.sub);
      const ext = request.body.contentType.split('/')[1] ?? 'jpg';
      const key = storage.sceneBackgroundKey(request.params.id, request.params.sceneId, ext);
      const uploadUrl = await storage.getPresignedUploadUrl(key, request.body.contentType);
      const publicUrl = `${process.env.STORAGE_PUBLIC_URL}/${key}`;
      return { uploadUrl, publicUrl, key };
    },
  );

  // ── Scene connections ─────────────────────────────────────────────────────

  app.get(
    '/:id/connections',
    { preHandler: [app.authenticate], schema: { params: IdParam } },
    async (request) => adventureService.listConnections(request.params.id, request.user.sub),
  );

  app.post(
    '/:id/scenes/:sceneId/connections',
    {
      preHandler: [app.authenticate],
      schema: { params: SceneParam, body: SceneConnectionCreateSchema },
    },
    async (request, reply) => {
      const connection = await adventureService.createConnection(
        request.params.id,
        request.params.sceneId,
        request.user.sub,
        request.body,
      );
      return reply.code(201).send(connection);
    },
  );

  app.delete(
    '/:id/scenes/:sceneId/connections/:connectionId',
    {
      preHandler: [app.authenticate],
      schema: { params: ConnectionParam },
    },
    async (request, reply) => {
      await adventureService.removeConnection(
        request.params.id,
        request.params.connectionId,
        request.user.sub,
      );
      return reply.code(204).send();
    },
  );

  // ── NPCs ──────────────────────────────────────────────────────────────────

  app.get(
    '/:id/npcs',
    { preHandler: [app.authenticate], schema: { params: IdParam } },
    async (request) => adventureService.listNpcs(request.params.id, request.user.sub),
  );

  app.post(
    '/:id/scenes/:sceneId/npcs',
    {
      preHandler: [app.authenticate],
      schema: { params: SceneParam, body: SceneNpcCreateSchema },
    },
    async (request, reply) => {
      const npc = await adventureService.createNpc(
        request.params.id,
        request.params.sceneId,
        request.user.sub,
        request.body,
      );
      return reply.code(201).send(npc);
    },
  );

  app.patch(
    '/:id/scenes/:sceneId/npcs/:npcId',
    {
      preHandler: [app.authenticate],
      schema: { params: NpcParam, body: SceneNpcUpdateSchema },
    },
    async (request) =>
      adventureService.updateNpc(
        request.params.id,
        request.params.npcId,
        request.user.sub,
        request.body,
      ),
  );

  app.delete(
    '/:id/scenes/:sceneId/npcs/:npcId',
    {
      preHandler: [app.authenticate],
      schema: { params: NpcParam },
    },
    async (request, reply) => {
      await adventureService.removeNpc(request.params.id, request.params.npcId, request.user.sub);
      return reply.code(204).send();
    },
  );

  // ── Encounters ────────────────────────────────────────────────────────────

  app.get(
    '/:id/scenes/:sceneId/encounter',
    { preHandler: [app.authenticate], schema: { params: SceneParam } },
    async (request) =>
      adventureService.getEncounter(request.params.id, request.params.sceneId, request.user.sub),
  );

  app.post(
    '/:id/scenes/:sceneId/encounter',
    {
      preHandler: [app.authenticate],
      schema: { params: SceneParam, body: EncounterCreateSchema },
    },
    async (request, reply) => {
      const encounter = await adventureService.createEncounter(
        request.params.id,
        request.params.sceneId,
        request.user.sub,
        request.body,
      );
      return reply.code(201).send(encounter);
    },
  );

  app.patch(
    '/:id/scenes/:sceneId/encounter',
    {
      preHandler: [app.authenticate],
      schema: { params: SceneParam, body: EncounterUpdateSchema },
    },
    async (request) =>
      adventureService.updateEncounter(
        request.params.id,
        request.params.sceneId,
        request.user.sub,
        request.body,
      ),
  );

  app.get(
    '/:id/scenes/:sceneId/encounter/monsters',
    { preHandler: [app.authenticate], schema: { params: SceneParam } },
    async (request) =>
      adventureService.listEncounterMonsters(
        request.params.id,
        request.params.sceneId,
        request.user.sub,
      ),
  );

  app.post(
    '/:id/scenes/:sceneId/encounter/monsters',
    {
      preHandler: [app.authenticate],
      schema: { params: SceneParam, body: EncounterMonsterCreateSchema },
    },
    async (request, reply) => {
      const monster = await adventureService.addEncounterMonster(
        request.params.id,
        request.params.sceneId,
        request.user.sub,
        request.body,
      );
      return reply.code(201).send(monster);
    },
  );

  app.delete(
    '/:id/scenes/:sceneId/encounter/monsters/:monsterId',
    {
      preHandler: [app.authenticate],
      schema: { params: MonsterEntryParam },
    },
    async (request, reply) => {
      await adventureService.removeEncounterMonster(
        request.params.id,
        request.params.monsterId,
        request.user.sub,
      );
      return reply.code(204).send();
    },
  );

  // ── Kids Mode Presets ─────────────────────────────────────────────────────

  app.get(
    '/:id/presets',
    { preHandler: [app.authenticate], schema: { params: IdParam } },
    async (request) => adventureService.listPresets(request.params.id, request.user.sub),
  );

  app.post(
    '/:id/presets',
    {
      preHandler: [app.authenticate],
      schema: { params: IdParam, body: CharacterPresetCreateSchema },
    },
    async (request, reply) => {
      const preset = await adventureService.createPreset(
        request.params.id,
        request.user.sub,
        request.body,
      );
      return reply.code(201).send(preset);
    },
  );

  app.patch(
    '/:id/presets/:presetId',
    {
      preHandler: [app.authenticate],
      schema: { params: PresetParam, body: CharacterPresetUpdateSchema },
    },
    async (request) =>
      adventureService.updatePreset(
        request.params.id,
        request.params.presetId,
        request.user.sub,
        request.body,
      ),
  );

  app.delete(
    '/:id/presets/:presetId',
    {
      preHandler: [app.authenticate],
      schema: { params: PresetParam },
    },
    async (request, reply) => {
      await adventureService.removePreset(
        request.params.id,
        request.params.presetId,
        request.user.sub,
      );
      return reply.code(204).send();
    },
  );
};

export default adventureRoutes;
