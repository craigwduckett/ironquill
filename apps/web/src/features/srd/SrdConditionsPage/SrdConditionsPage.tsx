import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdCondition, useSrdConditions } from '../hooks/useSrd.js';
import styles from '../SrdListPage.module.css';
import { SrdMarkdown } from '../SrdMarkdown/SrdMarkdown.js';

export function SrdConditionsPage() {
  const { data, isLoading, isError } = useSrdConditions();
  const [selected, setSelected] = useState<SrdCondition | null>(null);
  const [edition, setEdition] = useState<'' | '2014' | '2024'>('');

  const filtered = (data ?? []).filter((c) => (edition ? c.sourceEdition === edition : true));

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/srd" className={styles.breadcrumbLink}>
          SRD
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span>Conditions</span>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>Conditions</h1>
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
      {isError && <EmptyState icon="⚠️" title="Failed to load conditions" />}

      {!isLoading && !isError && (
        <div className={styles.layout}>
          <div>
            <p className={styles.count}>{filtered.length} results</p>
            <div className={styles.grid}>
              {filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={styles.card}
                  onClick={() => setSelected((prev) => (prev?.id === c.id ? null : c))}
                  aria-pressed={selected?.id === c.id}
                >
                  <div className={styles.cardName}>{c.name}</div>
                  <div className={styles.cardMeta}>
                    <Badge variant="info">{c.sourceEdition}</Badge>
                  </div>
                  <p className={styles.cardDesc}>{c.mechanicalEffects[0]}</p>
                </button>
              ))}
            </div>
          </div>

          {selected && (
            <div className={styles.detail}>
              <div className={styles.detailHeader}>
                <div>
                  <div className={styles.detailTitle}>{selected.name}</div>
                  <div className={styles.cardMeta}>
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

              <div className={styles.detailSection}>
                <SrdMarkdown content={selected.description} />
              </div>

              {selected.mechanicalEffects.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Effects</div>
                  <ul style={{ paddingLeft: 'var(--space-4)' }}>
                    {selected.mechanicalEffects.map((e) => (
                      <li key={e} className={styles.detailText}>
                        {e}
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
