import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdBackground, useSrdBackgrounds } from '../hooks/useSrd.js';
import styles from '../SrdListPage.module.css';

export function SrdBackgroundsPage() {
  const { data, isLoading, isError } = useSrdBackgrounds();
  const [selected, setSelected] = useState<SrdBackground | null>(null);
  const [edition, setEdition] = useState<'' | '2014' | '2024'>('');

  const filtered = (data ?? []).filter((b) => (edition ? b.sourceEdition === edition : true));

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/srd" className={styles.breadcrumbLink}>
          SRD
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span>Backgrounds</span>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>Backgrounds</h1>
        <div className={styles.controls}>
          <select
            className={styles.select}
            value={edition}
            onChange={(e) => setEdition(e.target.value as '' | '2014' | '2024')}
          >
            <option value="">All editions</option>
            <option value="2014">2014 (SRD 5.1)</option>
            <option value="2024">2024 (SRD 5.2)</option>
          </select>
        </div>
      </div>

      {isLoading && <Spinner size="lg" />}
      {isError && <EmptyState icon="⚠️" title="Failed to load backgrounds" />}

      {!isLoading && !isError && (
        <div className={styles.layout}>
          <div>
            <p className={styles.count}>{filtered.length} results</p>
            <div className={styles.grid}>
              {filtered.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={styles.card}
                  onClick={() => setSelected(b)}
                  aria-pressed={selected?.id === b.id}
                >
                  <div className={styles.cardName}>{b.name}</div>
                  <div className={styles.cardMeta}>
                    <Badge variant="info">{b.sourceEdition}</Badge>
                    {b.skillProficiencies.map((s) => (
                      <Badge key={s} variant="success">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <p className={styles.cardDesc}>{b.featureName}</p>
                </button>
              ))}
            </div>
          </div>

          {selected && (
            <div className={styles.detail}>
              <div className={styles.detailTitle}>{selected.name}</div>
              <div className={styles.cardMeta}>
                <Badge variant="info">{selected.sourceEdition}</Badge>
              </div>

              {selected.skillProficiencies.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Skill Proficiencies</div>
                  <ul className={styles.detailList}>
                    {selected.skillProficiencies.map((s) => (
                      <li key={s}>
                        <Badge variant="success">{s}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selected.toolProficiencies.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Tool Proficiencies</div>
                  <ul className={styles.detailList}>
                    {selected.toolProficiencies.map((t) => (
                      <li key={t}>
                        <Badge>{t}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>Feature: {selected.featureName}</div>
                <p className={styles.detailText}>{selected.featureDescription}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
