import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdItem, useSrdItems } from '../hooks/useSrd.js';
import styles from '../SrdListPage.module.css';
import { SrdMarkdown } from '../SrdMarkdown/SrdMarkdown.js';

const CATEGORY_LABELS: Record<SrdItem['category'], string> = {
  weapon: 'Weapon',
  armor: 'Armour',
  adventuring_gear: 'Gear',
  tool: 'Tool',
  magic_item: 'Magic Item',
};

const RARITY_VARIANT: Record<
  string,
  'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
> = {
  Common: 'default',
  Uncommon: 'success',
  Rare: 'info',
  'Very Rare': 'warning',
  Legendary: 'accent',
  Artifact: 'danger',
};

export function SrdItemsPage() {
  const { data, isLoading, isError } = useSrdItems();
  const [selected, setSelected] = useState<SrdItem | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'' | SrdItem['category']>('');

  const filtered = (data ?? []).filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category ? item.category === category : true;
    return matchSearch && matchCat;
  });

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/srd" className={styles.breadcrumbLink}>
          SRD
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span>Items</span>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>Items</h1>
        <div className={styles.controls}>
          <input
            className={styles.searchInput}
            placeholder="Search items…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelected(null);
            }}
          />
          <select
            className={styles.select}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as '' | SrdItem['category']);
              setSelected(null);
            }}
          >
            <option value="">All categories</option>
            {(Object.entries(CATEGORY_LABELS) as [SrdItem['category'], string][]).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <Spinner size="lg" />}
      {isError && <EmptyState icon="⚠️" title="Failed to load items" />}

      {!isLoading && !isError && (
        <div className={styles.layout}>
          <div>
            <p className={styles.count}>{filtered.length} results</p>
            <div className={styles.grid}>
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.card}
                  onClick={() => setSelected((prev) => (prev?.id === item.id ? null : item))}
                  aria-pressed={selected?.id === item.id}
                >
                  <div className={styles.cardName}>{item.name}</div>
                  <div className={styles.cardMeta}>
                    <Badge>{CATEGORY_LABELS[item.category]}</Badge>
                    {item.rarity && (
                      <Badge variant={RARITY_VARIANT[item.rarity] ?? 'default'}>
                        {item.rarity}
                      </Badge>
                    )}
                    {item.requiresAttunement && <Badge variant="warning">Attunement</Badge>}
                  </div>
                  {item.cost && (
                    <p className={styles.cardDesc}>
                      {item.cost.amount} {item.cost.unit}
                    </p>
                  )}
                </button>
              ))}
            </div>
            {filtered.length === 0 && (
              <EmptyState icon="🗡️" title="No items found" description="Try different filters." />
            )}
          </div>

          {selected && (
            <div className={styles.detail}>
              <div className={styles.detailHeader}>
                <div>
                  <div className={styles.detailTitle}>{selected.name}</div>
                  <div className={styles.cardMeta}>
                    <Badge>{CATEGORY_LABELS[selected.category]}</Badge>
                    {selected.rarity && (
                      <Badge variant={RARITY_VARIANT[selected.rarity] ?? 'default'}>
                        {selected.rarity}
                      </Badge>
                    )}
                    {selected.requiresAttunement && (
                      <Badge variant="warning">Requires Attunement</Badge>
                    )}
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

              {selected.cost && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Cost</div>
                  <p className={styles.detailText}>
                    {selected.cost.amount} {selected.cost.unit}
                  </p>
                </div>
              )}
              {selected.weight !== null && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Weight</div>
                  <p className={styles.detailText}>{selected.weight} lb.</p>
                </div>
              )}
              <div className={styles.detailSection}>
                {selected.description ? (
                  <SrdMarkdown content={selected.description} />
                ) : (
                  <p className={styles.detailText}>No description available.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
