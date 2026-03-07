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
 *
 * Note: 5e-bits 2024 format uses `description` (string) and `prerequisites`
 * as a flat object — different from the 2014 array-of-objects format.
 */

import type { srdFeatTypeEnum } from '../../schema/srd.js';

type FeatType = (typeof srdFeatTypeEnum.enumValues)[number];

// 5e-bits/5e-database 2024 format: prerequisites is a flat object, not an array.
type RawPrerequisiteObject2024 = {
  minimum_level?: number;
  feature_named?: string;
};

export type RawFeat2024 = {
  index: string;
  name: string;
  description: string;
  type?: string;
  prerequisites?: RawPrerequisiteObject2024;
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
  if (!raw.prerequisites) return null;

  const prereq = raw.prerequisites;
  const result: {
    minimumLevel?: number;
    featureNamed?: string;
    abilityScore?: { name: string; minimum: number };
  } = {};

  if (prereq.minimum_level != null) result.minimumLevel = prereq.minimum_level;
  if (prereq.feature_named) result.featureNamed = prereq.feature_named;

  return Object.keys(result).length ? result : null;
}

export function transformFeat2024(raw: RawFeat2024) {
  return {
    sourceEdition: '2024' as const,
    name: raw.name,
    description: raw.description,
    type: mapFeatType(raw),
    prerequisites: parsePrerequisites(raw),
    repeatable: raw.repeatable ?? null,
  };
}
