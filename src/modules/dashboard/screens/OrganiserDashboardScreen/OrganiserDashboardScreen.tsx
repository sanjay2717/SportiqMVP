import styles from './OrganiserDashboardScreen.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ORGANISER_MOCK_DATA } from '../../constants/mockData';
import { getUpcomingEvents, DashboardEvent } from '../../services/organiserService';
import { EventItem } from '../../types';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';
import { ROUTES } from '../../../../routing/routes';

export function OrganiserDashboardScreen() {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<DashboardEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUpcomingEvents()
      .then(setUpcomingEvents)
      .catch((err) => {
        console.error('Failed to load upcoming events:', err);
        setUpcomingEvents([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const formatEventTimestamp = (event: DashboardEvent | EventItem): string => {
    if ('event_date' in event && event.event_date) {
      const date = new Date(event.event_date);
      const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `${datePart} • ${timePart}`;
    }
    if ('timestamp' in event) {
      return event.timestamp;
    }
    return '';
  };



  const getStatCardClassName = (index: number) => {
    if (index === 0) {
      return `${styles.statCard} ${styles.statCardPrimary}`;
    }
    if (index === 4) {
      return `${styles.statCard} ${styles.statCardError}`;
    }
    return styles.statCard;
  };

  const getStatIconClassName = (index: number) => {
    if (index === 0) return styles.statIconPrimary;
    if (index === 1 || index === 3) return styles.statIconSecondary;
    if (index === 4) return styles.statIconError;
    return styles.statIconTertiary;
  };

  const getQuickActionIconWrapClassName = (index: number) => {
    if (index === 0 || index === 3) return styles.quickActionIconWrapPrimary;
    if (index === 1 || index === 4) return styles.quickActionIconWrapSecondary;
    return styles.quickActionIconWrapTertiary;
  };

  const getTimelineDotClassName = (index: number) => {
    if (index === 0) return styles.timelineDotPrimary;
    if (index === 1) return styles.timelineDotSecondary;
    if (index === 3) return styles.timelineDotError;
    return styles.timelineDotNeutral;
  };


  return (
    <div className={styles.container}>
      {/* Bento Stats Grid (5 Cards) */}
      <section className={styles.statsGrid}>
        {ORGANISER_MOCK_DATA.stats.map((stat, index) => (
          <div key={stat.id} className={getStatCardClassName(index)}>
            {index === 0 && <div className={styles.cardHighlightPrimary} />}
            <div className={styles.statTop}>
              <span className={index === 4 ? styles.statLabelError : styles.statLabel}>
                {stat.label}
              </span>
              <span
                className={`material-symbols-outlined ${getStatIconClassName(index)}`}
                style={index === 0 ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {stat.iconName}
              </span>
            </div>
            <div className={styles.statBottom}>
              <div className={styles.statBottomRow}>
                <span className={styles.statNumber}>{stat.value}</span>
                {stat.badge && (
                  <button className={styles.reviewBtn}>{stat.badge.text}</button>
                )}
              </div>
              {stat.trend && (
                <div className={styles.trendRow}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    arrow_upward
                  </span>
                  <span>{stat.trend.value}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Quick Actions 6-Card Grid */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>
          {ORGANISER_MOCK_DATA.quickActionsTitle}
        </h3>
        <div className={styles.quickActionsGrid}>
          {ORGANISER_MOCK_DATA.quickActions.map((action, index) => (
            <button
              key={action.id}
              className={styles.quickActionBtn}
              onClick={() => navigate(action.route)}
            >
              {action.hasBadge && <span className={styles.badgeDot} />}
              <div className={getQuickActionIconWrapClassName(index)}>
                <span
                  className={`material-symbols-outlined ${styles.quickActionIcon}`}
                  style={index === 0 ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {action.iconName}
                </span>
              </div>
              <span className={styles.quickActionLabel}>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area Grid (2 Columns on Desktop) */}
      <div className={styles.mainGrid}>
        {/* Left Column (Wider): Upcoming Events + Active Tournaments */}
        <div className={styles.leftCol}>
          {/* Upcoming Events Horizontal Scrolling Cards */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                {ORGANISER_MOCK_DATA.upcomingEventsTitle}
              </h3>
              <button className={styles.sectionActionBtn}>
                {ORGANISER_MOCK_DATA.upcomingEventsActionText}
              </button>
            </div>
            <div className={styles.eventScrollContainer}>
              {isLoading ? (
                // SKELETON STATE
                [1, 2, 3].map((key) => (
                  <div key={key} className={styles.eventCard}>
                    <div className={styles.eventTopBarSecondary} />
                    <div className={styles.eventCardBody}>
                      <div className={styles.eventHeaderRow}>
                        <Skeleton width="80px" height="16px" />
                        <div className={styles.eventStatusDotSecondary} />
                      </div>
                      <Skeleton width="140px" height="24px" style={{ margin: '8px 0' }} />
                      <Skeleton width="100px" height="16px" style={{ marginBottom: '16px' }} />
                      <div className={styles.eventCardFooter}>
                        <Skeleton width="120px" height="16px" />
                        <Skeleton width="60px" height="32px" variant="rectangular" />
                      </div>
                    </div>
                  </div>
                ))
              ) : upcomingEvents.length === 0 ? (
                // EMPTY STATE
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-10) var(--spacing-6)', textAlign: 'center', backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-neutral-400)', marginBottom: 'var(--spacing-4)' }}>event_busy</span>
                  <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-body-lg)', marginBottom: 'var(--spacing-6)' }}>No upcoming events yet.</p>
                  <button type="button" onClick={() => navigate(ROUTES.CREATE_EVENT)} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2) var(--spacing-5)', backgroundColor: 'var(--color-primary-500)', color: 'var(--color-on-primary)', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-family-label-lg)', fontWeight: 500, cursor: 'pointer', transition: 'background-color 0.2s ease' }}>
                    Create your first event
                  </button>
                </div>
              ) : (
                // LOADED DATA
                <div className="animate-fade-in" style={{ display: 'contents' }}>
                  {upcomingEvents.map((event, index) => (
                    <div key={event.id} className={styles.eventCard}>
                      <div
                        className={
                          index === 0 ? styles.eventTopBarPrimary : styles.eventTopBarSecondary
                        }
                      />
                      <div className={styles.eventCardBody}>
                        <div className={styles.eventHeaderRow}>
                          <span className={styles.eventDateBadge}>
                            {formatEventTimestamp(event)}
                          </span>
                          <div
                            className={
                              index === 0
                                ? styles.eventStatusDotPrimary
                                : styles.eventStatusDotSecondary
                            }
                          />
                        </div>
                        <h4 className={styles.eventTitle}>{event.title}</h4>
                        <div className={styles.eventLocation}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            location_on
                          </span>
                          <span>{event.location}</span>
                        </div>
                        <div className={styles.eventCardFooter}>
                          <div className={styles.eventAttendees}>
                            {'attendees' in event ? (
                              <>
                                <span className={styles.attendeeCount}>
                                  {(event as any).attendees || '0'}
                                </span>{' '}
                                {ORGANISER_MOCK_DATA.upcomingEventsRegisteredText}
                              </>
                            ) : (
                              <span>{'sport' in event ? String((event as any).sport) : ''}</span>
                            )}
                          </div>
                          <button className={styles.eventManageBtn}>
                            {ORGANISER_MOCK_DATA.upcomingEventsManageText}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Active Tournaments Preview */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                {ORGANISER_MOCK_DATA.tournamentsTitle}
              </h3>
            </div>
            <div className={styles.tournamentCard}>
              {ORGANISER_MOCK_DATA.tournaments.map((tournament) => (
                <div key={tournament.id} className={styles.tournamentItem}>
                  <div className={styles.tournamentIconWrap}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {tournament.iconName}
                    </span>
                  </div>
                  <div className={styles.tournamentContent}>
                    <h4 className={styles.tournamentTitle}>{tournament.title}</h4>
                    <div className={styles.tournamentMetaRow}>
                      <span
                        className={
                          tournament.status === 'Live'
                            ? styles.badgeLive
                            : styles.badgeScheduled
                        }
                      >
                        {tournament.status}
                      </span>
                      <span className={styles.tournamentDesc}>
                        {tournament.description}
                      </span>
                    </div>
                  </div>
                  <button className={styles.chevronBtn}>
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (Narrower): Timeline / Recent Activity */}
        <div className={styles.rightCol}>
          <section className={styles.activityCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                {ORGANISER_MOCK_DATA.activitiesTitle}
              </h3>
              <button className={styles.iconButton}>
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
            <div className={styles.timelineContainer}>
              {ORGANISER_MOCK_DATA.activities.map((activity, index) => (
                <div key={activity.id} className={styles.timelineItem}>
                  <div className={getTimelineDotClassName(index)} />
                  <span className={styles.timelineTime}>{activity.timestamp}</span>
                  <div className={styles.timelineTitle}>{activity.title}</div>
                  <p className={styles.timelineDesc}>{activity.description}</p>
                </div>
              ))}
            </div>
            <button className={styles.viewFullLogBtn}>
              {ORGANISER_MOCK_DATA.activitiesActionText}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
