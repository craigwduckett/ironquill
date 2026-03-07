/**
 * Source: 5e-bits/5e-database (MIT License) — https://github.com/5e-bits/5e-database
 * SRD 5.1 content © 2016 Wizards of the Coast LLC, used under OGL 1.0a
 * IronQuill is not affiliated with Wizards of the Coast LLC or Hasbro Inc.
 */

/**
 * Transformer for SRD monsters.
 * Source: 2014 only — 2024 monsters not yet available in 5e-bits/5e-database.
 */

type RawArmorClass = { type: string; value: number };
type RawSpeed = Record<string, string | number>;
type RawProficiency = {
  value: number;
  proficiency: { index: string; name: string };
};
type RawSense = Record<string, string | number>;
type RawAction = {
  name: string;
  desc: string;
  attack_bonus?: number;
  damage?: unknown[];
  dc?: unknown;
};
type RawSpecialAbility = { name: string; desc: string; usage?: unknown };
type RawLegendaryAction = { name: string; desc: string };

export type RawMonster2014 = {
  index: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: RawArmorClass[];
  hit_points: number;
  hit_dice: string;
  hit_points_roll?: string;
  speed: RawSpeed;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies: RawProficiency[];
  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities?: Array<{ index: string; name: string }>;
  senses: RawSense;
  languages: string;
  challenge_rating: number;
  xp: number;
  actions?: RawAction[];
  legendary_actions?: RawLegendaryAction[];
  special_abilities?: RawSpecialAbility[];
};

function parseSenses(senses: RawSense): string {
  return Object.entries(senses)
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
    .join(', ');
}

function parseProficiencies(proficiencies: RawProficiency[]) {
  const savingThrows: Record<string, number> = {};
  const skills: Record<string, number> = {};

  for (const p of proficiencies) {
    const idx = p.proficiency.index;
    if (idx.startsWith('saving-throw-')) {
      const key = idx.replace('saving-throw-', '').toUpperCase();
      savingThrows[key] = p.value;
    } else if (idx.startsWith('skill-')) {
      const key = p.proficiency.name.replace('Skill: ', '');
      skills[key] = p.value;
    }
  }

  return {
    savingThrows: Object.keys(savingThrows).length ? savingThrows : null,
    skills: Object.keys(skills).length ? skills : null,
  };
}

export function transformMonster2014(raw: RawMonster2014) {
  const primaryAc = raw.armor_class[0];
  const { savingThrows, skills } = parseProficiencies(raw.proficiencies);

  return {
    sourceEdition: '2014' as const,
    name: raw.name,
    size: raw.size,
    type: raw.type,
    alignment: raw.alignment,
    ac: primaryAc?.value ?? 10,
    acType: primaryAc?.type ?? null,
    hp: raw.hit_points,
    hpFormula: raw.hit_dice,
    speed: raw.speed as Record<string, number | string>,
    abilityScores: {
      STR: raw.strength,
      DEX: raw.dexterity,
      CON: raw.constitution,
      INT: raw.intelligence,
      WIS: raw.wisdom,
      CHA: raw.charisma,
    },
    savingThrows,
    skills,
    damageResistances: raw.damage_resistances.length ? raw.damage_resistances : null,
    damageImmunities: raw.damage_immunities.length ? raw.damage_immunities : null,
    conditionImmunities: raw.condition_immunities?.length
      ? raw.condition_immunities.map((c) => c.name)
      : null,
    senses: parseSenses(raw.senses),
    languages: raw.languages || '—',
    cr: raw.challenge_rating,
    xp: raw.xp,
    actions: (raw.actions ?? []) as Array<Record<string, unknown>>,
    legendaryActions: raw.legendary_actions?.length
      ? (raw.legendary_actions as Array<Record<string, unknown>>)
      : null,
    specialAbilities: raw.special_abilities?.length
      ? (raw.special_abilities as Array<Record<string, unknown>>)
      : null,
  };
}
