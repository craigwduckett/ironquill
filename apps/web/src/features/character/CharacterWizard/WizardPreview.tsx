import type { SrdClass, SrdSpecies } from '../../srd/hooks/useSrd.js';
import styles from './CharacterWizard.module.css';
import { ABILITY_KEYS, ABILITY_LABELS, formatModifier, type WizardDraft } from './wizardState.js';

// D&D class emoji mapping
const CLASS_EMOJI: Record<string, string> = {
  Barbarian: '⚔️',
  Bard: '🎵',
  Cleric: '✨',
  Druid: '🌿',
  Fighter: '🛡️',
  Monk: '👊',
  Paladin: '⚜️',
  Ranger: '🏹',
  Rogue: '🗡️',
  Sorcerer: '🔥',
  Warlock: '🌑',
  Wizard: '📚',
};

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
  species: SrdSpecies | null;
  srdClass: SrdClass | null;
};

export function WizardPreview({ draft, species, srdClass }: Props) {
  const emoji =
    (srdClass ? CLASS_EMOJI[srdClass.name] : null) ??
    (species ? SPECIES_EMOJI[species.name] : null) ??
    '🎲';

  // Apply species ability bonuses to scores
  const bonuses: Partial<Record<string, number>> = species?.abilityBonuses ?? {};
  const effectiveScore = (key: string) =>
    (draft.abilityScores[key as keyof typeof draft.abilityScores] ?? 8) + (bonuses[key] ?? 0);

  return (
    <>
      <p className={styles.previewTitle}>Character Preview</p>

      <div className={styles.previewPortrait}>{emoji}</div>

      {draft.name ? (
        <p className={styles.previewName}>{draft.name}</p>
      ) : (
        <p className={styles.previewPlaceholder}>Unnamed adventurer</p>
      )}

      <div className={styles.previewSection}>
        {species && (
          <div className={styles.previewRow}>
            <span className={styles.previewRowLabel}>Species</span>
            <span className={styles.previewRowValue}>{species.name}</span>
          </div>
        )}
        {srdClass && (
          <div className={styles.previewRow}>
            <span className={styles.previewRowLabel}>Class</span>
            <span className={styles.previewRowValue}>{srdClass.name}</span>
          </div>
        )}
        {srdClass && (
          <div className={styles.previewRow}>
            <span className={styles.previewRowLabel}>Hit Die</span>
            <span className={styles.previewRowValue}>{srdClass.hitDie}</span>
          </div>
        )}
        {draft.alignment && (
          <div className={styles.previewRow}>
            <span className={styles.previewRowLabel}>Alignment</span>
            <span className={styles.previewRowValue}>{draft.alignment}</span>
          </div>
        )}
      </div>

      <div className={styles.previewSection}>
        <p className={styles.previewSectionTitle}>Ability Scores</p>
        <div className={styles.previewAbilities}>
          {ABILITY_KEYS.map((key) => {
            const score = effectiveScore(key);
            return (
              <div key={key} className={styles.previewAbility}>
                <span className={styles.previewAbilityKey}>
                  {ABILITY_LABELS[key].slice(0, 3).toUpperCase()}
                </span>
                <span className={styles.previewAbilityScore}>{score}</span>
                <span className={styles.previewAbilityMod}>{formatModifier(score)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
