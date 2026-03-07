/**
 * Source: 5e-bits/5e-database (MIT License) — https://github.com/5e-bits/5e-database
 * SRD 5.1 content © 2016 Wizards of the Coast LLC, used under OGL 1.0a
 * SRD 5.2 content © 2024 Wizards of the Coast LLC, used under CC-BY-4.0
 * IronQuill is not affiliated with Wizards of the Coast LLC or Hasbro Inc.
 */

/**
 * Transformers for SRD backgrounds.
 * 2014: src/2014 — feature-based backgrounds (Shelter of the Faithful, etc.)
 * 2024: src/2024 — ability-score + feat-based backgrounds (new design).
 *
 * Both editions are seeded. The UI should filter by sourceEdition.
 */

// ── 2014 ─────────────────────────────────────────────────────────────────────

type RawProfRef = { index: string; name: string; url: string };
type RawEquipmentRef = {
  equipment: { index: string; name: string };
  quantity: number;
};

export type RawBackground2014 = {
  index: string;
  name: string;
  starting_proficiencies: RawProfRef[];
  language_options?: { choose: number };
  starting_equipment?: RawEquipmentRef[];
  feature: { name: string; desc: string[] };
};

export function transformBackground2014(raw: RawBackground2014) {
  const skills = raw.starting_proficiencies
    .filter((p) => p.index.startsWith('skill-'))
    .map((p) => p.name.replace('Skill: ', ''));

  const tools = raw.starting_proficiencies
    .filter((p) => !p.index.startsWith('skill-'))
    .map((p) => p.name);

  return {
    sourceEdition: '2014' as const,
    name: raw.name,
    description: null,
    skillProficiencies: skills,
    toolProficiencies: tools,
    languagesCount: raw.language_options?.choose ?? 0,
    equipment: (raw.starting_equipment ?? []).map((se) => ({
      name: se.equipment.name,
      quantity: se.quantity,
    })),
    featureName: raw.feature.name,
    featureDescription: raw.feature.desc.join('\n'),
  };
}

// ── 2024 ─────────────────────────────────────────────────────────────────────

type RawAbilityScore2024 = { index: string; name: string; url: string };
type RawFeat2024 = {
  index: string;
  name: string;
  note?: string;
  url: string;
};
type RawProficiency2024 = { index: string; name: string; url: string };

export type RawBackground2024 = {
  index: string;
  name: string;
  ability_scores?: RawAbilityScore2024[];
  feat?: RawFeat2024;
  proficiencies?: RawProficiency2024[];
  equipment_options?: Array<{ desc: string }>;
};

export function transformBackground2024(raw: RawBackground2024) {
  const skills = (raw.proficiencies ?? [])
    .filter((p) => p.index.startsWith('skill-'))
    .map((p) => p.name.replace('Skill: ', ''));

  const tools = (raw.proficiencies ?? [])
    .filter((p) => p.index.startsWith('tool-'))
    .map((p) => p.name.replace('Tool: ', ''));

  const featDescription = raw.feat
    ? `Starting Feat: ${raw.feat.name}${raw.feat.note ? ` (${raw.feat.note})` : ''}`
    : '';

  const equipmentDesc = raw.equipment_options?.[0]?.desc ?? 'See rulebook for equipment options.';

  return {
    sourceEdition: '2024' as const,
    name: raw.name,
    description: raw.ability_scores
      ? `Ability Score increases: ${raw.ability_scores.map((a) => a.name).join(', ')}`
      : null,
    skillProficiencies: skills,
    toolProficiencies: tools,
    languagesCount: 0,
    equipment: [{ desc: equipmentDesc }],
    featureName: raw.feat?.name ?? '—',
    featureDescription: featDescription || 'No feature description available.',
  };
}
