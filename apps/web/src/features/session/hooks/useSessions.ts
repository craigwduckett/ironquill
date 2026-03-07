import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/auth.js';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function authHeaders() {
  const token = useAuthStore.getState().accessToken;
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// ── Types ──────────────────────────────────────────────────────────────────────

export type Session = {
  id: string;
  adventureId: string;
  currentSceneId: string | null;
  status: 'lobby' | 'active' | 'paused' | 'ended';
  startedAt: string | null;
  endedAt: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InitiativeEntry = {
  id: string;
  label: string;
  initiative: number;
  characterId: string | null;
  npcId: string | null;
  isCurrent: boolean;
};

export type SessionCombat = {
  id: string;
  sessionId: string;
  round: number;
  isActive: number;
  initiativeOrder: InitiativeEntry[];
};

// ── Keys ───────────────────────────────────────────────────────────────────────

export const sessionKeys = {
  byAdventure: (adventureId: string) => ['sessions', 'adventure', adventureId] as const,
  detail: (id: string) => ['sessions', id] as const,
  combat: (id: string) => ['sessions', id, 'combat'] as const,
};

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useSessionsByAdventure(adventureId: string) {
  return useQuery({
    queryKey: sessionKeys.byAdventure(adventureId),
    queryFn: async (): Promise<Session[]> => {
      const res = await fetch(`${API}/sessions/adventure/${adventureId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load sessions');
      return res.json();
    },
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: async (): Promise<Session> => {
      const res = await fetch(`${API}/sessions/${sessionId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load session');
      return res.json();
    },
    refetchInterval: 5000,
  });
}

export function useCreateSession(adventureId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<Session> => {
      const res = await fetch(`${API}/sessions/adventure/${adventureId}`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to create session');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.byAdventure(adventureId) }),
  });
}

export function useStartSession(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<Session> => {
      const res = await fetch(`${API}/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to start session');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) }),
  });
}

export function usePauseSession(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<Session> => {
      const res = await fetch(`${API}/sessions/${sessionId}/pause`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to pause session');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) }),
  });
}

export function useEndSession(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (summary?: string): Promise<Session> => {
      const res = await fetch(`${API}/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ summary }),
      });
      if (!res.ok) throw new Error('Failed to end session');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) }),
  });
}

export function useSetScene(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sceneId: string): Promise<Session> => {
      const res = await fetch(`${API}/sessions/${sessionId}/scene`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ sceneId }),
      });
      if (!res.ok) throw new Error('Failed to set scene');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) }),
  });
}

export function useSessionCombat(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.combat(sessionId),
    queryFn: async (): Promise<SessionCombat | null> => {
      const res = await fetch(`${API}/sessions/${sessionId}/combat`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load combat');
      return res.json();
    },
    refetchInterval: 3000,
  });
}

export function useStartCombat(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (initiativeOrder: InitiativeEntry[]): Promise<SessionCombat> => {
      const res = await fetch(`${API}/sessions/${sessionId}/combat/start`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ initiativeOrder }),
      });
      if (!res.ok) throw new Error('Failed to start combat');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.combat(sessionId) }),
  });
}

export function useAdvanceTurn(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<SessionCombat> => {
      const res = await fetch(`${API}/sessions/${sessionId}/combat/advance`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to advance turn');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.combat(sessionId) }),
  });
}

export function useEndCombat(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const res = await fetch(`${API}/sessions/${sessionId}/combat`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to end combat');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.combat(sessionId) }),
  });
}
