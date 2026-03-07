import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdSpecies, useSrdSpecies } from '../hooks/useSrd.js';
import styles from '../SrdListPage.module.css';

function SpeciesDetail({ species }: { species: SrdSpecies }) {
  return (
    <div className={styles.detail}>
      <div className={styles.detailTitle}>{species.name}</div>

      <div className={styles.cardMeta}>
        <Badge variant="accent">{species.displayTerm}</Badge>
        <Badge>{species.size}</Badge>
        <Badge>Speed {species.speed} ft.</Badge>
        <Badge variant="info">{species.sourceEdition}</Badge>
      </div>

      {species.description && <p className={styles.detailText}>{species.description}</p>}

      {Object.keys(species.abilityBonuses).length > 0 && (
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>Ability Bonuses</div>
          <ul className={styles.detailList}>
            {Object.entries(species.abilityBonuses).map(([ability, bonus]) => (
              <li key={ability}>
                <Badge variant="success">
                  {ability} +{bonus}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {species.traits.length > 0 && (
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>Traits</div>
          <ul className={styles.detailList}>
            {species.traits.map((t) => (
              <li key={t.name}>
                <Badge>{t.name}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {species.languages.length > 0 && (
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>Languages</div>
          <ul className={styles.detailList}>
            {species.languages.map((l) => (
              <li key={l}>
                <Badge variant="default">{l}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
                  onClick={() => setSelected(s)}
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

          {selected && <SpeciesDetail species={selected} />}
        </div>
      )}
    </div>
  );
}
