import styles from './CoachDashboardScreen.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { COACH_MOCK_DATA } from '../../constants/mockData';
import { getTotalAthletesCount } from '../../services/athleteSearchService';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';

export function CoachDashboardScreen() {
  const navigate = useNavigate();
  const [totalAthletes, setTotalAthletes] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTotalAthletesCount()
      .then(setTotalAthletes)
      .catch(() => {
        // Fallback handled in UI
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      {/* Welcome Section */}
      <section className={styles.welcomeSection}>
        <div>
          <h1 className={styles.greeting}>{COACH_MOCK_DATA.greeting}</h1>
          <p className={styles.subtitle}>{COACH_MOCK_DATA.subtitle}</p>
        </div>
        <div className={styles.newSessionBtnWrap}>
          <button className={styles.newSessionBtn} type="button">
            <span className="material-symbols-outlined">add</span>
            {COACH_MOCK_DATA.newSessionText}
          </button>
        </div>
      </section>

      {/* Metrics Hero Bento Grid */}
      <section className={styles.metricsGrid}>
        {COACH_MOCK_DATA.stats.map((stat) => {
          if (stat.id === '1' && isLoading) {
            return (
              <div key={stat.id} className={styles.metricCard}>
                <div className={styles.metricTop}>
                  <Skeleton width="40px" height="40px" variant="circular" />
                </div>
                <div className={styles.metricBottom}>
                  <Skeleton width="60px" height="32px" />
                  <Skeleton width="100px" height="16px" style={{ marginTop: '8px' }} />
                </div>
              </div>
            );
          }

          const displayValue = stat.id === '1' ? (totalAthletes ?? 0) : stat.value;
          const needsFade = stat.id === '1';

          return (
            <div key={stat.id} className={styles.metricCard}>
              <div className={needsFade ? "animate-fade-in" : ""} style={{ display: 'contents' }}>
                <div className={styles.metricTop}>
                  <span className={`material-symbols-outlined ${styles.metricIcon}`}>{stat.iconName}</span>
                  {stat.badge && (
                    <span className={stat.badge.variant === 'error' ? styles.badgeError : styles.badgePrimary}>
                      {stat.badge.text}
                    </span>
                  )}
                  {stat.isPulse && <span className={styles.pulseDot} />}
                </div>
                <div className={styles.metricBottom}>
                  <h2 className={styles.metricNumber}>{displayValue}</h2>
                  <p className={styles.metricLabel}>{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 2-Column Desktop Main Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column: Quick Actions & Today's Schedule */}
        <div className={styles.leftCol}>
          {/* Quick Actions Grid */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>{COACH_MOCK_DATA.quickActionsTitle}</h3>
            </div>
            <div className={styles.quickActionsGrid}>
              {COACH_MOCK_DATA.quickActions.map((action) => {
                const iconWrapClass =
                  action.variant === 'secondary'
                    ? styles.quickActionIconWrapSecondary
                    : styles.quickActionIconWrap;
                const iconColor =
                  action.variant === 'secondary'
                    ? 'var(--color-info)'
                    : 'var(--color-primary-500)';

                return (
                  <button
                    key={action.id}
                    className={styles.quickActionBtn}
                    onClick={() => navigate(action.route)}
                    type="button"
                  >
                    <div className={iconWrapClass}>
                      <span
                        className={`material-symbols-outlined ${styles.quickActionIcon}`}
                        style={{
                          color: iconColor,
                          fontVariationSettings: action.id === '4' ? "'FILL' 1" : undefined,
                        }}
                      >
                        {action.iconName}
                      </span>
                    </div>
                    <span className={styles.quickActionLabel}>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Today's Schedule */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>{COACH_MOCK_DATA.scheduleTitle}</h3>
              <button className={styles.viewAllBtn} type="button">
                {COACH_MOCK_DATA.scheduleActionText}
              </button>
            </div>
            <div className={styles.scheduleCard}>
              <ul className={styles.scheduleList}>
                {COACH_MOCK_DATA.schedule.map((item, index) => {
                  let borderClass = styles.scheduleItemTransparent;
                  if (index === 0) borderClass = styles.scheduleItemPrimary;
                  else if (index === 1) borderClass = styles.scheduleItemSecondary;

                  return (
                    <li key={item.id} className={`${styles.scheduleItem} ${borderClass}`}>
                      <div className={styles.scheduleTimeBox}>
                        <span className={styles.scheduleTimeText}>{item.time}</span>
                      </div>
                      <div className={styles.scheduleContent}>
                        <h4 className={styles.scheduleTitle}>{item.title}</h4>
                        <div className={styles.scheduleLocation}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            {item.iconName || 'location_on'}
                          </span>
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </div>

        {/* Right Column: Academy Performance & Recent Activity */}
        <div className={styles.rightCol}>
          {/* Academy Performance Chart */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>{COACH_MOCK_DATA.performance.title}</h3>
              <button className={styles.moreBtn} aria-label="More options" type="button">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
            <div className={styles.performanceCard}>
              <div className={styles.legendRow}>
                {COACH_MOCK_DATA.performance.legend.map((item, idx) => (
                  <div key={idx} className={styles.legendItem}>
                    <div className={idx === 0 ? styles.legendDotPrimary : styles.legendDotSecondary} />
                    <span className={styles.legendLabel}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className={styles.chartArea}>
                <div className={styles.yAxis}>
                  {COACH_MOCK_DATA.performance.yAxis.map((label, idx) => (
                    <span key={idx}>{label}</span>
                  ))}
                </div>
                <div className={styles.barsContainer}>
                  {COACH_MOCK_DATA.performance.bars.map((bar, idx) => (
                    <div key={idx} className={styles.barPair}>
                      <div
                        className={styles.barSecondary}
                        style={{ height: `${bar.secondary}%` }}
                        title={bar.secondaryLabel}
                      />
                      <div
                        className={styles.barPrimary}
                        style={{ height: `${bar.primary}%` }}
                        title={bar.primaryLabel}
                      />
                    </div>
                  ))}
                </div>
                <div className={styles.xAxis}>
                  {COACH_MOCK_DATA.performance.xAxis.map((label, idx) => (
                    <span key={idx}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>{COACH_MOCK_DATA.activityTitle}</h3>
            </div>
            <div className={styles.activityCard}>
              <div className={styles.activityList}>
                {COACH_MOCK_DATA.activities.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityAvatar}>
                      {activity.initials || 'SP'}
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityTitleRow}>
                        <h4 className={styles.activityName}>{activity.title}</h4>
                        <span className={styles.activityTime}>{activity.timestamp}</span>
                      </div>
                      <p className={styles.activityDesc}>{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
