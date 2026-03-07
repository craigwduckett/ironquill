import { useSrdBackgrounds } from '../../srd/hooks/useSrd.js';
import styles from './CharacterWizard.module.css';
import type { WizardDraft } from './wizardState.js';

const BACKGROUND_EMOJI: Record<string, string> = {
  Acolyte: '🕯️',
  Criminal: '🔪',
  'Folk Hero': '🌾',
  Gladiator: '⚔️',
  'Guild Artisan': '🔨',
  Hermit: '🏔️',
  Noble: '👑',
  Outlander: '🌲',
  Sage: '📜',
  Sailor: '⚓',
  Soldier: '🪖',
  Urchin: '🏙️',
  Charlatan: '🎭',
  Entertainer: '🎶',
  Spy: '🕵️',
};

type Props = {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
};

export function Step3Background({ draft, onChange }: Props) {
  const { data: allBackgrounds, isLoading } = useSrdBackgrounds();

  // Show only one entry per background name — prefer 2014 (feature-based),
  // which maps cleanly to the wizard. 2024 backgrounds have a different
  // structure (ability boosts + feats) and will be surfaced separately later.
  const backgrounds = allBackgrounds
    ? [
        ...new Map(
          [...allBackgrounds]
            .sort((a, _b) => (a.sourceEdition === '2014' ? -1 : 1))
            .map((b) => [b.name, b]),
        ).values(),
      ]
    : undefined;

  const selected = backgrounds?.find((b) => b.id === draft.backgroundId) ?? null;

  if (isLoading) {
    return (
      <div>
        <h2 className={styles.stepHeading}>Choose your Background</h2>
        <p className={styles.stepSubtitle}>Loading backgrounds…</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className={styles.stepHeading}>Choose your Background</h2>
      <p className={styles.stepSubtitle}>
        Your background tells the story of who you were before you became an adventurer.
      </p>

      <div className={styles.grid}>
        {(backgrounds ?? []).map((bg) => (
          <button
            key={bg.id}
            type="button"
            className={styles.card}
            data-selected={draft.backgroundId === bg.id ? 'true' : undefined}
            onClick={() => onChange({ backgroundId: bg.id })}
          >
            <span className={styles.cardEmoji}>{BACKGROUND_EMOJI[bg.name] ?? '📖'}</span>
            <p className={styles.cardName}>{bg.name}</p>
            <p className={styles.cardMeta}>{bg.skillProficiencies.slice(0, 2).join(', ')}</p>
          </button>
        ))}
      </div>

      {selected && (
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <span className={styles.detailEmoji}>{BACKGROUND_EMOJI[selected.name] ?? '📖'}</span>
            <div>
              <p className={styles.detailTitle}>{selected.name}</p>
              <p className={styles.detailSubtitle}>
                Skills: {selected.skillProficiencies.join(', ')}
              </p>
            </div>
          </div>

          {selected.description && (
            <p className={styles.detailDescription}>{selected.description}</p>
          )}

          {/* Skill proficiencies */}
          <div className={styles.detailTags}>
            {selected.skillProficiencies.map((s) => (
              <span key={s} className={styles.detailTag} data-accent="true">
                {s}
              </span>
            ))}
            {selected.toolProficiencies.map((t) => (
              <span key={t} className={styles.detailTag}>
                {t}
              </span>
            ))}
            {selected.languagesCount > 0 && (
              <span className={styles.detailTag}>
                +{selected.languagesCount} language
                {selected.languagesCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Background feature */}
          {selected.featureName && (
            <div className={styles.traitList}>
              <div className={styles.trait}>
                <p className={styles.traitName}>{selected.featureName}</p>
                <p className={styles.traitDesc}>{selected.featureDescription}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
