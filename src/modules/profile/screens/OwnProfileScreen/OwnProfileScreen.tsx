import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OwnProfileScreen.module.css';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { getOwnProfile, ProfileData } from '../../services/profileService';
import { ROUTES } from '../../../../routing/routes';
import { ProfileSectionHeader } from '../../components/ProfileSectionHeader/ProfileSectionHeader';
import { UserRole } from '../../../../core/auth/types';

export function OwnProfileScreen() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    getOwnProfile(user.id)
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load profile. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className={styles.centerContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centerContainer}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-error)' }}>error</span>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.secondaryButton} onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.centerContainer}>
        <p className={styles.errorText}>Profile not found.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header / Meta */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.brandTitle}>SportIQ</h1>
          <div className={styles.headerIcons}>
            <span className="material-symbols-outlined">search</span>
            <span className="material-symbols-outlined">verified</span>
          </div>
        </div>

        <div className={styles.profileMeta}>
          <div className={styles.avatarContainer}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <span className="material-symbols-outlined">person</span>
              </div>
            )}
          </div>
          
          <h2 className={styles.profileName}>{profile.full_name || 'Not set'}</h2>
          
          <p className={styles.profileRoleTitle}>
            {profile.primary_position ? `${profile.primary_position} • ` : ''}
            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
          </p>

          {profile.location && (
            <p className={styles.profileLocation}>
              <span className="material-symbols-outlined">location_on</span>
              {profile.location}
            </p>
          )}

          <div className={styles.actionButtons}>
            <button className={styles.primaryButton} onClick={() => navigate(ROUTES.EDIT_PROFILE)}>
              Edit Profile
            </button>
            <button className={styles.secondaryButton}>
              Share
            </button>
            <button 
              className={styles.secondaryButton} 
              style={{ color: 'var(--color-error-500)', borderColor: 'var(--color-error-500)' }}
              onClick={async () => {
                await signOut();
                navigate(ROUTES.LOGIN);
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className={styles.bioContainer}>
          <p className={styles.bioText}>
            {profile.bio || "No bio provided."}
          </p>
        </div>
      </header>

      {/* Tabs placeholder */}
      <div className={styles.tabsContainer}>
        <div className={`${styles.tabItem} ${styles.tabActive}`}>Overview</div>
        <div className={styles.tabItem}>Performance</div>
        <div className={styles.tabItem}>Media</div>
      </div>

      <div className={styles.contentSection}>
        
        {/* Physical Profile (Real Data) */}
        {profile.role === UserRole.Athlete && (
          <section className={styles.section}>
            <ProfileSectionHeader title="Physical Profile" />
            <div className={styles.statsCardGrid}>
              
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Height</span>
                <span className={styles.statValue}>
                  {profile.height_cm ? `${profile.height_cm} cm` : 'Not set'}
                </span>
              </div>
              
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Weight</span>
                <span className={styles.statValue}>
                  {profile.weight_kg ? `${profile.weight_kg} kg` : 'Not set'}
                </span>
              </div>

              <div className={styles.statBox}>
                <span className={styles.statLabel}>Dominant Foot</span>
                <span className={styles.statValue} style={{ textTransform: 'capitalize' }}>
                  {profile.dominant_foot || 'Not set'}
                </span>
              </div>

            </div>
          </section>
        )}

        {/* Statistics link for Athlete, empty states for others */}
        {profile.role === UserRole.Athlete ? (
          <section className={styles.section}>
            <button 
              className={styles.primaryButton}
              style={{ width: '100%', padding: 'var(--spacing-4)', marginTop: 'var(--spacing-4)' }}
              onClick={() => navigate(ROUTES.STATISTICS)}
            >
              View My Performance Stats
            </button>
          </section>
        ) : (
          <>
            <section className={styles.section}>
              <ProfileSectionHeader title="Performance Stats" />
              <div className={styles.emptyStateContainer}>
                <span className="material-symbols-outlined">analytics</span>
                <p className={styles.emptyStateText}>No performance data available</p>
              </div>
            </section>

            <section className={styles.section}>
              <ProfileSectionHeader title="Recent Matches" />
              <div className={styles.emptyStateContainer}>
                <span className="material-symbols-outlined">sports_soccer</span>
                <p className={styles.emptyStateText}>No matches recorded yet</p>
              </div>
            </section>
          </>
        )}

        {/* Achievements Section - Restored for all profiles */}
        <section className={styles.section}>
          <ProfileSectionHeader 
            title="Achievements" 
            actionText="View Gallery"
            onActionClick={() => navigate(ROUTES.ACHIEVEMENTS)}
          />
          <div className={styles.emptyStateContainer} style={{ cursor: 'pointer' }} onClick={() => navigate(ROUTES.ACHIEVEMENTS)}>
            <span className="material-symbols-outlined">workspace_premium</span>
            <p className={styles.emptyStateText}>View Achievement Gallery</p>
          </div>
        </section>
        
      </div>
    </div>
  );
}
