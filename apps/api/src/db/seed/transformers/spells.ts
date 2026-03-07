/**
 * Source: 5e-bits/5e-database (MIT License) — https://github.com/5e-bits/5e-database
 * SRD 5.1 content © 2016 Wizards of the Coast LLC, used under OGL 1.0a
 * IronQuill is not affiliated with Wizards of the Coast LLC or Hasbro Inc.
 */

/**
 * Transformer for SRD spells.
 * Source: 2014 only — 2024 spells not yet available in 5e-bits/5e-database.
 */

type RawSpellSchool = { index: string; name: string };
type RawSpellClass = { index: string; name: string };

export type RawSpell2014 = {
  index: string;
  name: string;
  desc: string[];
  higher_level?: string[];
  range: string;
  components: string[]; // e.g. ["V", "S", "M"]
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  school: RawSpellSchool;
  classes: RawSpellClass[];
};

export function transformSpell2014(raw: RawSpell2014) {
  const hasVerbal = raw.components.includes('V');
  const hasSomatic = raw.components.includes('S');
  const materialComponent = raw.components.includes('M') ? (raw.material ?? null) : null;

  return {
    sourceEdition: '2014' as const,
    name: raw.name,
    level: raw.level,
    school: raw.school.name,
    castingTime: raw.casting_time,
    range: raw.range,
    components: {
      verbal: hasVerbal,
      somatic: hasSomatic,
      material: materialComponent,
    },
    duration: raw.duration,
    concentration: raw.concentration,
    ritual: raw.ritual,
    description: raw.desc.join('\n'),
    higherLevels: raw.higher_level?.join('\n') ?? null,
    classes: raw.classes.map((c) => c.name),
  };
}

// ── 2024 ─────────────────────────────────────────────────────────────────────
// Hand-authored from SRD 5.2.1 PDF. Same DB shape as 2014 except sourceEdition.

export type RawSpell2024 = {
  index: string;
  name: string;
  level: number;
  school: string;
  casting_time: string;
  range: string;
  components: string[];
  material?: string | null;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  desc: string[];
  higher_level?: string[] | null;
  classes: string[];
};

export function transformSpell2024(raw: RawSpell2024) {
  const hasVerbal = raw.components.includes('V');
  const hasSomatic = raw.components.includes('S');
  const materialComponent = raw.components.includes('M') ? (raw.material ?? null) : null;

  return {
    sourceEdition: '2024' as const,
    name: raw.name,
    level: raw.level,
    school: raw.school,
    castingTime: raw.casting_time,
    range: raw.range,
    components: {
      verbal: hasVerbal,
      somatic: hasSomatic,
      material: materialComponent,
    },
    duration: raw.duration,
    concentration: raw.concentration,
    ritual: raw.ritual,
    description: raw.desc.join('\n'),
    higherLevels: raw.higher_level?.join('\n') ?? null,
    classes: raw.classes,
  };
}
