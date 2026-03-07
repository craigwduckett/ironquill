/**
 * Shared novice-friendly UI helpers for SRD pages.
 * - Tip: an inline "?" tooltip showing a plain-English explanation
 * - NoviceBox: a callout that explains what a section means for new players
 */
import type { ReactNode } from 'react';
import styles from './SrdListPage.module.css';

type TipProps = { text: string };

export function Tip({ text }: TipProps) {
  return (
    <span className={styles.tooltip}>
      <span className={styles.tooltipTrigger} aria-label="More info" role="img">
        ?
      </span>
      <span className={styles.tooltipBox} role="tooltip">
        {text}
      </span>
    </span>
  );
}

type NoviceBoxProps = { label?: string; children: ReactNode };

export function NoviceBox({ label = '💡 New to D&D?', children }: NoviceBoxProps) {
  return (
    <div className={styles.noviceBox}>
      <div className={styles.noviceBoxLabel}>{label}</div>
      {children}
    </div>
  );
}
