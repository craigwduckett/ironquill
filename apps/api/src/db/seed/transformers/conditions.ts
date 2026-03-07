/**
 * Transformers for SRD conditions.
 *
 * 2014: plain desc array (bullet points).
 * 2024: single markdown description string with updated mechanical language.
 * Both editions are seeded; UI can filter or display both.
 */

// ── 2014 ─────────────────────────────────────────────────────────────────────

export type RawCondition2014 = {
  index: string;
  name: string;
  desc: string[];
};

export function transformCondition2014(raw: RawCondition2014) {
  return {
    sourceEdition: '2014' as const,
    name: raw.name,
    description: raw.desc.join('\n'),
    mechanicalEffects: raw.desc,
  };
}

// ── 2024 ─────────────────────────────────────────────────────────────────────

export type RawCondition2024 = {
  index: string;
  name: string;
  description: string;
};

function extract2024Effects(description: string): string[] {
  // Pull out bold-headed effect lines from the 2024 markdown format:
  // e.g. "**Can't See.** You can't see..."
  const lines = description.split('\n');
  const effects: string[] = [];
  for (const line of lines) {
    const match = line.match(/\*\*([^*]+)\.\*\*\s*(.*)/);
    if (match) {
      effects.push(`${match[1]}: ${match[2]}`.trim());
    }
  }
  return effects.length ? effects : [description];
}

export function transformCondition2024(raw: RawCondition2024) {
  return {
    sourceEdition: '2024' as const,
    name: raw.name,
    description: raw.description,
    mechanicalEffects: extract2024Effects(raw.description),
  };
}
