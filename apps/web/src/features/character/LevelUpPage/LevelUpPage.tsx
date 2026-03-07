import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '../../../components/ui/Button/Button.js';
import { Spinner } from '../../../components/ui/Spinner/Spinner.js';
import { useSrdClasses } from '../../srd/hooks/useSrd.js';
import { useCharacter, useUpdateCharacter } from '../hooks/useCharacters.js';
import styles from './LevelUpPage.module.css';

// ── D&D constants ─────────────────────────────────────────────────────────────

const HIT_DIE: Record<string, number> = {
  Barbarian: 12,
  Fighter: 10,
  Paladin: 10,
  Ranger: 10,
  Bard: 8,
  Cleric: 8,
  Druid: 8,
  Monk: 8,
  Rogue: 8,
  Warlock: 8,
  Sorcerer: 6,
  Wizard: 6,
};

const PROFICIENCY_BY_LEVEL: Record<number, number> = {
  1: 2,
  2: 2,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 3,
  8: 3,
  9: 4,
  10: 4,
  11: 4,
  12: 4,
  13: 5,
  14: 5,
  15: 5,
  16: 5,
  17: 6,
  18: 6,
  19: 6,
  20: 6,
};

function conMod(con: number): number {
  return Math.floor((con - 10) / 2);
}

// ── Component ─────────────────────────────────────────────────────────────────

type Props = { characterId: string };

export function LevelUpPage({ characterId }: Props) {
  const navigate = useNavigate();
  const { data: character, isLoading, isError } = useCharacter(characterId);
  const { data: classList } = useSrdClasses();
  const updateCharacter = useUpdateCharacter(characterId);

  const [hpRoll, setHpRoll] = useState<number | ''>('');
  const [useAverage, setUseAverage] = useState(true);

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !character) {
    return (
      <div className={styles.center}>
        <p className={styles.error}>Character not found.</p>
        <Link to="/dashboard">
          <Button variant="primary">Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  if (character.level >= 20) {
    return (
      <div className={styles.center}>
        <p className={styles.capped}>{character.name} is already at the maximum level (20).</p>
        <Link to="/characters/$id" params={{ id: characterId }}>
          <Button variant="primary">Back to character sheet</Button>
        </Link>
      </div>
    );
  }

  const srdClass = classList?.find((c) => c.id === character.classId) ?? null;
  const newLevel = character.level + 1;
  const newProfBonus = PROFICIENCY_BY_LEVEL[newLevel] ?? character.proficiencyBonus;
  const hitDie = srdClass ? (HIT_DIE[srdClass.name] ?? 8) : 8;
  const con = character.abilityScores.con;
  const average = Math.floor(hitDie / 2) + 1 + conMod(con);

  const newFeatures = srdClass?.featuresByLevel.find((f) => f.level === newLevel)?.features ?? [];

  const hpGain = useAverage
    ? average
    : typeof hpRoll === 'number' && hpRoll >= 1
      ? hpRoll + conMod(con)
      : null;

  async function handleLevelUp() {
    if (hpGain === null) return;
    await updateCharacter.mutateAsync({
      level: newLevel,
      hpMax: (character?.hpMax ?? 0) + hpGain,
      hpCurrent: (character?.hpCurrent ?? 0) + hpGain,
      proficiencyBonus: newProfBonus,
    });
    void navigate({ to: '/characters/$id', params: { id: characterId } });
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/characters/$id" params={{ id: characterId }} className={styles.back}>
          ← Back to character sheet
        </Link>
        <h1 className={styles.title}>Level Up — {character.name}</h1>
        <p className={styles.subtitle}>
          {srdClass?.name ?? '—'} · Level {character.level} → {newLevel}
        </p>
      </div>

      <div className={styles.body}>
        {/* ── Hit Points ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Hit Points</h2>
          <p className={styles.cardSub}>
            Hit Die: d{hitDie} &nbsp;·&nbsp; CON modifier:{' '}
            {conMod(con) >= 0 ? `+${conMod(con)}` : conMod(con)}
          </p>

          <div className={styles.hpOptions}>
            <label className={styles.option}>
              <input
                type="radio"
                name="hpMethod"
                checked={useAverage}
                onChange={() => setUseAverage(true)}
              />
              <span>
                Use average <strong>(+{average} HP)</strong>
              </span>
            </label>
            <label className={styles.option}>
              <input
                type="radio"
                name="hpMethod"
                checked={!useAverage}
                onChange={() => setUseAverage(false)}
              />
              <span>Roll your hit die (d{hitDie})</span>
            </label>
          </div>

          {!useAverage && (
            <div className={styles.rollInput}>
              <label htmlFor="hp-roll" className={styles.rollLabel}>
                Enter your d{hitDie} roll (1–{hitDie}):
              </label>
              <input
                id="hp-roll"
                type="number"
                className={styles.input}
                min={1}
                max={hitDie}
                value={hpRoll}
                onChange={(e) => {
                  const v = Number.parseInt(e.target.value, 10);
                  setHpRoll(Number.isNaN(v) ? '' : Math.min(hitDie, Math.max(1, v)));
                }}
                placeholder={`1–${hitDie}`}
              />
              {typeof hpRoll === 'number' && hpRoll >= 1 && (
                <p className={styles.rollResult}>
                  HP gain: {hpRoll} + {conMod(con)} = <strong>{hpRoll + conMod(con)}</strong>
                </p>
              )}
            </div>
          )}
        </section>

        {/* ── Proficiency Bonus ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Proficiency Bonus</h2>
          {newProfBonus !== character.proficiencyBonus ? (
            <p className={styles.cardBody}>
              Increases from <strong>+{character.proficiencyBonus}</strong> to{' '}
              <strong>+{newProfBonus}</strong> at level {newLevel}.
            </p>
          ) : (
            <p className={styles.cardBody}>
              Stays at <strong>+{newProfBonus}</strong> — no change at level {newLevel}.
            </p>
          )}
        </section>

        {/* ── New class features ── */}
        {newFeatures.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>New Features at Level {newLevel}</h2>
            <div className={styles.featureList}>
              {newFeatures.map((f) => (
                <div key={f.name} className={styles.feature}>
                  <p className={styles.featureName}>{f.name}</p>
                  <p className={styles.featureDesc}>{f.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Confirm ── */}
        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={() => void handleLevelUp()}
            disabled={!useAverage && hpGain === null}
            isLoading={updateCharacter.isPending}
          >
            Confirm Level Up to {newLevel}
          </Button>
          <Link to="/characters/$id" params={{ id: characterId }}>
            <Button variant="ghost">Cancel</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
