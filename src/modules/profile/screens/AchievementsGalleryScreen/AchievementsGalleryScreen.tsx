import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { ROUTES } from '../../../../routing/routes';
import { getAchievements, Achievement } from '../../services/achievementService';
import styles from './AchievementsGalleryScreen.module.css';

export function AchievementsGalleryScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting and Filtering state
  const [sortBy, setSortBy] = useState<'dateDesc' | 'dateAsc'>('dateDesc');
  const [filterVerified, setFilterVerified] = useState(false);

  const loadAchievements = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAchievements(user.id);
      setAchievements(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load achievements.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const toggleSort = () => {
    setSortBy(prev => prev === 'dateDesc' ? 'dateAsc' : 'dateDesc');
  };

  const toggleFilter = () => {
    setFilterVerified(prev => !prev);
  };

  // Client-side filtering & sorting
  const processedAchievements = achievements
    .filter(ach => (filterVerified ? ach.is_verified : true))
    .sort((a, b) => {
      const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
      const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
      return sortBy === 'dateDesc' ? dateB - dateA : dateA - dateB;
    });

  const renderCard = (ach: Achievement) => {
    // 1. Featured Highlight: Image + Verified
    if (ach.image_url && ach.is_verified) {
      return (
        <div 
          key={ach.id} 
          className={`${styles.glassCard} ${styles.featuredCard}`}
          onClick={() => navigate(`/achievements/${ach.id}/edit`)}
        >
          <div className={styles.bgImageContainer}>
            <img src={ach.image_url} alt="" className={styles.bgImage} />
            <div className={styles.bgGradient}></div>
          </div>
          <div className={`${styles.flexBetween} ${styles.cardContentZ10}`}>
            <div className={styles.badgeIcon}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary-500)', fontVariationSettings: "'FILL' 1" }}>
                {ach.icon_name || 'workspace_premium'}
              </span>
            </div>
            <span className={styles.verifiedChip}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span> 
              Verified
            </span>
          </div>
          <div className={styles.cardContentZ10} style={{ marginTop: 'auto' }}>
            <span className={styles.issuerLabel}>{ach.issuer}</span>
            <h2 className={styles.cardTitle}>{ach.title}</h2>
            <p className={styles.cardDesc}>{ach.description}</p>
            {ach.start_date && (
              <p className={styles.cardDate}>Issued: {ach.start_date}</p>
            )}
          </div>
        </div>
      );
    }

    // 2. Image Focus: Image (not verified)
    if (ach.image_url && !ach.is_verified) {
      return (
        <div 
          key={ach.id} 
          className={`${styles.glassCard} ${styles.imageFocusCard}`}
          onClick={() => navigate(`/achievements/${ach.id}/edit`)}
        >
          <img src={ach.image_url} alt="" className={styles.imageFocusBg} />
          <div className={styles.imageFocusGradient}></div>
          <div className={styles.imageFocusContent}>
            <div className={styles.imageFocusIcon}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-text-inverse)', fontVariationSettings: "'FILL' 1" }}>
                {ach.icon_name || 'star'}
              </span>
            </div>
            <span className={`${styles.issuerLabel} ${styles.imageFocusIssuer}`}>{ach.issuer}</span>
            <h3 className={styles.imageFocusTitle}>{ach.title}</h3>
            {ach.metric_value && (
              <div className={styles.metricPillRow}>
                <span className={styles.metricPill}>{ach.metric_value}</span>
                <span className={styles.metricLabel}>Metric</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3. Metric Focus: Metric value provided (no image)
    if (ach.metric_value && !ach.image_url) {
      return (
        <div 
          key={ach.id} 
          className={`${styles.glassCard} ${styles.metricFocusCard}`}
          onClick={() => navigate(`/achievements/${ach.id}/edit`)}
        >
          <div className={styles.flexBetween}>
            <span className={styles.issuerLabel}>{ach.issuer || 'Metric'}</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-neutral-600)' }}>
              {ach.icon_name || 'timeline'}
            </span>
          </div>
          <div style={{ margin: 'var(--spacing-4) 0' }}>
            <div className={styles.metricValue}>{ach.metric_value}</div>
            <h3 className={styles.metricFocusTitle}>{ach.title}</h3>
          </div>
          <div>
            <div className={styles.progressBarTrack}>
              <div className={styles.progressBarFill} style={{ width: '100%' }}></div>
            </div>
            <p className={styles.metricSubtext}>Recorded Metric</p>
          </div>
        </div>
      );
    }

    // 4. Standard Card: Everything else
    return (
      <div 
        key={ach.id} 
        className={`${styles.glassCard} ${styles.standardCard}`}
        onClick={() => navigate(`/achievements/${ach.id}/edit`)}
      >
        <div className={styles.flexBetween} style={{ marginBottom: 'auto' }}>
          <div className={styles.standardIcon}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary-500)', fontVariationSettings: "'FILL' 1" }}>
              {ach.icon_name || 'emoji_events'}
            </span>
          </div>
        </div>
        <div style={{ marginTop: 'var(--spacing-4)' }}>
          <span className={styles.issuerLabel}>{ach.issuer}</span>
          <h3 className={styles.standardTitle}>{ach.title}</h3>
          <p className={styles.cardDesc}>{ach.description}</p>
        </div>
        <div className={styles.cardFooter}>
          <span className={styles.cardDate}>{ach.start_date || 'No Date'}</span>
          {ach.is_verified && (
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary-500)', fontSize: '18px' }}>verified</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <div className={styles.headerSection}>
          <div>
            <h1 className={styles.title}>Milestones & Achievements</h1>
            <p className={styles.subtitle}>A curated gallery of verified professional accolades, certifications, and athletic milestones.</p>
          </div>
          <div className={styles.controlsRow}>
            <button className={styles.controlButton} onClick={toggleFilter}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {filterVerified ? 'check_box' : 'check_box_outline_blank'}
              </span>
              Verified Only
            </button>
            <button className={styles.controlButton} onClick={toggleSort}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {sortBy === 'dateDesc' ? 'arrow_downward' : 'arrow_upward'}
              </span>
              Date
            </button>
            <button 
              className={`${styles.controlButton} ${styles.addBtn}`}
              onClick={() => navigate(ROUTES.ACHIEVEMENTS_FORM)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Add
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorAlert} style={{ marginBottom: 'var(--spacing-6)' }}>
            <span className="material-symbols-outlined">error</span>
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={loadAchievements} style={{ padding: 'var(--spacing-1) var(--spacing-3)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-error)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family-label-md)', fontWeight: 'bold' }}>
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className={styles.loadingOverlay}>
            <span className={`material-symbols-outlined ${styles.spinner}`}>sync</span>
            <p>Loading achievements...</p>
          </div>
        ) : (
          processedAchievements.length > 0 ? (
            <div className={styles.grid}>
              {processedAchievements.map(renderCard)}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={`material-symbols-outlined ${styles.emptyIcon}`}>emoji_events</span>
              <h2 className={styles.emptyTitle}>No Achievements Found</h2>
              <p className={styles.emptyDesc}>You haven't added any milestones or achievements yet. Add your first one to showcase your progress.</p>
              <button 
                className={styles.addBtnLarge}
                onClick={() => navigate(ROUTES.ACHIEVEMENTS_FORM)}
              >
                <span className="material-symbols-outlined">add_circle</span>
                Add Achievement
              </button>
            </div>
          )
        )}
      </main>
    </div>
  );
}
