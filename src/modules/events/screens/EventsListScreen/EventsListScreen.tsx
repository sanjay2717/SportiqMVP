import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../routing/routes';
import { getEvents, SportEvent } from '../../services/eventService';
import { EventCard } from '../../components/EventCard/EventCard';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';
import styles from './EventsListScreen.module.css';
import cardStyles from '../../components/EventCard/EventCard.module.css';

export function EventsListScreen() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Community Events</h1>
          <p className={styles.subtitle}>Discover and join upcoming tournaments, training sessions, and sports gatherings.</p>
        </div>
        <button className={styles.createButton} onClick={() => navigate(ROUTES.CREATE_EVENT)}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '6px' }}>add</span>
          Create Event
        </button>
      </header>

      <section className={styles.content}>
        {isLoading ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map(key => (
              <div key={key} className={cardStyles.card}>
                <div className={cardStyles.content}>
                  <div className={cardStyles.header}>
                    <Skeleton width="60%" height="24px" />
                    <Skeleton width="80px" height="24px" style={{ borderRadius: '100px' }} />
                  </div>
                  <Skeleton width="100%" height="16px" style={{ marginTop: '12px', marginBottom: '8px' }} />
                  <Skeleton width="80%" height="16px" style={{ marginBottom: '16px' }} />
                  <div className={cardStyles.metaGrid}>
                    <Skeleton width="70%" height="20px" />
                    <Skeleton width="50%" height="20px" />
                    <Skeleton width="60%" height="20px" />
                  </div>
                </div>
                <div className={cardStyles.footer}>
                  <Skeleton width="120px" height="36px" style={{ borderRadius: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-error)' }}>error</span>
            <p className={styles.emptyStateText}>{error}</p>
            <button className={styles.retryButton} onClick={fetchEvents}>Try Again</button>
          </div>
        ) : events.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-neutral-400)' }}>event_busy</span>
            <p className={styles.emptyStateText}>No upcoming events found.</p>
            <button className={styles.createButton} onClick={() => navigate(ROUTES.CREATE_EVENT)}>
              Be the first to create one
            </button>
          </div>
        ) : (
          <div className={`${styles.grid} animate-fade-in`}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
