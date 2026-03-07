/**
 * Source: 5e-bits/5e-database (MIT License) — https://github.com/5e-bits/5e-database
 * SRD 5.1 content © 2016 Wizards of the Coast LLC, used under OGL 1.0a
 * IronQuill is not affiliated with Wizards of the Coast LLC or Hasbro Inc.
 */

/**
 * Transformer for SRD 5.1 (2014) classes data from 5e-bits/5e-database.
 * Source: src/2014 — no 2024 classes data is available yet in the community DB.
 */

type RawProficiencyRef = {
  index: string;
  name: string;
  url: string;
};

type RawSavingThrow = {
  index: string;
  name: string;
  url: string;
};

type RawSkillChoice = {
  desc: string;
  choose: number;
  type: string;
  from: {
    option_set_type: string;
    options?: Array<{ option_type: string; item?: RawProficiencyRef }>;
  };
};

type RawStartingEquipment = {
  equipment: { index: string; name: string };
  quantity: number;
};

export type RawClass2014 = {
  index: string;
  name: string;
  hit_die: number;
  proficiencies: RawProficiencyRef[];
  saving_throws: RawSavingThrow[];
  proficiency_choices?: RawSkillChoice[];
  starting_equipment?: RawStartingEquipment[];
  spellcasting?: Record<string, unknown>;
};

function parseArmorWeaponProficiencies(proficiencies: RawProficiencyRef[]) {
  const armor: string[] = [];
  const weapons: string[] = [];

  for (const p of proficiencies) {
    const name = p.name.toLowerCase();
    if (name.includes('armor') || name.includes('shield')) {
      armor.push(p.name);
    } else if (
      name.includes('weapon') ||
      name.includes('crossbow') ||
      name.includes('sword') ||
      name.includes('axe') ||
      name.includes('bow')
    ) {
      weapons.push(p.name);
    }
  }

  return { armor, weapons };
}

function parseSkillChoices(choices?: RawSkillChoice[]) {
  if (!choices || choices.length === 0) return undefined;

  const choice = choices[0];
  if (!choice) return undefined;

  const from: string[] = [];

  if (choice.from.option_set_type === 'options_array' && choice.from.options) {
    for (const opt of choice.from.options) {
      if (opt.option_type === 'reference' && opt.item) {
        const name = opt.item.name.replace('Skill: ', '');
        from.push(name);
      }
    }
  }

  return { choose: choice.choose, from };
}

export function transformClass2014(raw: RawClass2014) {
  const { armor, weapons } = parseArmorWeaponProficiencies(raw.proficiencies);
  const primaryAbilities = raw.saving_throws.map((st) => st.name);

  return {
    sourceEdition: '2014' as const,
    name: raw.name,
    description: null,
    hitDie: `d${raw.hit_die}`,
    primaryAbilities,
    savingThrows: raw.saving_throws.map((st) => st.name),
    armorProficiencies: armor,
    weaponProficiencies: weapons,
    skillChoices: parseSkillChoices(raw.proficiency_choices) ?? null,
    featuresByLevel: [],
    spellcastingInfo: raw.spellcasting ?? null,
    startingEquipment: (raw.starting_equipment ?? []).map((se) => ({
      name: se.equipment.name,
      quantity: se.quantity,
    })),
    // 2014 rows don't have 2024 additions — default to empty.
    subclasses: [],
    weaponMasteries: [],
  };
}

// ── 2024 ─────────────────────────────────────────────────────────────────────
// Hand-authored from SRD 5.2.1 PDF. Includes subclasses and weapon masteries.

type RawFeature2024 = { name: string; description: string };
type RawFeatureLevel2024 = { level: number; features: RawFeature2024[] };
type RawSubclass2024 = { name: string; gainedAtLevel: number };
type RawSkillChoice2024 = { choose: number; from: string[] };

export type RawClass2024 = {
  index: string;
  name: string;
  hit_die: number;
  primary_abilities: string[];
  saving_throws: string[];
  armor_proficiencies: string[];
  weapon_proficiencies: string[];
  tool_proficiencies: string[];
  skill_choices: RawSkillChoice2024;
  starting_equipment: Array<Record<string, unknown>>;
  subclasses: RawSubclass2024[];
  weapon_masteries: string[];
  features_by_level: RawFeatureLevel2024[];
  spellcasting_info: Record<string, unknown> | null;
};

export function transformClass2024(raw: RawClass2024) {
  return {
    sourceEdition: '2024' as const,
    name: raw.name,
    description: null,
    hitDie: `d${raw.hit_die}`,
    primaryAbilities: raw.primary_abilities,
    savingThrows: raw.saving_throws,
    armorProficiencies: raw.armor_proficiencies,
    weaponProficiencies: raw.weapon_proficiencies,
    skillChoices: raw.skill_choices,
    featuresByLevel: raw.features_by_level,
    spellcastingInfo: raw.spellcasting_info,
    startingEquipment: raw.starting_equipment,
    subclasses: raw.subclasses,
    weaponMasteries: raw.weapon_masteries,
  };
}
