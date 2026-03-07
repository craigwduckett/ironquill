import { useSrdClasses } from '../../srd/hooks/useSrd.js';
import { SrdMarkdown } from '../../srd/SrdMarkdown/SrdMarkdown.js';
import styles from './CharacterWizard.module.css';
import type { WizardDraft } from './wizardState.js';

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

const CLASS_ROLE: Record<string, string> = {
  Barbarian: 'Melee damage · Rage',
  Bard: 'Support · Magic · Skills',
  Cleric: 'Healing · Divine magic',
  Druid: 'Nature magic · Shapeshifting',
  Fighter: 'Versatile combat · Extra attacks',
  Monk: 'Unarmed · Ki points · Speed',
  Paladin: 'Holy warrior · Aura · Lay on Hands',
  Ranger: 'Ranged · Tracking · Favoured enemy',
  Rogue: 'Stealth · Sneak attack · Skills',
  Sorcerer: 'Innate magic · Metamagic',
  Warlock: 'Patron pacts · Eldritch blast',
  Wizard: 'Spellbook · Arcane mastery',
};

type Props = {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
};

export function Step2Class({ draft, onChange }: Props) {
  const { data: classList, isLoading } = useSrdClasses();
  const selected = classList?.find((c) => c.id === draft.classId) ?? null;

  if (isLoading) {
    return (
      <div>
        <h2 className={styles.stepHeading}>Choose your Class</h2>
        <p className={styles.stepSubtitle}>Loading class data…</p>
      </div>
    );
  }

  const level1Features = selected?.featuresByLevel.find((f) => f.level === 1)?.features ?? [];

  return (
    <div>
      <h2 className={styles.stepHeading}>Choose your Class</h2>
      <p className={styles.stepSubtitle}>
        Your class defines your role in the party and how you grow with each level.
      </p>

      <div className={styles.grid}>
        {(classList ?? []).map((cls) => (
          <button
            key={cls.id}
            type="button"
            className={styles.card}
            data-selected={draft.classId === cls.id ? 'true' : undefined}
            onClick={() => onChange({ classId: cls.id })}
          >
            <span className={styles.cardEmoji}>{CLASS_EMOJI[cls.name] ?? '⚔️'}</span>
            <p className={styles.cardName}>{cls.name}</p>
            <p className={styles.cardMeta}>
              {cls.hitDie} · {CLASS_ROLE[cls.name] ?? cls.primaryAbilities.join(', ')}
            </p>
          </button>
        ))}
      </div>

      {selected && (
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <span className={styles.detailEmoji}>{CLASS_EMOJI[selected.name] ?? '⚔️'}</span>
            <div>
              <p className={styles.detailTitle}>{selected.name}</p>
              <p className={styles.detailSubtitle}>
                Hit Die {selected.hitDie} · Primary: {selected.primaryAbilities.join(', ')}
              </p>
            </div>
          </div>

          {selected.description && (
            <SrdMarkdown content={selected.description} className={styles.detailDescription} />
          )}

          {/* Saving throws */}
          <div className={styles.detailTags}>
            {selected.savingThrows.map((st) => (
              <span key={st} className={styles.detailTag} data-accent="true">
                {st} save
              </span>
            ))}
          </div>

          {/* Proficiencies */}
          {(selected.armorProficiencies.length > 0 || selected.weaponProficiencies.length > 0) && (
            <div className={styles.detailTags}>
              {selected.armorProficiencies.map((a) => (
                <span key={a} className={styles.detailTag}>
                  {a}
                </span>
              ))}
              {selected.weaponProficiencies.map((w) => (
                <span key={w} className={styles.detailTag}>
                  {w}
                </span>
              ))}
            </div>
          )}

          {/* Level 1 features */}
          {level1Features.length > 0 && (
            <>
              <p className={styles.traitName} style={{ marginBottom: 'var(--space-2)' }}>
                Level 1 Features
              </p>
              <div className={styles.traitList}>
                {level1Features.map((f) => (
                  <div key={f.name} className={styles.trait}>
                    <p className={styles.traitName}>{f.name}</p>
                    <SrdMarkdown content={f.description} className={styles.traitDesc} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Skill choices */}
          {selected.skillChoices && (
            <p className={styles.detailDescription} style={{ marginTop: 'var(--space-4)' }}>
              <strong>Skills:</strong> Choose {selected.skillChoices.choose} from{' '}
              {selected.skillChoices.from.join(', ')}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
