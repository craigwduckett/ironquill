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
 * The script is idempotent: it truncates all srd_* tables before inserting,
 * so re-running it always produces a clean, consistent state.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../client.js';
import {
  srdBackgrounds,
  srdClasses,
  srdConditions,
  srdItems,
  srdMonsters,
  srdRules,
  srdSpecies,
  srdSpells,
} from '../schema/srd.js';
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
import type { RawRace2014 } from './transformers/races.js';
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

async function batchInsert<T extends Record<string, unknown>>(
  table: Parameters<typeof db.insert>[0],
  rows: T[],
) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    await db.insert(table).values(rows.slice(i, i + BATCH_SIZE));
  }
}

// ── Seed functions ────────────────────────────────────────────────────────────

async function seedSpecies() {
  // 2014 data uses the term "Race"; 2024 will use "Species".
  // The transformer sets displayTerm accordingly on each row.
  const raw = loadJson<RawRace2014[]>(join(dataDir, 'races.json'));
  const rows = raw.map(transformSpecies2014);
  await batchInsert(srdSpecies, rows);
  console.log(`  species: inserted ${rows.length} rows (2014, displayTerm='Race')`);
}

async function seedClasses() {
  const raw = loadJson<RawClass2014[]>(join(dataDir, 'classes.json'));
  const rows = raw.map(transformClass2014);
  await batchInsert(srdClasses, rows);
  console.log(`  classes: inserted ${rows.length} rows (2014)`);
}

async function seedBackgrounds() {
  const raw2014 = loadJson<RawBackground2014[]>(join(dataDir, 'backgrounds.json'));
  const raw2024 = loadJson<RawBackground2024[]>(join(data2024Dir, 'backgrounds.json'));

  const rows2014 = raw2014.map(transformBackground2014);
  const rows2024 = raw2024.map(transformBackground2024);
  const all = [...rows2014, ...rows2024];

  await batchInsert(srdBackgrounds, all);
  console.log(
    `  backgrounds: inserted ${rows2014.length} (2014) + ${rows2024.length} (2024) = ${all.length} rows`,
  );
}

async function seedSpells() {
  const raw = loadJson<RawSpell2014[]>(join(dataDir, 'spells.json'));
  const rows = raw.map(transformSpell2014);
  await batchInsert(srdSpells, rows);
  console.log(`  spells: inserted ${rows.length} rows (2014)`);
}

async function seedMonsters() {
  const raw = loadJson<RawMonster2014[]>(join(dataDir, 'monsters.json'));
  const rows = raw.map(transformMonster2014);
  await batchInsert(srdMonsters, rows);
  console.log(`  monsters: inserted ${rows.length} rows (2014)`);
}

async function seedItems() {
  const equipment2014 = loadJson<RawEquipment2014[]>(join(dataDir, 'equipment.json'));
  const magicItems2014 = loadJson<RawMagicItem2014[]>(join(dataDir, 'magic-items.json'));
  const equipment2024 = loadJson<RawEquipment2024[]>(join(data2024Dir, 'equipment.json'));

  const rows2014Eq = equipment2014.map(transformEquipment2014);
  const rows2014Magic = magicItems2014.map(transformMagicItem2014);
  const rows2024 = equipment2024.map(transformEquipment2024);
  const all = [...rows2014Eq, ...rows2014Magic, ...rows2024];

  await batchInsert(srdItems, all);
  console.log(
    `  items: inserted ${rows2014Eq.length} equipment (2014) + ${rows2014Magic.length} magic items (2014) + ${rows2024.length} equipment (2024) = ${all.length} rows`,
  );
}

async function seedConditions() {
  const raw2014 = loadJson<RawCondition2014[]>(join(dataDir, 'conditions.json'));
  const raw2024 = loadJson<RawCondition2024[]>(join(data2024Dir, 'conditions.json'));

  const rows2014 = raw2014.map(transformCondition2014);
  const rows2024 = raw2024.map(transformCondition2024);
  const all = [...rows2014, ...rows2024];

  await batchInsert(srdConditions, all);
  console.log(
    `  conditions: inserted ${rows2014.length} (2014) + ${rows2024.length} (2024) = ${all.length} rows`,
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

  await batchInsert(srdRules, all);
  console.log(
    `  rules: inserted ${categoryRows.length} categories + ${sectionRows.length} sections = ${all.length} rows (2014)`,
  );
}

// ── Truncate + seed ───────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding SRD data…\n');

  // Truncate all SRD tables in dependency-safe order
  await db.delete(srdRules);
  await db.delete(srdConditions);
  await db.delete(srdItems);
  await db.delete(srdMonsters);
  await db.delete(srdSpells);
  await db.delete(srdBackgrounds);
  await db.delete(srdClasses);
  await db.delete(srdSpecies);

  console.log('Tables cleared. Inserting SRD data…\n');

  await seedSpecies();
  await seedClasses();
  await seedBackgrounds();
  await seedSpells();
  await seedMonsters();
  await seedItems();
  await seedConditions();
  await seedRules();

  console.log('\nSRD seed complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
