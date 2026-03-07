import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdFeat, useSrdFeats } from '../hooks/useSrd.js';
import { NoviceBox, Tip } from '../SrdHelpers.js';
import styles from '../SrdListPage.module.css';
import { SrdMarkdown } from '../SrdMarkdown/SrdMarkdown.js';

const FEAT_TYPE_LABELS: Record<string, string> = {
  origin: 'Origin',
  general: 'General',
  'fighting-style': 'Fighting Style',
  'epic-boon': 'Epic Boon',
};

const FEAT_TYPE_VARIANTS: Record<string, 'accent' | 'success' | 'warning' | 'info'> = {
  origin: 'info',
  general: 'accent',
  'fighting-style': 'warning',
  'epic-boon': 'success',
};

const FEAT_TYPE_COLORS: Record<string, string> = {
  origin: 'var(--color-info)',
  general: 'var(--color-accent)',
  'fighting-style': 'var(--color-warning)',
  'epic-boon': 'var(--color-success)',
};

const ALL_FEAT_TYPES = ['All', 'origin', 'general', 'fighting-style', 'epic-boon'] as const;

export function SrdFeatsPage() {
  const { data, isLoading, isError } = useSrdFeats();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selected, setSelected] = useState<SrdFeat | null>(null);

  const filtered = useMemo(() => {
    return (data ?? [])
      .filter((f) => typeFilter === 'All' || f.type === typeFilter)
      .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, typeFilter, search]);

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
        <EmptyState icon="⚠️" title="Failed to load feats" />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.sidebarTitle}>
            <span className={styles.sidebarTitleText}>Feats</span>
            <Link to="/srd" className={styles.sidebarBack}>
              ← SRD
            </Link>
          </div>
          <input
            className={styles.searchInput}
            placeholder="Search feats…"
            aria-label="Search feats"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.chips}>
            {ALL_FEAT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={clsx(styles.chip, typeFilter === t && styles.chipActive)}
                onClick={() => setTypeFilter(t)}
              >
                {t === 'All' ? 'All' : (FEAT_TYPE_LABELS[t] ?? t)}
              </button>
            ))}
          </div>
        </div>

        <p className={styles.count}>
          {filtered.length} of {(data ?? []).length} feats
        </p>

        <div className={styles.list}>
          {filtered.map((f) => (
            <button
              key={f.id}
              type="button"
              className={clsx(styles.listRow, selected?.id === f.id && styles.listRowActive)}
              onClick={() => setSelected(f)}
            >
              <span
                className={styles.rowDot}
                style={{
                  background: FEAT_TYPE_COLORS[f.type] ?? 'var(--color-accent)',
                }}
              />
              <span className={styles.rowName}>{f.name}</span>
              <span className={styles.rowCategory}>{FEAT_TYPE_LABELS[f.type] ?? f.type}</span>
              <span className={styles.rowBadge}>
                <Badge variant={FEAT_TYPE_VARIANTS[f.type] ?? 'accent'} size="sm">
                  {FEAT_TYPE_LABELS[f.type] ?? f.type}
                </Badge>
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <EmptyState
              icon="⭐"
              title="No results"
              description="Try a different search or filter."
            />
          )}
        </div>
      </div>

      {/* ── Detail pane ── */}
      <div key={selected?.id ?? 'empty'} className={styles.detail}>
        {!selected ? (
          <div className={styles.emptyDetail}>
            <span className={styles.emptyDetailIcon}>⭐</span>
            <p className={styles.emptyDetailText}>
              Select a feat to see what special ability it grants your character.
            </p>
          </div>
        ) : (
          <div className={styles.detailInner}>
            <div className={styles.detailHeader}>
              <h1 className={styles.detailTitle}>{selected.name}</h1>
              <div className={styles.cardMeta}>
                <Badge variant={FEAT_TYPE_VARIANTS[selected.type] ?? 'accent'}>
                  {FEAT_TYPE_LABELS[selected.type] ?? selected.type}
                </Badge>
                {selected.repeatable && <Badge variant="info">Repeatable</Badge>}
              </div>
            </div>

            <NoviceBox>
              <strong>What is a Feat?</strong> Feats are optional special abilities you can take
              instead of an Ability Score Improvement when you level up. <em>Origin</em> feats are
              granted by your Background at character creation. <em>General</em> feats are available
              to any character meeting the prerequisites. <em>Fighting Style</em> feats give combat
              techniques. <em>Epic Boon</em> feats are powerful rewards at level 19–20.
            </NoviceBox>

            {selected.prerequisites && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Prerequisites
                  <Tip text="You must meet these requirements to take this feat. Prerequisites are checked when you choose the feat, not every level." />
                </div>
                <ul className={styles.detailList}>
                  {selected.prerequisites.level && (
                    <li>
                      <Badge variant="warning">Level {selected.prerequisites.level}+</Badge>
                    </li>
                  )}
                  {selected.prerequisites.ability && (
                    <li>
                      <Badge>{selected.prerequisites.ability}</Badge>
                    </li>
                  )}
                  {selected.prerequisites.proficiency && (
                    <li>
                      <Badge>Proficiency: {selected.prerequisites.proficiency}</Badge>
                    </li>
                  )}
                  {selected.prerequisites.spellcasting && (
                    <li>
                      <Badge variant="info">Spellcasting ability</Badge>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className={styles.detailSection}>
              <SrdMarkdown content={selected.description} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
