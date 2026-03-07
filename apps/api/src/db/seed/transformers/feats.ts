/**
 * Source: 5e-bits/5e-database (MIT License) — https://github.com/5e-bits/5e-database
 * SRD 5.2 content © 2024 Wizards of the Coast LLC, used under CC-BY-4.0
 * IronQuill is not affiliated with Wizards of the Coast LLC or Hasbro Inc.
 */

/**
 * Transformer for SRD 5.2 (2024) feats.
 * Source: src/2024/5e-SRD-Feats.json from 5e-bits/5e-database.
 *
 * 2024 feats are typed: origin | general | fighting-style | epic-boon.
 * Origin feats are mandatory — every Background grants exactly one.
 */

import type { srdFeatTypeEnum } from '../../schema/srd.js';

type FeatType = (typeof srdFeatTypeEnum.enumValues)[number];

type RawPrerequisite2024 = {
  type: 'level' | 'feature' | 'ability_score';
  minimum_level?: number;
  feature?: string;
  ability_score?: { index: string; name: string };
  minimum_score?: number;
};

export type RawFeat2024 = {
  index: string;
  name: string;
  desc: string[];
  type?: string;
  prerequisites?: RawPrerequisite2024[];
  repeatable?: string;
};

function mapFeatType(raw: RawFeat2024): FeatType {
  const t = (raw.type ?? '').toLowerCase();
  if (t.includes('origin')) return 'origin';
  if (t.includes('fighting') || t.includes('style')) return 'fighting-style';
  if (t.includes('epic') || t.includes('boon')) return 'epic-boon';
  return 'general';
}

function parsePrerequisites(raw: RawFeat2024): {
  minimumLevel?: number;
  featureNamed?: string;
  abilityScore?: { name: string; minimum: number };
} | null {
  if (!raw.prerequisites?.length) return null;

  const result: {
    minimumLevel?: number;
    featureNamed?: string;
    abilityScore?: { name: string; minimum: number };
  } = {};

  for (const prereq of raw.prerequisites) {
    if (prereq.type === 'level' && prereq.minimum_level != null) {
      result.minimumLevel = prereq.minimum_level;
    } else if (prereq.type === 'feature' && prereq.feature) {
      result.featureNamed = prereq.feature;
    } else if (
      prereq.type === 'ability_score' &&
      prereq.ability_score &&
      prereq.minimum_score != null
    ) {
      result.abilityScore = {
        name: prereq.ability_score.name,
        minimum: prereq.minimum_score,
      };
    }
  }

  return Object.keys(result).length ? result : null;
}

export function transformFeat2024(raw: RawFeat2024) {
  return {
    sourceEdition: '2024' as const,
    name: raw.name,
    description: raw.desc.join('\n'),
    type: mapFeatType(raw),
    prerequisites: parsePrerequisites(raw),
    repeatable: raw.repeatable ?? null,
  };
}
