import type { SrdBackground, SrdClass, SrdSpecies } from '../../srd/hooks/useSrd.js';
import styles from './CharacterWizard.module.css';
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  ALIGNMENTS,
  formatModifier,
  type WizardDraft,
} from './wizardState.js';

type Props = {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
  species: SrdSpecies | null;
  srdClass: SrdClass | null;
  background: SrdBackground | null;
};

export function Step5Review({ draft, onChange, species, srdClass, background }: Props) {
  const bonuses = species?.abilityBonuses ?? {};

  return (
    <div>
      <h2 className={styles.stepHeading}>Name &amp; Review</h2>
      <p className={styles.stepSubtitle}>
        Give your character a name, add some personality, then create them.
      </p>

      {/* Name & alignment */}
      <div className={styles.formColumns} style={{ marginBottom: 'var(--space-6)' }}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="char-name">
            Character Name *
          </label>
          <input
            id="char-name"
            type="text"
            className={styles.formInput}
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Thordak Ironforge"
            maxLength={100}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="char-alignment">
            Alignment
          </label>
          <select
            id="char-alignment"
            className={styles.formSelect}
            value={draft.alignment}
            onChange={(e) => onChange({ alignment: e.target.value })}
          >
            <option value="">— choose —</option>
            {ALIGNMENTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appearance */}
      <p className={styles.formLabel} style={{ marginBottom: 'var(--space-3)' }}>
        Appearance
      </p>
      <div className={styles.formColumns}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="char-age">
            Age
          </label>
          <input
            id="char-age"
            type="text"
            className={styles.formInput}
            value={draft.appearance.age}
            onChange={(e) =>
              onChange({
                appearance: { ...draft.appearance, age: e.target.value },
              })
            }
            placeholder="e.g. 34"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="char-height">
            Height
          </label>
          <input
            id="char-height"
            type="text"
            className={styles.formInput}
            value={draft.appearance.height}
            onChange={(e) =>
              onChange({
                appearance: { ...draft.appearance, height: e.target.value },
              })
            }
            placeholder="e.g. 5'10&quot;"
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="char-desc">
          Physical Description
        </label>
        <textarea
          id="char-desc"
          className={styles.formTextarea}
          value={draft.appearance.description}
          onChange={(e) =>
            onChange({
              appearance: { ...draft.appearance, description: e.target.value },
            })
          }
          placeholder="Describe your character's appearance…"
        />
      </div>

      {/* Personality */}
      <p className={styles.formLabel} style={{ margin: 'var(--space-4) 0 var(--space-3)' }}>
        Personality
      </p>
      <div className={styles.formColumns}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="char-traits">
            Personality Traits
          </label>
          <textarea
            id="char-traits"
            className={styles.formTextarea}
            value={draft.personality.traits}
            onChange={(e) =>
              onChange({
                personality: { ...draft.personality, traits: e.target.value },
              })
            }
            placeholder="How does your character behave?"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="char-ideals">
            Ideals
          </label>
          <textarea
            id="char-ideals"
            className={styles.formTextarea}
            value={draft.personality.ideals}
            onChange={(e) =>
              onChange({
                personality: { ...draft.personality, ideals: e.target.value },
              })
            }
            placeholder="What drives your character?"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="char-bonds">
            Bonds
          </label>
          <textarea
            id="char-bonds"
            className={styles.formTextarea}
            value={draft.personality.bonds}
            onChange={(e) =>
              onChange({
                personality: { ...draft.personality, bonds: e.target.value },
              })
            }
            placeholder="What ties your character to the world?"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="char-flaws">
            Flaws
          </label>
          <textarea
            id="char-flaws"
            className={styles.formTextarea}
            value={draft.personality.flaws}
            onChange={(e) =>
              onChange({
                personality: { ...draft.personality, flaws: e.target.value },
              })
            }
            placeholder="What weaknesses does your character have?"
          />
        </div>
      </div>

      {/* Notes */}
      <div className={styles.formGroup} style={{ marginTop: 'var(--space-2)' }}>
        <label className={styles.formLabel} htmlFor="char-notes">
          Notes
        </label>
        <textarea
          id="char-notes"
          className={styles.formTextarea}
          value={draft.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Any additional notes about your character…"
          style={{ minHeight: '60px' }}
        />
      </div>

      {/* Summary review */}
      <p
        className={styles.stepSubtitle}
        style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}
      >
        Character Summary
      </p>
      <div className={styles.reviewGrid}>
        <div className={styles.reviewSection}>
          <p className={styles.reviewSectionTitle}>Identity</p>
          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Species</span>
            <span className={styles.reviewValue}>{species?.name ?? '—'}</span>
          </div>
          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Class</span>
            <span className={styles.reviewValue}>{srdClass?.name ?? '—'}</span>
          </div>
          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Background</span>
            <span className={styles.reviewValue}>{background?.name ?? '—'}</span>
          </div>
          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Hit Die</span>
            <span className={styles.reviewValue}>{srdClass?.hitDie ?? '—'}</span>
          </div>
        </div>

        <div className={styles.reviewSection}>
          <p className={styles.reviewSectionTitle}>Ability Scores</p>
          {ABILITY_KEYS.map((key) => {
            const base = draft.abilityScores[key];
            const bonus = (bonuses[key] ?? 0) as number;
            const total = base + bonus;
            return (
              <div key={key} className={styles.reviewRow}>
                <span className={styles.reviewLabel}>{ABILITY_LABELS[key].slice(0, 3)}</span>
                <span className={styles.reviewValue}>
                  {total} ({formatModifier(total)})
                  {bonus !== 0 && (
                    <span
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      {' '}
                      {base}+{bonus}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
