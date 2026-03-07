import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge/Badge.js';
import { Button } from '../../../components/ui/Button/Button.js';
import { EmptyState } from '../../../components/ui/EmptyState/EmptyState.js';
import { Spinner } from '../../../components/ui/Spinner/Spinner.js';
import {
  useAdventure,
  useDeleteAdventure,
  useGenerateInvite,
  useScenes,
} from '../hooks/useAdventures.js';
import styles from './AdventureOverviewPage.module.css';

type Props = { adventureId: string };

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
};

const RULESET_LABEL: Record<string, string> = {
  standard: 'Standard 5e SRD',
  kids: 'Kids Mode',
  custom: 'Custom',
};

export function AdventureOverviewPage({ adventureId }: Props) {
  const { data: adventure, isLoading, isError } = useAdventure(adventureId);
  const { data: sceneList } = useScenes(adventureId);
  const generateInvite = useGenerateInvite(adventureId);
  const deleteAdventure = useDeleteAdventure();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !adventure) {
    return (
      <div className={styles.center}>
        <EmptyState
          title="Adventure not found"
          description="This adventure may have been deleted or doesn't belong to you."
          action={
            <Link to="/dashboard">
              <Button variant="primary">Back to dashboard</Button>
            </Link>
          }
        />
      </div>
    );
  }

  function copyInviteCode() {
    if (!adventure?.inviteCode) return;
    void navigator.clipboard.writeText(adventure.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <Link to="/dashboard" className={styles.back}>
            ← Dashboard
          </Link>
          <h1 className={styles.title}>{adventure.title}</h1>
          <div className={styles.meta}>
            <Badge variant="accent">{STATUS_LABEL[adventure.status] ?? adventure.status}</Badge>
            <span className={styles.metaItem}>
              {RULESET_LABEL[adventure.ruleset] ?? adventure.ruleset}
            </span>
            <span className={styles.metaItem}>
              {adventure.adventureType === 'campaign' ? 'Campaign' : 'One-shot'}
            </span>
            <span className={styles.metaItem}>
              Levels {adventure.levelRangeMin}–{adventure.levelRangeMax}
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link to="/adventures/$id/sessions" params={{ id: adventureId }}>
            <Button variant="primary" size="sm">
              Sessions
            </Button>
          </Link>
          <Link to="/adventures/$id/scenes" params={{ id: adventureId }}>
            <Button variant="secondary" size="sm">
              Scenes
            </Button>
          </Link>
          <Link to="/adventures/$id/npcs" params={{ id: adventureId }}>
            <Button variant="secondary" size="sm">
              NPCs
            </Button>
          </Link>
          {adventure.ruleset === 'kids' && (
            <Link to="/adventures/$id/presets" params={{ id: adventureId }}>
              <Button variant="secondary" size="sm">
                Presets
              </Button>
            </Link>
          )}
          <Link to="/adventures/$id/settings" params={{ id: adventureId }}>
            <Button variant="ghost" size="sm">
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {adventure.description && <p className={styles.description}>{adventure.description}</p>}

      <div className={styles.grid}>
        {/* ── Scenes summary ── */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Scenes</h2>
            <Link to="/adventures/$id/scenes" params={{ id: adventureId }}>
              <Button variant="ghost" size="sm">
                Edit scenes
              </Button>
            </Link>
          </div>
          {sceneList && sceneList.length > 0 ? (
            <ol className={styles.sceneList}>
              {sceneList.map((scene) => (
                <li key={scene.id} className={styles.sceneItem}>
                  <span className={styles.sceneIndex}>{scene.orderIndex + 1}</span>
                  <span className={styles.sceneName}>{scene.title}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>No scenes yet. Add your first scene.</p>
          )}
        </section>

        {/* ── Invite code ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Invite Players</h2>
          {adventure.inviteCode ? (
            <div className={styles.inviteBox}>
              <code className={styles.inviteCode}>{adventure.inviteCode}</code>
              <Button variant="secondary" size="sm" onClick={copyInviteCode}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          ) : (
            <div className={styles.inviteBox}>
              <p className={styles.empty}>No invite code yet.</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => void generateInvite.mutate()}
                isLoading={generateInvite.isPending}
              >
                Generate code
              </Button>
            </div>
          )}
          <p className={styles.inviteHint}>
            Share this code with players so they can join via the dashboard.
          </p>
        </section>
      </div>

      {/* ── Danger zone ── */}
      <div className={styles.danger}>
        {confirmDelete ? (
          <div className={styles.confirmRow}>
            <span className={styles.confirmText}>
              Delete &ldquo;{adventure.title}&rdquo;? This cannot be undone.
            </span>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteAdventure.isPending}
              onClick={() =>
                void deleteAdventure.mutateAsync(adventureId).then(() => {
                  window.location.href = '/dashboard';
                })
              }
            >
              Confirm delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
            Delete adventure
          </Button>
        )}
      </div>
    </div>
  );
}
