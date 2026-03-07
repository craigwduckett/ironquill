import type {
  AdventureCreateInput,
  AdventureUpdateInput,
  SceneCreateInput,
  SceneUpdateInput,
} from '@ironquill/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api.js';
import { useAuthStore } from '../../../stores/auth.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AdventureSummary = {
  id: string;
  title: string;
  adventureType: 'campaign' | 'one_shot';
  ruleset: 'standard' | 'kids' | 'custom';
  status: 'draft' | 'active' | 'completed';
  levelRangeMin: number;
  levelRangeMax: number;
  coverImageId: string | null;
  updatedAt: string;
};

export type Adventure = AdventureSummary & {
  description: string | null;
  setting: string | null;
  playerCapacityMin: number;
  playerCapacityMax: number;
  inviteCode: string | null;
  ownerId: string;
  createdAt: string;
};

export type Scene = {
  id: string;
  adventureId: string;
  title: string;
  narrativeReadAloud: string | null;
  dmNotes: string | null;
  orderIndex: number;
  backgroundImageId: string | null;
  createdAt: string;
  updatedAt: string;
};

// ── Query keys ────────────────────────────────────────────────────────────────

export const adventureKeys = {
  all: ['adventures'] as const,
  detail: (id: string) => ['adventures', id] as const,
  scenes: (id: string) => ['adventures', id, 'scenes'] as const,
  npcs: (id: string) => ['adventures', id, 'npcs'] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAdventures() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<AdventureSummary[]>({
    queryKey: adventureKeys.all,
    queryFn: () => api.get<AdventureSummary[]>('/adventures', token ?? undefined),
    enabled: Boolean(token),
  });
}

export function useAdventure(id: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<Adventure>({
    queryKey: adventureKeys.detail(id),
    queryFn: () => api.get<Adventure>(`/adventures/${id}`, token ?? undefined),
    enabled: Boolean(id) && Boolean(token),
  });
}

export function useCreateAdventure() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<Adventure, Error, AdventureCreateInput>({
    mutationFn: (data) => api.post<Adventure>('/adventures', data, token ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adventureKeys.all });
    },
  });
}

export function useUpdateAdventure(id: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<Adventure, Error, AdventureUpdateInput>({
    mutationFn: (data) => api.patch<Adventure>(`/adventures/${id}`, data, token ?? undefined),
    onSuccess: (updated) => {
      queryClient.setQueryData(adventureKeys.detail(id), updated);
      void queryClient.invalidateQueries({ queryKey: adventureKeys.all });
    },
  });
}

export function useDeleteAdventure() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/adventures/${id}`, token ?? undefined),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: adventureKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: adventureKeys.all });
    },
  });
}

export function useGenerateInvite(id: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<{ inviteCode: string }, Error, void>({
    mutationFn: () =>
      api.post<{ inviteCode: string }>(`/adventures/${id}/invite`, {}, token ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.detail(id),
      });
    },
  });
}

export function useJoinAdventure() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<unknown, Error, { inviteCode: string; characterId?: string }>({
    mutationFn: (data) => api.post('/adventures/join', data, token ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useScenes(adventureId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<Scene[]>({
    queryKey: adventureKeys.scenes(adventureId),
    queryFn: () => api.get<Scene[]>(`/adventures/${adventureId}/scenes`, token ?? undefined),
    enabled: Boolean(adventureId) && Boolean(token),
  });
}

export function useCreateScene(adventureId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<Scene, Error, SceneCreateInput>({
    mutationFn: (data) =>
      api.post<Scene>(`/adventures/${adventureId}/scenes`, data, token ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.scenes(adventureId),
      });
    },
  });
}

export function useUpdateScene(adventureId: string, sceneId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<Scene, Error, SceneUpdateInput>({
    mutationFn: (data) =>
      api.patch<Scene>(`/adventures/${adventureId}/scenes/${sceneId}`, data, token ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.scenes(adventureId),
      });
    },
  });
}

export function useDeleteScene(adventureId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<void, Error, string>({
    mutationFn: (sceneId) =>
      api.delete<void>(`/adventures/${adventureId}/scenes/${sceneId}`, token ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.scenes(adventureId),
      });
    },
  });
}
