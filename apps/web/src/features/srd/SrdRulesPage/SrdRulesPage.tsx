import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdRule, useSrdRules } from '../hooks/useSrd.js';
import { NoviceBox } from '../SrdHelpers.js';
import styles from '../SrdListPage.module.css';
import { SrdMarkdown } from '../SrdMarkdown/SrdMarkdown.js';

const CATEGORY_COLORS: Record<string, string> = {
  Combat: '#e05c5c',
  'Ability Checks': '#5c9ee0',
  Movement: '#5cb87a',
  Spellcasting: '#9b59b6',
  Equipment: '#e09d3c',
  Adventuring: '#c8a96e',
};

export function SrdRulesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<SrdRule | null>(null);

  const { data, isLoading, isError } = useSrdRules({
    q: search || undefined,
    category: category || undefined,
  });

  const rules = useMemo(() => {
    return (data ?? []).filter((r) => r.description.trim().length > 0);
  }, [data]);

  const categories = useMemo(() => {
    return [...new Set((data ?? []).map((r) => r.category))].sort();
  }, [data]);

  if (isLoading) {
    return (
      <div className={styles.loadingPane}>
        <Spinner size="lg" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className={styles.loadingPane}>
        <EmptyState icon="⚠️" title="Failed to load rules" />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.sidebarTitle}>
            <span className={styles.sidebarTitleText}>Rules</span>
            <Link to="/srd" className={styles.sidebarBack}>
              ← SRD
            </Link>
          </div>
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
          <div className={styles.chips}>
            <button
              type="button"
              className={clsx(styles.chip, category === '' && styles.chipActive)}
              onClick={() => setCategory('')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={clsx(styles.chip, category === cat && styles.chipActive)}
                onClick={() => {
                  setCategory(cat);
                  setSearch('');
                  setSelected(null);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className={styles.count}>{rules.length} rules</p>

        <div className={styles.list}>
          {rules.map((r) => (
            <button
              key={r.id}
              type="button"
              className={clsx(styles.listRow, selected?.id === r.id && styles.listRowActive)}
              onClick={() => setSelected(r)}
            >
              <span
                className={styles.rowDot}
                style={{
                  background: CATEGORY_COLORS[r.category] ?? 'var(--color-border)',
                }}
              />
              <span className={styles.rowName}>{r.topic}</span>
              <span className={styles.rowBadge}>
                <Badge size="sm">{r.category}</Badge>
              </span>
            </button>
          ))}
          {rules.length === 0 && (
            <EmptyState icon="📖" title="No rules found" description="Try a different search." />
          )}
        </div>
      </div>

      {/* ── Detail pane ── */}
      <div className={styles.detail}>
        {!selected ? (
          <div className={styles.emptyDetail}>
            <span className={styles.emptyDetailIcon}>📖</span>
            <p className={styles.emptyDetailText}>
              Select a rule topic to read the full explanation.
            </p>
            <NoviceBox label="💡 About the Rules Reference">
              The SRD (System Reference Document) is the freely available part of the D&amp;D
              rulebook that game designers can use in their own products. Everything here comes from
              that document — it covers how combat, ability checks, spellcasting, movement, and
              adventuring work. Use the search or category filters to find what you need.
            </NoviceBox>
          </div>
        ) : (
          <div className={styles.detailInner}>
            <div className={styles.detailHeader}>
              <h1 className={styles.detailTitle}>{selected.topic}</h1>
              <div className={styles.cardMeta}>
                <Badge>{selected.category}</Badge>
              </div>
            </div>

            <SrdMarkdown content={selected.description} />

            {selected.keywords.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>Related Keywords</div>
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
    </div>
  );
}
