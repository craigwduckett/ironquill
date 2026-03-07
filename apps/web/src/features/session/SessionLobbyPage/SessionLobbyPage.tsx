import { Link } from '@tanstack/react-router';
import { Spinner } from '../../../components/ui/Spinner/Spinner.js';
import { useCreateSession, useSessionsByAdventure } from '../hooks/useSessions.js';
import styles from './SessionLobbyPage.module.css';

type Props = { adventureId: string };

const STATUS_LABEL: Record<string, string> = {
  lobby: 'Lobby',
  active: 'Active',
  paused: 'Paused',
  ended: 'Ended',
};

export function SessionLobbyPage({ adventureId }: Props) {
  const { data: sessions, isLoading, isError } = useSessionsByAdventure(adventureId);
  const createSession = useCreateSession(adventureId);

  if (isLoading) return <Spinner />;
  if (isError) return <p className={styles.error}>Failed to load sessions.</p>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Sessions</h1>
        <button
          type="button"
          className={styles.newBtn}
          onClick={() => createSession.mutate()}
          disabled={createSession.isPending}
        >
          {createSession.isPending ? 'Creating…' : '+ New Session'}
        </button>
      </div>

      {createSession.isError && (
        <p className={styles.error}>Failed to create session. Please try again.</p>
      )}

      {sessions?.length === 0 ? (
        <p className={styles.empty}>No sessions yet. Create one to get started.</p>
      ) : (
        <ul className={styles.list}>
          {sessions?.map((session) => (
            <li key={session.id} className={styles.card}>
              <div className={styles.cardInfo}>
                <span className={`${styles.status} ${styles[`status_${session.status}`]}`}>
                  {STATUS_LABEL[session.status] ?? session.status}
                </span>
                <span className={styles.date}>
                  {new Date(session.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.cardActions}>
                <Link to="/sessions/$id/dm" params={{ id: session.id }} className={styles.dmLink}>
                  DM View
                </Link>
                <Link
                  to="/sessions/$id/play"
                  params={{ id: session.id }}
                  className={styles.playLink}
                >
                  Player View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.back}>
        <Link to="/adventures/$id" params={{ id: adventureId }}>
          ← Back to adventure
        </Link>
      </div>
    </div>
  );
}
