import type { Scene } from '../hooks/useAdventures.js';

type SceneType = Scene['sceneType'];

export const DEFAULT_BACKGROUNDS: Record<SceneType, string> = {
  exploration: '/assets/scene-backgrounds/exploration.jpg',
  social: '/assets/scene-backgrounds/social.jpg',
  combat: '/assets/scene-backgrounds/combat.jpg',
  puzzle: '/assets/scene-backgrounds/puzzle.jpg',
  rest: '/assets/scene-backgrounds/rest.jpg',
  transition: '/assets/scene-backgrounds/transition.jpg',
};

export const DEFAULT_BACKGROUND_IDS: Record<SceneType, string> = {
  exploration: 'default:exploration',
  social: 'default:social',
  combat: 'default:combat',
  puzzle: 'default:puzzle',
  rest: 'default:rest',
  transition: 'default:transition',
};

/**
 * Resolves a backgroundImageId to a displayable image src.
 *
 * - `null` → no background
 * - `default:{sceneType}` → static bundled asset path
 * - `scene-bg/{...}` → R2 public URL (stored as-is in backgroundImageId after upload)
 */
export function resolveBackgroundSrc(backgroundImageId: string | null): string | null {
  if (!backgroundImageId) return null;
  if (backgroundImageId.startsWith('default:')) {
    const type = backgroundImageId.slice('default:'.length) as SceneType;
    return DEFAULT_BACKGROUNDS[type] ?? null;
  }
  return backgroundImageId;
}

export function isDefaultBackground(backgroundImageId: string | null): boolean {
  return backgroundImageId?.startsWith('default:') ?? false;
}
