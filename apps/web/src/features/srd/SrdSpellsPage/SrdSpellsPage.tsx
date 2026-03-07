import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdSpell, useSrdSpells } from '../hooks/useSrd.js';
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

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/srd" className={styles.breadcrumbLink}>
          SRD
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span>Spells</span>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>Spells</h1>
        <div className={styles.controls}>
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
            <option value="0">Cantrip</option>
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
      </div>

      {isLoading && <Spinner size="lg" label="Loading spells…" />}
      {isError && <EmptyState icon="⚠️" title="Failed to load spells" />}

      {!isLoading && !isError && (
        <div className={styles.layout}>
          <div>
            <p className={styles.count}>{spells.length} results</p>
            <div className={styles.grid}>
              {spells.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={styles.card}
                  onClick={() => setSelected((prev) => (prev?.id === s.id ? null : s))}
                  aria-pressed={selected?.id === s.id}
                >
                  <div className={styles.cardName}>{s.name}</div>
                  <div className={styles.cardMeta}>
                    <Badge variant="accent">{s.level === 0 ? 'Cantrip' : `Lvl ${s.level}`}</Badge>
                    <Badge>{s.school}</Badge>
                    {s.concentration && <Badge variant="warning">Conc.</Badge>}
                    {s.ritual && <Badge variant="info">Ritual</Badge>}
                  </div>
                  <p className={styles.cardDesc}>
                    {s.castingTime} · {s.range} · {s.duration}
                  </p>
                </button>
              ))}
            </div>
            {spells.length === 0 && (
              <EmptyState icon="✨" title="No spells found" description="Try different filters." />
            )}
          </div>

          {selected && (
            <div className={styles.detail}>
              <div className={styles.detailHeader}>
                <div>
                  <div className={styles.detailTitle}>{selected.name}</div>
                  <div className={styles.cardMeta}>
                    <Badge variant="accent">
                      {selected.level === 0 ? 'Cantrip' : `Level ${selected.level}`}
                    </Badge>
                    <Badge>{selected.school}</Badge>
                    {selected.concentration && <Badge variant="warning">Concentration</Badge>}
                    {selected.ritual && <Badge variant="info">Ritual</Badge>}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.detailClose}
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>Details</div>
                <p className={styles.detailText}>
                  <strong>Casting Time:</strong> {selected.castingTime}
                  {'\n'}
                  <strong>Range:</strong> {selected.range}
                  {'\n'}
                  <strong>Components:</strong> {componentString(selected.components)}
                  {'\n'}
                  <strong>Duration:</strong> {selected.duration}
                </p>
              </div>

              <hr className={styles.divider} />

              <SrdMarkdown content={selected.description} />

              {selected.higherLevels && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>At Higher Levels</div>
                  <SrdMarkdown content={selected.higherLevels} />
                </div>
              )}

              {selected.classes.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Classes</div>
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
      )}
    </div>
  );
}
