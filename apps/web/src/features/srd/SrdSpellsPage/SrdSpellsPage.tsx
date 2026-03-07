import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdSpell, useSrdSpells } from '../hooks/useSrd.js';
import { NoviceBox, Tip } from '../SrdHelpers.js';
import styles from '../SrdListPage.module.css';
import { SrdMarkdown } from '../SrdMarkdown/SrdMarkdown.js';

const SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

const SCHOOL_COLORS: Record<string, string> = {
  Abjuration: '#5c9ee0',
  Conjuration: '#9b59b6',
  Divination: '#f1c40f',
  Enchantment: '#e91e8c',
  Evocation: '#e05c5c',
  Illusion: '#1abc9c',
  Necromancy: '#7f8c8d',
  Transmutation: '#e09d3c',
};

const SCHOOL_EXPLAINERS: Record<string, string> = {
  Abjuration: 'Protection and warding magic — shields, banishments, counterspells.',
  Conjuration: 'Summoning creatures or teleporting objects and people.',
  Divination: 'Gaining information — seeing the future, detecting magic, finding hidden things.',
  Enchantment: 'Influencing minds — charming people, putting them to sleep, or controlling them.',
  Evocation: 'Raw elemental energy — fireballs, lightning bolts, healing.',
  Illusion: 'Creating false images, sounds, or sensations to deceive.',
  Necromancy: 'Manipulating life and death — raising undead, draining life force.',
  Transmutation:
    'Changing the physical properties of things — turning lead to gold, flying, polymorph.',
};

function componentString(c: SrdSpell['components']) {
  const parts: string[] = [];
  if (c.verbal) parts.push('V');
  if (c.somatic) parts.push('S');
  if (c.material) parts.push(`M (${c.material})`);
  return parts.join(', ');
}

export function SrdSpellsPage() {
  const [search, setSearch] = useState('');
  const [school, setSchool] = useState('');
  const [level, setLevel] = useState('');
  const [selected, setSelected] = useState<SrdSpell | null>(null);

  const { data, isLoading, isError } = useSrdSpells({
    name: search || undefined,
    school: school || undefined,
    level: level || undefined,
  });

  const spells = data ?? [];

  if (isLoading) {
    return (
      <div className={styles.loadingPane}>
        <Spinner size="lg" label="Loading spells…" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className={styles.loadingPane}>
        <EmptyState icon="⚠️" title="Failed to load spells" />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.sidebarTitle}>
            <span className={styles.sidebarTitleText}>Spells</span>
            <Link to="/srd" className={styles.sidebarBack}>
              ← SRD
            </Link>
          </div>
          <input
            className={styles.searchInput}
            placeholder="Search spells…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelected(null);
            }}
          />
          <select
            className={styles.select}
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setSelected(null);
            }}
          >
            <option value="">All levels</option>
            <option value="0">Cantrip (level 0)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
              <option key={l} value={String(l)}>
                Level {l}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={school}
            onChange={(e) => {
              setSchool(e.target.value);
              setSelected(null);
            }}
          >
            <option value="">All schools</option>
            {SCHOOLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <p className={styles.count}>{spells.length} spells</p>

        <div className={styles.list}>
          {spells.map((s) => (
            <button
              key={s.id}
              type="button"
              className={clsx(styles.listRow, selected?.id === s.id && styles.listRowActive)}
              onClick={() => setSelected(s)}
            >
              <span
                className={styles.rowDot}
                style={{
                  background: SCHOOL_COLORS[s.school] ?? 'var(--color-accent)',
                }}
              />
              <span className={styles.rowName}>{s.name}</span>
              <span className={styles.rowCategory}>{s.school.slice(0, 4)}</span>
              <span className={styles.rowBadge}>
                <Badge variant="accent" size="sm">
                  {s.level === 0 ? 'Cantrip' : `L${s.level}`}
                </Badge>
              </span>
            </button>
          ))}
          {spells.length === 0 && (
            <EmptyState icon="✨" title="No spells found" description="Try different filters." />
          )}
        </div>
      </div>

      {/* ── Detail pane ── */}
      <div key={selected?.id ?? 'empty'} className={styles.detail}>
        {!selected ? (
          <div className={styles.emptyDetail}>
            <span className={styles.emptyDetailIcon}>✨</span>
            <p className={styles.emptyDetailText}>Select a spell to read its full description.</p>
          </div>
        ) : (
          <div className={styles.detailInner}>
            <div className={styles.detailHeader}>
              <h1 className={styles.detailTitle}>{selected.name}</h1>
              <div className={styles.cardMeta}>
                <Badge variant="accent">
                  {selected.level === 0 ? 'Cantrip' : `Level ${selected.level} Spell`}
                </Badge>
                <Badge>{selected.school}</Badge>
                {selected.concentration && <Badge variant="warning">Concentration</Badge>}
                {selected.ritual && <Badge variant="info">Ritual</Badge>}
              </div>
            </div>

            <NoviceBox>
              <strong>{selected.school}</strong> —{' '}
              {SCHOOL_EXPLAINERS[selected.school] ?? 'A magical effect.'}
              {selected.level === 0 && (
                <>
                  {' '}
                  <strong>Cantrip</strong> means this spell costs no spell slots — you can cast it
                  as many times as you like, every day.
                </>
              )}
              {selected.concentration && (
                <>
                  {' '}
                  <strong>Concentration</strong> means you must stay focused to maintain this spell.
                  If you take damage and fail a save, the spell ends. You can only concentrate on
                  one spell at a time.
                </>
              )}
              {selected.ritual && (
                <>
                  {' '}
                  <strong>Ritual</strong> means you can cast this spell without spending a spell
                  slot if you take 10 extra minutes — great for utility spells outside combat.
                </>
              )}
            </NoviceBox>

            <div className={styles.detailSection}>
              <div className={styles.detailSectionLabel}>Casting Details</div>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <tbody>
                  {(
                    [
                      [
                        'Casting Time',
                        selected.castingTime,
                        'How long it takes to cast — usually 1 Action (your turn), but some are bonus actions, reactions, or take minutes.',
                      ],
                      [
                        'Range',
                        selected.range,
                        'How far away the target can be. "Self" means it only affects you. "Touch" means you must reach the target.',
                      ],
                      [
                        'Components',
                        componentString(selected.components),
                        'V = you must speak aloud. S = you must gesture with your hands. M = you need a physical material component.',
                      ],
                      [
                        'Duration',
                        selected.duration,
                        'How long the effect lasts. "Instantaneous" means it happens and is done (like a fireball). "Concentration" means it lasts as long as you focus on it.',
                      ],
                    ] as [string, string, string][]
                  ).map(([label, value, tip]) => (
                    <tr
                      key={label}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <td
                        style={{
                          padding: 'var(--space-2) var(--space-3) var(--space-2) 0',
                          fontWeight: 'var(--font-semibold)',
                          color: 'var(--color-text-primary)',
                          whiteSpace: 'nowrap',
                          verticalAlign: 'top',
                        }}
                      >
                        {label} <Tip text={tip} />
                      </td>
                      <td
                        style={{
                          padding: 'var(--space-2) 0',
                          verticalAlign: 'top',
                        }}
                      >
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <hr className={styles.divider} />

            <SrdMarkdown content={selected.description} />

            {selected.higherLevels && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  At Higher Levels
                  <Tip text="When you cast this spell using a higher-level slot than required, it becomes more powerful. Spell slots are the resource that spellcasters spend to cast spells." />
                </div>
                <SrdMarkdown content={selected.higherLevels} />
              </div>
            )}

            {selected.classes.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Available to
                  <Tip text="Only characters of these classes can learn and cast this spell (unless a subclass or feat grants it)." />
                </div>
                <ul className={styles.detailList}>
                  {selected.classes.map((c) => (
                    <li key={c}>
                      <Badge>{c}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
