import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button.js';
import { Spinner } from '../../../components/ui/Spinner/Spinner.js';
import { useAdventure, useDeleteAdventure, useUpdateAdventure } from '../hooks/useAdventures.js';
import styles from './AdventureSettingsPage.module.css';

type Props = { adventureId: string };

export function AdventureSettingsPage({ adventureId }: Props) {
  const navigate = useNavigate();
  const { data: adventure, isLoading } = useAdventure(adventureId);
  const updateAdventure = useUpdateAdventure(adventureId);
  const deleteAdventure = useDeleteAdventure();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'completed'>('draft');
  const [ruleset, setRuleset] = useState<'standard' | 'kids' | 'custom'>('standard');
  const [levelMin, setLevelMin] = useState(1);
  const [levelMax, setLevelMax] = useState(5);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (adventure) {
      setTitle(adventure.title);
      setDescription(adventure.description ?? '');
      setStatus(adventure.status);
      setRuleset(adventure.ruleset);
      setLevelMin(adventure.levelRangeMin);
      setLevelMax(adventure.levelRangeMax);
    }
  }, [adventure]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateAdventure.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      ruleset,
      levelRangeMin: levelMin,
      levelRangeMax: levelMax,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
      <div className={styles.header}>
        <Link to="/adventures/$id" params={{ id: adventureId }} className={styles.back}>
          ← Adventure overview
        </Link>
        <h1 className={styles.title}>Settings</h1>
      </div>

      <div className={styles.card}>
        <form onSubmit={(e) => void handleSave(e)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="set-title" className={styles.label}>
              Title
            </label>
            <input
              id="set-title"
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="set-desc" className={styles.label}>
              Description
            </label>
            <textarea
              id="set-desc"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="set-status" className={styles.label}>
                Status
              </label>
              <select
                id="set-status"
                className={styles.select}
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'active' | 'completed')}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="set-ruleset" className={styles.label}>
                Ruleset
              </label>
              <select
                id="set-ruleset"
                className={styles.select}
                value={ruleset}
                onChange={(e) => setRuleset(e.target.value as 'standard' | 'kids' | 'custom')}
              >
                <option value="standard">Standard 5e SRD</option>
                <option value="kids">Kids Mode</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="set-lvl-min" className={styles.label}>
                Min level
              </label>
              <input
                id="set-lvl-min"
                type="number"
                className={styles.input}
                value={levelMin}
                onChange={(e) => setLevelMin(Number(e.target.value))}
                min={1}
                max={20}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="set-lvl-max" className={styles.label}>
                Max level
              </label>
              <input
                id="set-lvl-max"
                type="number"
                className={styles.input}
                value={levelMax}
                onChange={(e) => setLevelMax(Number(e.target.value))}
                min={levelMin}
                max={20}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="submit" variant="primary" isLoading={updateAdventure.isPending}>
              {saved ? 'Saved!' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>

      <div className={styles.danger}>
        <h2 className={styles.dangerTitle}>Danger Zone</h2>
        {confirmDelete ? (
          <div className={styles.confirmRow}>
            <span className={styles.confirmText}>
              Delete &ldquo;{adventure?.title}&rdquo;? This will permanently remove all scenes,
              NPCs, and session data.
            </span>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteAdventure.isPending}
              onClick={() =>
                void deleteAdventure
                  .mutateAsync(adventureId)
                  .then(() => void navigate({ to: '/dashboard' }))
              }
            >
              Confirm delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            Delete adventure
          </Button>
        )}
      </div>
    </div>
  );
}
