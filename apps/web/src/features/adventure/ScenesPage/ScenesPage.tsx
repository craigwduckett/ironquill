import { Link } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button.js';
import { Spinner } from '../../../components/ui/Spinner/Spinner.js';
import {
  type LootEntry,
  type Scene,
  useCreateScene,
  useDeleteScene,
  useSceneBackgroundUploadUrl,
  useScenes,
  useUpdateScene,
} from '../hooks/useAdventures.js';
import { SceneFlowGraph } from '../SceneFlowGraph/SceneFlowGraph.js';
import {
  DEFAULT_BACKGROUND_IDS,
  DEFAULT_BACKGROUNDS,
  resolveBackgroundSrc,
} from '../utils/sceneBackground.js';
import styles from './ScenesPage.module.css';

type Props = { adventureId: string };

type SceneType = Scene['sceneType'];
type LootType = LootEntry['type'];

const SCENE_TYPES: SceneType[] = [
  'exploration',
  'social',
  'combat',
  'puzzle',
  'rest',
  'transition',
];

const SCENE_TYPE_LABELS: Record<SceneType, string> = {
  exploration: 'Exploration',
  social: 'Social',
  combat: 'Combat',
  puzzle: 'Puzzle',
  rest: 'Rest',
  transition: 'Transition',
};

const SCENE_TYPE_COLOURS: Record<SceneType, string> = {
  exploration: '#3b82f6',
  social: '#a855f7',
  combat: '#ef4444',
  puzzle: '#f59e0b',
  rest: '#22c55e',
  transition: '#6b7280',
};

const LOOT_TYPE_LABELS: Record<LootType, string> = {
  item: 'Item',
  gold: 'Gold',
  xp: 'XP',
};

function LootEditor({
  loot,
  onChange,
}: {
  loot: LootEntry[];
  onChange: (loot: LootEntry[]) => void;
}) {
  function addEntry() {
    onChange([...loot, { type: 'gold', quantity: 1 }]);
  }

  function updateEntry(index: number, entry: LootEntry) {
    onChange(loot.map((e, i) => (i === index ? entry : e)));
  }

  function removeEntry(index: number) {
    onChange(loot.filter((_, i) => i !== index));
  }

  return (
    <div className={styles.lootEditor}>
      <div className={styles.lootHeader}>
        <span className={styles.label}>Loot</span>
        <button type="button" className={styles.lootAddBtn} onClick={addEntry}>
          + Add entry
        </button>
      </div>
      {loot.length === 0 && <p className={styles.lootEmpty}>No loot assigned to this scene.</p>}
      {loot.map((entry, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: loot entries have no stable ID
        <div key={i} className={styles.lootRow}>
          <select
            className={styles.lootTypeSelect}
            value={entry.type}
            onChange={(e) =>
              updateEntry(i, {
                ...entry,
                type: e.target.value as LootType,
                itemName: e.target.value !== 'item' ? undefined : entry.itemName,
              })
            }
            aria-label="Loot type"
          >
            {(['item', 'gold', 'xp'] as LootType[]).map((t) => (
              <option key={t} value={t}>
                {LOOT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          {entry.type === 'item' && (
            <input
              className={styles.lootItemName}
              value={entry.itemName ?? ''}
              onChange={(e) => updateEntry(i, { ...entry, itemName: e.target.value })}
              placeholder="Item name…"
              aria-label="Item name"
            />
          )}
          <input
            type="number"
            className={styles.lootQty}
            value={entry.quantity}
            min={0}
            onChange={(e) =>
              updateEntry(i, {
                ...entry,
                quantity: Math.max(0, Number(e.target.value)),
              })
            }
            aria-label="Quantity"
          />
          <button
            type="button"
            className={styles.lootRemoveBtn}
            onClick={() => removeEntry(i)}
            aria-label="Remove loot entry"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function BackgroundPicker({
  adventureId,
  sceneId,
  sceneType,
  backgroundImageId,
  onChange,
}: {
  adventureId: string;
  sceneId: string;
  sceneType: SceneType;
  backgroundImageId: string | null;
  onChange: (id: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const getUploadUrl = useSceneBackgroundUploadUrl(adventureId, sceneId);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const currentSrc = resolveBackgroundSrc(backgroundImageId);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;
    type AllowedType = (typeof allowedTypes)[number];
    if (!allowedTypes.includes(file.type as AllowedType)) {
      setUploadError('Only JPEG, PNG, and WebP images are supported.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const { uploadUrl, key } = await getUploadUrl.mutateAsync({
        contentType: file.type as AllowedType,
      });
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      onChange(key);
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className={styles.bgSection}>
      <span className={styles.label}>Background image</span>
      {currentSrc && (
        <div className={styles.bgPreview}>
          <img src={currentSrc} alt="Scene background preview" className={styles.bgPreviewImg} />
          <button
            type="button"
            className={styles.bgClearBtn}
            onClick={() => onChange(null)}
            aria-label="Remove background image"
          >
            Remove
          </button>
        </div>
      )}
      <div className={styles.bgPicker}>
        {SCENE_TYPES.map((type) => (
          <button
            type="button"
            key={type}
            className={`${styles.bgSwatch} ${
              backgroundImageId === DEFAULT_BACKGROUND_IDS[type] ? styles.bgSwatchActive : ''
            }`}
            onClick={() => onChange(DEFAULT_BACKGROUND_IDS[type])}
            title={SCENE_TYPE_LABELS[type]}
            aria-label={`Use ${SCENE_TYPE_LABELS[type]} default background`}
            aria-pressed={backgroundImageId === DEFAULT_BACKGROUND_IDS[type]}
          >
            <img
              src={DEFAULT_BACKGROUNDS[type]}
              alt={SCENE_TYPE_LABELS[type]}
              className={styles.bgSwatchImg}
            />
            <span className={styles.bgSwatchLabel}>{SCENE_TYPE_LABELS[type]}</span>
          </button>
        ))}
      </div>
      <div className={styles.bgUpload}>
        <label className={styles.bgUploadLabel}>
          {uploading ? 'Uploading…' : 'Upload custom image'}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.bgFileInput}
            onChange={(e) => void handleFileChange(e)}
            disabled={uploading}
          />
        </label>
        {!backgroundImageId && sceneType && (
          <button
            type="button"
            className={styles.bgDefaultBtn}
            onClick={() => onChange(DEFAULT_BACKGROUND_IDS[sceneType])}
          >
            Use scene-type default
          </button>
        )}
      </div>
      {uploadError && <p className={styles.bgError}>{uploadError}</p>}
    </div>
  );
}

function SceneRow({
  scene,
  adventureId,
  allScenes,
  onEdited,
}: {
  scene: Scene;
  adventureId: string;
  allScenes: Scene[];
  onEdited: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(scene.title);
  const [narrative, setNarrative] = useState(scene.narrativeReadAloud ?? '');
  const [dmNotes, setDmNotes] = useState(scene.dmNotes ?? '');
  const [dmTips, setDmTips] = useState(scene.dmTips ?? '');
  const [sceneType, setSceneType] = useState<SceneType>(scene.sceneType);
  const [loot, setLoot] = useState<LootEntry[]>(scene.loot ?? []);
  const [backgroundImageId, setBackgroundImageId] = useState<string | null>(
    scene.backgroundImageId,
  );
  const updateScene = useUpdateScene(adventureId, scene.id);
  const deleteScene = useDeleteScene(adventureId);

  const sortedScenes = [...allScenes].sort((a, b) => a.orderIndex - b.orderIndex);
  const currentPos = sortedScenes.findIndex((s) => s.id === scene.id);
  const prevScene = sortedScenes[currentPos - 1] ?? null;
  const nextScene = sortedScenes[currentPos + 1] ?? null;
  const canMoveUp = currentPos > 0;
  const canMoveDown = currentPos < sortedScenes.length - 1;

  const updatePrev = useUpdateScene(adventureId, prevScene?.id ?? scene.id);
  const updateNext = useUpdateScene(adventureId, nextScene?.id ?? scene.id);

  async function save() {
    await updateScene.mutateAsync({
      title,
      narrativeReadAloud: narrative,
      dmNotes,
      dmTips,
      sceneType,
      loot: loot.length > 0 ? loot : undefined,
      backgroundImageId: backgroundImageId ?? undefined,
    });
    setEditing(false);
    onEdited();
  }

  async function moveUp() {
    if (!prevScene) return;
    await Promise.all([
      updateScene.mutateAsync({ orderIndex: prevScene.orderIndex }),
      updatePrev.mutateAsync({ orderIndex: scene.orderIndex }),
    ]);
    onEdited();
  }

  async function moveDown() {
    if (!nextScene) return;
    await Promise.all([
      updateScene.mutateAsync({ orderIndex: nextScene.orderIndex }),
      updateNext.mutateAsync({ orderIndex: scene.orderIndex }),
    ]);
    onEdited();
  }

  const backgroundSrc = resolveBackgroundSrc(scene.backgroundImageId);
  const lootCount = (scene.loot ?? []).length;

  return (
    <div className={styles.sceneRow}>
      {backgroundSrc && !editing && (
        <div
          className={styles.sceneBanner}
          style={{ backgroundImage: `url(${backgroundSrc})` }}
          aria-hidden="true"
        />
      )}
      {editing ? (
        <div className={styles.sceneEdit}>
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Scene title"
          />
          <label htmlFor={`scene-type-${scene.id}`} className={styles.label}>
            Scene type
          </label>
          <select
            id={`scene-type-${scene.id}`}
            className={styles.select}
            value={sceneType}
            onChange={(e) => setSceneType(e.target.value as SceneType)}
          >
            {SCENE_TYPES.map((type) => (
              <option key={type} value={type}>
                {SCENE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <label htmlFor={`scene-narrative-${scene.id}`} className={styles.label}>
            Read-aloud narrative
          </label>
          <textarea
            id={`scene-narrative-${scene.id}`}
            className={styles.textarea}
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            rows={4}
            placeholder="What the players hear when this scene starts…"
          />
          <label htmlFor={`scene-notes-${scene.id}`} className={styles.label}>
            DM notes (private)
          </label>
          <textarea
            id={`scene-notes-${scene.id}`}
            className={styles.textarea}
            value={dmNotes}
            onChange={(e) => setDmNotes(e.target.value)}
            rows={3}
            placeholder="NPC motivations, secret info, trap triggers…"
          />
          <label htmlFor={`scene-tips-${scene.id}`} className={styles.label}>
            DM tips
          </label>
          <textarea
            id={`scene-tips-${scene.id}`}
            className={styles.textarea}
            value={dmTips}
            onChange={(e) => setDmTips(e.target.value)}
            rows={3}
            placeholder="Suggestions for running this scene…"
          />
          <LootEditor loot={loot} onChange={setLoot} />
          <BackgroundPicker
            adventureId={adventureId}
            sceneId={scene.id}
            sceneType={sceneType}
            backgroundImageId={backgroundImageId}
            onChange={setBackgroundImageId}
          />
          <div className={styles.editActions}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void save()}
              isLoading={updateScene.isPending}
            >
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.sceneView}>
          <div className={styles.sceneInfo}>
            <div className={styles.reorderButtons}>
              <button
                type="button"
                className={styles.reorderBtn}
                onClick={() => void moveUp()}
                disabled={!canMoveUp || updateScene.isPending}
                aria-label="Move scene up"
              >
                ▲
              </button>
              <span className={styles.sceneOrder}>{scene.orderIndex + 1}</span>
              <button
                type="button"
                className={styles.reorderBtn}
                onClick={() => void moveDown()}
                disabled={!canMoveDown || updateScene.isPending}
                aria-label="Move scene down"
              >
                ▼
              </button>
            </div>
            <div>
              <div className={styles.sceneTitleRow}>
                <p className={styles.sceneTitle}>{scene.title}</p>
                <span
                  className={styles.sceneTypeBadge}
                  style={{ color: SCENE_TYPE_COLOURS[scene.sceneType] }}
                >
                  {SCENE_TYPE_LABELS[scene.sceneType]}
                </span>
                {lootCount > 0 && (
                  <span className={styles.lootBadge}>
                    {lootCount} loot {lootCount === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              {scene.narrativeReadAloud && (
                <p className={styles.sceneNarrative}>
                  {scene.narrativeReadAloud.slice(0, 120)}
                  {scene.narrativeReadAloud.length > 120 ? '…' : ''}
                </p>
              )}
            </div>
          </div>
          <div className={styles.sceneActions}>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void deleteScene.mutate(scene.id)}
              isLoading={deleteScene.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

type ViewMode = 'list' | 'flow';

export function ScenesPage({ adventureId }: Props) {
  const { data: sceneList, isLoading, refetch } = useScenes(adventureId);
  const createScene = useCreateScene(adventureId);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  async function handleAdd() {
    if (!newTitle.trim()) return;
    await createScene.mutateAsync({
      title: newTitle.trim(),
      sceneType: 'exploration',
      orderIndex: sceneList?.length ?? 0,
    });
    setNewTitle('');
    setAdding(false);
  }

  return (
    <div className={viewMode === 'flow' ? styles.pageFlow : styles.page}>
      <div className={styles.header}>
        <Link to="/adventures/$id" params={{ id: adventureId }} className={styles.back}>
          ← Adventure overview
        </Link>
        <h1 className={styles.title}>Scenes</h1>
      </div>

      <div className={styles.viewToggle}>
        <button
          type="button"
          className={`${styles.viewTab} ${viewMode === 'list' ? styles.viewTabActive : ''}`}
          onClick={() => setViewMode('list')}
        >
          List view
        </button>
        <button
          type="button"
          className={`${styles.viewTab} ${viewMode === 'flow' ? styles.viewTabActive : ''}`}
          onClick={() => setViewMode('flow')}
        >
          Flow view
        </button>
      </div>

      {isLoading ? (
        <div className={styles.center}>
          <Spinner size="lg" />
        </div>
      ) : viewMode === 'flow' ? (
        <SceneFlowGraph adventureId={adventureId} />
      ) : (
        <div className={styles.sceneList}>
          {(sceneList ?? []).map((scene) => (
            <SceneRow
              key={scene.id}
              scene={scene}
              adventureId={adventureId}
              allScenes={sceneList ?? []}
              onEdited={() => void refetch()}
            />
          ))}

          {adding ? (
            <div className={styles.addForm}>
              <input
                className={styles.input}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Scene title…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleAdd();
                  if (e.key === 'Escape') setAdding(false);
                }}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => void handleAdd()}
                isLoading={createScene.isPending}
                disabled={!newTitle.trim()}
              >
                Add scene
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setAdding(true)}>
              + Add scene
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
