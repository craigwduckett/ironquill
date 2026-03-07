/**
 * Source: 5e-bits/5e-database (MIT License) — https://github.com/5e-bits/5e-database
 * SRD 5.1 content © 2016 Wizards of the Coast LLC, used under OGL 1.0a
 * SRD 5.2 content © 2024 Wizards of the Coast LLC, used under CC-BY-4.0
 * IronQuill is not affiliated with Wizards of the Coast LLC or Hasbro Inc.
 */

/**
 * SRD seed script — populates all srd_* tables with data from:
 *   - 2014: 5e-bits/5e-database src/2014 (SRD 5.1, OGL)
 *   - 2024: 5e-bits/5e-database src/2024 (SRD 5.2, CC-BY-4.0)
 *
 * Each SRD table row carries a source_edition column ('2014' | '2024') so the
 * app can filter content by ruleset version. When 2024 data becomes available
 * for a missing category (classes, spells, monsters, species) simply:
 *   1. Add the JSON file to data/2024/
 *   2. Write/update the transformer in transformers/
 *   3. Add the 2024 seeding block below
 *   4. Re-run `pnpm db:seed`
 *
 * The script is idempotent: it upserts all SRD rows by name + source_edition.
 * User data (characters, etc.) is NEVER deleted — the seed only touches srd_*
 * tables and uses ON CONFLICT DO UPDATE so existing FK references stay intact.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { logger } from '../../lib/logger.js';
import {
  type RawBackground2014,
  type RawBackground2024,
  transformBackground2014,
  transformBackground2024,
} from './transformers/backgrounds.js';
import type { RawClass2014 } from './transformers/classes.js';
import { transformClass2014 } from './transformers/classes.js';
import {
  type RawCondition2014,
  type RawCondition2024,
  transformCondition2014,
  transformCondition2024,
} from './transformers/conditions.js';
import {
  type RawEquipment2014,
  type RawEquipment2024,
  type RawMagicItem2014,
  transformEquipment2014,
  transformEquipment2024,
  transformMagicItem2014,
} from './transformers/items.js';
import type { RawMonster2014 } from './transformers/monsters.js';
import { transformMonster2014 } from './transformers/monsters.js';
import type { LanguageLookup, RawRace2014, TraitLookup } from './transformers/races.js';
import { transformRace2014 as transformSpecies2014 } from './transformers/races.js';
import {
  type RawRule2014,
  type RawRuleSection2014,
  transformRule2014,
  transformRuleSection2014,
} from './transformers/rules.js';
import type { RawSpell2014 } from './transformers/spells.js';
import { transformSpell2014 } from './transformers/spells.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
const data2024Dir = join(dataDir, '2024');

function loadJson<T>(filePath: string): T {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

const BATCH_SIZE = 100;

function toSnakeCase(camel: string): string {
  return camel.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

// Own postgres.js connection for raw upserts — same DATABASE_URL as the app.
const pgClient = postgres(process.env.DATABASE_URL ?? '', { max: 3 });

/**
 * Batch upsert using ON CONFLICT ON CONSTRAINT.
 *
 * We use postgres.js directly (via pgClient.unsafe) because Drizzle's
 * onConflictDoUpdate() requires actual PgColumn references, not constraint
 * names. This raw-SQL path is only used by the seed script.
 *
 * All values are passed as parameterised inputs via postgres.js — no
 * string interpolation of user/data values occurs.
 */
async function batchUpsert<T extends Record<string, unknown>>(
  tableName: string,
  rows: T[],
  conflictConstraint: string,
) {
  if (rows.length === 0) return;
  const keys = Object.keys(rows[0] ?? {});
  const colNames = keys.map((k) => `"${toSnakeCase(k)}"`).join(', ');
  const nonIdKeys = keys.filter((k) => k !== 'id');
  const setClauses = nonIdKeys
    .map((k) => `"${toSnakeCase(k)}" = EXCLUDED."${toSnakeCase(k)}"`)
    .join(', ');

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const values = batch.flatMap((row) =>
      keys.map((k) => {
        const v = row[k];
        return typeof v === 'object' && v !== null && !Array.isArray(v) ? JSON.stringify(v) : v;
      }),
    );
    const colCount = keys.length;
    const rowPlaceholders = batch
      .map((_, ri) => `(${keys.map((_, ci) => `$${ri * colCount + ci + 1}`).join(', ')})`)
      .join(', ');

    await pgClient.unsafe(
      `INSERT INTO "${tableName}" (${colNames}) VALUES ${rowPlaceholders} ON CONFLICT ON CONSTRAINT "${conflictConstraint}" DO UPDATE SET ${setClauses}`,
      values as Parameters<typeof pgClient.unsafe>[1],
    );
  }
}

// ── Seed functions ────────────────────────────────────────────────────────────

type RawTraitData = { index: string; name: string; desc: string };
type RawLanguageData = {
  index: string;
  name: string;
  desc: string;
  type: string;
  script: string;
  typical_speakers: string[];
};

async function seedSpecies() {
  // 2014 data uses the term "Race"; 2024 will use "Species".
  // The transformer sets displayTerm accordingly on each row.
  const raw = loadJson<RawRace2014[]>(join(dataDir, 'races.json'));

  const rawTraits = loadJson<RawTraitData[]>(join(dataDir, 'traits.json'));
  const traitLookup: TraitLookup = new Map(rawTraits.map((t) => [t.index, t.desc]));

  const rawLanguages = loadJson<RawLanguageData[]>(join(dataDir, 'languages.json'));
  const languageLookup: LanguageLookup = new Map(
    rawLanguages.map((l) => [
      l.index,
      {
        desc: l.desc,
        type: l.type,
        script: l.script,
        typicalSpeakers: l.typical_speakers,
      },
    ]),
  );

  const rows = raw.map((r) => transformSpecies2014(r, traitLookup, languageLookup));
  await batchUpsert('srd_species', rows, 'srd_species_name_edition_uq');
  logger.info(`species: upserted ${rows.length} rows (2014, displayTerm='Race')`);
}

async function seedClasses() {
  const raw = loadJson<RawClass2014[]>(join(dataDir, 'classes.json'));
  const rows = raw.map(transformClass2014);
  await batchUpsert('srd_classes', rows, 'srd_classes_name_edition_uq');
  logger.info(`classes: upserted ${rows.length} rows (2014)`);
}

async function seedBackgrounds() {
  const raw2014 = loadJson<RawBackground2014[]>(join(dataDir, 'backgrounds.json'));
  const raw2024 = loadJson<RawBackground2024[]>(join(data2024Dir, 'backgrounds.json'));

  const rows2014 = raw2014.map(transformBackground2014);
  const rows2024 = raw2024.map(transformBackground2024);
  const all = [...rows2014, ...rows2024];

  await batchUpsert('srd_backgrounds', all, 'srd_backgrounds_name_edition_uq');
  logger.info(
    `backgrounds: upserted ${rows2014.length} (2014) + ${rows2024.length} (2024) = ${all.length} rows`,
  );
}

async function seedSpells() {
  const raw = loadJson<RawSpell2014[]>(join(dataDir, 'spells.json'));
  const rows = raw.map(transformSpell2014);
  await batchUpsert('srd_spells', rows, 'srd_spells_name_edition_uq');
  logger.info(`spells: upserted ${rows.length} rows (2014)`);
}

async function seedMonsters() {
  const raw = loadJson<RawMonster2014[]>(join(dataDir, 'monsters.json'));
  const rows = raw.map(transformMonster2014);
  await batchUpsert('srd_monsters', rows, 'srd_monsters_name_edition_uq');
  logger.info(`monsters: upserted ${rows.length} rows (2014)`);
}

async function seedItems() {
  const equipment2014 = loadJson<RawEquipment2014[]>(join(dataDir, 'equipment.json'));
  const magicItems2014 = loadJson<RawMagicItem2014[]>(join(dataDir, 'magic-items.json'));
  const equipment2024 = loadJson<RawEquipment2024[]>(join(data2024Dir, 'equipment.json'));

  const rows2014Eq = equipment2014.map(transformEquipment2014);
  const rows2014Magic = magicItems2014.map(transformMagicItem2014);
  const rows2024 = equipment2024.map(transformEquipment2024);
  const all = [...rows2014Eq, ...rows2014Magic, ...rows2024];

  await batchUpsert('srd_items', all, 'srd_items_name_edition_uq');
  logger.info(
    `items: upserted ${rows2014Eq.length} equipment (2014) + ${rows2014Magic.length} magic items (2014) + ${rows2024.length} equipment (2024) = ${all.length} rows`,
  );
}

async function seedConditions() {
  const raw2014 = loadJson<RawCondition2014[]>(join(dataDir, 'conditions.json'));
  const raw2024 = loadJson<RawCondition2024[]>(join(data2024Dir, 'conditions.json'));

  const rows2014 = raw2014.map(transformCondition2014);
  const rows2024 = raw2024.map(transformCondition2024);
  const all = [...rows2014, ...rows2024];

  await batchUpsert('srd_conditions', all, 'srd_conditions_name_edition_uq');
  logger.info(
    `conditions: upserted ${rows2014.length} (2014) + ${rows2024.length} (2024) = ${all.length} rows`,
  );
}

async function seedRules() {
  const rawRules = loadJson<RawRule2014[]>(join(dataDir, 'rules.json'));
  const rawSections = loadJson<RawRuleSection2014[]>(join(dataDir, 'rule-sections.json'));

  // Build a lookup from section index → parent rule category name
  const sectionToCategory = new Map<string, string>();
  for (const rule of rawRules) {
    for (const sub of rule.subsections) {
      sectionToCategory.set(sub.index, rule.name);
    }
  }

  const categoryRows = rawRules.map(transformRule2014);
  const sectionRows = rawSections.map((s) =>
    transformRuleSection2014(s, sectionToCategory.get(s.index) ?? 'General'),
  );
  const all = [...categoryRows, ...sectionRows];

  await batchUpsert('srd_rules', all, 'srd_rules_topic_edition_uq');
  logger.info(
    `rules: upserted ${categoryRows.length} categories + ${sectionRows.length} sections = ${all.length} rows (2014)`,
  );
}

// ── Upsert seed ───────────────────────────────────────────────────────────────

async function main() {
  logger.info('Seeding SRD data…');
  logger.info('Strategy: upsert on (name, source_edition) — user data is never touched.');

  await seedSpecies();
  await seedClasses();
  await seedBackgrounds();
  await seedSpells();
  await seedMonsters();
  await seedItems();
  await seedConditions();
  await seedRules();

  logger.info('SRD seed complete.');
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
