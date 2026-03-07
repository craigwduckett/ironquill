import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdClass, useSrdClasses } from '../hooks/useSrd.js';
import styles from '../SrdListPage.module.css';

function ClassDetail({ cls }: { cls: SrdClass }) {
  return (
    <div className={styles.detail}>
      <div className={styles.detailTitle}>{cls.name}</div>
      <div className={styles.cardMeta}>
        <Badge variant="accent">Hit Die {cls.hitDie}</Badge>
      </div>

      {cls.savingThrows.length > 0 && (
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>Saving Throws</div>
          <ul className={styles.detailList}>
            {cls.savingThrows.map((s) => (
              <li key={s}>
                <Badge variant="warning">{s}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {cls.armorProficiencies.length > 0 && (
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>Armour Proficiencies</div>
          <ul className={styles.detailList}>
            {cls.armorProficiencies.map((a) => (
              <li key={a}>
                <Badge>{a}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {cls.weaponProficiencies.length > 0 && (
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>Weapon Proficiencies</div>
          <ul className={styles.detailList}>
            {cls.weaponProficiencies.map((w) => (
              <li key={w}>
                <Badge>{w}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {cls.skillChoices && (
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>Skills (choose {cls.skillChoices.choose})</div>
          <ul className={styles.detailList}>
            {cls.skillChoices.from.map((s) => (
              <li key={s}>
                <Badge variant="info">{s}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {cls.startingEquipment.length > 0 && (
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>Starting Equipment</div>
          <ul className={styles.detailList}>
            {cls.startingEquipment.map((e) => (
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
  );
}

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
                  onClick={() => setSelected(c)}
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
          {selected && <ClassDetail cls={selected} />}
        </div>
      )}
    </div>
  );
}
