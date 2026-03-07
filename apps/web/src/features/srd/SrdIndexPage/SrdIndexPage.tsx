import { Link } from '@tanstack/react-router';
import styles from './SrdIndexPage.module.css';

const CATEGORIES = [
  {
    slug: 'species',
    icon: '🧝',
    name: 'Species',
    desc: 'Playable races and species — traits, ability bonuses, languages',
  },
  {
    slug: 'classes',
    icon: '⚔️',
    name: 'Classes',
    desc: 'Character classes — hit dice, proficiencies, features',
  },
  {
    slug: 'backgrounds',
    icon: '📜',
    name: 'Backgrounds',
    desc: 'Character backgrounds — skills, equipment, features',
  },
  {
    slug: 'spells',
    icon: '✨',
    name: 'Spells',
    desc: '319 spells — searchable by level, school, and class',
  },
  {
    slug: 'monsters',
    icon: '🐉',
    name: 'Monsters',
    desc: 'Bestiary of 334 creatures — filter by CR, type, and size',
  },
  {
    slug: 'items',
    icon: '🗡️',
    name: 'Items',
    desc: 'Weapons, armour, gear, and magic items',
  },
  {
    slug: 'conditions',
    icon: '💀',
    name: 'Conditions',
    desc: 'All 15 conditions — mechanical effects at a glance',
  },
  {
    slug: 'rules',
    icon: '📖',
    name: 'Rules',
    desc: 'Combat, spellcasting, exploration, and social rules',
  },
];

export function SrdIndexPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>SRD Reference</h1>
        <p className={styles.subtitle}>
          The complete D&amp;D 5e System Reference Document — always accessible, no account
          required.
        </p>
      </header>

      <div className={styles.grid}>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/srd/${cat.slug}` as '/srd/species'}
            className={styles.categoryCard}
          >
            <span className={styles.categoryIcon} aria-hidden="true">
              {cat.icon}
            </span>
            <span className={styles.categoryName}>{cat.name}</span>
            <span className={styles.categoryDesc}>{cat.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
