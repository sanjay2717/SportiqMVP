import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../../../shared/layouts/AppLayout';
import { getUpcomingEvents, DashboardEvent } from '../../../dashboard/services/organiserService';
import styles from './NotificationsScreen.module.css';

export function NotificationsScreen() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUpcomingEvents();
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events for notifications:', err);
        setError('Failed to load notifications.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading notifications...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className={styles.errorState}>
          <span className={`material-symbols-outlined ${styles.errorIcon}`}>error</span>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>Retry</button>
        </div>
      </AppLayout>
    );
  }

  // Helper to format date relatively or short style for mock/real data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Soon';
    }
  };

  return (
    <AppLayout>
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Notifications</h1>
          <div className={styles.headerActions}>
            <button className={styles.iconButton} aria-label="Search">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className={styles.iconButton} aria-label="Settings">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        <div className={styles.content}>
          {/* Section: Event Updates */}
          <section className={styles.section} aria-labelledby="events-title">
            <h2 id="events-title" className={styles.sectionTitle}>Event Updates</h2>
            <div className={styles.sectionCard}>
              {events.length > 0 ? (
                events.map(event => (
                  <div key={event.id} className={styles.notificationItem}>
                    <div className={`${styles.iconWrapper} ${styles.iconWrapperEvent}`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                    </div>
                    <div className={styles.contentWrapper}>
                      <div className={styles.headerRow}>
                        <p className={styles.message}>
                          <span className={styles.messageBold}>{event.title}</span> is scheduled for {formatDate(event.event_date)}.
                        </p>
                        <span className={styles.timestamp}>New</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <span className={`material-symbols-outlined ${styles.emptyStateIcon}`}>event_busy</span>
                  <h3 className={styles.emptyStateTitle}>No Upcoming Events</h3>
                  <p className={styles.emptyStateDesc}>You have no event notifications right now.</p>
                </div>
              )}
            </div>
          </section>

          {/* Section: Achievements */}
          <section className={styles.section} aria-labelledby="achievements-title">
            <h2 id="achievements-title" className={styles.sectionTitle}>Achievements</h2>
            <div className={styles.sectionCard}>
              <div className={styles.emptyState}>
                <span className={`material-symbols-outlined ${styles.emptyStateIcon}`}>emoji_events</span>
                <h3 className={styles.emptyStateTitle}>No New Achievements</h3>
                <p className={styles.emptyStateDesc}>Keep training to unlock milestones and badges!</p>
              </div>
            </div>
          </section>

          {/* Section: Social Activity */}
          <section className={styles.section} aria-labelledby="social-title">
            <h2 id="social-title" className={styles.sectionTitle}>Social Activity</h2>
            <div className={styles.sectionCard}>
              <div className={styles.emptyState}>
                <span className={`material-symbols-outlined ${styles.emptyStateIcon}`}>group</span>
                <h3 className={styles.emptyStateTitle}>No Recent Interactions</h3>
                <p className={styles.emptyStateDesc}>You don't have any new followers, likes, or comments.</p>
              </div>
            </div>
          </section>

          {/* Section: System Alerts */}
          <section className={styles.section} aria-labelledby="system-title">
            <h2 id="system-title" className={styles.sectionTitle}>System Alerts</h2>
            <div className={styles.sectionCard}>
              <div className={styles.emptyState}>
                <span className={`material-symbols-outlined ${styles.emptyStateIcon}`}>notifications</span>
                <h3 className={styles.emptyStateTitle}>All Caught Up</h3>
                <p className={styles.emptyStateDesc}>There are no system updates or alerts.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
