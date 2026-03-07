import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdMonster, useSrdMonsters } from '../hooks/useSrd.js';
import styles from '../SrdListPage.module.css';

function modifier(score: number) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : String(mod);
}

function crLabel(cr: number) {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

function MonsterDetail({ monster }: { monster: SrdMonster }) {
  const stats = monster.abilityScores;
  return (
    <div className={styles.detail}>
      <div className={styles.detailTitle}>{monster.name}</div>
      <div className={styles.cardMeta}>
        <Badge variant="danger">CR {crLabel(monster.cr)}</Badge>
        <Badge>{monster.size}</Badge>
        <Badge>{monster.type}</Badge>
        <Badge variant="default">{monster.alignment}</Badge>
      </div>

      <div className={styles.detailSection}>
        <p className={styles.detailText}>
          <strong>AC:</strong> {monster.ac}
          {monster.acType ? ` (${monster.acType})` : ''}
          {'\n'}
          <strong>HP:</strong> {monster.hp} ({monster.hpFormula}){'\n'}
          <strong>Speed:</strong>{' '}
          {Object.entries(monster.speed)
            .map(([k, v]) => `${k} ${v}`)
            .join(', ')}
        </p>
      </div>

      <hr className={styles.divider} />

      <div className={styles.statGrid}>
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className={styles.stat}>
            <div className={styles.statLabel}>{k}</div>
            <div className={styles.statValue}>{v}</div>
            <div className={styles.statMod}>{modifier(v as number)}</div>
          </div>
        ))}
      </div>

      <hr className={styles.divider} />

      <div className={styles.detailSection}>
        <p className={styles.detailText}>
          <strong>Senses:</strong> {monster.senses}
          {'\n'}
          <strong>Languages:</strong> {monster.languages}
          {'\n'}
          <strong>XP:</strong> {monster.xp.toLocaleString()}
        </p>
      </div>

      {monster.specialAbilities && monster.specialAbilities.length > 0 && (
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>Special Abilities</div>
          {monster.specialAbilities.map((a) => (
            <p key={String(a.name)} className={styles.detailText}>
              <strong>{String(a.name)}.</strong> {String(a.desc)}
            </p>
          ))}
        </div>
      )}

      {monster.actions.length > 0 && (
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>Actions</div>
          {monster.actions.map((a) => (
            <p key={String(a.name)} className={styles.detailText}>
              <strong>{String(a.name)}.</strong> {String(a.desc)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

const MONSTER_TYPES = [
  'aberration',
  'beast',
  'celestial',
  'construct',
  'dragon',
  'elemental',
  'fey',
  'fiend',
  'giant',
  'humanoid',
  'monstrosity',
  'ooze',
  'plant',
  'undead',
];

export function SrdMonstersPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [crMax, setCrMax] = useState('');
  const [selected, setSelected] = useState<SrdMonster | null>(null);

  const { data, isLoading, isError } = useSrdMonsters({
    name: search || undefined,
    type: type || undefined,
    crMax: crMax || undefined,
  });

  const monsters = data ?? [];

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/srd" className={styles.breadcrumbLink}>
          SRD
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span>Monsters</span>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>Monsters</h1>
        <div className={styles.controls}>
          <input
            className={styles.searchInput}
            placeholder="Search monsters…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelected(null);
            }}
          />
          <select
            className={styles.select}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setSelected(null);
            }}
          >
            <option value="">All types</option>
            {MONSTER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={crMax}
            onChange={(e) => {
              setCrMax(e.target.value);
              setSelected(null);
            }}
          >
            <option value="">Max CR</option>
            {[
              '0',
              '0.125',
              '0.25',
              '0.5',
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
              '10',
              '12',
              '15',
              '20',
              '24',
              '30',
            ].map((c) => (
              <option key={c} value={c}>
                CR ≤ {c === '0.125' ? '1/8' : c === '0.25' ? '1/4' : c === '0.5' ? '1/2' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <Spinner size="lg" label="Loading monsters…" />}
      {isError && <EmptyState icon="⚠️" title="Failed to load monsters" />}

      {!isLoading && !isError && (
        <div className={styles.layout}>
          <div>
            <p className={styles.count}>{monsters.length} results</p>
            <div className={styles.grid}>
              {monsters.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={styles.card}
                  onClick={() => setSelected(m)}
                  aria-pressed={selected?.id === m.id}
                >
                  <div className={styles.cardName}>{m.name}</div>
                  <div className={styles.cardMeta}>
                    <Badge variant="danger">CR {crLabel(m.cr)}</Badge>
                    <Badge>{m.size}</Badge>
                    <Badge>{m.type}</Badge>
                  </div>
                  <p className={styles.cardDesc}>
                    AC {m.ac} · HP {m.hp} · {m.alignment}
                  </p>
                </button>
              ))}
            </div>
            {monsters.length === 0 && (
              <EmptyState
                icon="🐉"
                title="No monsters found"
                description="Try different filters."
              />
            )}
          </div>
          {selected && <MonsterDetail monster={selected} />}
        </div>
      )}
    </div>
  );
}
