import { useState } from 'react';
import { Button } from '../../../components/ui/Button/Button.js';
import { Spinner } from '../../../components/ui/Spinner/Spinner.js';
import { useSrdMonsterDetail, useSrdMonsters } from '../../srd/hooks/useSrd.js';
import {
  type EncounterMonster,
  useAddEncounterMonster,
  useEncounter,
  useEncounterMonsters,
  useRemoveEncounterMonster,
} from '../hooks/useAdventures.js';
import styles from './EncounterPanel.module.css';

type Props = {
  adventureId: string;
  sceneId: string;
  partyLevel?: number;
  partySize?: number;
};

// XP thresholds per player per level [easy, medium, hard, deadly]
const XP_THRESHOLDS: Record<number, [number, number, number, number]> = {
  1: [25, 50, 75, 100],
  2: [50, 100, 150, 200],
  3: [75, 150, 225, 400],
  4: [125, 250, 375, 500],
  5: [250, 500, 750, 1100],
  6: [300, 600, 900, 1400],
  7: [350, 750, 1100, 1700],
  8: [450, 900, 1400, 2100],
  9: [550, 1100, 1600, 2400],
  10: [600, 1200, 1900, 2800],
  11: [800, 1600, 2400, 3600],
  12: [1000, 2000, 3000, 4500],
  13: [1100, 2200, 3400, 5100],
  14: [1250, 2500, 3800, 5700],
  15: [1400, 2800, 4300, 6400],
  16: [1600, 3200, 4800, 7200],
  17: [2000, 3900, 5900, 8800],
  18: [2100, 4200, 6300, 9500],
  19: [2400, 4900, 7300, 10900],
  20: [2800, 5700, 8500, 12700],
};

type Difficulty = 'easy' | 'medium' | 'hard' | 'deadly' | 'trivial';

function getEncounterMultiplier(monsterCount: number): number {
  if (monsterCount <= 1) return 1.0;
  if (monsterCount === 2) return 1.5;
  if (monsterCount <= 6) return 2.0;
  if (monsterCount <= 10) return 2.5;
  if (monsterCount <= 14) return 3.0;
  return 4.0;
}

function calcDifficulty(
  entries: Array<{ xp: number; quantity: number }>,
  partyLevel: number,
  partySize: number,
): { difficulty: Difficulty; adjustedXp: number } {
  const clampedLevel = Math.max(1, Math.min(20, partyLevel));
  const thresholds = XP_THRESHOLDS[clampedLevel];
  if (!thresholds) return { difficulty: 'trivial', adjustedXp: 0 };

  const rawXp = entries.reduce((sum, e) => sum + e.xp * e.quantity, 0);
  const totalCount = entries.reduce((sum, e) => sum + e.quantity, 0);
  const multiplier = getEncounterMultiplier(totalCount);
  const adjustedXp = Math.floor(rawXp * multiplier);

  const [easy, medium, hard, deadly] = thresholds;
  const partyEasy = easy * partySize;
  const partyMedium = medium * partySize;
  const partyHard = hard * partySize;
  const partyDeadly = deadly * partySize;

  let difficulty: Difficulty;
  if (adjustedXp >= partyDeadly) difficulty = 'deadly';
  else if (adjustedXp >= partyHard) difficulty = 'hard';
  else if (adjustedXp >= partyMedium) difficulty = 'medium';
  else if (adjustedXp >= partyEasy) difficulty = 'easy';
  else difficulty = 'trivial';

  return { difficulty, adjustedXp };
}

function DifficultyBadge({
  difficulty,
  adjustedXp,
}: {
  difficulty: Difficulty;
  adjustedXp: number;
}) {
  const labels: Record<Difficulty, string> = {
    trivial: 'Trivial',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    deadly: 'Deadly',
  };
  return (
    <span className={`${styles.diffBadge} ${styles[`diffBadge_${difficulty}`]}`}>
      {labels[difficulty]} ({adjustedXp} XP)
    </span>
  );
}

function MonsterRow({
  entry,
  adventureId,
  sceneId,
}: {
  entry: EncounterMonster;
  adventureId: string;
  sceneId: string;
}) {
  const { data: monster } = useSrdMonsterDetail(entry.srdMonsterId ?? '');
  const addMonster = useAddEncounterMonster(adventureId, sceneId);
  const removeMonster = useRemoveEncounterMonster(adventureId, sceneId);

  const displayName = monster?.name ?? 'Custom monster';
  const cr = monster?.cr;

  function adjustQuantity(delta: number) {
    const next = entry.quantity + delta;
    if (next <= 0) {
      void removeMonster.mutate(entry.id);
    } else {
      void addMonster.mutate({
        srdMonsterId: entry.srdMonsterId ?? undefined,
        quantity: next,
      });
    }
  }

  return (
    <li className={styles.monsterRow}>
      <div className={styles.monsterInfo}>
        <span className={styles.monsterName}>{displayName}</span>
        {cr !== undefined && <span className={styles.monsterMeta}>CR {cr}</span>}
      </div>
      <div className={styles.monsterControls}>
        <button
          type="button"
          className={styles.qtyBtn}
          onClick={() => adjustQuantity(-1)}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className={styles.qty}>{entry.quantity}</span>
        <button
          type="button"
          className={styles.qtyBtn}
          onClick={() => adjustQuantity(1)}
          aria-label="Increase quantity"
        >
          +
        </button>
        <Button variant="ghost" size="sm" onClick={() => void removeMonster.mutate(entry.id)}>
          ×
        </Button>
      </div>
    </li>
  );
}

function MonsterSearchResults({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (id: string) => void;
}) {
  const { data: monsters, isFetching } = useSrdMonsters(
    query.trim().length >= 2 ? { name: query.trim() } : undefined,
  );

  if (!query.trim() || query.trim().length < 2) return null;

  return (
    <div className={styles.searchResults}>
      {isFetching && <p className={styles.searchHint}>Searching…</p>}
      {!isFetching && (!monsters || monsters.length === 0) && (
        <p className={styles.searchHint}>No monsters found.</p>
      )}
      {monsters && monsters.length > 0 && (
        <ul className={styles.resultList}>
          {monsters.slice(0, 8).map((m) => (
            <li key={m.id}>
              <button type="button" className={styles.resultItem} onClick={() => onSelect(m.id)}>
                <span>{m.name}</span>
                <span className={styles.resultMeta}>
                  CR {m.cr} · {m.xp} XP
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EncounterPanel({ adventureId, sceneId, partyLevel = 1, partySize = 4 }: Props) {
  const { isLoading: encounterLoading } = useEncounter(adventureId, sceneId);
  const { data: monsterEntries, isLoading: monstersLoading } = useEncounterMonsters(
    adventureId,
    sceneId,
  );
  const addMonster = useAddEncounterMonster(adventureId, sceneId);

  const [search, setSearch] = useState('');

  const isLoading = encounterLoading || monstersLoading;

  function handleSelectMonster(srdMonsterId: string) {
    void addMonster.mutate({ srdMonsterId, quantity: 1 });
    setSearch('');
  }

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="sm" />
      </div>
    );
  }

  const entries = monsterEntries ?? [];

  // Difficulty calc requires XP — we pass 0 for custom monsters without SRD data.
  // A future enhancement can resolve XP from loaded SRD monster details.
  const { difficulty, adjustedXp } = calcDifficulty(
    entries.map((e) => ({ xp: 0, quantity: e.quantity })),
    partyLevel,
    partySize,
  );

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Encounter</h3>
        {entries.length > 0 && <DifficultyBadge difficulty={difficulty} adjustedXp={adjustedXp} />}
      </div>

      {entries.length > 0 && (
        <ul className={styles.monsterList}>
          {entries.map((entry) => (
            <MonsterRow key={entry.id} entry={entry} adventureId={adventureId} sceneId={sceneId} />
          ))}
        </ul>
      )}

      <div className={styles.addMonster}>
        <div className={styles.searchWrap}>
          <input
            className={styles.input}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SRD monsters to add…"
            autoComplete="off"
          />
          <MonsterSearchResults query={search} onSelect={handleSelectMonster} />
        </div>
      </div>

      {addMonster.isPending && <p className={styles.hint}>Adding…</p>}
    </div>
  );
}
