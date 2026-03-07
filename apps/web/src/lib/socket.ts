import type { ClientToServerEvents, ServerToClientEvents } from '@ironquill/shared';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth.js';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:3000';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (socket?.connected) return socket;

  const token = useAuthStore.getState().accessToken;

  socket = io(WS_URL, {
    auth: { token },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect_error', (err) => {
    // Token may have expired — refresh and retry with the latest access token
    if (err.message === 'Invalid or expired token') {
      const { accessToken } = useAuthStore.getState();
      if (socket && accessToken) {
        (socket.auth as { token: string }).token = accessToken;
        socket.connect();
      }
    }
  });

  return socket;
}

export function connectSocket(): void {
  getSocket().connect();
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function joinSession(sessionId: string, characterId: string): void {
  getSocket().emit('session:join', { sessionId, characterId });
}

export function leaveSession(sessionId: string): void {
  getSocket().emit('session:leave', { sessionId });
}
