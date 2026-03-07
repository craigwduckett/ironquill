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
import styles from './ScenesPage.module.css';

type Props = { adventureId: string };

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
  const updateScene = useUpdateScene(adventureId, scene.id);
  const deleteScene = useDeleteScene(adventureId);

  async function save() {
    await updateScene.mutateAsync({
      title,
      narrativeReadAloud: narrative,
      dmNotes,
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
              <p className={styles.sceneTitle}>{scene.title}</p>
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

export function ScenesPage({ adventureId }: Props) {
  const { data: sceneList, isLoading, refetch } = useScenes(adventureId);
  const createScene = useCreateScene(adventureId);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!newTitle.trim()) return;
    await createScene.mutateAsync({
      title: newTitle.trim(),
      orderIndex: sceneList?.length ?? 0,
    });
    setNewTitle('');
    setAdding(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/adventures/$id" params={{ id: adventureId }} className={styles.back}>
          ← Adventure overview
        </Link>
        <h1 className={styles.title}>Scenes</h1>
      </div>

      {isLoading ? (
        <div className={styles.center}>
          <Spinner size="lg" />
        </div>
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
