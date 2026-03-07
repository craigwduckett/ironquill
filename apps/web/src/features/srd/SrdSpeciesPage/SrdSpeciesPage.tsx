import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdSpecies, useSrdSpecies } from '../hooks/useSrd.js';
import { NoviceBox, Tip } from '../SrdHelpers.js';
import styles from '../SrdListPage.module.css';
import { SrdMarkdown } from '../SrdMarkdown/SrdMarkdown.js';

const SIZE_COLORS: Record<string, string> = {
  Tiny: '#5c9ee0',
  Small: '#5cb87a',
  Medium: '#c8a96e',
  Large: '#e09d3c',
  Huge: '#e05c5c',
  Gargantuan: '#b05ce0',
};

const EDITION_LABELS: Record<string, string> = {
  '2014': '5.1',
  '2024': '5.2',
};

export function SrdSpeciesPage() {
  const { data, isLoading, isError } = useSrdSpecies();
  const [search, setSearch] = useState('');
  const [editionFilter, setEditionFilter] = useState('All');
  const [selected, setSelected] = useState<SrdSpecies | null>(null);

  const editions = useMemo(() => {
    const vals = [...new Set((data ?? []).map((s) => s.sourceEdition))].sort();
    return ['All', ...vals];
  }, [data]);

  const filtered = useMemo(() => {
    return (data ?? [])
      .filter((s) => editionFilter === 'All' || s.sourceEdition === editionFilter)
      .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, editionFilter, search]);

  if (isLoading) {
    return (
      <div className={styles.loadingPane}>
        <Spinner size="lg" label="Loading species…" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className={styles.loadingPane}>
        <EmptyState
          icon="⚠️"
          title="Failed to load species"
          description="Check the API is running."
        />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.sidebarTitle}>
            <span className={styles.sidebarTitleText}>Species</span>
            <Link to="/srd" className={styles.sidebarBack}>
              ← SRD
            </Link>
          </div>
          <input
            className={styles.searchInput}
            placeholder="Search species…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.chips}>
            {editions.map((ed) => (
              <button
                key={ed}
                type="button"
                className={clsx(styles.chip, editionFilter === ed && styles.chipActive)}
                onClick={() => setEditionFilter(ed)}
              >
                {ed === 'All' ? 'All' : `SRD ${EDITION_LABELS[ed] ?? ed}`}
              </button>
            ))}
          </div>
        </div>

        <p className={styles.count}>
          {filtered.length} of {(data ?? []).length} species
        </p>

        <div className={styles.list}>
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              className={clsx(styles.listRow, selected?.id === s.id && styles.listRowActive)}
              onClick={() => setSelected(s)}
            >
              <span
                className={styles.rowDot}
                style={{
                  background: SIZE_COLORS[s.size] ?? 'var(--color-border)',
                }}
              />
              <span className={styles.rowName}>{s.name}</span>
              <span className={styles.rowCategory}>{s.size}</span>
              <span className={styles.rowBadge}>
                <Badge variant="accent" size="sm">
                  {s.displayTerm}
                </Badge>
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <EmptyState icon="🧝" title="No results" description="Try a different search." />
          )}
        </div>
      </div>

      {/* ── Detail pane ── */}
      <div className={styles.detail}>
        {!selected ? (
          <div className={styles.emptyDetail}>
            <span className={styles.emptyDetailIcon}>🧬</span>
            <p className={styles.emptyDetailText}>
              Select a species from the list to read its full details.
            </p>
          </div>
        ) : (
          <div className={styles.detailInner}>
            <div className={styles.detailHeader}>
              <h1 className={styles.detailTitle}>{selected.name}</h1>
              <div className={styles.cardMeta}>
                <Badge variant="accent">{selected.displayTerm}</Badge>
                <Badge>{selected.size}</Badge>
                <Badge>Speed {selected.speed} ft.</Badge>
                <Badge variant="info">
                  SRD {EDITION_LABELS[selected.sourceEdition] ?? selected.sourceEdition}
                </Badge>
              </div>
            </div>

            <NoviceBox>
              <strong>What is a Species / Race?</strong> In D&amp;D your character's species
              determines their physical appearance, innate abilities, and some of their personality.
              It's one of the first choices you make. The <em>display term</em> just tells you which
              rulebook edition named them this way — "Race" (older books) or "Species" (newer
              books).
            </NoviceBox>

            {selected.description && <SrdMarkdown content={selected.description} />}

            {Object.keys(selected.abilityBonuses).length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Ability Bonuses
                  <Tip text="These numbers are added to your ability scores when you create your character. A +2 to STR means you are naturally stronger than average for your species." />
                </div>
                <ul className={styles.detailList}>
                  {Object.entries(selected.abilityBonuses).map(([ability, bonus]) => (
                    <li key={ability}>
                      <Badge variant="success">
                        {ability} +{bonus}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.detailSection}>
              <div className={styles.detailSectionLabel}>
                Size: {selected.size}
                <Tip text="Most player characters are Medium (roughly human-sized). Small characters are like halflings or gnomes. Size affects what weapons you can use and how other rules apply to you." />
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailSectionLabel}>
                Speed: {selected.speed} ft.
                <Tip text="This is how far your character can move in one turn during combat (measured in feet on a grid where each square = 5 ft). Most characters move 30 ft. per turn." />
              </div>
            </div>

            {selected.traits.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Traits
                  <Tip text="Special abilities your character gets just from being this species — no training required. Every member of the species has these." />
                </div>
                {selected.traits.map((t) => (
                  <div key={t.name} className={styles.detailSubsection}>
                    <div className={styles.detailSubsectionName}>{t.name}</div>
                    <SrdMarkdown content={t.description} />
                  </div>
                ))}
              </div>
            )}

            {selected.languages.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Languages
                  <Tip text="Languages your character can speak, read, and write by default. In D&D, different creatures and cultures have their own languages. Knowing a language lets you communicate with that group and read their written works." />
                </div>
                <ul className={styles.detailList}>
                  {selected.languages.map((l) => {
                    // Stored as "Name (Type) — script: X"
                    const namePart = l.split(' (')[0] ?? l;
                    const scriptMatch = l.match(/script: ([^)]+)/);
                    const typePart = l.match(/\(([^)]+)\)/)?.[1];
                    const fullLabel = [namePart, typePart].filter(Boolean).join(' · ');
                    return (
                      <li key={l}>
                        <span title={scriptMatch ? `Script: ${scriptMatch[1]}` : undefined}>
                          <Badge>{fullLabel}</Badge>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {selected.languageDesc && (
                  <p className={styles.detailText} style={{ marginTop: 'var(--space-2)' }}>
                    {selected.languageDesc}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
