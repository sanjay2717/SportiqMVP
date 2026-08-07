import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getUpcomingEvents, DashboardEvent } from '../../../dashboard/services/organiserService';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';
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
      <main className={styles.container}>
        <header className={styles.header}>
          <Skeleton width="150px" height="32px" />
          <div className={styles.headerActions}>
             <Skeleton width="40px" height="40px" variant="circular" />
             <Skeleton width="40px" height="40px" variant="circular" />
          </div>
        </header>
        <div className={styles.content}>
          <section className={styles.section}>
            <Skeleton width="120px" height="24px" className={styles.sectionTitle} />
            <div className={styles.sectionCard}>
               <div className={styles.notificationItem}>
                  <div className={styles.iconWrapper}>
                    <Skeleton width="100%" height="100%" variant="circular" />
                  </div>
                  <div className={styles.contentWrapper}>
                     <div className={styles.headerRow}>
                       <Skeleton width="80%" height="20px" />
                       <Skeleton width="40px" height="20px" />
                     </div>
                  </div>
               </div>
               <div className={styles.notificationItem} style={{ borderTop: '1px solid var(--color-outline-variant)' }}>
                  <div className={styles.iconWrapper}>
                    <Skeleton width="100%" height="100%" variant="circular" />
                  </div>
                  <div className={styles.contentWrapper}>
                     <div className={styles.headerRow}>
                       <Skeleton width="60%" height="20px" />
                       <Skeleton width="40px" height="20px" />
                     </div>
                  </div>
               </div>
            </div>
          </section>
          
          <section className={styles.section}>
            <Skeleton width="120px" height="24px" className={styles.sectionTitle} />
            <div className={styles.sectionCard}>
               <div className={styles.emptyState}>
                 <Skeleton width="48px" height="48px" variant="circular" style={{ marginBottom: '16px' }} />
                 <Skeleton width="160px" height="24px" style={{ marginBottom: '8px' }} />
                 <Skeleton width="200px" height="20px" />
               </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <>
        <div className={styles.errorState}>
          <span className={`material-symbols-outlined ${styles.errorIcon}`}>error</span>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>Retry</button>
        </div>
      </>
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
    <div className="animate-fade-in">
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
    </div>
  );
}
