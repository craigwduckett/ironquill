import { useSrdSpecies } from '../../srd/hooks/useSrd.js';
import styles from './CharacterWizard.module.css';
import type { WizardDraft } from './wizardState.js';

const SPECIES_EMOJI: Record<string, string> = {
  Dwarf: '⛏️',
  Elf: '🌙',
  Halfling: '🍀',
  Human: '🧑',
  Dragonborn: '🐉',
  Gnome: '⚙️',
  'Half-Elf': '🌟',
  'Half-Orc': '💪',
  Tiefling: '😈',
};

type Props = {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
};

export function Step1Species({ draft, onChange }: Props) {
  const { data: speciesList, isLoading } = useSrdSpecies();
  const selected = speciesList?.find((s) => s.id === draft.speciesId) ?? null;

  if (isLoading) {
    return (
      <div>
        <h2 className={styles.stepHeading}>Choose your Species</h2>
        <p className={styles.stepSubtitle}>Loading species data…</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className={styles.stepHeading}>Choose your Species</h2>
      <p className={styles.stepSubtitle}>
        Your species shapes your traits, ability bonuses, and languages.
      </p>

      <div className={styles.grid}>
        {(speciesList ?? []).map((sp) => (
          <button
            key={sp.id}
            type="button"
            className={styles.card}
            data-selected={draft.speciesId === sp.id ? 'true' : undefined}
            onClick={() => onChange({ speciesId: sp.id })}
          >
            <span className={styles.cardEmoji}>{SPECIES_EMOJI[sp.name] ?? '🧬'}</span>
            <p className={styles.cardName}>{sp.name}</p>
            <p className={styles.cardMeta}>
              Speed {sp.speed} ft · {sp.size} size
            </p>
          </button>
        ))}
      </div>

      {selected && (
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <span className={styles.detailEmoji}>{SPECIES_EMOJI[selected.name] ?? '🧬'}</span>
            <div>
              <p className={styles.detailTitle}>{selected.name}</p>
              <p className={styles.detailSubtitle}>
                Speed {selected.speed} ft · {selected.size} size
              </p>
            </div>
          </div>

          {selected.description && (
            <p className={styles.detailDescription}>{selected.description}</p>
          )}

          {/* Ability bonuses */}
          {Object.keys(selected.abilityBonuses).length > 0 && (
            <div className={styles.detailTags}>
              {Object.entries(selected.abilityBonuses).map(([key, val]) => (
                <span key={key} className={styles.detailTag} data-accent="true">
                  +{val} {key.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {/* Languages */}
          {selected.languages.length > 0 && (
            <div className={styles.detailTags}>
              {selected.languages.map((lang) => (
                <span key={lang} className={styles.detailTag}>
                  {lang}
                </span>
              ))}
            </div>
          )}

          {/* Traits */}
          {selected.traits.length > 0 && (
            <div className={styles.traitList}>
              {selected.traits.map((t) => (
                <div key={t.name} className={styles.trait}>
                  <p className={styles.traitName}>{t.name}</p>
                  <p className={styles.traitDesc}>{t.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
