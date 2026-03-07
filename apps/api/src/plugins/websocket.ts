import type { ClientToServerEvents, ServerToClientEvents } from '@ironquill/shared';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Server, type Socket } from 'socket.io';
import { db } from '../db/client.js';
import { sessions } from '../db/schema/sessions.js';

// ── Room helpers ──────────────────────────────────────────────────────────────

function sessionRoom(sessionId: string): string {
  return `session:${sessionId}`;
}

// ── Plugin ────────────────────────────────────────────────────────────────────

type AuthenticatedSocket = Socket<ClientToServerEvents, ServerToClientEvents> & {
  data: {
    userId: string;
    displayName: string;
  };
};

declare module 'fastify' {
  interface FastifyInstance {
    io: Server<ClientToServerEvents, ServerToClientEvents>;
  }
}

export default fp(async function websocketPlugin(app: FastifyInstance) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(app.server, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? ['https://ironquill.app']
          : ['http://localhost:5173'],
      credentials: true,
    },
  });

  // Auth middleware — client sends access token in handshake.auth.token
  io.use((socket, next) => {
    const token = (socket.handshake.auth as { token?: string }).token;
    if (!token) {
      return next(new Error('No auth token provided'));
    }

    try {
      // Verify using the same JWT secret as Fastify
      const payload = app.jwt.verify<{ sub: string; displayName: string }>(token);
      (socket as AuthenticatedSocket).data.userId = payload.sub;
      (socket as AuthenticatedSocket).data.displayName = payload.displayName;
      return next();
    } catch {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const { userId, displayName } = socket.data;

    app.log.info({ userId }, 'WebSocket client connected');

    // ── session:join ─────────────────────────────────────────────────────────
    socket.on('session:join', async ({ sessionId, characterId }) => {
      const room = sessionRoom(sessionId);
      await socket.join(room);

      // Notify others in the session
      socket.to(room).emit('player:joined', {
        userId,
        characterId,
        displayName,
      });

      // Resync current session state to the newly joined client
      const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);

      if (session?.currentSceneId) {
        socket.emit('scene:change', {
          sceneId: session.currentSceneId,
          narrativeReadAloud: null,
        });
      }
    });

    // ── session:leave ─────────────────────────────────────────────────────────
    socket.on('session:leave', async ({ sessionId }) => {
      const room = sessionRoom(sessionId);
      await socket.leave(room);
      socket.to(room).emit('player:left', { userId });
    });

    // ── roll:log ─────────────────────────────────────────────────────────────
    // Player logs a dice roll — broadcast to DM room for transparency
    socket.on('roll:log', (data) => {
      const rooms = Array.from(socket.rooms);
      const sessionRoom = rooms.find((r) => r.startsWith('session:') && !r.endsWith(':dm'));
      if (!sessionRoom) return;
      io.to(`${sessionRoom}:dm`).emit('player:joined', {
        userId,
        characterId: data.characterId,
        displayName,
      });
    });

    socket.on('disconnect', (reason) => {
      app.log.info({ userId, reason }, 'WebSocket client disconnected');
    });
  });

  // Decorate Fastify instance so routes can emit events
  app.decorate('io', io);
});
