/**
 * Source: 5e-bits/5e-database (MIT License) — https://github.com/5e-bits/5e-database
 * SRD 5.1 content © 2016 Wizards of the Coast LLC, used under OGL 1.0a
 * IronQuill is not affiliated with Wizards of the Coast LLC or Hasbro Inc.
 */

/**
 * Transformer for SRD rules (combat, spellcasting, etc.) and rule sections.
 * Source: 2014 only — no 2024 rules data in 5e-bits/5e-database yet.
 *
 * The rules.json top-level entries (e.g. "Combat") act as categories.
 * The rule-sections.json entries are the actual rule text, referencing a parent.
 * We combine both into a flat srd_rules table for easy lookup.
 */

// ── Rules (categories) ────────────────────────────────────────────────────────

export type RawRule2014 = {
  index: string;
  name: string;
  desc: string;
  subsections: Array<{ index: string; name: string; url: string }>;
};

// ── Rule sections (actual text) ───────────────────────────────────────────────

export type RawRuleSection2014 = {
  index: string;
  name: string;
  desc: string;
};

function extractKeywords(text: string): string[] {
  // Extract capitalised multi-word terms and bold-marked phrases as keywords
  const boldTerms = [...text.matchAll(/\*\*([^*]{3,40})\*\*/g)]
    .map((m) => m[1]?.trim())
    .filter((t): t is string => Boolean(t));
  const unique = [...new Set(boldTerms)].slice(0, 20);
  return unique;
}

/** Transforms a top-level rule (e.g. "Combat") into a category summary row. */
export function transformRule2014(raw: RawRule2014): {
  sourceEdition: '2014';
  category: string;
  topic: string;
  description: string;
  keywords: string[];
} {
  return {
    sourceEdition: '2014',
    category: raw.name,
    topic: raw.name,
    description: raw.desc || `${raw.name} — see subsections.`,
    keywords: raw.subsections.map((s) => s.name),
  };
}

/**
 * Transforms a rule section with its parent category name for context.
 * The caller is responsible for resolving the category from the parent rule.
 */
export function transformRuleSection2014(
  raw: RawRuleSection2014,
  category: string,
): {
  sourceEdition: '2014';
  category: string;
  topic: string;
  description: string;
  keywords: string[];
} {
  return {
    sourceEdition: '2014',
    category,
    topic: raw.name,
    description: raw.desc,
    keywords: extractKeywords(raw.desc),
  };
}

// ── 2024 ─────────────────────────────────────────────────────────────────────
// Hand-authored from SRD 5.2.1 PDF (Rules Glossary section).

export type RawRule2024 = {
  index: string;
  topic: string;
  category: string;
  description: string;
  keywords?: string[];
};

export function transformRule2024(raw: RawRule2024): {
  sourceEdition: '2024';
  category: string;
  topic: string;
  description: string;
  keywords: string[];
} {
  return {
    sourceEdition: '2024',
    category: raw.category,
    topic: raw.topic,
    description: raw.description,
    keywords: raw.keywords ?? extractKeywords(raw.description),
  };
}
