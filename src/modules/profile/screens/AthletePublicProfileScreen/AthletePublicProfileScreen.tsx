import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../../core/database/supabaseClient';
import { REGION_LIST } from '../../../../shared/constants/regions';
import { AppLayout } from '../../../../shared/layouts/AppLayout';
import styles from './AthletePublicProfileScreen.module.css';

interface AthleteProfile {
  id: string;
  full_name: string;
  role: string;
  selected_sports: string[];
  age: number | null;
  location: string | null;
  primary_position: string | null;
  bio: string | null;
}

function formatSportName(sportId: string | undefined): string {
  if (!sportId) return '';
  return sportId.charAt(0).toUpperCase() + sportId.slice(1);
}

const REGION_MAP: Record<string, string> = REGION_LIST.reduce((acc, region) => {
  acc[region.id] = region.name;
  return acc;
}, {} as Record<string, string>);

export function AthletePublicProfileScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Posts');

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, selected_sports, age, location, primary_position, bio')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setProfile(null);
          } else {
            throw error;
          }
        } else {
          setProfile(data as AthleteProfile);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className={styles.errorState}>
          <span className={`material-symbols-outlined ${styles.errorIcon}`}>error</span>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>Retry</button>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className={styles.notFoundState}>
          <span className={`material-symbols-outlined ${styles.notFoundIcon}`}>person_off</span>
          <p className={styles.notFoundText}>Athlete not found or not visible.</p>
          <button className={styles.backToSearchButton} onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </AppLayout>
    );
  }

  const sportDisplay = (profile.selected_sports && profile.selected_sports.length > 0) 
    ? formatSportName(profile.selected_sports[0]) 
    : 'Athlete';
    
  const locationDisplay = profile.location ? (REGION_MAP[profile.location] || profile.location) : 'Location unknown';
  
  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'A';

  return (
    <AppLayout>
      <main className={styles.container}>
        {/* 1. Hero / Header Section */}
        <section className={styles.headerImageContainer}>
          <img 
            className={styles.headerImage} 
            src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1120&auto=format&fit=crop" 
            alt="Cover" 
          />
          <div className={styles.headerGradient}></div>
          
          <nav className={styles.topNav}>
            <button className={styles.navIcon} onClick={() => navigate(-1)} aria-label="Go back">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button className={styles.navIcon} aria-label="More options">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </nav>
          
          <div className={styles.profileInfoOverlay}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>{initials}</div>
            </div>
            
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{profile.full_name || 'Unnamed Athlete'}</h1>
              <span className={`material-symbols-outlined ${styles.verifiedIcon}`} style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            
            <p className={styles.subtitle}>
              {profile.primary_position ? `${sportDisplay} • ${profile.primary_position}` : sportDisplay}
            </p>
            
            <div className={styles.tagsRow}>
              <span className={styles.tag}>
                <span className={`material-symbols-outlined ${styles.tagIcon}`}>location_on</span>
                {locationDisplay}
              </span>
              <span className={styles.tag}>
                <span className={`material-symbols-outlined ${styles.tagIcon}`}>sports</span>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </span>
            </div>
          </div>
        </section>

        {/* 2. Actions (Visual Only) */}
        <section className={styles.actionsSection}>
          <button type="button" className={styles.primaryActionBtn}>
            <span className="material-symbols-outlined">person_add</span>
            Follow
          </button>
          <button type="button" className={styles.secondaryActionBtn}>
            <span className="material-symbols-outlined">chat</span>
            Message
          </button>
        </section>

        <div className={styles.contentGrid}>
          {/* LEFT COLUMN */}
          <div className={styles.leftColumn} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            
            {/* About Me */}
            {profile.bio && (
              <section className={styles.section} aria-labelledby="about-title">
                <div className={styles.sectionHeader}>
                  <h2 id="about-title" className={styles.sectionTitle}>About Me</h2>
                </div>
                <div className={styles.card}>
                  <p className={styles.bioText}>{profile.bio}</p>
                </div>
              </section>
            )}

            {/* Impact Score */}
            <section className={styles.section} aria-labelledby="impact-title">
              <div className={styles.sectionHeader}>
                <h2 id="impact-title" className={styles.sectionTitle}>Impact Score</h2>
              </div>
              <div className={`${styles.card} ${styles.impactScoreCard}`}>
                <div className={styles.impactInfo}>
                  <span className={styles.impactLabel}>Global Ranking</span>
                  <div className={styles.impactValueRow}>
                    <span className={styles.impactValue}>--</span>
                  </div>
                  <span className={styles.impactFollowers}>Not yet calculated</span>
                </div>
                
                {/* Empty State Donut */}
                <div className={styles.donutWrapper}>
                  <svg width="96" height="96" viewBox="0 0 96 96">
                    <circle className={styles.donutCircleBg} cx="48" cy="48" r="40" />
                  </svg>
                  <span className={styles.donutScore} style={{ color: 'var(--color-neutral-300)' }}>?</span>
                </div>
              </div>
            </section>

            {/* Key Achievements */}
            <section className={styles.section} aria-labelledby="achievements-title">
              <div className={styles.sectionHeader}>
                <h2 id="achievements-title" className={styles.sectionTitle}>Key Achievements</h2>
                <button className={styles.seeAllLink} style={{ background: 'none', border: 'none' }}>See All</button>
              </div>
              
              <div className={styles.emptyState}>
                <span className={`material-symbols-outlined ${styles.emptyStateIcon}`}>emoji_events</span>
                <h3 className={styles.emptyStateTitle}>No Achievements Yet</h3>
                <p className={styles.emptyStateDesc}>This athlete hasn't published any achievements to their profile.</p>
              </div>
            </section>
            
            {/* Activity Feed */}
            <section className={styles.section} aria-labelledby="activity-title">
              <div className={styles.sectionHeader}>
                <h2 id="activity-title" className={styles.sectionTitle}>Activity Feed</h2>
              </div>
              
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tab} ${activeTab === 'Posts' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('Posts')}
                  style={{ background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
                >
                  Posts
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'Articles' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('Articles')}
                  style={{ background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
                >
                  Articles
                </button>
              </div>
              
              <div className={styles.emptyState}>
                <span className={`material-symbols-outlined ${styles.emptyStateIcon}`}>article</span>
                <h3 className={styles.emptyStateTitle}>No Recent Activity</h3>
                <p className={styles.emptyStateDesc}>There are no {activeTab.toLowerCase()} to display at this time.</p>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightColumn} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            
            {/* Current Focus */}
            <section className={styles.section} aria-labelledby="focus-title">
              <div className={styles.sectionHeader}>
                <h2 id="focus-title" className={styles.sectionTitle}>Current Focus</h2>
              </div>
              
              <div className={styles.emptyState}>
                <span className={`material-symbols-outlined ${styles.emptyStateIcon}`}>track_changes</span>
                <h3 className={styles.emptyStateTitle}>Focus Not Set</h3>
                <p className={styles.emptyStateDesc}>Current training phase is not publicly available.</p>
              </div>
            </section>

          </div>
        </div>
      </main>
    </AppLayout>
  );
}
