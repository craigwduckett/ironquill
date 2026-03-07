import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { useState } from 'react';
import { Badge, Button, Spinner } from '../../../components/ui/index.js';
import type { CharacterSummary } from '../hooks/useCharacters.js';
import { useDeleteCharacter } from '../hooks/useCharacters.js';
import styles from './CharacterCard.module.css';

type CharacterCardProps = {
  character: CharacterSummary;
  speciesName?: string;
  className?: string;
};

function hpVariant(current: number, max: number): 'full' | 'mid' | 'low' {
  if (max === 0) return 'full';
  const pct = current / max;
  if (pct > 0.5) return 'full';
  if (pct > 0.25) return 'mid';
  return 'low';
}

function hpPercent(current: number, max: number): number {
  if (max === 0) return 100;
  return Math.min(100, Math.round((current / max) * 100));
}

export function CharacterCard({ character, speciesName, className }: CharacterCardProps) {
  const [confirming, setConfirming] = useState(false);
  const deleteCharacter = useDeleteCharacter();

  const variant = hpVariant(character.hpCurrent, character.hpMax);
  const pct = hpPercent(character.hpCurrent, character.hpMax);

  function handleDelete() {
    deleteCharacter.mutate(character.id, {
      onSuccess: () => setConfirming(false),
    });
  }

  return (
    <div className={clsx(styles.card, className)}>
      {/* Delete confirm overlay */}
      {confirming && (
        <div className={styles.confirmOverlay}>
          <p className={styles.confirmText}>
            Permanently delete <span className={styles.confirmName}>{character.name}</span>?
            <br />
            This cannot be undone.
          </p>
          <div className={styles.confirmActions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(false)}
              disabled={deleteCharacter.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteCharacter.isPending}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Header — portrait + identity */}
      <div className={styles.header}>
        <div className={styles.portrait} aria-hidden="true">
          {character.portraitId ? (
            <img src={character.portraitId} alt={character.name} className={styles.portraitImg} />
          ) : (
            '⚔️'
          )}
        </div>
        <div className={styles.identity}>
          <div className={styles.name}>{character.name}</div>
          <div className={styles.meta}>
            <Badge variant="accent">Lvl {character.level}</Badge>
            {speciesName && <Badge>{speciesName}</Badge>}
          </div>
        </div>
      </div>

      {/* HP bar */}
      {character.hpMax > 0 && (
        <div
          className={styles.hpBar}
          role="progressbar"
          aria-label={`HP: ${character.hpCurrent} / ${character.hpMax}`}
          aria-valuenow={character.hpCurrent}
          aria-valuemin={0}
          aria-valuemax={character.hpMax}
        >
          <div
            className={clsx(styles.hpFill, styles[`hpFill--${variant}`])}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>HP</div>
          <div className={styles.statValue}>
            {character.hpCurrent}/{character.hpMax}
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>AC</div>
          <div className={styles.statValue}>{character.ac}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Level</div>
          <div className={styles.statValue}>{character.level}</div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.footer}>
        <Link to="/characters/$id" params={{ id: character.id }} className={styles.footerAction}>
          <Button variant="secondary" size="sm" fullWidth>
            View sheet
          </Button>
        </Link>
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => setConfirming(true)}
          aria-label={`Delete ${character.name}`}
          disabled={deleteCharacter.isPending}
        >
          {deleteCharacter.isPending ? <Spinner size="sm" /> : '🗑'}
        </button>
      </div>
    </div>
  );
}
