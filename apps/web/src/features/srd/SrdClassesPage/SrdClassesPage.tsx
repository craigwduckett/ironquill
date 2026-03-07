import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdClass, useSrdClasses } from '../hooks/useSrd.js';
import styles from '../SrdListPage.module.css';
import { SrdMarkdown } from '../SrdMarkdown/SrdMarkdown.js';

export function SrdClassesPage() {
  const { data, isLoading, isError } = useSrdClasses();
  const [selected, setSelected] = useState<SrdClass | null>(null);
  const [search, setSearch] = useState('');

  const filtered = (data ?? []).filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/srd" className={styles.breadcrumbLink}>
          SRD
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span>Classes</span>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>Classes</h1>
        <div className={styles.controls}>
          <input
            className={styles.searchInput}
            placeholder="Search classes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <Spinner size="lg" />}
      {isError && <EmptyState icon="⚠️" title="Failed to load classes" />}

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
                    <Badge variant="accent">Hit Die {c.hitDie}</Badge>
                    {c.savingThrows.map((s) => (
                      <Badge key={s} variant="warning">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  {c.skillChoices && (
                    <p className={styles.cardDesc}>
                      Choose {c.skillChoices.choose} skills from {c.skillChoices.from.length}{' '}
                      options
                    </p>
                  )}
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
                    <Badge variant="accent">Hit Die {selected.hitDie}</Badge>
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

              {selected.description && (
                <div className={styles.detailSection}>
                  <SrdMarkdown content={selected.description} />
                </div>
              )}

              {selected.savingThrows.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Saving Throws</div>
                  <ul className={styles.detailList}>
                    {selected.savingThrows.map((s) => (
                      <li key={s}>
                        <Badge variant="warning">{s}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.armorProficiencies.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Armour Proficiencies</div>
                  <ul className={styles.detailList}>
                    {selected.armorProficiencies.map((a) => (
                      <li key={a}>
                        <Badge>{a}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.weaponProficiencies.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Weapon Proficiencies</div>
                  <ul className={styles.detailList}>
                    {selected.weaponProficiencies.map((w) => (
                      <li key={w}>
                        <Badge>{w}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.skillChoices && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>
                    Skills (choose {selected.skillChoices.choose})
                  </div>
                  <ul className={styles.detailList}>
                    {selected.skillChoices.from.map((s) => (
                      <li key={s}>
                        <Badge variant="info">{s}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.startingEquipment.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionLabel}>Starting Equipment</div>
                  <ul className={styles.detailList}>
                    {selected.startingEquipment.map((e) => (
                      <li key={`${String(e.name)}-eq`}>
                        <Badge>
                          {String(e.name)} ×{String(e.quantity)}
                        </Badge>
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
