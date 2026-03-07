import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdSpecies, useSrdSpecies } from '../hooks/useSrd.js';
import styles from '../SrdListPage.module.css';
import { SrdMarkdown } from '../SrdMarkdown/SrdMarkdown.js';

export function SrdSpeciesPage() {
  const { data, isLoading, isError } = useSrdSpecies();
  const [selected, setSelected] = useState<SrdSpecies | null>(null);
  const [search, setSearch] = useState('');

  const filtered = (data ?? []).filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/srd" className={styles.breadcrumbLink}>
          SRD
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span>Species</span>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>Species</h1>
        <div className={styles.controls}>
          <input
            className={styles.searchInput}
            placeholder="Search species…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <Spinner size="lg" label="Loading species…" />}
      {isError && (
        <EmptyState
          icon="⚠️"
          title="Failed to load species"
          description="Check the API is running."
        />
      )}

      {!isLoading && !isError && (
        <div className={styles.layout}>
          <div>
            <p className={styles.count}>{filtered.length} results</p>
            <div className={styles.grid}>
              {filtered.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={styles.card}
                  onClick={() => setSelected((prev) => (prev?.id === s.id ? null : s))}
                  aria-pressed={selected?.id === s.id}
                >
                  <div className={styles.cardName}>{s.name}</div>
                  <div className={styles.cardMeta}>
                    <Badge variant="accent">{s.displayTerm}</Badge>
                    <Badge>{s.size}</Badge>
                    <Badge>Speed {s.speed} ft.</Badge>
                  </div>
                  {s.traits.length > 0 && (
                    <p className={styles.cardDesc}>{s.traits.map((t) => t.name).join(' · ')}</p>
                  )}
                </button>
              ))}
            </div>
            {filtered.length === 0 && (
              <EmptyState icon="🧝" title="No results" description="Try a different search." />
            )}
          </div>

          {selected && (
            <div className={styles.detail}>
              <div className={styles.detailHeader}>
                <div>
                  <div className={styles.detailTitle}>{selected.name}</div>
                  <div className={styles.cardMeta}>
                    <Badge variant="accent">{selected.displayTerm}</Badge>
                    <Badge>{selected.size}</Badge>
                    <Badge>Speed {selected.speed} ft.</Badge>
                    <Badge variant="info">{selected.sourceEdition}</Badge>
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

              {selected.description && <SrdMarkdown content={selected.description} />}

              {Object.keys(selected.abilityBonuses).length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Ability Bonuses</div>
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

              {selected.traits.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Traits</div>
                  {selected.traits.map((t) => (
                    <div key={t.name} className={styles.detailSection}>
                      <div className={styles.detailSectionLabel}>{t.name}</div>
                      <SrdMarkdown content={t.description} />
                    </div>
                  ))}
                </div>
              )}

              {selected.languages.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Languages</div>
                  <ul className={styles.detailList}>
                    {selected.languages.map((l) => (
                      <li key={l}>
                        <Badge variant="default">{l}</Badge>
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
