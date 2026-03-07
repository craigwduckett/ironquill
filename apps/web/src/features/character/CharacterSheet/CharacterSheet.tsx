import { Link, useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button.js';
import { Spinner } from '../../../components/ui/Spinner/Spinner.js';
import { useSrdBackgrounds, useSrdClasses, useSrdSpecies } from '../../srd/hooks/useSrd.js';
import { useCharacter, useDeleteCharacter, useUpdateCharacter } from '../hooks/useCharacters.js';
import styles from './CharacterSheet.module.css';

// ── D&D constants ─────────────────────────────────────────────────────────────

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
type AbilityKey = (typeof ABILITY_KEYS)[number];

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

const ABILITY_SHORT: Record<AbilityKey, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
};

// Saving throw proficiencies come from the class
const SAVING_THROW_ABILITIES: Record<AbilityKey, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

type Skill = { name: string; ability: AbilityKey; index: string };

const SKILLS: Skill[] = [
  { name: 'Acrobatics', ability: 'dex', index: 'acrobatics' },
  { name: 'Animal Handling', ability: 'wis', index: 'animal-handling' },
  { name: 'Arcana', ability: 'int', index: 'arcana' },
  { name: 'Athletics', ability: 'str', index: 'athletics' },
  { name: 'Deception', ability: 'cha', index: 'deception' },
  { name: 'History', ability: 'int', index: 'history' },
  { name: 'Insight', ability: 'wis', index: 'insight' },
  { name: 'Intimidation', ability: 'cha', index: 'intimidation' },
  { name: 'Investigation', ability: 'int', index: 'investigation' },
  { name: 'Medicine', ability: 'wis', index: 'medicine' },
  { name: 'Nature', ability: 'int', index: 'nature' },
  { name: 'Perception', ability: 'wis', index: 'perception' },
  { name: 'Performance', ability: 'cha', index: 'performance' },
  { name: 'Persuasion', ability: 'cha', index: 'persuasion' },
  { name: 'Religion', ability: 'int', index: 'religion' },
  { name: 'Sleight of Hand', ability: 'dex', index: 'sleight-of-hand' },
  { name: 'Stealth', ability: 'dex', index: 'stealth' },
  { name: 'Survival', ability: 'wis', index: 'survival' },
];

// XP thresholds for levels 1–20 (total XP to reach that level)
const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000,
  195000, 225000, 265000, 305000, 355000,
];

function mod(score: number): number {
  return Math.floor((score - 10) / 2);
}

function fmtMod(score: number): string {
  const m = mod(score);
  return m >= 0 ? `+${m}` : String(m);
}

function hpClass(pct: number): string {
  if (pct > 0.5) return styles.hpFull ?? '';
  if (pct > 0.25) return styles.hpMid ?? '';
  return styles.hpLow ?? '';
}

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

// ── Component ─────────────────────────────────────────────────────────────────

type Props = { characterId: string };

export function CharacterSheet({ characterId }: Props) {
  const navigate = useNavigate();

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: character, isLoading, isError } = useCharacter(characterId);
  const { data: speciesList } = useSrdSpecies();
  const { data: classList } = useSrdClasses();
  const { data: backgroundList } = useSrdBackgrounds();

  const updateCharacter = useUpdateCharacter(characterId);
  const deleteCharacter = useDeleteCharacter();

  const species = speciesList?.find((s) => s.id === character?.speciesId) ?? null;
  const srdClass = classList?.find((c) => c.id === character?.classId) ?? null;
  const background = backgroundList?.find((b) => b.id === character?.backgroundId) ?? null;

  // ── Local HP state (optimistic) ───────────────────────────────────────────
  const [hpCurrent, setHpCurrent] = useState(0);
  const [hpTemp, setHpTemp] = useState(0);
  const [hpDelta, setHpDelta] = useState('');

  useEffect(() => {
    if (character) {
      setHpCurrent(character.hpCurrent ?? 0);
      setHpTemp(character.hpTemp ?? 0);
    }
  }, [character]);

  function applyHpDelta(sign: 1 | -1) {
    const delta = Number.parseInt(hpDelta, 10);
    if (Number.isNaN(delta) || delta <= 0) return;
    const next = Math.max(0, Math.min(character?.hpMax ?? 0, hpCurrent + sign * delta));
    setHpCurrent(next);
    setHpDelta('');
    updateCharacter.mutate({ hpCurrent: next });
  }

  // ── Notes auto-save (debounced 1 s) ──────────────────────────────────────
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(true);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (character) setNotes(character.notes ?? '');
  }, [character]);

  const handleNotesChange = useCallback(
    (value: string) => {
      setNotes(value);
      setNotesSaved(false);
      if (notesTimer.current) clearTimeout(notesTimer.current);
      notesTimer.current = setTimeout(() => {
        updateCharacter.mutate({ notes: value });
        setNotesSaved(true);
      }, 1000);
    },
    [updateCharacter],
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    await deleteCharacter.mutateAsync(characterId);
    void navigate({ to: '/dashboard' });
  }

  // ── Loading / error states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 'var(--space-20)',
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !character) {
    return (
      <div className={styles.notFound}>
        <span className={styles.notFoundIcon}>🎲</span>
        <h1 className={styles.notFoundTitle}>Character not found</h1>
        <p className={styles.notFoundSub}>
          This character may have been deleted or doesn't belong to you.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const scores = character.abilityScores;
  const profBonus = character.proficiencyBonus;
  const savingThrowProfs = new Set(srdClass?.savingThrows ?? []);
  const skillProfs = new Set(character.skillProficiencies ?? []);

  const hpPct = character.hpMax > 0 ? hpCurrent / character.hpMax : 0;

  const currentLevelXp = XP_THRESHOLDS[character.level - 1] ?? 0;
  const nextLevelXp = XP_THRESHOLDS[character.level] ?? XP_THRESHOLDS[19] ?? 355000;
  const xpIntoLevel = character.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const xpPct = Math.min(1, xpIntoLevel / xpNeeded);

  const emoji = (srdClass ? CLASS_EMOJI[srdClass.name] : null) ?? '🎲';

  // Collect features for display
  type Feature = { name: string; description: string; source: string };
  const features: Feature[] = [];

  // Species traits
  if (species) {
    for (const t of species.traits) {
      features.push({
        name: t.name,
        description: t.description,
        source: species.name,
      });
    }
  }

  // Class level-1 features
  if (srdClass) {
    const level1 = srdClass.featuresByLevel.find((f) => f.level === 1);
    if (level1) {
      for (const f of level1.features) {
        features.push({
          name: f.name,
          description: f.description,
          source: srdClass.name,
        });
      }
    }
  }

  // Background feature
  if (background?.featureName) {
    features.push({
      name: background.featureName,
      description: background.featureDescription,
      source: background.name,
    });
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.portrait}>{emoji}</div>

        <div className={styles.headerInfo}>
          <h1 className={styles.characterName}>{character.name}</h1>
          <p className={styles.characterSubtitle}>
            Level {character.level} {species?.name ?? '—'} {srdClass?.name ?? '—'}
            {character.alignment ? ` · ${character.alignment}` : ''}
            {background ? ` · ${background.name}` : ''}
          </p>

          <div className={styles.xpBar}>
            <div className={styles.xpLabel}>
              <span>Experience Points</span>
              <span>
                {character.xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
              </span>
            </div>
            <div className={styles.xpTrack}>
              <div className={styles.xpFill} style={{ width: `${xpPct * 100}%` }} />
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          {confirmDelete ? (
            <>
              <Button
                variant="danger"
                size="sm"
                isLoading={deleteCharacter.isPending}
                onClick={() => void handleDelete()}
              >
                Confirm delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* ── Core stats ── */}
      <div className={styles.coreStats}>
        {/* HP — spans 2 columns */}
        <div className={styles.hpBox}>
          <div className={styles.hpHeader}>
            <span className={styles.hpLabelRow}>Hit Points</span>
            <span className={styles.hpNumbers}>
              {hpCurrent} / {character.hpMax}
              {hpTemp > 0 && <span> (+{hpTemp} temp)</span>}
            </span>
          </div>
          <div className={styles.hpTrack}>
            <div
              className={clsx(styles.hpFill, hpClass(hpPct))}
              style={{ width: `${hpPct * 100}%` }}
            />
          </div>
          <div className={styles.hpControls}>
            <input
              type="number"
              className={styles.hpInput}
              value={hpDelta}
              onChange={(e) => setHpDelta(e.target.value)}
              placeholder="Δ HP"
              min={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyHpDelta(1);
              }}
            />
            <button
              type="button"
              className={styles.hpBtn}
              onClick={() => applyHpDelta(1)}
              title="Heal"
            >
              +
            </button>
            <button
              type="button"
              className={styles.hpBtn}
              onClick={() => applyHpDelta(-1)}
              title="Damage"
            >
              −
            </button>
            <span className={styles.hpTempLabel}>Temp HP: {hpTemp}</span>
          </div>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statLabel}>Armour Class</span>
          <span className={styles.statValue}>{character.ac}</span>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statLabel}>Initiative</span>
          <span className={styles.statValue}>{fmtMod(scores.dex)}</span>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statLabel}>Speed</span>
          <span className={styles.statValue}>{character.speed}</span>
          <span className={styles.statSub}>ft.</span>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statLabel}>Prof. Bonus</span>
          <span className={styles.statValue}>+{profBonus}</span>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statLabel}>Passive Perc.</span>
          <span className={styles.statValue}>
            {10 + mod(scores.wis) + (skillProfs.has('perception') ? profBonus : 0)}
          </span>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className={styles.columns}>
        {/* Left: abilities + skills */}
        <div>
          {/* Ability scores */}
          <div className={styles.section} style={{ marginBottom: 'var(--space-4)' }}>
            <p className={styles.sectionTitle}>Ability Scores &amp; Saves</p>
            <div className={styles.abilityGrid}>
              {ABILITY_KEYS.map((key) => {
                const score = scores[key];
                const hasSaveProf = savingThrowProfs.has(SAVING_THROW_ABILITIES[key]);
                return (
                  <div key={key} className={styles.abilityRow}>
                    <div
                      className={styles.savingThrowDot}
                      data-proficient={hasSaveProf ? 'true' : undefined}
                      title={`${ABILITY_LABELS[key]} saving throw ${hasSaveProf ? '(proficient)' : ''}`}
                    />
                    <span className={styles.abilityName}>{ABILITY_LABELS[key]}</span>
                    <span className={styles.abilityScore}>{score}</span>
                    <span className={styles.abilityMod}>{fmtMod(score)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Skills</p>
            <div className={styles.skillList}>
              {SKILLS.map((skill) => {
                const isProficient = skillProfs.has(skill.index);
                const skillMod = mod(scores[skill.ability]) + (isProficient ? profBonus : 0);
                return (
                  <div key={skill.index} className={styles.skillRow}>
                    <div
                      className={styles.skillDot}
                      data-proficient={isProficient ? 'true' : undefined}
                      title={isProficient ? 'Proficient' : undefined}
                    />
                    <span className={styles.skillName}>{skill.name}</span>
                    <span className={styles.skillAbility}>{ABILITY_SHORT[skill.ability]}</span>
                    <span className={styles.skillMod}>
                      {skillMod >= 0 ? `+${skillMod}` : String(skillMod)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: features, personality, notes */}
        <div className={styles.rightColumn}>
          {/* Features & traits */}
          {features.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Features &amp; Traits</p>
              <div className={styles.featureList}>
                {features.map((f) => (
                  <div key={`${f.source}-${f.name}`} className={styles.feature}>
                    <p className={styles.featureSource}>{f.source}</p>
                    <p className={styles.featureName}>{f.name}</p>
                    <p className={styles.featureDesc}>{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personality */}
          {character.personality && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Personality</p>
              <div className={styles.personalityGrid}>
                {(
                  [
                    { key: 'traits', label: 'Traits' },
                    { key: 'ideals', label: 'Ideals' },
                    { key: 'bonds', label: 'Bonds' },
                    { key: 'flaws', label: 'Flaws' },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key} className={styles.personalityItem}>
                    <span className={styles.personalityLabel}>{label}</span>
                    <span
                      className={clsx(
                        styles.personalityValue,
                        !character.personality?.[key] && styles.emptyValue,
                      )}
                    >
                      {character.personality?.[key] || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance */}
          {character.appearance &&
            (character.appearance.age ||
              character.appearance.height ||
              character.appearance.description) && (
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Appearance</p>
                <div className={styles.appearanceGrid}>
                  {character.appearance.age && (
                    <div className={styles.appearanceItem}>
                      <span className={styles.appearanceLabel}>Age</span>
                      <span className={styles.appearanceValue}>{character.appearance.age}</span>
                    </div>
                  )}
                  {character.appearance.height && (
                    <div className={styles.appearanceItem}>
                      <span className={styles.appearanceLabel}>Height</span>
                      <span className={styles.appearanceValue}>{character.appearance.height}</span>
                    </div>
                  )}
                </div>
                {character.appearance.description && (
                  <p className={styles.featureDesc}>{character.appearance.description}</p>
                )}
              </div>
            )}

          {/* Notes */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Notes</p>
            <textarea
              className={styles.notesTextarea}
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Session notes, character backstory, reminders…"
            />
            <p className={styles.notesSaving}>{notesSaved ? 'Saved' : 'Saving…'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
