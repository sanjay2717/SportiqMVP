import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getUpcomingEvents, DashboardEvent } from '../../../dashboard/services/organiserService';
import { getNotifications, markAsRead, markAllAsRead, Notification } from '../../services/notificationService';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';
import { ROUTES } from '../../../../routing/routes';
import styles from './NotificationsScreen.module.css';

export function NotificationsScreen() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsData, notificationsData] = await Promise.all([
          getUpcomingEvents(),
          getNotifications()
        ]);
        setEvents(eventsData);
        setNotifications(notificationsData);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification.id);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
    
    // NAMED SCOPE REDUCTION: Tap navigation without inline actions.
    if (notification.type === 'follow' && notification.actor_id) {
      navigate(`${ROUTES.PROFILE}/${notification.actor_id}`);
    } else if (notification.post_id) {
      navigate(`${ROUTES.HOME}#post-${notification.post_id}`);
    }
  };

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Soon';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return 'favorite';
      case 'comment': return 'chat_bubble';
      case 'follow': return 'person_add';
      default: return 'notifications';
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor?.name || 'Someone';
    switch (notification.type) {
      case 'like': return <><span className={styles.messageBold}>{actorName}</span> liked your post.</>;
      case 'comment': return <><span className={styles.messageBold}>{actorName}</span> commented on your post.</>;
      case 'follow': return <><span className={styles.messageBold}>{actorName}</span> started following you.</>;
      default: return <><span className={styles.messageBold}>{actorName}</span> interacted with you.</>;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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

          {/* Section: Unified Recent Activity */}
          <section className={styles.section} aria-labelledby="activity-title">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '16px' }}>
              <h2 id="activity-title" className={styles.sectionTitle}>Recent Activity</h2>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead} 
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary-500)', cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className={styles.sectionCard}>
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={styles.notificationItem}
                    onClick={() => handleNotificationClick(notification)}
                    style={{ cursor: 'pointer', backgroundColor: notification.read ? 'transparent' : 'var(--color-primary-50)' }}
                  >
                    <div className={styles.iconWrapper} style={{ backgroundColor: 'var(--color-neutral-100)' }}>
                      {notification.actor?.avatar_url ? (
                        <img 
                          src={notification.actor.avatar_url} 
                          alt="Avatar" 
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <span className="material-symbols-outlined" style={{ color: 'var(--color-neutral-600)' }}>
                          {getNotificationIcon(notification.type)}
                        </span>
                      )}
                    </div>
                    <div className={styles.contentWrapper}>
                      <div className={styles.headerRow}>
                        <p className={styles.message}>
                          {getNotificationText(notification)}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={styles.timestamp}>{formatDate(notification.created_at)}</span>
                          {!notification.read && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-500)' }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <span className={`material-symbols-outlined ${styles.emptyStateIcon}`}>notifications_off</span>
                  <h3 className={styles.emptyStateTitle}>All Caught Up</h3>
                  <p className={styles.emptyStateDesc}>You have no new notifications.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
