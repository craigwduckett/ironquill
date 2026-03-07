import type {
  AdventureCreateInput,
  AdventureUpdateInput,
  CharacterPresetCreateInput,
  CharacterPresetUpdateInput,
  EncounterMonsterCreateInput,
  SceneConnectionCreateInput,
  SceneCreateInput,
  SceneNpcCreateInput,
  SceneNpcUpdateInput,
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
  sceneType: 'exploration' | 'social' | 'combat' | 'puzzle' | 'rest' | 'transition';
  narrativeReadAloud: string | null;
  dmNotes: string | null;
  dmTips: string | null;
  loot: LootEntry[] | null;
  orderIndex: number;
  positionX: number | null;
  positionY: number | null;
  backgroundImageId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LootEntry = {
  type: 'item' | 'gold' | 'xp';
  itemId?: string | undefined;
  itemName?: string | undefined;
  quantity: number;
};

export type SceneConnection = {
  id: string;
  fromSceneId: string;
  toSceneId: string;
  label: string | null;
  conditionNotes: string | null;
  createdAt: string;
};

export type Npc = {
  id: string;
  sceneId: string;
  monsterId: string | null;
  customName: string | null;
  customHpMax: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Encounter = {
  id: string;
  sceneId: string;
  difficultyRating: 'easy' | 'medium' | 'hard' | 'deadly' | null;
  terrainNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EncounterMonster = {
  id: string;
  encounterId: string;
  srdMonsterId: string | null;
  customStatBlock: Record<string, unknown> | null;
  quantity: number;
  createdAt: string;
};

export type CharacterPreset = {
  id: string;
  adventureId: string;
  name: string;
  levelOverride: number | null;
  baseCharacterData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

// ── Query keys ────────────────────────────────────────────────────────────────

export const adventureKeys = {
  all: ['adventures'] as const,
  detail: (id: string) => ['adventures', id] as const,
  scenes: (id: string) => ['adventures', id, 'scenes'] as const,
  connections: (id: string) => ['adventures', id, 'connections'] as const,
  npcs: (id: string) => ['adventures', id, 'npcs'] as const,
  encounter: (adventureId: string, sceneId: string) =>
    ['adventures', adventureId, 'scenes', sceneId, 'encounter'] as const,
  encounterMonsters: (adventureId: string, sceneId: string) =>
    ['adventures', adventureId, 'scenes', sceneId, 'encounter', 'monsters'] as const,
  presets: (id: string) => ['adventures', id, 'presets'] as const,
};

// ── Adventure hooks ───────────────────────────────────────────────────────────

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

// ── Scene hooks ───────────────────────────────────────────────────────────────

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

// ── Scene connection hooks ────────────────────────────────────────────────────

export function useConnections(adventureId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<SceneConnection[]>({
    queryKey: adventureKeys.connections(adventureId),
    queryFn: () =>
      api.get<SceneConnection[]>(`/adventures/${adventureId}/connections`, token ?? undefined),
    enabled: Boolean(adventureId) && Boolean(token),
  });
}

export function useCreateConnection(adventureId: string, sceneId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<SceneConnection, Error, SceneConnectionCreateInput>({
    mutationFn: (data) =>
      api.post<SceneConnection>(
        `/adventures/${adventureId}/scenes/${sceneId}/connections`,
        data,
        token ?? undefined,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.connections(adventureId),
      });
    },
  });
}

export function useDeleteConnection(adventureId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<void, Error, { sceneId: string; connectionId: string }>({
    mutationFn: ({ sceneId, connectionId }) =>
      api.delete<void>(
        `/adventures/${adventureId}/scenes/${sceneId}/connections/${connectionId}`,
        token ?? undefined,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.connections(adventureId),
      });
    },
  });
}

// ── NPC hooks ─────────────────────────────────────────────────────────────────

export function useNpcs(adventureId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<Npc[]>({
    queryKey: adventureKeys.npcs(adventureId),
    queryFn: () => api.get<Npc[]>(`/adventures/${adventureId}/npcs`, token ?? undefined),
    enabled: Boolean(adventureId) && Boolean(token),
  });
}

export function useCreateNpc(adventureId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<Npc, Error, SceneNpcCreateInput & { sceneId: string }>({
    mutationFn: ({ sceneId, ...data }) =>
      api.post<Npc>(`/adventures/${adventureId}/scenes/${sceneId}/npcs`, data, token ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.npcs(adventureId),
      });
    },
  });
}

export function useUpdateNpc(adventureId: string, npcId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<Npc, Error, SceneNpcUpdateInput & { sceneId: string }>({
    mutationFn: ({ sceneId, ...data }) =>
      api.patch<Npc>(
        `/adventures/${adventureId}/scenes/${sceneId}/npcs/${npcId}`,
        data,
        token ?? undefined,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.npcs(adventureId),
      });
    },
  });
}

export function useDeleteNpc(adventureId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<void, Error, { sceneId: string; npcId: string }>({
    mutationFn: ({ sceneId, npcId }) =>
      api.delete<void>(
        `/adventures/${adventureId}/scenes/${sceneId}/npcs/${npcId}`,
        token ?? undefined,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.npcs(adventureId),
      });
    },
  });
}

// ── Encounter hooks ───────────────────────────────────────────────────────────

export function useEncounter(adventureId: string, sceneId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<Encounter | null>({
    queryKey: adventureKeys.encounter(adventureId, sceneId),
    queryFn: () =>
      api.get<Encounter | null>(
        `/adventures/${adventureId}/scenes/${sceneId}/encounter`,
        token ?? undefined,
      ),
    enabled: Boolean(adventureId) && Boolean(sceneId) && Boolean(token),
  });
}

export function useEncounterMonsters(adventureId: string, sceneId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<EncounterMonster[]>({
    queryKey: adventureKeys.encounterMonsters(adventureId, sceneId),
    queryFn: () =>
      api.get<EncounterMonster[]>(
        `/adventures/${adventureId}/scenes/${sceneId}/encounter/monsters`,
        token ?? undefined,
      ),
    enabled: Boolean(adventureId) && Boolean(sceneId) && Boolean(token),
  });
}

export function useAddEncounterMonster(adventureId: string, sceneId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<EncounterMonster, Error, EncounterMonsterCreateInput>({
    mutationFn: (data) =>
      api.post<EncounterMonster>(
        `/adventures/${adventureId}/scenes/${sceneId}/encounter/monsters`,
        data,
        token ?? undefined,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.encounterMonsters(adventureId, sceneId),
      });
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.encounter(adventureId, sceneId),
      });
    },
  });
}

export function useRemoveEncounterMonster(adventureId: string, sceneId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<void, Error, string>({
    mutationFn: (monsterId) =>
      api.delete<void>(
        `/adventures/${adventureId}/scenes/${sceneId}/encounter/monsters/${monsterId}`,
        token ?? undefined,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.encounterMonsters(adventureId, sceneId),
      });
    },
  });
}

// ── Kids Mode Preset hooks ────────────────────────────────────────────────────

export function usePresets(adventureId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<CharacterPreset[]>({
    queryKey: adventureKeys.presets(adventureId),
    queryFn: () =>
      api.get<CharacterPreset[]>(`/adventures/${adventureId}/presets`, token ?? undefined),
    enabled: Boolean(adventureId) && Boolean(token),
  });
}

export function useCreatePreset(adventureId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<CharacterPreset, Error, CharacterPresetCreateInput>({
    mutationFn: (data) =>
      api.post<CharacterPreset>(`/adventures/${adventureId}/presets`, data, token ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.presets(adventureId),
      });
    },
  });
}

export function useUpdatePreset(adventureId: string, presetId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<CharacterPreset, Error, CharacterPresetUpdateInput>({
    mutationFn: (data) =>
      api.patch<CharacterPreset>(
        `/adventures/${adventureId}/presets/${presetId}`,
        data,
        token ?? undefined,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.presets(adventureId),
      });
    },
  });
}

export function useDeletePreset(adventureId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation<void, Error, string>({
    mutationFn: (presetId) =>
      api.delete<void>(`/adventures/${adventureId}/presets/${presetId}`, token ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adventureKeys.presets(adventureId),
      });
    },
  });
}
