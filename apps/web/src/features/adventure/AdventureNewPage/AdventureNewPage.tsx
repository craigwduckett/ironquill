import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '../../../components/ui/Button/Button.js';
import { useCreateAdventure } from '../hooks/useAdventures.js';
import styles from './AdventureNewPage.module.css';

export function AdventureNewPage() {
  const navigate = useNavigate();
  const createAdventure = useCreateAdventure();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [adventureType, setAdventureType] = useState<'campaign' | 'one_shot'>('campaign');
  const [ruleset, setRuleset] = useState<'standard' | 'kids' | 'custom'>('standard');
  const [levelMin, setLevelMin] = useState(1);
  const [levelMax, setLevelMax] = useState(5);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const adventure = await createAdventure.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        adventureType,
        ruleset,
        levelRangeMin: levelMin,
        levelRangeMax: levelMax,
        playerCapacityMin: 1,
        playerCapacityMax: 6,
      });
      void navigate({ to: '/adventures/$id', params: { id: adventure.id } });
    } catch {
      setError('Failed to create adventure. Please try again.');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>New Adventure</h1>
        <p className={styles.subtitle}>Set up your adventure before inviting players.</p>

        <form onSubmit={(e) => void handleSubmit(e)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="adv-title" className={styles.label}>
              Title
            </label>
            <input
              id="adv-title"
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Lost Mines of Phandelver"
              maxLength={200}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="adv-desc" className={styles.label}>
              Description (optional)
            </label>
            <textarea
              id="adv-desc"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your adventure…"
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="adv-type" className={styles.label}>
                Type
              </label>
              <select
                id="adv-type"
                className={styles.select}
                value={adventureType}
                onChange={(e) => setAdventureType(e.target.value as 'campaign' | 'one_shot')}
              >
                <option value="campaign">Campaign</option>
                <option value="one_shot">One-shot</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="adv-ruleset" className={styles.label}>
                Ruleset
              </label>
              <select
                id="adv-ruleset"
                className={styles.select}
                value={ruleset}
                onChange={(e) => setRuleset(e.target.value as 'standard' | 'kids' | 'custom')}
              >
                <option value="standard">Standard (5e SRD)</option>
                <option value="kids">Kids Mode (simplified)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="adv-level-min" className={styles.label}>
                Min level
              </label>
              <input
                id="adv-level-min"
                type="number"
                className={styles.input}
                value={levelMin}
                onChange={(e) => setLevelMin(Number(e.target.value))}
                min={1}
                max={20}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="adv-level-max" className={styles.label}>
                Max level
              </label>
              <input
                id="adv-level-max"
                type="number"
                className={styles.input}
                value={levelMax}
                onChange={(e) => setLevelMax(Number(e.target.value))}
                min={levelMin}
                max={20}
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <Button
              type="submit"
              variant="primary"
              isLoading={createAdventure.isPending}
              disabled={!title.trim()}
            >
              Create Adventure
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
