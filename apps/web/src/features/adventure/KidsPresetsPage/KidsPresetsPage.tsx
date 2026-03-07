import { useState } from 'react';
import { Button } from '../../../components/ui/Button/Button.js';
import { Spinner } from '../../../components/ui/Spinner/Spinner.js';
import type { CharacterPreset } from '../hooks/useAdventures.js';
import {
  useCreatePreset,
  useDeletePreset,
  usePresets,
  useUpdatePreset,
} from '../hooks/useAdventures.js';
import styles from './KidsPresetsPage.module.css';

type Props = { adventureId: string };

type Archetype = {
  id: string;
  label: string;
  srdClass: string;
  tagline: string;
};

const ARCHETYPES: Archetype[] = [
  {
    id: 'hero',
    label: 'The Hero',
    srdClass: 'fighter',
    tagline: 'Brave and strong warrior',
  },
  {
    id: 'healer',
    label: 'The Healer',
    srdClass: 'cleric',
    tagline: 'Protects friends and heals wounds',
  },
  {
    id: 'trickster',
    label: 'The Trickster',
    srdClass: 'rogue',
    tagline: 'Sneaky and clever',
  },
  {
    id: 'wizard',
    label: 'The Wizard',
    srdClass: 'wizard',
    tagline: 'Casts spells and solves puzzles',
  },
  {
    id: 'wild_one',
    label: 'The Wild One',
    srdClass: 'barbarian',
    tagline: 'Tough and fierce',
  },
  {
    id: 'ranger',
    label: 'The Ranger',
    srdClass: 'ranger',
    tagline: 'Skilled with animals and bows',
  },
];

type EditState = {
  presetId: string;
  name: string;
  levelOverride: number;
};

export function KidsPresetsPage({ adventureId }: Props) {
  const { data: presets, isLoading } = usePresets(adventureId);
  const createPreset = useCreatePreset(adventureId);
  const deletePreset = useDeletePreset(adventureId);

  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState(1);
  const [editState, setEditState] = useState<EditState | null>(null);

  function handleArchetypeSelect(archetype: Archetype) {
    setSelectedArchetype(archetype);
    setNewName(archetype.label);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedArchetype) return;
    await createPreset.mutateAsync({
      name: newName.trim(),
      levelOverride: newLevel,
      baseCharacterData: {
        archetype: selectedArchetype.id,
        srdClass: selectedArchetype.srdClass,
        level: newLevel,
      },
    });
    setSelectedArchetype(null);
    setNewName('');
    setNewLevel(1);
  }

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.sectionTitle}>Character Presets</h2>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>New Preset</h3>
        <p className={styles.cardHint}>Choose an archetype to get started</p>
        <div className={styles.archetypeGrid}>
          {ARCHETYPES.map((archetype) => (
            <button
              key={archetype.id}
              type="button"
              className={`${styles.archetypeBtn} ${selectedArchetype?.id === archetype.id ? styles.archetypeBtnActive : ''}`}
              onClick={() => handleArchetypeSelect(archetype)}
            >
              <span className={styles.archetypeName}>{archetype.label}</span>
              <span className={styles.archetypeClass}>{archetype.srdClass}</span>
              <span className={styles.archetypeTagline}>{archetype.tagline}</span>
            </button>
          ))}
        </div>

        {selectedArchetype && (
          <form onSubmit={(e) => void handleCreate(e)} className={styles.newForm}>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="preset-name" className={styles.label}>
                  Name
                </label>
                <input
                  id="preset-name"
                  type="text"
                  className={styles.input}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div className={styles.fieldNarrow}>
                <label htmlFor="preset-level" className={styles.label}>
                  Level
                </label>
                <input
                  id="preset-level"
                  type="number"
                  className={styles.input}
                  value={newLevel}
                  onChange={(e) => setNewLevel(Number(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>
            </div>
            <div className={styles.formActions}>
              <Button type="submit" variant="primary" isLoading={createPreset.isPending}>
                Create preset
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSelectedArchetype(null);
                  setNewName('');
                  setNewLevel(1);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {presets && presets.length > 0 ? (
        <div className={styles.presetList}>
          {presets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              adventureId={adventureId}
              editState={editState}
              onEditStart={() =>
                setEditState({
                  presetId: preset.id,
                  name: preset.name,
                  levelOverride: preset.levelOverride ?? 1,
                })
              }
              onEditChange={setEditState}
              onEditDone={() => setEditState(null)}
              onDelete={() => void deletePreset.mutateAsync(preset.id)}
              isDeleting={deletePreset.isPending && deletePreset.variables === preset.id}
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No presets yet. Create one above.</p>
      )}
    </div>
  );
}

type PresetCardProps = {
  preset: CharacterPreset;
  adventureId: string;
  editState: EditState | null;
  onEditStart: () => void;
  onEditChange: (state: EditState) => void;
  onEditDone: () => void;
  onDelete: () => void;
  isDeleting: boolean;
};

function PresetCard({
  preset,
  adventureId,
  editState,
  onEditStart,
  onEditChange,
  onEditDone,
  onDelete,
  isDeleting,
}: PresetCardProps) {
  const updatePreset = useUpdatePreset(adventureId, preset.id);
  const isEditing = editState?.presetId === preset.id;

  const archetype =
    typeof preset.baseCharacterData.archetype === 'string'
      ? preset.baseCharacterData.archetype
      : null;
  const srdClass =
    typeof preset.baseCharacterData.srdClass === 'string'
      ? preset.baseCharacterData.srdClass
      : null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editState) return;
    await updatePreset.mutateAsync({
      name: editState.name.trim(),
      levelOverride: editState.levelOverride,
    });
    onEditDone();
  }

  if (isEditing && editState) {
    return (
      <form onSubmit={(e) => void handleSave(e)} className={styles.presetCard}>
        <div className={styles.editRow}>
          <input
            type="text"
            className={styles.input}
            value={editState.name}
            onChange={(e) => onEditChange({ ...editState, name: e.target.value })}
            maxLength={100}
            required
          />
          <input
            type="number"
            className={`${styles.input} ${styles.inputNarrow}`}
            value={editState.levelOverride}
            onChange={(e) =>
              onEditChange({
                ...editState,
                levelOverride: Number(e.target.value),
              })
            }
            min={1}
            max={20}
          />
          <Button type="submit" variant="primary" size="sm" isLoading={updatePreset.isPending}>
            Save
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onEditDone}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className={styles.presetCard}>
      <div className={styles.presetInfo}>
        <span className={styles.presetName}>{preset.name}</span>
        <div className={styles.presetMeta}>
          {archetype && <span className={styles.archBadge}>{archetype}</span>}
          {srdClass && <span className={styles.classBadge}>{srdClass}</span>}
          <span className={styles.levelBadge}>Lv {preset.levelOverride ?? 1}</span>
        </div>
      </div>
      <div className={styles.presetActions}>
        <Button variant="ghost" size="sm" onClick={onEditStart}>
          Edit
        </Button>
        <Button variant="danger" size="sm" isLoading={isDeleting} onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
