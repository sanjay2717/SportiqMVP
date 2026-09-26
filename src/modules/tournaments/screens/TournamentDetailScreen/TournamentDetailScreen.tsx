import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournamentById, Tournament } from '../../services/tournamentService';
import { ROUTES } from '../../../../routing/routes';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';
import styles from './TournamentDetailScreen.module.css';

export function TournamentDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await getTournamentById(id);
        setTournament(data);
      } catch (err) {
        setError('Failed to load tournament details.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleRegister = () => {
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <main className={styles.container}>
        <Skeleton width="100%" height="200px" style={{ marginBottom: '16px' }} />
        <Skeleton width="60%" height="32px" style={{ marginBottom: '16px' }} />
        <Skeleton width="40%" height="24px" style={{ marginBottom: '32px' }} />
      </main>
    );
  }

  if (error || !tournament) {
    return (
      <main className={styles.container}>
        <div className={styles.emptyState}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-error)' }}>error</span>
          <p className={styles.emptyStateText}>{error || 'Tournament not found.'}</p>
          <button className={styles.backButton} onClick={() => navigate(ROUTES.TOURNAMENTS)}>
            Back to Tournaments
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(ROUTES.TOURNAMENTS)}>
        <span className="material-symbols-outlined">arrow_back</span>
        Back
      </button>

      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{tournament.title}</h1>
          {tournament.sport && (
            <span className={styles.sportBadge}>{tournament.sport}</span>
          )}
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainInfo}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>About the Tournament</h2>
            <p className={styles.description}>
              {tournament.description || 'No description provided.'}
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Details</h2>
            <ul className={styles.detailsList}>
              <li className={styles.detailItem}>
                <span className="material-symbols-outlined">calendar_today</span>
                <div>
                  <strong>Dates</strong>
                  <span>{formatDate(tournament.start_date)} {tournament.end_date ? ` – ${formatDate(tournament.end_date)}` : ''}</span>
                </div>
              </li>
              {tournament.location && (
                <li className={styles.detailItem}>
                  <span className="material-symbols-outlined">location_on</span>
                  <div>
                    <strong>Location</strong>
                    <span>{tournament.location}</span>
                  </div>
                </li>
              )}
              {tournament.organiser_name && (
                <li className={styles.detailItem}>
                  <span className="material-symbols-outlined">group</span>
                  <div>
                    <strong>Organiser</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      {tournament.organiser_avatar ? (
                        <img src={tournament.organiser_avatar} alt="Avatar" className={styles.organiserAvatar} />
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>person</span>
                      )}
                      <span>{tournament.organiser_name}</span>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </section>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.actionCard}>
            <h3 className={styles.actionTitle}>Ready to compete?</h3>
            <button className={styles.registerButton} onClick={handleRegister}>
              Register Now
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-success)' }}>check_circle</span>
            </div>
            <h2 className={styles.modalTitle}>You're registered!</h2>
            <p className={styles.modalText}>
              Your registration for <strong>{tournament.title}</strong> has been confirmed.
            </p>
            {/* DEMO ONLY — registration is not persisted to the database. This is
                a static confirmation for pilot demo purposes; a real registration
                flow (with a registrations table and capacity limits) is future work. */}
            <button className={styles.modalCloseButton} onClick={() => setShowModal(false)}>
              Back to Tournament
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
