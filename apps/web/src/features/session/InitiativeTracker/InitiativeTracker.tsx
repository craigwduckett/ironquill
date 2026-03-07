import type { InitiativeEntry } from '../hooks/useSessions.js';
import styles from './InitiativeTracker.module.css';

type Props = {
  entries: InitiativeEntry[];
  round: number;
  isDm: boolean;
  onAdvance?: () => void;
  onEndCombat?: () => void;
};

export function InitiativeTracker({ entries, round, isDm, onAdvance, onEndCombat }: Props) {
  return (
    <div className={styles.tracker}>
      <div className={styles.header}>
        <span className={styles.title}>Initiative — Round {round}</span>
        {isDm && (
          <div className={styles.actions}>
            <button type="button" className={styles.advanceBtn} onClick={onAdvance}>
              Next Turn
            </button>
            <button type="button" className={styles.endBtn} onClick={onEndCombat}>
              End Combat
            </button>
          </div>
        )}
      </div>

      <ol className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.id} className={`${styles.entry} ${entry.isCurrent ? styles.current : ''}`}>
            <span className={styles.initiative}>{entry.initiative}</span>
            <span className={styles.label}>{entry.label}</span>
            {entry.isCurrent && <span className={styles.badge}>Active</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
