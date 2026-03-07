/**
 * Source: 5e-bits/5e-database (MIT License) — https://github.com/5e-bits/5e-database
 * SRD 5.1 content © 2016 Wizards of the Coast LLC, used under OGL 1.0a
 * SRD 5.2 content © 2024 Wizards of the Coast LLC, used under CC-BY-4.0
 * IronQuill is not affiliated with Wizards of the Coast LLC or Hasbro Inc.
 */

/**
 * Transformers for the unified srd_species table.
 *
 * 2014: Called "Race" — ability score bonuses are fixed per race.
 * 2024: Called "Species" — no fixed ASIs (those moved to Backgrounds).
 *
 * Both editions share one table. The `displayTerm` column ('Race' | 'Species')
 * tells the UI which word to use for labels, headings, and filters.
 *
 * When 2024 Species data is released in 5e-bits/5e-database:
 *   1. Download src/2024/5e-SRD-Species.json → data/2024/species.json
 *   2. Add transformSpecies2024() below
 *   3. Add a 2024 seeding block in seed/index.ts
 */

type RawAbilityBonus = {
  ability_score: { index: string; name: string };
  bonus: number;
};

type RawTrait = {
  index: string;
  name: string;
  url: string;
};

type RawLanguage = {
  index: string;
  name: string;
  url: string;
};

export type RawRace2014 = {
  index: string;
  name: string;
  speed: number;
  size: string;
  alignment?: string;
  age?: string;
  size_description?: string;
  ability_bonuses: RawAbilityBonus[];
  traits: RawTrait[];
  languages: RawLanguage[];
  language_desc?: string;
};

const ABILITY_INDEX_MAP: Record<string, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
};

export function transformRace2014(raw: RawRace2014) {
  const abilityBonuses: Record<string, number> = {};
  for (const ab of raw.ability_bonuses) {
    const key = ABILITY_INDEX_MAP[ab.ability_score.index] ?? ab.ability_score.name;
    abilityBonuses[key] = ab.bonus;
  }

  const description = [raw.alignment, raw.age, raw.size_description].filter(Boolean).join(' ');

  return {
    sourceEdition: '2014' as const,
    displayTerm: 'Race' as const,
    name: raw.name,
    description: description || null,
    traits: raw.traits.map((t) => ({ name: t.name, description: '' })),
    abilityBonuses,
    languages: raw.languages.map((l) => l.name),
    speed: raw.speed,
    size: raw.size,
  };
}

// ── 2024 placeholder ──────────────────────────────────────────────────────────
// When 5e-bits/5e-database releases 5e-SRD-Species.json for the 2024 ruleset,
// add transformSpecies2024() here. Key differences from 2014:
//   - displayTerm: 'Species'
//   - abilityBonuses: {} (ASIs moved to Background in 2024)
//   - Languages may come from background rather than species
// Example input shape: { index, name, size, speed, traits: [...], url }
