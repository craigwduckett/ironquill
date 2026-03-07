import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '../../../components/ui/Button/Button.js';
import { EmptyState } from '../../../components/ui/EmptyState/EmptyState.js';
import { Spinner } from '../../../components/ui/Spinner/Spinner.js';
import { useSrdMonsters } from '../../srd/hooks/useSrd.js';
import type { Npc } from '../hooks/useAdventures.js';
import {
  useCreateNpc,
  useDeleteNpc,
  useNpcs,
  useScenes,
  useUpdateNpc,
} from '../hooks/useAdventures.js';
import styles from './NPCRosterPage.module.css';

type Props = { adventureId: string };

type NpcFormState = {
  sceneId: string;
  customName: string;
  customHpMax: string;
  notes: string;
  monsterId: string;
  monsterSearch: string;
};

const EMPTY_FORM: NpcFormState = {
  sceneId: '',
  customName: '',
  customHpMax: '',
  notes: '',
  monsterId: '',
  monsterSearch: '',
};

function MonsterSearchDropdown({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (id: string, name: string) => void;
}) {
  const { data: monsters, isFetching } = useSrdMonsters(
    query.trim().length >= 2 ? { name: query.trim() } : undefined,
  );

  if (!query.trim() || query.trim().length < 2) return null;

  return (
    <div className={styles.monsterDropdown}>
      {isFetching && <p className={styles.dropdownHint}>Searching…</p>}
      {!isFetching && (!monsters || monsters.length === 0) && (
        <p className={styles.dropdownHint}>No monsters found.</p>
      )}
      {monsters && monsters.length > 0 && (
        <ul className={styles.dropdownList}>
          {monsters.slice(0, 8).map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => onSelect(m.id, m.name)}
              >
                <span>{m.name}</span>
                <span className={styles.dropdownMeta}>CR {m.cr}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NpcCard({
  npc,
  adventureId,
  sceneName,
}: {
  npc: Npc;
  adventureId: string;
  sceneName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(npc.customName ?? '');
  const [hp, setHp] = useState(String(npc.customHpMax ?? ''));
  const [notes, setNotes] = useState(npc.notes ?? '');
  const updateNpc = useUpdateNpc(adventureId, npc.id);
  const deleteNpc = useDeleteNpc(adventureId);

  async function save() {
    await updateNpc.mutateAsync({
      sceneId: npc.sceneId,
      customName: name.trim() || undefined,
      customHpMax: hp ? Number(hp) : undefined,
      notes: notes.trim() || undefined,
    });
    setEditing(false);
  }

  return (
    <div className={styles.npcCard}>
      {editing ? (
        <div className={styles.npcEdit}>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Custom name"
          />
          <input
            className={styles.input}
            type="number"
            min={0}
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            placeholder="HP"
          />
          <textarea
            className={styles.textarea}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Notes…"
          />
          <div className={styles.cardActions}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void save()}
              isLoading={updateNpc.isPending}
            >
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.npcView}>
          <div className={styles.npcInfo}>
            <p className={styles.npcName}>
              {npc.customName ?? (npc.monsterId ? 'SRD Monster' : 'Unnamed NPC')}
            </p>
            <p className={styles.npcScene}>{sceneName}</p>
            <div className={styles.npcMeta}>
              {npc.customHpMax != null && (
                <span className={styles.npcMetaItem}>HP {npc.customHpMax}</span>
              )}
              {npc.monsterId && <span className={styles.npcMetaItem}>SRD base</span>}
            </div>
            {npc.notes && <p className={styles.npcNotes}>{npc.notes}</p>}
          </div>
          <div className={styles.cardActions}>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              isLoading={deleteNpc.isPending}
              onClick={() => void deleteNpc.mutate({ sceneId: npc.sceneId, npcId: npc.id })}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function NPCRosterPage({ adventureId }: Props) {
  const { data: npcs, isLoading: npcsLoading, isError: npcsError } = useNpcs(adventureId);
  const { data: sceneList, isLoading: scenesLoading } = useScenes(adventureId);
  const createNpc = useCreateNpc(adventureId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NpcFormState>(EMPTY_FORM);

  const isLoading = npcsLoading || scenesLoading;

  async function handleAdd() {
    if (!form.sceneId) return;
    await createNpc.mutateAsync({
      sceneId: form.sceneId,
      customName: form.customName.trim() || undefined,
      customHpMax: form.customHpMax ? Number(form.customHpMax) : undefined,
      notes: form.notes.trim() || undefined,
      monsterId: form.monsterId || undefined,
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  const sceneMap = new Map((sceneList ?? []).map((s) => [s.id, s.title]));

  const npcsByScene = (npcs ?? []).reduce<Record<string, Npc[]>>((acc, npc) => {
    const key = npc.sceneId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(npc);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (npcsError) {
    return (
      <div className={styles.center}>
        <EmptyState
          title="Failed to load NPCs"
          description="Check your connection and try again."
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/adventures/$id" params={{ id: adventureId }} className={styles.back}>
          ← Adventure overview
        </Link>
        <h1 className={styles.title}>NPC Roster</h1>
        {!showForm && (
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            + Add NPC
          </Button>
        )}
      </div>

      {showForm && (
        <div className={styles.addForm}>
          <h2 className={styles.formTitle}>Add NPC</h2>

          <div className={styles.formRow}>
            <label htmlFor="npc-scene" className={styles.label}>
              Scene
            </label>
            <select
              id="npc-scene"
              className={styles.select}
              value={form.sceneId}
              onChange={(e) => setForm((f) => ({ ...f, sceneId: e.target.value }))}
            >
              <option value="">Select a scene…</option>
              {(sceneList ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <label htmlFor="npc-name" className={styles.label}>
              Custom name
            </label>
            <input
              id="npc-name"
              className={styles.input}
              value={form.customName}
              onChange={(e) => setForm((f) => ({ ...f, customName: e.target.value }))}
              placeholder="e.g. Gareth the innkeeper"
            />
          </div>

          <div className={styles.formRow}>
            <label htmlFor="npc-hp" className={styles.label}>
              Max HP
            </label>
            <input
              id="npc-hp"
              className={styles.input}
              type="number"
              min={0}
              value={form.customHpMax}
              onChange={(e) => setForm((f) => ({ ...f, customHpMax: e.target.value }))}
              placeholder="e.g. 14"
            />
          </div>

          <div className={styles.formRow}>
            <label htmlFor="npc-notes" className={styles.label}>
              Notes
            </label>
            <textarea
              id="npc-notes"
              className={styles.textarea}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Motivations, personality, secrets…"
            />
          </div>

          <div className={styles.formRow}>
            <label htmlFor="npc-monster" className={styles.label}>
              SRD monster base (optional)
            </label>
            <div className={styles.searchWrap}>
              {form.monsterId ? (
                <div className={styles.monsterSelected}>
                  <span>{form.monsterSearch}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        monsterId: '',
                        monsterSearch: '',
                      }))
                    }
                  >
                    Clear
                  </Button>
                </div>
              ) : (
                <>
                  <input
                    id="npc-monster"
                    className={styles.input}
                    value={form.monsterSearch}
                    onChange={(e) => setForm((f) => ({ ...f, monsterSearch: e.target.value }))}
                    placeholder="Search monsters by name…"
                    autoComplete="off"
                  />
                  <MonsterSearchDropdown
                    query={form.monsterSearch}
                    onSelect={(id, name) =>
                      setForm((f) => ({
                        ...f,
                        monsterId: id,
                        monsterSearch: name,
                      }))
                    }
                  />
                </>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleAdd()}
              isLoading={createNpc.isPending}
              disabled={!form.sceneId}
            >
              Add NPC
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setForm(EMPTY_FORM);
                setShowForm(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {(!npcs || npcs.length === 0) && !showForm && (
        <EmptyState
          title="No NPCs yet"
          description="Add NPCs to populate your adventure with characters."
          action={
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Add your first NPC
            </Button>
          }
        />
      )}

      {Object.entries(npcsByScene).map(([sceneId, sceneNpcs]) => (
        <section key={sceneId} className={styles.sceneGroup}>
          <h2 className={styles.sceneGroupTitle}>{sceneMap.get(sceneId) ?? 'Unknown scene'}</h2>
          <div className={styles.npcList}>
            {sceneNpcs.map((npc) => (
              <NpcCard
                key={npc.id}
                npc={npc}
                adventureId={adventureId}
                sceneName={sceneMap.get(npc.sceneId) ?? ''}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
