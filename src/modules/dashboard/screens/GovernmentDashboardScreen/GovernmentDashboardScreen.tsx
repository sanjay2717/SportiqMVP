import styles from './GovernmentDashboardScreen.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GOVERNMENT_MOCK_DATA } from '../../constants/mockData';
import { getGovernmentAnalytics, DashboardAnalytics } from '../../services/analyticsService';
import { ROUTES } from '../../../../routing/routes';

export function GovernmentDashboardScreen() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGovernmentAnalytics()
      .then(setAnalytics)
      .catch((err) => {
        console.error('Failed to load government analytics:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const totalAthletesDisplay = isLoading
    ? <div className="skeleton" style={{width: 80, height: 28, display: 'inline-block'}} />
    : (analytics?.totalAthletes.toLocaleString() ?? '0');
  const totalCoachesDisplay = isLoading
    ? <div className="skeleton" style={{width: 50, height: 20, display: 'inline-block'}} />
    : (analytics?.totalCoaches.toLocaleString() ?? '0');
  const totalOrganisersDisplay = isLoading
    ? <div className="skeleton" style={{width: 50, height: 20, display: 'inline-block'}} />
    : (analytics?.totalOrganisers.toLocaleString() ?? '0');
  const totalEventsDisplay = isLoading
    ? <div className="skeleton" style={{width: 50, height: 20, display: 'inline-block'}} />
    : (analytics?.totalEvents.toLocaleString() ?? '0');

  const displayDistricts =
    analytics?.athletesByDistrict && analytics.athletesByDistrict.length > 0
      ? analytics.athletesByDistrict.slice(0, 4)
      : [];

  const displaySports =
    analytics?.athletesBySport && analytics.athletesBySport.length > 0
      ? analytics.athletesBySport.slice(0, 3)
      : [];

  const maxDistrictCount =
    displayDistricts.length > 0
      ? Math.max(...displayDistricts.map((d) => d.count), 1)
      : 1;

  const maxSportCount =
    displaySports.length > 0
      ? Math.max(
          ...displaySports.map((s) =>
            typeof s.count === 'number' ? s.count : 450000
          ),
          1
        )
      : 1;

  const formatSportCount = (count: number | string): string => {
    if (typeof count === 'number') {
      return `${count.toLocaleString()} Athletes`;
    }
    return count;
  };

  const getSportWidthPercent = (count: number | string, idx: number): number => {
    if (typeof count === 'number') {
      return Math.max(Math.min((count / maxSportCount) * 100, 100), 15);
    }
    if (idx === 0) return 85;
    if (idx === 1) return 60;
    return 40;
  };

  const getSportBarClassName = (idx: number): string => {
    if (idx === 0) return styles.sportBarPrimary ?? '';
    if (idx === 1) return styles.sportBarSecondary ?? '';
    return styles.sportBarTertiary ?? '';
  };

  const getTimelineDotClassName = (idx: number): string => {
    if (idx === 0) return styles.timelineDotPrimary ?? '';
    if (idx === 1) return styles.timelineDotSecondary ?? '';
    return styles.timelineDotNeutral ?? '';
  };

  return (
    <div className={styles.container}>
      {/* Hero Analytics Bento Grid */}
      <section className={styles.statsGrid}>
        {/* Primary Stat Card */}
        <div className={styles.statCardPrimary}>
          <span className={`material-symbols-outlined ${styles.watermarkIcon}`}>
            groups
          </span>
          <div>
            <div className={styles.statLabelPrimary}>
              Total Registered Athletes
            </div>
            <div className={styles.statValueRow}>
              <span className={styles.statValuePrimary}>
                {totalAthletesDisplay}
              </span>
              <span className={styles.trendBadge}>
                <span className="material-symbols-outlined">trending_up</span>
                +5%
              </span>
            </div>
          </div>
          <button
            className={styles.deepDiveBtn}
            onClick={() => navigate(ROUTES.ANALYTICS)}
            type="button"
          >
            View Deep Dive
          </button>
        </div>

        {/* Secondary Stats Column (Right) */}
        <div className={styles.statsColRight}>
          <div className={styles.statCardSecondary}>
            <div>
              <p className={styles.statLabelSmall}>Verified Coaches</p>
              <p className={styles.statValueSmall}>{totalCoachesDisplay}</p>
            </div>
            <div className={styles.statIconSecondary}>
              <span className="material-symbols-outlined">sports</span>
            </div>
          </div>

          <div className={styles.statCardTertiary}>
            <div>
              <p className={styles.statLabelSmall}>Organizations</p>
              <p className={styles.statValueSmall}>{totalOrganisersDisplay}</p>
            </div>
            <div className={styles.statIconTertiary}>
              <span className="material-symbols-outlined">corporate_fare</span>
            </div>
          </div>
        </div>

        {/* Full-Width Stat Card (Bottom) */}
        <div className={styles.statCardFull}>
          <div>
            <p className={styles.statLabelSmall}>Active Events</p>
            <p className={styles.statValueSmall}>{totalEventsDisplay}</p>
          </div>
          <div className={styles.statIconPrimary}>
            <span className="material-symbols-outlined">event</span>
          </div>
        </div>
      </section>

      {/* Quick Actions Glassmorphism Strip */}
      <section className={styles.quickActionsStrip}>
        <button
          className={styles.quickActionBtn}
          onClick={() => navigate(ROUTES.ATHLETE_DIRECTORY)}
          type="button"
        >
          <span className={`material-symbols-outlined ${styles.actionIconSecondary}`}>
            search
          </span>
          Athletes
        </button>
        <button
          className={styles.quickActionBtn}
          onClick={() => navigate(ROUTES.ORGANIZATION_DIRECTORY)}
          type="button"
        >
          <span className={`material-symbols-outlined ${styles.actionIconSecondary}`}>
            search
          </span>
          Organizations
        </button>
        <button
          className={styles.quickActionBtnPrimary}
          onClick={() => navigate(ROUTES.REPORTS)}
          type="button"
        >
          <span className="material-symbols-outlined">description</span>
          Report
        </button>
        <button
          className={styles.quickActionBtn}
          onClick={() => navigate(ROUTES.LEADERBOARDS)}
          type="button"
        >
          <span className={`material-symbols-outlined ${styles.actionIconTertiary}`}>
            emoji_events
          </span>
          Leaderboards
        </button>
      </section>

      {/* Analytics Preview Bento Grid */}
      <section className={styles.analyticsGrid}>
        {/* Left Card: Registration Trend (District Chart) */}
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardHeader}>
            <h3 className={styles.analyticsCardTitle}>Registration Trend</h3>
            <button
              className={styles.analyticsActionBtn}
              onClick={() => navigate(ROUTES.ANALYTICS)}
              type="button"
            >
              View Full
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <div className={styles.chartBars}>
            {isLoading ? (
              // SKELETON STATE
              [1, 2, 3, 4].map((key) => (
                <div key={key} className={styles.chartBarCol}>
                  <div className={`skeleton ${styles.chartBar}`} style={{ height: `${20 + Math.random() * 60}%`, background: 'var(--color-neutral-200)' }} />
                  <div className="skeleton" style={{ width: '40px', height: '12px', marginTop: '8px' }} />
                </div>
              ))
            ) : displayDistricts.length === 0 ? (
              <div className={styles.noDataMsg}>No district data available</div>
            ) : (
              displayDistricts.map((district, idx) => {
                const heightPercent = Math.max(
                  (district.count / maxDistrictCount) * 100,
                  10
                );
                return (
                  <div key={`${district.name}-${idx}`} className={styles.chartBarCol}>
                    <div
                      className={styles.chartBar}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className={styles.chartXLabel}>{district.name}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Card: Top Sports */}
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardHeader}>
            <h3 className={styles.analyticsCardTitle}>Top Sports</h3>
            <button
              className={styles.analyticsActionBtn}
              onClick={() => navigate(ROUTES.ANALYTICS)}
              type="button"
            >
              View All
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <div className={styles.sportsList}>
            {isLoading ? (
              // SKELETON STATE
              [1, 2, 3].map((key) => (
                <div key={key} className={styles.sportRow}>
                  <div className={styles.sportRowHeader}>
                    <div className="skeleton" style={{ width: '80px', height: '16px' }} />
                    <div className="skeleton" style={{ width: '40px', height: '16px' }} />
                  </div>
                  <div className={styles.sportBarTrack}>
                    <div className="skeleton" style={{ width: `${30 + Math.random() * 50}%`, height: '8px' }} />
                  </div>
                </div>
              ))
            ) : displaySports.length === 0 ? (
              <div className={styles.noDataMsg}>No sports data available</div>
            ) : (
              displaySports.map((sport, idx) => {
                const widthPercent = getSportWidthPercent(sport.count, idx);
                return (
                  <div key={`${sport.name}-${idx}`} className={styles.sportRow}>
                    <div className={styles.sportRowHeader}>
                      <span className={styles.sportName}>{sport.name}</span>
                      <span className={styles.sportCount}>
                        {formatSportCount(sport.count)}
                      </span>
                    </div>
                    <div className={styles.sportBarTrack}>
                      <div
                        className={`${styles.sportBarFill} ${getSportBarClassName(idx)}`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Recent Activity Timeline Card */}
      <section className={styles.activityCard}>
        <h3 className={styles.activityTitle}>Recent Activity</h3>
        <div className={styles.timelineList}>
          <div className={styles.noDataMsg}>Activity tracking coming soon</div>
        </div>
      </section>
    </div>
  );
}
