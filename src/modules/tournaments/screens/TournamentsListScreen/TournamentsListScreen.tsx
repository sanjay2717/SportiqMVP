import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { UserRole } from '../../../../core/auth/types';
import { getTournaments, Tournament } from '../../../tournaments/services/tournamentService';
import { ROUTES } from '../../../../routing/routes';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';
import styles from './TournamentsListScreen.module.css';

export function TournamentsListScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTournaments();
      setTournaments(data);
    } catch (err) {
      setError('Failed to load tournaments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOrganiser = user?.role === UserRole.Organiser;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tournaments</h1>
          <p className={styles.subtitle}>Browse all upcoming and active tournaments.</p>
        </div>
        {isOrganiser && (
          <button
            type="button"
            className={styles.createButton}
            onClick={() => navigate(ROUTES.CREATE_TOURNAMENT)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            New Tournament
          </button>
        )}
      </header>

      <section className={styles.content}>
        {isLoading ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4].map(key => (
              <div key={key} className={styles.card}>
                <div className={styles.cardBody}>
                  <Skeleton width="60%" height="22px" style={{ marginBottom: '8px' }} />
                  <Skeleton width="40%" height="16px" style={{ marginBottom: '12px' }} />
                  <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
                  <Skeleton width="80%" height="16px" />
                </div>
                <div className={styles.cardFooter}>
                  <Skeleton width="120px" height="16px" />
                  <Skeleton width="80px" height="16px" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-error)' }}>error</span>
            <p className={styles.emptyStateText}>{error}</p>
            <button type="button" className={styles.retryButton} onClick={fetchTournaments}>
              Retry
            </button>
          </div>
        ) : tournaments.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-neutral-400)' }}>emoji_events</span>
            <p className={styles.emptyStateText}>No tournaments yet.</p>
            {isOrganiser && (
              <button
                type="button"
                className={styles.createButton}
                onClick={() => navigate(ROUTES.CREATE_TOURNAMENT)}
              >
                Create the first tournament
              </button>
            )}
          </div>
        ) : (
          <div className={`${styles.grid} animate-fade-in`}>
            {tournaments.map(tournament => (
              <div key={tournament.id} className={styles.card}>
                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>{tournament.title}</h2>
                    {tournament.sport && (
                      <span className={styles.sportBadge}>{tournament.sport}</span>
                    )}
                  </div>
                  {tournament.description && (
                    <p className={styles.cardDesc}>{tournament.description}</p>
                  )}
                  <div className={styles.metaGrid}>
                    <span className={styles.metaItem}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
                      {formatDate(tournament.start_date)}
                      {tournament.end_date && ` – ${formatDate(tournament.end_date)}`}
                    </span>
                    {tournament.location && (
                      <span className={styles.metaItem}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                        {tournament.location}
                      </span>
                    )}
                    {tournament.organiser_name && (
                      <span className={styles.metaItem}>
                        {tournament.organiser_avatar ? (
                          <img src={tournament.organiser_avatar} alt="Avatar" style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                        )}
                        {tournament.organiser_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
