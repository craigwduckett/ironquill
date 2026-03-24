import type { Scene } from '../hooks/useAdventures.js';

type SceneType = Scene['sceneType'];

export type BackgroundTag =
  | 'environment'
  | 'interior'
  | 'night'
  | 'weather'
  | 'abstract'
  | 'combat'
  | 'social'
  | 'exploration'
  | 'rest'
  | 'puzzle';

export interface BackgroundEntry {
  id: string;
  label: string;
  src: string;
  tags: BackgroundTag[];
}

export const BACKGROUND_LIBRARY: BackgroundEntry[] = [
  // ── Original scene-type defaults ─────────────────────────────────────────
  {
    id: 'default:exploration',
    label: 'Ancient Forest',
    src: '/assets/scene-backgrounds/exploration.jpg',
    tags: ['exploration', 'environment'],
  },
  {
    id: 'default:social',
    label: 'Tavern',
    src: '/assets/scene-backgrounds/social.jpg',
    tags: ['social', 'interior'],
  },
  {
    id: 'default:combat',
    label: 'Battlefield',
    src: '/assets/scene-backgrounds/combat.jpg',
    tags: ['combat', 'environment'],
  },
  {
    id: 'default:puzzle',
    label: 'Arcane Chamber',
    src: '/assets/scene-backgrounds/puzzle.jpg',
    tags: ['puzzle', 'interior'],
  },
  {
    id: 'default:rest',
    label: 'Woodland Glade',
    src: '/assets/scene-backgrounds/rest.jpg',
    tags: ['rest', 'environment'],
  },
  {
    id: 'default:transition',
    label: 'Mountain Road',
    src: '/assets/scene-backgrounds/transition.jpg',
    tags: ['exploration', 'environment'],
  },

  // ── Environments ─────────────────────────────────────────────────────────
  {
    id: 'default:dungeon',
    label: 'Dungeon Corridor',
    src: '/assets/scene-backgrounds/dungeon.jpg',
    tags: ['exploration', 'interior', 'combat'],
  },
  {
    id: 'default:cave',
    label: 'Crystal Cave',
    src: '/assets/scene-backgrounds/cave.jpg',
    tags: ['exploration', 'environment'],
  },
  {
    id: 'default:underwater',
    label: 'Sunken Ruins',
    src: '/assets/scene-backgrounds/underwater.jpg',
    tags: ['exploration', 'environment'],
  },
  {
    id: 'default:sky-airship',
    label: 'Airship Deck',
    src: '/assets/scene-backgrounds/sky-airship.jpg',
    tags: ['exploration', 'social', 'environment'],
  },
  {
    id: 'default:volcano',
    label: 'Volcanic Wastes',
    src: '/assets/scene-backgrounds/volcano.jpg',
    tags: ['combat', 'environment'],
  },
  {
    id: 'default:arctic',
    label: 'Arctic Tundra',
    src: '/assets/scene-backgrounds/arctic.jpg',
    tags: ['exploration', 'environment'],
  },
  {
    id: 'default:mountain-pass',
    label: 'Mountain Pass',
    src: '/assets/scene-backgrounds/mountain-pass.jpg',
    tags: ['exploration', 'environment'],
  },

  // ── Interiors ────────────────────────────────────────────────────────────
  {
    id: 'default:throne-room',
    label: 'Throne Room',
    src: '/assets/scene-backgrounds/throne-room.jpg',
    tags: ['social', 'interior'],
  },
  {
    id: 'default:library',
    label: 'Arcane Library',
    src: '/assets/scene-backgrounds/library.jpg',
    tags: ['puzzle', 'interior', 'social'],
  },
  {
    id: 'default:temple',
    label: 'Temple',
    src: '/assets/scene-backgrounds/temple.jpg',
    tags: ['social', 'interior', 'rest'],
  },
  {
    id: 'default:market',
    label: 'Market Street',
    src: '/assets/scene-backgrounds/market.jpg',
    tags: ['social', 'environment'],
  },
  {
    id: 'default:guild-hall',
    label: 'Guild Hall',
    src: '/assets/scene-backgrounds/guild-hall.jpg',
    tags: ['social', 'interior'],
  },
  {
    id: 'default:prison',
    label: 'Prison Cell',
    src: '/assets/scene-backgrounds/prison.jpg',
    tags: ['interior', 'combat'],
  },
  {
    id: 'default:night-tavern',
    label: 'Tavern at Night',
    src: '/assets/scene-backgrounds/night-tavern.jpg',
    tags: ['social', 'interior', 'night'],
  },

  // ── Night / time variants ────────────────────────────────────────────────
  {
    id: 'default:night-forest',
    label: 'Night Forest',
    src: '/assets/scene-backgrounds/night-forest.jpg',
    tags: ['exploration', 'environment', 'night'],
  },
  {
    id: 'default:moonlit-clearing',
    label: 'Moonlit Clearing',
    src: '/assets/scene-backgrounds/moonlit-clearing.jpg',
    tags: ['exploration', 'rest', 'night'],
  },
  {
    id: 'default:dawn-battlefield',
    label: 'Dawn Battlefield',
    src: '/assets/scene-backgrounds/dawn-battlefield.jpg',
    tags: ['combat', 'environment'],
  },

  // ── Weather / mood ───────────────────────────────────────────────────────
  {
    id: 'default:stormy-forest',
    label: 'Stormy Forest',
    src: '/assets/scene-backgrounds/stormy-forest.jpg',
    tags: ['exploration', 'environment', 'weather', 'combat'],
  },
  {
    id: 'default:misty-ruins',
    label: 'Misty Ruins',
    src: '/assets/scene-backgrounds/misty-ruins.jpg',
    tags: ['exploration', 'environment', 'weather'],
  },
  {
    id: 'default:blizzard',
    label: 'Blizzard Pass',
    src: '/assets/scene-backgrounds/blizzard.jpg',
    tags: ['exploration', 'environment', 'weather'],
  },

  // ── Abstract / atmosphere ────────────────────────────────────────────────
  {
    id: 'default:dark-void',
    label: 'Dark Void',
    src: '/assets/scene-backgrounds/dark-void.jpg',
    tags: ['abstract', 'combat'],
  },
  {
    id: 'default:sanctuary',
    label: 'Sanctuary',
    src: '/assets/scene-backgrounds/sanctuary.jpg',
    tags: ['abstract', 'rest'],
  },
  {
    id: 'default:arcane',
    label: 'Arcane Realm',
    src: '/assets/scene-backgrounds/arcane.jpg',
    tags: ['abstract', 'puzzle'],
  },
  {
    id: 'default:triumphant',
    label: 'Triumphant Sky',
    src: '/assets/scene-backgrounds/triumphant.jpg',
    tags: ['abstract', 'exploration'],
  },
];

/** Scene-type defaults used as the initial/suggested pick when creating a new scene. */
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
 * - `default:{key}` → static bundled asset path from the library
 * - anything else → treated as a full R2 public URL (stored after custom upload)
 */
export function resolveBackgroundSrc(backgroundImageId: string | null): string | null {
  if (!backgroundImageId) return null;
  if (backgroundImageId.startsWith('default:')) {
    const entry = BACKGROUND_LIBRARY.find((b) => b.id === backgroundImageId);
    return entry?.src ?? null;
  }
  return backgroundImageId;
}

export function isDefaultBackground(backgroundImageId: string | null): boolean {
  return backgroundImageId?.startsWith('default:') ?? false;
}
