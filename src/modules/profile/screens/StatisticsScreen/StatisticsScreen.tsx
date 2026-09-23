// STATIC DEMO DATA — relocated from dashboard, no real performance data pipeline exists yet.
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../routing/routes';
import styles from './StatisticsScreen.module.css';
import { ATHLETE_MOCK_DATA } from '../../../dashboard/constants/mockData';
import { ProfileSectionHeader } from '../../components/ProfileSectionHeader/ProfileSectionHeader';
import { DashboardStatCard } from '../../../dashboard/components/DashboardStatCard/DashboardStatCard';

export function StatisticsScreen() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className={styles.pageTitle}>Performance Statistics</h1>
        </div>
        <p className={styles.pageSubtitle}>Review recent metrics and training load analysis.</p>
      </header>

      <div className={styles.impactCard}>
        <div className={styles.impactHeader}>
          <span className={styles.impactTitle}>Impact Score</span>
          {/* STATIC DEMO DATA — not wired to real scores, no score pipeline exists yet. */}
          <span className={styles.impactValue}>-</span>
        </div>
        <div className={styles.rankGrid}>
          <div className={styles.rankItem}>
            <span className={styles.rankLabel}>District Rank</span>
            {/* STATIC DEMO DATA — not wired to real ranks, no rank pipeline exists yet. */}
            <span className={styles.rankValue}>-</span>
          </div>
          <div className={styles.rankItem}>
            <span className={styles.rankLabel}>State Rank</span>
            {/* STATIC DEMO DATA — not wired to real ranks, no rank pipeline exists yet. */}
            <span className={styles.rankValue}>-</span>
          </div>
          <div className={styles.rankItem}>
            <span className={styles.rankLabel}>Consistency</span>
            {/* STATIC DEMO DATA — not wired to real consistency, no consistency pipeline exists yet. */}
            <span className={styles.rankValue}>-</span>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <ProfileSectionHeader title="Key Performance Indicators" />
        <div className={styles.kpiGrid}>
          {/* STATIC DEMO DATA — not wired to real KPIs, no KPI pipeline exists yet. */}
          {ATHLETE_MOCK_DATA.stats.map(stat => (
            <DashboardStatCard key={stat.id} data={{ ...stat, value: '-' }} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <ProfileSectionHeader title="Upcoming Training" />
        <div className={styles.trainingCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-8) var(--spacing-6)', textAlign: 'center', backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)' }}>
          {/* STATIC DEMO DATA — not wired to real training, no training pipeline exists yet. */}
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-neutral-400)', marginBottom: 'var(--spacing-4)' }}>calendar_today</span>
          <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-body-lg)' }}>Training schedule coming soon</p>
        </div>
      </section>

      <section className={styles.section}>
        <ProfileSectionHeader 
          title="Recent Achievements" 
          actionText="View All" 
          onActionClick={() => navigate(ROUTES.ACHIEVEMENTS)} 
        />
        <div className={styles.achievementsList} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-8) var(--spacing-6)', textAlign: 'center', backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)' }}>
          {/* STATIC DEMO DATA — not wired to real achievements, no achievements pipeline exists yet. */}
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-neutral-400)', marginBottom: 'var(--spacing-4)' }}>emoji_events</span>
          <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-body-lg)' }}>Achievements coming soon</p>
        </div>
      </section>
    </div>
  );
}
