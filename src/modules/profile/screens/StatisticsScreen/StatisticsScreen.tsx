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
          <span className={styles.impactValue}>{ATHLETE_MOCK_DATA.impactScore}</span>
        </div>
        <div className={styles.rankGrid}>
          <div className={styles.rankItem}>
            <span className={styles.rankLabel}>District Rank</span>
            <span className={styles.rankValue}>#{ATHLETE_MOCK_DATA.districtRank}</span>
          </div>
          <div className={styles.rankItem}>
            <span className={styles.rankLabel}>State Rank</span>
            <span className={styles.rankValue}>#{ATHLETE_MOCK_DATA.stateRank}</span>
          </div>
          <div className={styles.rankItem}>
            <span className={styles.rankLabel}>Consistency</span>
            <span className={styles.rankValue}>{ATHLETE_MOCK_DATA.consistency}</span>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <ProfileSectionHeader title="Key Performance Indicators" />
        <div className={styles.kpiGrid}>
          {ATHLETE_MOCK_DATA.stats.map(stat => (
            <DashboardStatCard key={stat.id} data={stat} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <ProfileSectionHeader title="Upcoming Training" />
        <div className={styles.trainingCard}>
          <div className={styles.trainingHeader}>
            <h3 className={styles.trainingTitle}>{ATHLETE_MOCK_DATA.upcomingTraining.title}</h3>
            <span className={styles.trainingCoach}>Coach: {ATHLETE_MOCK_DATA.upcomingTraining.coach}</span>
          </div>
          <div className={styles.trainingDetails}>
            <div className={styles.trainingDetail}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
              <span>{ATHLETE_MOCK_DATA.upcomingTraining.time}</span>
            </div>
            <div className={styles.trainingDetail}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
              <span>{ATHLETE_MOCK_DATA.upcomingTraining.location}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <ProfileSectionHeader 
          title="Recent Achievements" 
          actionText="View All" 
          onActionClick={() => navigate(ROUTES.ACHIEVEMENTS)} 
        />
        <div className={styles.achievementsList}>
          {ATHLETE_MOCK_DATA.achievements.map(ach => (
            <div key={ach.id} className={styles.achievementItem}>
              <div className={styles.achievementIcon}>
                <span className="material-symbols-outlined">{ach.iconName}</span>
              </div>
              <div className={styles.achievementContent}>
                <span className={styles.achievementTitle}>{ach.title}</span>
                <span className={styles.achievementDate}>{ach.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
