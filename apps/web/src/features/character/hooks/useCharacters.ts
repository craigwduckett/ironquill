import type { CharacterCreateInput, CharacterUpdateInput } from '@ironquill/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api.js';
import { useAuthStore } from '../../../stores/auth.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CharacterSummary = {
  id: string;
  name: string;
  level: number;
  hpCurrent: number;
  hpMax: number;
  ac: number;
  portraitId: string | null;
  speciesId: string | null;
  classId: string | null;
};

export type Character = CharacterSummary & {
  xp: number;
  hpTemp: number;
  speed: number;
  proficiencyBonus: number;
  alignment: string | null;
  skillProficiencies: string[];
  abilityScores: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  personality: {
    traits: string;
    ideals: string;
    bonds: string;
    flaws: string;
  } | null;
  appearance: {
    age?: string;
    height?: string;
    description?: string;
  } | null;
  backgroundId: string | null;
  notes: string | null;
  managedBy: 'self' | 'dm';
  createdAt: string;
  updatedAt: string;
};

export type DashboardData = {
  characters: CharacterSummary[];
  adventures: unknown[];
  joinedAdventures: unknown[];
};

// ── Query keys ────────────────────────────────────────────────────────────────

export const characterKeys = {
  all: ['characters'] as const,
  detail: (id: string) => ['characters', id] as const,
  dashboard: ['dashboard'] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useDashboard() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<DashboardData>({
    queryKey: characterKeys.dashboard,
    queryFn: () => api.get<DashboardData>('/dashboard', token ?? undefined),
    enabled: Boolean(token),
  });
}

export function useCharacters() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<Character[]>({
    queryKey: characterKeys.all,
    queryFn: () => api.get<Character[]>('/characters', token ?? undefined),
    enabled: Boolean(token),
  });
}

export function useCharacter(id: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery<Character>({
    queryKey: characterKeys.detail(id),
    queryFn: () => api.get<Character>(`/characters/${id}`, token ?? undefined),
    enabled: Boolean(id) && Boolean(token),
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);

  return useMutation<Character, Error, CharacterCreateInput>({
    mutationFn: (data) => api.post<Character>('/characters', data, token ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: characterKeys.all });
      void queryClient.invalidateQueries({ queryKey: characterKeys.dashboard });
    },
  });
}

export function useUpdateCharacter(id: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);

  return useMutation<Character, Error, CharacterUpdateInput>({
    mutationFn: (data) => api.patch<Character>(`/characters/${id}`, data, token ?? undefined),
    onSuccess: (updated) => {
      queryClient.setQueryData(characterKeys.detail(id), updated);
      void queryClient.invalidateQueries({ queryKey: characterKeys.all });
      void queryClient.invalidateQueries({ queryKey: characterKeys.dashboard });
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);

  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/characters/${id}`, token ?? undefined),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: characterKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: characterKeys.all });
      void queryClient.invalidateQueries({ queryKey: characterKeys.dashboard });
    },
  });
}
