import { useSrdSpecies } from '../../srd/hooks/useSrd.js';
import styles from './CharacterWizard.module.css';
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  type AbilityKey,
  type AbilityScoreMethod,
  formatModifier,
  POINT_BUY_BUDGET,
  POINT_BUY_COSTS,
  pointBuyCost,
  STANDARD_ARRAY,
  type WizardDraft,
} from './wizardState.js';

// Standard Array available values (sorted desc for the select options)
const STANDARD_VALUES = [15, 14, 13, 12, 10, 8] as const;

type Props = {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
};

export function Step4Abilities({ draft, onChange }: Props) {
  const { data: speciesList } = useSrdSpecies();
  const species = speciesList?.find((s) => s.id === draft.speciesId) ?? null;
  const bonuses = species?.abilityBonuses ?? {};

  const method = draft.abilityMethod;
  const scores = draft.abilityScores;

  function setMethod(m: AbilityScoreMethod) {
    if (m === 'standard') {
      onChange({ abilityMethod: m, abilityScores: { ...STANDARD_ARRAY } });
    } else if (m === 'pointbuy') {
      onChange({
        abilityMethod: m,
        abilityScores: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
      });
    } else {
      onChange({ abilityMethod: m });
    }
  }

  function setScore(key: AbilityKey, val: number) {
    onChange({ abilityScores: { ...scores, [key]: val } });
  }

  // ── Standard Array: assign values via selects ──────────────────────────────

  // Which values are still available for a given key
  function availableValues(key: AbilityKey) {
    const usedByOthers = ABILITY_KEYS.filter((k) => k !== key).map((k) => scores[k]);
    return STANDARD_VALUES.filter((v) => !usedByOthers.includes(v) || scores[key] === v);
  }

  // ── Point Buy: adjust score up/down ───────────────────────────────────────

  const spent = pointBuyCost(scores);
  const remaining = POINT_BUY_BUDGET - spent;

  function canIncrease(key: AbilityKey) {
    const next = scores[key] + 1;
    if (next > 15) return false;
    const nextCost = (POINT_BUY_COSTS[next] ?? 0) - (POINT_BUY_COSTS[scores[key]] ?? 0);
    return remaining >= nextCost;
  }

  function canDecrease(key: AbilityKey) {
    return scores[key] > 8;
  }

  // ── Manual: clamp to 1–20 ─────────────────────────────────────────────────

  function handleManualChange(key: AbilityKey, raw: string) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n)) {
      setScore(key, Math.min(20, Math.max(1, n)));
    }
  }

  return (
    <div>
      <h2 className={styles.stepHeading}>Ability Scores</h2>
      <p className={styles.stepSubtitle}>
        Set your six core ability scores. Species bonuses are shown separately and added on the
        character sheet.
      </p>

      {/* Method selector */}
      <div className={styles.methodTabs}>
        {(
          [
            { id: 'standard', label: 'Standard Array' },
            { id: 'pointbuy', label: 'Point Buy' },
            { id: 'manual', label: 'Manual Entry' },
          ] as { id: AbilityScoreMethod; label: string }[]
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={styles.methodTab}
            data-active={method === id ? 'true' : undefined}
            onClick={() => setMethod(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Method info */}
      {method === 'standard' && (
        <div className={styles.standardArrayInfo}>
          Assign each value to one ability score. All six values must be used exactly once.
          <div className={styles.standardArrayValues}>
            {STANDARD_VALUES.map((v) => (
              <span key={v} className={styles.standardArrayValue}>
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {method === 'pointbuy' && (
        <div className={styles.pointBuyInfo}>
          <span>
            Points remaining:{' '}
            <span
              className={styles.pointBuyRemaining}
              data-overspent={remaining < 0 ? 'true' : undefined}
            >
              {remaining} / {POINT_BUY_BUDGET}
            </span>
          </span>
          <span
            style={{
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-xs)',
            }}
          >
            Scores 8–15 · Higher costs more
          </span>
        </div>
      )}

      {/* Ability grid */}
      <div className={styles.abilityGrid}>
        {ABILITY_KEYS.map((key) => {
          const score = scores[key];
          const bonus = (bonuses[key] ?? 0) as number;
          const effective = score + bonus;

          return (
            <div key={key} className={styles.abilityBox}>
              <span className={styles.abilityBoxLabel}>
                {ABILITY_LABELS[key].slice(0, 3).toUpperCase()}
              </span>
              <span className={styles.abilityBoxFull}>{ABILITY_LABELS[key]}</span>

              {method === 'standard' && (
                <select
                  className={styles.standardArraySelect}
                  value={score}
                  onChange={(e) => setScore(key, Number(e.target.value))}
                >
                  {availableValues(key).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              )}

              {method === 'pointbuy' && (
                <div className={styles.abilityControls}>
                  <button
                    type="button"
                    className={styles.abilityBtn}
                    disabled={!canDecrease(key)}
                    onClick={() => setScore(key, score - 1)}
                  >
                    −
                  </button>
                  <span className={styles.abilityScore}>{score}</span>
                  <button
                    type="button"
                    className={styles.abilityBtn}
                    disabled={!canIncrease(key)}
                    onClick={() => setScore(key, score + 1)}
                  >
                    +
                  </button>
                </div>
              )}

              {method === 'manual' && (
                <input
                  type="number"
                  className={styles.standardArraySelect}
                  min={1}
                  max={20}
                  value={score}
                  onChange={(e) => handleManualChange(key, e.target.value)}
                  style={{ width: '4rem' }}
                />
              )}

              <span className={styles.abilityMod}>{formatModifier(effective)}</span>

              {bonus !== 0 && (
                <span className={styles.abilityBonus}>
                  {score} {bonus > 0 ? '+' : ''}
                  {bonus} (species)
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
