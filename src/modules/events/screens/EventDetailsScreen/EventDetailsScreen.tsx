import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../routing/routes';
import { getEventById, SportEvent } from '../../services/eventService';
import { REGION_LIST } from '../../../../shared/constants/regions';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';
import styles from './EventDetailsScreen.module.css';

// Map for region readable names
const REGION_MAP: Record<string, string> = {};
REGION_LIST.forEach(r => {
  REGION_MAP[r.id] = r.name;
});

export function EventDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEventById(id);
      if (!data) {
        setError('Event not found.');
      } else {
        setEvent(data);
      }
    } catch (err) {
      setError('Failed to load event details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <section className={styles.heroSection}>
          <Skeleton width="100%" height="240px" variant="rectangular" style={{ borderRadius: 0 }} />
          <div className={styles.heroContent} style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', zIndex: 2 }}>
            <div className={styles.heroText}>
              <Skeleton width="120px" height="24px" style={{ borderRadius: '100px', marginBottom: '8px' }} />
              <Skeleton width="300px" height="40px" style={{ marginBottom: '8px' }} />
              <Skeleton width="200px" height="24px" />
            </div>
            <div className={styles.heroActions}>
              <Skeleton width="120px" height="40px" variant="rectangular" style={{ borderRadius: '100px' }} />
            </div>
          </div>
        </section>

        <div className={styles.bentoGrid}>
          <div className={styles.mainColumn}>
            <section className={styles.statsGrid}>
              <Skeleton width="100%" height="120px" variant="rectangular" />
              <Skeleton width="100%" height="120px" variant="rectangular" />
              <Skeleton width="100%" height="120px" variant="rectangular" />
            </section>
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <Skeleton width="200px" height="24px" />
                <Skeleton width="120px" height="32px" variant="rectangular" />
              </div>
              <div className={styles.listContainer}>
                {[1, 2].map((key) => (
                  <div key={key} className={styles.listItem}>
                    <div className={styles.listUserInfo}>
                      <Skeleton width="48px" height="48px" variant="circular" />
                      <div>
                        <Skeleton width="150px" height="20px" style={{ marginBottom: '4px' }} />
                        <Skeleton width="200px" height="16px" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className={styles.sideColumn}>
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <Skeleton width="120px" height="24px" />
              </div>
              <Skeleton width="100%" height="100px" variant="rectangular" />
            </section>
            <section className={styles.quickActionCard}>
              <Skeleton width="100%" height="120px" variant="rectangular" />
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.errorContainer}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-error)' }}>error</span>
        <h2 className={styles.errorTitle}>Oops!</h2>
        <p>{error || 'Something went wrong.'}</p>
        <button className={styles.backButton} onClick={() => navigate(ROUTES.EVENTS)}>Back to Events</button>
      </div>
    );
  }

  const date = new Date(event.event_date);
  const formattedDate = date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });
  const locationDisplay = event.location ? (REGION_MAP[event.location] || event.location) : 'TBD';

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Hero Banner */}
      <section className={styles.heroSection}>
        <div className={styles.heroImageContainer}>
          <div className={styles.heroGradient}></div>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <span className={styles.liveBadge}>Live Registration</span>
              <h2 className={styles.eventTitle}>{event.title}</h2>
              <p className={styles.eventSubtitle}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_today</span>
                {formattedDate} • {formattedTime}
              </p>
            </div>
            <div className={styles.heroActions}>
              <button className={styles.editButton} title="Coming Soon">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                Edit Event
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className={styles.bentoGrid}>
        {/* Main Content Column */}
        <div className={styles.mainColumn}>
          {/* Stats Overview */}
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>groups</span> Athletes
              </p>
              <p className={styles.statNumber}>0</p>
              <p className={styles.statSubtext}>Target: 500</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_tree</span> Teams
              </p>
              <p className={styles.statNumber}>0</p>
              <p className={`${styles.statSubtext} ${styles.statSubtextMuted}`}>Capacity: 32</p>
            </div>
            <div className={`${styles.statCard} ${styles.statCardPrimary}`}>
              <div className={styles.statHeader}>
                <p className={`${styles.statLabel} ${styles.statLabelPrimary}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pending_actions</span> Pending Approvals
                </p>
                <span className={styles.pendingBadge}>0</span>
              </div>
              <div className={styles.statFooter}>
                <p className={`${styles.statSubtext} ${styles.statSubtextPrimary}`}>Requires immediate attention</p>
                <button className={styles.reviewButton} title="Coming Soon">
                  Review <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </button>
              </div>
            </div>
          </section>

          {/* Registrations List Preview */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Recent Registrations</h3>
              <button className={styles.exportButton} title="Coming Soon">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span> Export List
              </button>
            </div>
            <div className={styles.listContainer}>
              {/* Mock List Item 1 */}
              <div className={styles.listItem}>
                <div className={styles.listUserInfo}>
                  <div className={styles.listAvatar}>AJ</div>
                  <div>
                    <p className={styles.listName}>Alex Johnson</p>
                    <p className={styles.listSubtext}>U18 Division • Elite Strikers</p>
                  </div>
                </div>
                <div className={styles.listActions}>
                  <span className={styles.approvedBadge}>Approved</span>
                  <button className={styles.moreButton} title="Coming Soon">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_vert</span>
                  </button>
                </div>
              </div>
              {/* Mock List Item 2 */}
              <div className={styles.listItem}>
                <div className={styles.listUserInfo}>
                  <div className={styles.listAvatar}>SM</div>
                  <div>
                    <p className={styles.listName}>Sarah Miller</p>
                    <p className={styles.listSubtext}>U16 Division • Independent</p>
                  </div>
                </div>
                <div className={styles.listActions}>
                  <button className={styles.approveButton} title="Coming Soon">Approve</button>
                  <button className={styles.moreButton} title="Coming Soon">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_vert</span>
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.sectionFooter}>
              <button className={styles.viewAllButton} title="Coming Soon">View All Registrations</button>
            </div>
          </section>
        </div>

        {/* Side Content Column */}
        <div className={styles.sideColumn}>
          {/* Logistics */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Logistics</h3>
            </div>
            <div className={styles.logisticsContent}>
              <div className={styles.logisticsRow}>
                <span className={`material-symbols-outlined ${styles.logisticsIcon}`}>location_on</span>
                <div>
                  <p className={styles.logisticsTitle}>{locationDisplay}</p>
                  {event.description && <p className={styles.logisticsSubtext}>{event.description}</p>}
                </div>
              </div>
              <div className={styles.mapPreview}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>map</span>
              </div>
            </div>
          </section>

          {/* Announcements Action */}
          <section className={styles.quickActionCard}>
            <div className={styles.quickActionTitle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>campaign</span>
                Announcements
              </span>
            </div>
            <p className={styles.quickActionText}>Send updates to all registered athletes and team managers.</p>
            <button className={styles.quickActionButton} title="Coming Soon">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              New Announcement
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
