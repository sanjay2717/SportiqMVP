import styles from './CoachDashboardScreen.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { COACH_MOCK_DATA } from '../../constants/mockData';
import { getTotalAthletesCount } from '../../services/athleteSearchService';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';

export function CoachDashboardScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
          <h1 className={styles.greeting}>Morning, {user?.name || 'Coach'}</h1>
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

          let displayValue: string | number = 0;
          if (stat.id === '1') {
            displayValue = totalAthletes ?? 0;
          } else {
            // STATIC DEMO DATA — not wired to real metrics, no metrics pipeline exists yet.
            displayValue = '-';
          }
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
            <div className={styles.scheduleCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-10) var(--spacing-6)', textAlign: 'center', backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)' }}>
              {/* STATIC DEMO DATA — not wired to real schedule, no schedule pipeline exists yet. */}
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-neutral-400)', marginBottom: 'var(--spacing-4)' }}>calendar_today</span>
              <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-body-lg)' }}>Schedule coming soon</p>
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
            <div className={styles.performanceCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-10) var(--spacing-6)', textAlign: 'center', backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)', minHeight: '300px' }}>
              {/* STATIC DEMO DATA — not wired to real performance, no performance pipeline exists yet. */}
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-neutral-400)', marginBottom: 'var(--spacing-4)' }}>insights</span>
              <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-body-lg)' }}>Performance analytics coming soon</p>
            </div>
          </section>

          {/* Recent Activity */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>{COACH_MOCK_DATA.activityTitle}</h3>
            </div>
            <div className={styles.activityCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-10) var(--spacing-6)', textAlign: 'center', backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)' }}>
              {/* STATIC DEMO DATA — not wired to real activity, no activity pipeline exists yet. */}
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-neutral-400)', marginBottom: 'var(--spacing-4)' }}>history</span>
              <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-body-lg)' }}>Activity tracking coming soon</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
