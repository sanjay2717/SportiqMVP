import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../../core/database/supabaseClient';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';

import styles from './OrganizationDetailScreen.module.css';

interface OrganizationProfile {
  id: string;
  full_name: string;
  role: string;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  selected_sports?: string[];
}

// Stitch fidelity mock fallback constants matching d880f0c2759f445bae28722fc55f5fec ("Organization Profile")
const STITCH_ORG_PROFILE_DATA = {
  typeBadge: 'Premier Academy',
  stats: [
    { id: '1', label: 'Athletes', value: '1.2k' },
    { id: '2', label: 'Teams', value: '42' },
    { id: '3', label: 'Coaches', value: '15' },
  ],
  defaultBio:
    'Dedicated to developing the next generation of elite athletic talent. Premier Academy provides world-class coaching, state-of-the-art facilities, and comprehensive sports science support to athletes across multiple disciplines. Our mission is to foster excellence, discipline, and sportsmanship on and off the field.',
  defaultSports: 'Football, Athletics, Swimming',
  announcements: [
    {
      id: '1',
      title: 'Summer Trials Announced',
      time: '2h ago',
      text: 'Registration for the U16 and U18 Summer Football trials is now open. All prospective athletes must submit their medical clearance forms before participating.',
      icon: 'campaign',
      hasAction: true,
      actionText: 'Read full update',
    },
    {
      id: '2',
      title: 'Regional Championship Victory',
      time: '1d ago',
      text: 'Congratulations to our Senior Athletics squad for securing first place at the Regional Championships. Incredible performances all around, especially in the relay events.',
      icon: 'emoji_events',
      hasAction: false,
    },
  ],
  upcomingEvents: [
    {
      id: '1',
      badge: 'Tomorrow',
      title: 'U18 Squad Training',
      time: '16:00 - 18:00',
      location: 'Main Pitch',
    },
    {
      id: '2',
      badge: 'Oct 15',
      title: 'Coaches Seminar',
      time: '09:00 - 12:00',
      location: 'Conference Room A',
    },
  ],
  tournaments: [
    {
      id: '1',
      title: 'National Winter Cup',
      subtitle: 'Starts Nov 1 • 12 Teams',
    },
    {
      id: '2',
      title: 'City Sprint Series',
      subtitle: 'Starts Nov 15 • Athletics',
    },
  ],
};

function formatSports(sports?: string[]): string {
  if (!sports || sports.length === 0) return STITCH_ORG_PROFILE_DATA.defaultSports;
  return sports
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(', ');
}

export function OrganizationDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrgProfile() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, location, bio, avatar_url, selected_sports')
          .eq('id', id)
          .eq('role', 'organiser')
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Not found or RLS blocked
            setProfile(null);
          } else {
            throw error;
          }
        } else {
          setProfile(data as OrganizationProfile);
        }
      } catch (err) {
        console.error('Error fetching organization profile:', err);
        setError('Failed to load organization profile.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrgProfile();
  }, [id]);

  if (isLoading) {
    return (
      <main className={styles.container}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <Skeleton width="40px" height="40px" variant="circular" />
            <Skeleton width="150px" height="24px" className={styles.pageTitle} />
          </div>
          <div className={styles.topBarRight}>
            <Skeleton width="40px" height="40px" variant="circular" />
            <Skeleton width="40px" height="40px" variant="circular" />
          </div>
        </header>

        <section className={styles.heroCard}>
          <Skeleton width="100%" height="120px" variant="rectangular" style={{ borderRadius: 0 }} />
          <div className={styles.heroContent}>
            <div className={styles.avatarWrapper}>
              <Skeleton width="80px" height="80px" variant="circular" />
            </div>
            <div className={styles.orgNameRow}>
              <Skeleton width="200px" height="32px" />
            </div>
            <div className={styles.metaRow}>
              <Skeleton width="120px" height="20px" />
              <Skeleton width="120px" height="20px" />
            </div>
            <div className={styles.statsGrid}>
               <Skeleton width="100%" height="60px" variant="rectangular" />
               <Skeleton width="100%" height="60px" variant="rectangular" />
               <Skeleton width="100%" height="60px" variant="rectangular" />
            </div>
            <div className={styles.heroActions}>
              <Skeleton width="100%" height="48px" variant="rectangular" style={{ borderRadius: '100px' }} />
              <Skeleton width="100%" height="48px" variant="rectangular" style={{ borderRadius: '100px' }} />
            </div>
          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <Skeleton width="120px" height="24px" />
          </div>
          <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
          <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
          <Skeleton width="60%" height="16px" />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <>
        <div className={styles.errorState}>
          <span className={`material-symbols-outlined ${styles.errorIcon}`}>error</span>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()} type="button">
            Retry
          </button>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <div className={styles.notFoundState}>
          <span className={`material-symbols-outlined ${styles.notFoundIcon}`}>domain_disabled</span>
          <p className={styles.notFoundText}>Organization not found or not visible.</p>
          <button className={styles.backToSearchButton} onClick={() => navigate(-1)} type="button">
            Go Back
          </button>
        </div>
      </>
    );
  }

  const bioDisplay = profile.bio || STITCH_ORG_PROFILE_DATA.defaultBio;
  const locationDisplay = profile.location || 'Location Not Specified';
  const sportsDisplay = formatSports(profile.selected_sports);

  return (
    <div className="animate-fade-in">
      <main className={styles.container}>
        {/* Top Bar Navigation */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button
              className={styles.iconButton}
              onClick={() => navigate(-1)}
              aria-label="Go back"
              type="button"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className={styles.pageTitle}>{profile.full_name || 'Organization Profile'}</h1>
          </div>
          <div className={styles.topBarRight}>
            <button className={styles.iconButton} aria-label="Notifications" type="button">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className={styles.iconButton} aria-label="Share profile" type="button">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </header>

        {/* Hero Card */}
        <section className={styles.heroCard}>
          <div className={styles.heroBanner}></div>
          <div className={styles.heroContent}>
            <div className={styles.avatarWrapper}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className={styles.avatarImg} />
              ) : (
                <span className={`material-symbols-outlined ${styles.fallbackIcon}`}>corporate_fare</span>
              )}
            </div>

            <div className={styles.orgNameRow}>
              <h2 className={styles.orgName}>{profile.full_name}</h2>
              <span
                className={`material-symbols-outlined ${styles.verifiedIcon}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className={styles.orgTypeBadge}>{STITCH_ORG_PROFILE_DATA.typeBadge}</span>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={`material-symbols-outlined ${styles.metaIcon}`}>location_on</span>
                <span>{locationDisplay}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={`material-symbols-outlined ${styles.metaIcon}`}>sports_soccer</span>
                <span>{sportsDisplay}</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className={styles.statsGrid}>
              {STITCH_ORG_PROFILE_DATA.stats.map((st) => (
                <div key={st.id} className={styles.statItem}>
                  <span className={styles.statValue}>{st.value}</span>
                  <span className={styles.statLabel}>{st.label}</span>
                </div>
              ))}
            </div>

            {/* Hero Actions */}
            <div className={styles.heroActions}>
              <button className={styles.shareBtn} type="button">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  share
                </span>
                Share
              </button>
              <button className={styles.followBtn} type="button">
                Follow
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>About</h3>
          </div>
          <p className={styles.aboutText}>{bioDisplay}</p>
        </section>

        {/* Recent Announcements Section */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Announcements</h3>
          </div>
          <div className={styles.announcementList}>
            {STITCH_ORG_PROFILE_DATA.announcements.map((item) => (
              <div key={item.id} className={styles.announcementCard}>
                <div
                  className={
                    item.id === '1' ? styles.announcementIconBox : styles.announcementIconBoxSecondary
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div className={styles.announcementContent}>
                  <div className={styles.announcementTop}>
                    <h4 className={styles.announcementTitle}>{item.title}</h4>
                    <span className={styles.announcementTime}>{item.time}</span>
                  </div>
                  <p className={styles.announcementText}>{item.text}</p>
                  {item.hasAction && (
                    <button className={styles.readMoreBtn} type="button">
                      {item.actionText}
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        arrow_forward
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Upcoming Events</h3>
            <button className={styles.viewAllBtn} type="button">
              View All
            </button>
          </div>
          <div className={styles.eventGrid}>
            {STITCH_ORG_PROFILE_DATA.upcomingEvents.map((ev) => (
              <div key={ev.id} className={styles.eventCard}>
                <div className={styles.eventBadge}>
                  <span className={styles.eventDot}></span>
                  <span>{ev.badge}</span>
                </div>
                <h4 className={styles.eventTitle}>{ev.title}</h4>
                <div className={styles.eventMeta}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    schedule
                  </span>
                  <span>{ev.time}</span>
                </div>
                <div className={styles.eventMeta}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    location_on
                  </span>
                  <span>{ev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tournaments Section */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Tournaments</h3>
          </div>
          <div className={styles.tournamentList}>
            {STITCH_ORG_PROFILE_DATA.tournaments.map((tr) => (
              <div key={tr.id} className={styles.tournamentCard}>
                <div className={styles.tournamentLeft}>
                  <div className={styles.tournamentIconBox}>
                    <span className="material-symbols-outlined">trophy</span>
                  </div>
                  <div>
                    <h4 className={styles.tournamentTitle}>{tr.title}</h4>
                    <p className={styles.tournamentSubtitle}>{tr.subtitle}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-text-secondary)' }}>
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
