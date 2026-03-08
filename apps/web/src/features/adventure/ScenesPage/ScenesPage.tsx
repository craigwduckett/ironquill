import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '../../../components/ui/Button/Button.js';
import { Spinner } from '../../../components/ui/Spinner/Spinner.js';
import {
  type Scene,
  useCreateScene,
  useDeleteScene,
  useScenes,
  useUpdateScene,
} from '../hooks/useAdventures.js';
import { SceneFlowGraph } from '../SceneFlowGraph/SceneFlowGraph.js';
import styles from './ScenesPage.module.css';

type Props = { adventureId: string };

type SceneType = Scene['sceneType'];

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

function SceneRow({
  scene,
  adventureId,
  onEdited,
}: {
  scene: Scene;
  adventureId: string;
  onEdited: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(scene.title);
  const [narrative, setNarrative] = useState(scene.narrativeReadAloud ?? '');
  const [dmNotes, setDmNotes] = useState(scene.dmNotes ?? '');
  const [dmTips, setDmTips] = useState(scene.dmTips ?? '');
  const [sceneType, setSceneType] = useState<SceneType>(scene.sceneType);
  const updateScene = useUpdateScene(adventureId, scene.id);
  const deleteScene = useDeleteScene(adventureId);

  async function save() {
    await updateScene.mutateAsync({
      title,
      narrativeReadAloud: narrative,
      dmNotes,
      dmTips,
      sceneType,
    });
    setEditing(false);
    onEdited();
  }

  return (
    <div className={styles.sceneRow}>
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
            <span className={styles.sceneOrder}>{scene.orderIndex + 1}</span>
            <div>
              <div className={styles.sceneTitleRow}>
                <p className={styles.sceneTitle}>{scene.title}</p>
                <span
                  className={styles.sceneTypeBadge}
                  style={{ color: SCENE_TYPE_COLOURS[scene.sceneType] }}
                >
                  {SCENE_TYPE_LABELS[scene.sceneType]}
                </span>
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
