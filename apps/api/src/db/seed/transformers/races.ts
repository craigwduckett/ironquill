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

/** Lookup maps supplied by the seed script at call time */
export type TraitLookup = Map<string, string>;
export type LanguageLookup = Map<
  string,
  { desc: string; type: string; script: string; typicalSpeakers: string[] }
>;

const ABILITY_INDEX_MAP: Record<string, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
};

export function transformRace2014(
  raw: RawRace2014,
  traitLookup: TraitLookup,
  languageLookup: LanguageLookup,
) {
  const abilityBonuses: Record<string, number> = {};
  for (const ab of raw.ability_bonuses) {
    const key = ABILITY_INDEX_MAP[ab.ability_score.index] ?? ab.ability_score.name;
    abilityBonuses[key] = ab.bonus;
  }

  const description = [raw.alignment, raw.age, raw.size_description].filter(Boolean).join(' ');

  const traits = raw.traits.map((t) => ({
    name: t.name,
    description: traitLookup.get(t.index) ?? '',
  }));

  // Enrich language names with metadata from the language lookup
  const languages = raw.languages.map((l) => {
    const meta = languageLookup.get(l.index);
    if (!meta) return l.name;
    const parts = [l.name];
    if (meta.type) parts.push(`(${meta.type})`);
    if (meta.script) parts.push(`— script: ${meta.script}`);
    return parts.join(' ');
  });

  return {
    sourceEdition: '2014' as const,
    displayTerm: 'Race' as const,
    name: raw.name,
    description: description || null,
    traits,
    abilityBonuses,
    languages,
    languageDesc: raw.language_desc ?? null,
    speed: raw.speed,
    size: raw.size,
  };
}

// ── 2024 ─────────────────────────────────────────────────────────────────────
// Hand-authored from SRD 5.2.1 PDF. ASIs removed (moved to Backgrounds).
// Some species have size_options when the player may choose Small or Medium.

type RawTrait2024 = { name: string; description: string };

export type RawSpecies2024 = {
  index: string;
  name: string;
  size: string;
  size_options: string[];
  creature_type: string;
  speed: number;
  traits: RawTrait2024[];
  languages: string[];
  language_desc?: string;
};

export function transformSpecies2024(raw: RawSpecies2024) {
  return {
    sourceEdition: '2024' as const,
    displayTerm: 'Species' as const,
    name: raw.name,
    description: null,
    traits: raw.traits,
    abilityBonuses: {},
    languages: raw.languages,
    languageDesc: raw.language_desc ?? null,
    speed: raw.speed,
    size: raw.size,
    sizeOptions: raw.size_options,
    creatureType: raw.creature_type,
  };
}
