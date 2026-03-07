import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdRule, useSrdRules } from '../hooks/useSrd.js';
import styles from '../SrdListPage.module.css';
import { SrdMarkdown } from '../SrdMarkdown/SrdMarkdown.js';

export function SrdRulesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<SrdRule | null>(null);

  const { data, isLoading, isError } = useSrdRules({
    q: search || undefined,
    category: category || undefined,
  });

  const rules = (data ?? []).filter((r) => r.description.trim().length > 0);
  const categories = [...new Set((data ?? []).map((r) => r.category))].sort();

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/srd" className={styles.breadcrumbLink}>
          SRD
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span>Rules</span>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>Rules</h1>
        <div className={styles.controls}>
          <input
            className={styles.searchInput}
            placeholder="Search rules…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCategory('');
              setSelected(null);
            }}
          />
          <select
            className={styles.select}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSearch('');
              setSelected(null);
            }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <Spinner size="lg" />}
      {isError && <EmptyState icon="⚠️" title="Failed to load rules" />}

      {!isLoading && !isError && (
        <div className={styles.layout}>
          <div>
            <p className={styles.count}>{rules.length} results</p>
            <div className={styles.grid}>
              {rules.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={styles.card}
                  onClick={() => setSelected((prev) => (prev?.id === r.id ? null : r))}
                  aria-pressed={selected?.id === r.id}
                >
                  <div className={styles.cardName}>{r.topic}</div>
                  <div className={styles.cardMeta}>
                    <Badge>{r.category}</Badge>
                  </div>
                  <p className={styles.cardDesc}>{r.description.slice(0, 120)}…</p>
                </button>
              ))}
            </div>
            {rules.length === 0 && (
              <EmptyState icon="📖" title="No rules found" description="Try a different search." />
            )}
          </div>

          {selected && (
            <div className={styles.detail}>
              <div className={styles.detailHeader}>
                <div>
                  <div className={styles.detailTitle}>{selected.topic}</div>
                  <div className={styles.cardMeta}>
                    <Badge>{selected.category}</Badge>
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
              <SrdMarkdown content={selected.description} />
              {selected.keywords.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Keywords</div>
                  <ul className={styles.detailList}>
                    {selected.keywords.map((k) => (
                      <li key={k}>
                        <Badge variant="info">{k}</Badge>
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
