import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '../../../components/ui/Button/Button.js';
import { useSrdBackgrounds, useSrdClasses, useSrdSpecies } from '../../srd/hooks/useSrd.js';
import { useCreateCharacter } from '../hooks/useCharacters.js';
import styles from './CharacterWizard.module.css';
import { Step1Species } from './Step1Species.js';
import { Step2Class } from './Step2Class.js';
import { Step3Background } from './Step3Background.js';
import { Step4Abilities } from './Step4Abilities.js';
import { Step5Review } from './Step5Review.js';
import { WizardPreview } from './WizardPreview.js';
import { INITIAL_DRAFT, WIZARD_STEPS, type WizardDraft, type WizardStep } from './wizardState.js';

export function CharacterWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [draft, setDraft] = useState<WizardDraft>(INITIAL_DRAFT);

  const createCharacter = useCreateCharacter();

  // Prefetch SRD data for the preview panel
  const { data: speciesList } = useSrdSpecies();
  const { data: classList } = useSrdClasses();
  const { data: backgroundList } = useSrdBackgrounds();

  const species = speciesList?.find((s) => s.id === draft.speciesId) ?? null;
  const srdClass = classList?.find((c) => c.id === draft.classId) ?? null;
  const background = backgroundList?.find((b) => b.id === draft.backgroundId) ?? null;

  function patch(update: Partial<WizardDraft>) {
    setDraft((prev) => ({ ...prev, ...update }));
  }

  function canAdvance(): boolean {
    if (step === 1) return Boolean(draft.speciesId);
    if (step === 2) return Boolean(draft.classId);
    if (step === 3) return true; // background is optional
    if (step === 4) return true;
    if (step === 5) return draft.name.trim().length > 0;
    return false;
  }

  function goNext() {
    if (step < 5) setStep((step + 1) as WizardStep);
  }

  function goBack() {
    if (step > 1) setStep((step - 1) as WizardStep);
  }

  async function handleCreate() {
    if (!draft.speciesId || !draft.classId) return;
    const result = await createCharacter.mutateAsync({
      name: draft.name.trim(),
      speciesId: draft.speciesId,
      classId: draft.classId,
      backgroundId: draft.backgroundId ?? undefined,
      level: 1,
      abilityScores: draft.abilityScores,
      alignment: draft.alignment || undefined,
      personality:
        draft.personality.traits ||
        draft.personality.ideals ||
        draft.personality.bonds ||
        draft.personality.flaws
          ? draft.personality
          : undefined,
      appearance:
        draft.appearance.age || draft.appearance.height || draft.appearance.description
          ? {
              age: draft.appearance.age || undefined,
              height: draft.appearance.height || undefined,
              description: draft.appearance.description || undefined,
            }
          : undefined,
      notes: draft.notes || undefined,
    });

    void navigate({ to: '/characters/$id', params: { id: result.id } });
  }

  return (
    <div className={styles.wizard}>
      {/* ── Header with step indicator ── */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.title}>New Character</span>
          <nav className={styles.steps} aria-label="Wizard steps">
            {WIZARD_STEPS.map(({ step: s, label }) => (
              <div
                key={s}
                className={styles.stepItem}
                data-active={step === s ? 'true' : undefined}
                data-done={step > s ? 'true' : undefined}
              >
                <div className={styles.stepBadge}>{step > s ? '✓' : s}</div>
                <span className={styles.stepLabel}>{label}</span>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Body: step content + preview ── */}
      <div className={styles.body}>
        <div className={styles.stepContent}>
          {step === 1 && <Step1Species draft={draft} onChange={patch} />}
          {step === 2 && <Step2Class draft={draft} onChange={patch} />}
          {step === 3 && <Step3Background draft={draft} onChange={patch} />}
          {step === 4 && <Step4Abilities draft={draft} onChange={patch} />}
          {step === 5 && (
            <Step5Review
              draft={draft}
              onChange={patch}
              species={species}
              srdClass={srdClass}
              background={background}
            />
          )}
        </div>

        <aside className={styles.preview} aria-label="Character preview">
          <WizardPreview draft={draft} species={species} srdClass={srdClass} />
        </aside>
      </div>

      {/* ── Navigation ── */}
      <div className={styles.nav}>
        <Button variant="ghost" onClick={goBack} disabled={step === 1}>
          ← Back
        </Button>

        <div className={styles.navRight}>
          {step < 5 && (
            <Button variant="primary" onClick={goNext} disabled={!canAdvance()}>
              Next →
            </Button>
          )}
          {step === 5 && (
            <Button
              variant="primary"
              onClick={() => void handleCreate()}
              disabled={!canAdvance()}
              isLoading={createCharacter.isPending}
            >
              Create Character
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
