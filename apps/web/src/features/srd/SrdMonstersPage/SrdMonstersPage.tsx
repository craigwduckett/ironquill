import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdMonster, useSrdMonsters } from '../hooks/useSrd.js';
import { NoviceBox, Tip } from '../SrdHelpers.js';
import styles from '../SrdListPage.module.css';
import { SrdMarkdown } from '../SrdMarkdown/SrdMarkdown.js';

const MONSTER_TYPES = [
  'aberration',
  'beast',
  'celestial',
  'construct',
  'dragon',
  'elemental',
  'fey',
  'fiend',
  'giant',
  'humanoid',
  'monstrosity',
  'ooze',
  'plant',
  'undead',
];

const TYPE_COLORS: Record<string, string> = {
  aberration: '#9b59b6',
  beast: '#5cb87a',
  celestial: '#f1c40f',
  construct: '#7f8c8d',
  dragon: '#e05c5c',
  elemental: '#e09d3c',
  fey: '#1abc9c',
  fiend: '#c0392b',
  giant: '#e67e22',
  humanoid: '#c8a96e',
  monstrosity: '#8e44ad',
  ooze: '#27ae60',
  plant: '#16a085',
  undead: '#636e72',
};

function modifier(score: number) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : String(mod);
}

function crLabel(cr: number) {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

function crDanger(cr: number): 'default' | 'success' | 'warning' | 'danger' {
  if (cr <= 1) return 'success';
  if (cr <= 5) return 'warning';
  return 'danger';
}

export function SrdMonstersPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [crMax, setCrMax] = useState('');
  const [selected, setSelected] = useState<SrdMonster | null>(null);

  const { data, isLoading, isError } = useSrdMonsters({
    name: search || undefined,
    type: type || undefined,
    crMax: crMax || undefined,
  });

  const monsters = data ?? [];

  if (isLoading) {
    return (
      <div className={styles.loadingPane}>
        <Spinner size="lg" label="Loading monsters…" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className={styles.loadingPane}>
        <EmptyState icon="⚠️" title="Failed to load monsters" />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.sidebarTitle}>
            <span className={styles.sidebarTitleText}>Monsters</span>
            <Link to="/srd" className={styles.sidebarBack}>
              ← SRD
            </Link>
          </div>
          <input
            className={styles.searchInput}
            placeholder="Search monsters…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelected(null);
            }}
          />
          <select
            className={styles.select}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setSelected(null);
            }}
          >
            <option value="">All types</option>
            {MONSTER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={crMax}
            onChange={(e) => {
              setCrMax(e.target.value);
              setSelected(null);
            }}
          >
            <option value="">Max Challenge Rating</option>
            {[
              '0',
              '0.125',
              '0.25',
              '0.5',
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
              '10',
              '12',
              '15',
              '20',
              '24',
              '30',
            ].map((c) => (
              <option key={c} value={c}>
                CR ≤ {c === '0.125' ? '1/8' : c === '0.25' ? '1/4' : c === '0.5' ? '1/2' : c}
              </option>
            ))}
          </select>
        </div>

        <p className={styles.count}>{monsters.length} monsters</p>

        <div className={styles.list}>
          {monsters.map((m) => (
            <button
              key={m.id}
              type="button"
              className={clsx(styles.listRow, selected?.id === m.id && styles.listRowActive)}
              onClick={() => setSelected(m)}
            >
              <span
                className={styles.rowDot}
                style={{
                  background: TYPE_COLORS[m.type] ?? 'var(--color-border)',
                }}
              />
              <span className={styles.rowName}>{m.name}</span>
              <span className={styles.rowCategory}>{m.type}</span>
              <span className={styles.rowBadge}>
                <Badge variant={crDanger(m.cr)} size="sm">
                  CR {crLabel(m.cr)}
                </Badge>
              </span>
            </button>
          ))}
          {monsters.length === 0 && (
            <EmptyState icon="🐉" title="No monsters found" description="Try different filters." />
          )}
        </div>
      </div>

      {/* ── Detail pane ── */}
      <div className={styles.detail}>
        {!selected ? (
          <div className={styles.emptyDetail}>
            <span className={styles.emptyDetailIcon}>🐉</span>
            <p className={styles.emptyDetailText}>
              Select a monster to see its stats, abilities, and actions.
            </p>
          </div>
        ) : (
          <div className={styles.detailInner}>
            <div className={styles.detailHeader}>
              <h1 className={styles.detailTitle}>{selected.name}</h1>
              <div className={styles.cardMeta}>
                <Badge variant={crDanger(selected.cr)}>CR {crLabel(selected.cr)}</Badge>
                <Badge>{selected.size}</Badge>
                <Badge>{selected.type}</Badge>
                <Badge variant="default">{selected.alignment}</Badge>
              </div>
            </div>

            <NoviceBox>
              <strong>Challenge Rating (CR) {crLabel(selected.cr)}</strong> — CR tells you how tough
              a monster is relative to a party of four characters. As a DM, a rough guideline is: CR
              = character level for a challenging fight. CR 0–1 = easy starter enemies. CR 5+ =
              serious threats. CR 20+ = legendary boss-level monsters.
              <br />
              <br />
              <strong>Size: {selected.size}</strong> — affects how many squares it occupies on the
              battle grid (Medium = 1 square, Large = 2×2, Huge = 3×3).
              <br />
              <br />
              <strong>Alignment</strong> ({selected.alignment}) indicates the monster's general
              moral disposition. Chaotic Evil tends to be destructive and selfish; Lawful Good tends
              to be orderly and altruistic. Monsters can act against their alignment — it's a
              tendency, not a rule.
            </NoviceBox>

            <div className={styles.detailSection}>
              <div className={styles.detailSectionLabel}>Combat Stats</div>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <tbody>
                  <tr
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
                      }}
                    >
                      Armour Class (AC){' '}
                      <Tip text="AC is how hard the monster is to hit. When you attack, you roll a d20 and add modifiers — if the total equals or beats the AC, you hit." />
                    </td>
                    <td style={{ padding: 'var(--space-2) 0' }}>
                      {selected.ac}
                      {selected.acType ? ` (${selected.acType})` : ''}
                    </td>
                  </tr>
                  <tr
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
                      }}
                    >
                      Hit Points (HP){' '}
                      <Tip text="How much damage the monster can take before it's defeated. The formula in brackets shows how it's calculated (e.g. 5d8+10 means roll 5 eight-sided dice and add 10)." />
                    </td>
                    <td style={{ padding: 'var(--space-2) 0' }}>
                      {selected.hp} ({selected.hpFormula})
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: 'var(--space-2) var(--space-3) var(--space-2) 0',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Speed{' '}
                      <Tip text="How far the monster moves per turn. Some monsters have extra movement types like Fly, Swim, or Burrow." />
                    </td>
                    <td style={{ padding: 'var(--space-2) 0' }}>
                      {Object.entries(selected.speed)
                        .map(([k, v]) => `${k} ${v}`)
                        .join(', ')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr className={styles.divider} />

            <div className={styles.detailSection}>
              <div className={styles.detailSectionLabel}>
                Ability Scores
                <Tip text="The six core stats: STR (Strength), DEX (Dexterity), CON (Constitution), INT (Intelligence), WIS (Wisdom), CHA (Charisma). The number in brackets is the modifier — what gets added to dice rolls. A +3 means it's quite good at things using that stat." />
              </div>
              <div className={styles.statGrid}>
                {Object.entries(selected.abilityScores).map(([k, v]) => (
                  <div key={k} className={styles.stat}>
                    <div className={styles.statLabel}>{k}</div>
                    <div className={styles.statValue}>{v}</div>
                    <div className={styles.statMod}>{modifier(v as number)}</div>
                  </div>
                ))}
              </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.detailSection}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <tbody>
                  <tr
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
                      }}
                    >
                      Senses{' '}
                      <Tip text="Special senses beyond normal vision. Darkvision lets a monster see in darkness up to that distance. Blindsight means it doesn't need to see at all within that range." />
                    </td>
                    <td style={{ padding: 'var(--space-2) 0' }}>{selected.senses}</td>
                  </tr>
                  <tr
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
                      }}
                    >
                      Languages
                    </td>
                    <td style={{ padding: 'var(--space-2) 0' }}>{selected.languages}</td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: 'var(--space-2) var(--space-3) var(--space-2) 0',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      XP{' '}
                      <Tip text="Experience Points awarded to the players when they defeat this monster. You need XP to level up. Higher CR = more XP." />
                    </td>
                    <td style={{ padding: 'var(--space-2) 0' }}>{selected.xp.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {selected.specialAbilities && selected.specialAbilities.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Special Abilities
                  <Tip text="Passive traits that are always active, or abilities the monster can use during its turn beyond normal attacks." />
                </div>
                {selected.specialAbilities.map((a) => (
                  <div key={String(a.name)} className={styles.detailSubsection}>
                    <div className={styles.detailSubsectionName}>{String(a.name)}</div>
                    <SrdMarkdown content={String(a.desc)} />
                  </div>
                ))}
              </div>
            )}

            {selected.actions.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Actions
                  <Tip text="Things the monster can do on its turn. Most actions are attacks. Each round, a monster usually gets one action." />
                </div>
                {selected.actions.map((a) => (
                  <div key={String(a.name)} className={styles.detailSubsection}>
                    <div className={styles.detailSubsectionName}>{String(a.name)}</div>
                    <SrdMarkdown content={String(a.desc)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
