import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../../core/database/supabaseClient';
import { REGION_LIST } from '../../../../shared/constants/regions';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { messageService } from '../../../messages/services/messageService';
import { ROUTES } from '../../../../routing/routes';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';
import { networkService } from '../../../network/services/networkService';
import { getAchievements, Achievement } from '../../services/achievementService';
import { postService, Post } from '../../../dashboard/services/postService';
import styles from './AthletePublicProfileScreen.module.css';

interface AthleteProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string | null;
  selected_sports: string[];
  age: number | null;
  location: string | null;
  primary_position: string | null;
  bio: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  dominant_foot: string | null;
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
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMessaging, setIsMessaging] = useState(false);
  const [activeTab, setActiveTab] = useState('Posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Interactions state for posts
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const loadComments = async (postId: string) => {
    try {
      const comments = await postService.getComments(postId);
      setPostComments(prev => ({ ...prev, [postId]: comments }));
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handleToggleComments = (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
    } else {
      setActiveCommentPostId(postId);
      loadComments(postId);
    }
  };

  const submitComment = async (postId: string) => {
    if (!user || !commentText.trim()) return;
    try {
      const newComment = await postService.addComment(postId, user.id, commentText);
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
      ));
      setCommentText('');
    } catch (err) {
      console.error('Comment failed', err);
    }
  };

  const handleToggleLike = async (post: Post) => {
    if (!user) return;
    const currentlyLiked = !!post.isLiked;
    setPosts(prev => prev.map(p => 
      p.id === post.id 
        ? { ...p, isLiked: !currentlyLiked, likesCount: (p.likesCount || 0) + (currentlyLiked ? -1 : 1) }
        : p
    ));
    try {
      await postService.toggleLike(post.id, user.id, currentlyLiked);
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role, selected_sports, age, location, primary_position, bio, height_cm, weight_kg, dominant_foot')
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
          
          // Load related data
          try {
            const userAchievements = await getAchievements(id);
            setAchievements(userAchievements);
            
            const userPosts = await postService.getPostsByAuthor(id, user?.id);
            setPosts(userPosts);
          } catch (e) {
            console.error('Failed loading achievements/posts', e);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    }

    async function checkFollowStatus() {
      if (!id || !user) return;
      try {
        const following = await networkService.getConnectionStatus(user.id, id);
        setIsFollowing(following);
      } catch (err) {
        console.error('Failed to check follow status:', err);
      }
    }

    fetchProfile();
    checkFollowStatus();
  }, [id, user]);

  const handleToggleFollow = async () => {
    if (!user || !profile || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await networkService.unfollow(user.id, profile.id);
        setIsFollowing(false);
      } else {
        await networkService.follow(user.id, profile.id);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Failed to toggle follow status:', err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className={styles.container}>
        <section className={styles.headerImageContainer}>
          <Skeleton width="100%" height="100%" variant="rectangular" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
          <nav className={styles.topNav} style={{ zIndex: 2 }}>
            <Skeleton width="48px" height="48px" variant="circular" />
            <Skeleton width="48px" height="48px" variant="circular" />
          </nav>
          <div className={styles.profileInfoOverlay} style={{ zIndex: 2 }}>
            <div className={styles.avatarWrapper}>
              <Skeleton width="100%" height="100%" variant="circular" />
            </div>
            <div className={styles.nameRow}>
              <Skeleton width="200px" height="32px" />
            </div>
            <Skeleton width="150px" height="20px" style={{ marginTop: '8px' }} />
            <div className={styles.tagsRow} style={{ marginTop: '16px' }}>
              <Skeleton width="100px" height="28px" variant="rectangular" style={{ borderRadius: '100px' }} />
              <Skeleton width="100px" height="28px" variant="rectangular" style={{ borderRadius: '100px' }} />
            </div>
          </div>
        </section>

        <section className={styles.actionsSection}>
          <Skeleton width="120px" height="40px" variant="rectangular" style={{ borderRadius: '100px' }} />
          <Skeleton width="120px" height="40px" variant="rectangular" style={{ borderRadius: '100px' }} />
        </section>

        <div className={styles.contentGrid}>
          <div className={styles.leftColumn} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <Skeleton width="120px" height="24px" />
              </div>
              <div className={styles.card}>
                <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
                <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
                <Skeleton width="60%" height="16px" />
              </div>
            </section>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <Skeleton width="120px" height="24px" />
              </div>
              <div className={`${styles.card} ${styles.impactScoreCard}`}>
                 <Skeleton width="100%" height="96px" variant="rectangular" />
              </div>
            </section>
          </div>
          <div className={styles.rightColumn} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <Skeleton width="120px" height="24px" />
              </div>
              <div className={styles.card} style={{ height: '140px' }}>
                 <Skeleton width="100%" height="100%" variant="rectangular" />
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <>
        <div className={styles.errorState}>
          <span className={`material-symbols-outlined ${styles.errorIcon}`}>error</span>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>Retry</button>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <div className={styles.notFoundState}>
          <span className={`material-symbols-outlined ${styles.notFoundIcon}`}>person_off</span>
          <p className={styles.notFoundText}>Athlete not found or not visible.</p>
          <button className={styles.backToSearchButton} onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </>
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
    <div className="animate-fade-in">
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
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              ) : (
                <div className={styles.avatar}>{initials}</div>
              )}
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
                {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Not set'}
              </span>
            </div>
          </div>
        </section>

        {/* 2. Actions (Visual Only -> Now Functional) */}
        <section className={styles.actionsSection}>
          <button 
            type="button" 
            className={isFollowing ? styles.secondaryActionBtn : styles.primaryActionBtn}
            onClick={handleToggleFollow}
            disabled={isFollowLoading}
          >
            <span className="material-symbols-outlined">
              {isFollowing ? 'how_to_reg' : 'person_add'}
            </span>
            {isFollowLoading ? 'Wait...' : isFollowing ? 'Following' : 'Follow'}
          </button>
          <button 
            type="button" 
            className={styles.secondaryActionBtn}
            onClick={async () => {
              if (!user || !profile || isMessaging) return;
              setIsMessaging(true);
              try {
                const conversationId = await messageService.getOrCreateConversation(user.id, profile.id);
                navigate(ROUTES.PRIVATE_CHAT.replace(':conversationId', conversationId));
              } catch (err) {
                console.error('Failed to create conversation:', err);
              } finally {
                setIsMessaging(false);
              }
            }}
            disabled={isMessaging}
          >
            <span className="material-symbols-outlined">chat</span>
            {isMessaging ? 'Loading...' : 'Message'}
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

            {/* Physical Profile */}
            {(profile.age || profile.height_cm || profile.weight_kg || profile.dominant_foot) && (
              <section className={styles.section} aria-labelledby="physical-title">
                <div className={styles.sectionHeader}>
                  <h2 id="physical-title" className={styles.sectionTitle}>Physical Profile</h2>
                </div>
                <div className={styles.card}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-4)' }}>
                    {profile.age && (
                      <div>
                        <p style={{ margin: 0, fontFamily: 'var(--font-family-body-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age</p>
                        <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-family-title-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{profile.age} yrs</p>
                      </div>
                    )}
                    {profile.height_cm && (
                      <div>
                        <p style={{ margin: 0, fontFamily: 'var(--font-family-body-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Height</p>
                        <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-family-title-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{profile.height_cm} cm</p>
                      </div>
                    )}
                    {profile.weight_kg && (
                      <div>
                        <p style={{ margin: 0, fontFamily: 'var(--font-family-body-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weight</p>
                        <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-family-title-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{profile.weight_kg} kg</p>
                      </div>
                    )}
                    {profile.dominant_foot && (
                      <div>
                        <p style={{ margin: 0, fontFamily: 'var(--font-family-body-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dominant Foot</p>
                        <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-family-title-sm)', fontWeight: 600, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>{profile.dominant_foot}</p>
                      </div>
                    )}
                  </div>
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
                {achievements.length > 0 && <button className={styles.seeAllLink} style={{ background: 'none', border: 'none' }}>See All</button>}
              </div>
              
              {achievements.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={`material-symbols-outlined ${styles.emptyStateIcon}`}>emoji_events</span>
                  <h3 className={styles.emptyStateTitle}>No Achievements Yet</h3>
                  <p className={styles.emptyStateDesc}>This athlete hasn't published any achievements to their profile.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                  {achievements.slice(0, 3).map(ach => (
                    <div key={ach.id} className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', padding: 'var(--spacing-3)' }}>
                      {ach.image_url ? (
                         <img src={ach.image_url} alt={ach.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                         <span className={`material-symbols-outlined`} style={{ fontSize: 40, color: 'var(--color-primary-500)' }}>{ach.icon_name || 'emoji_events'}</span>
                      )}
                      <div>
                        <h4 style={{ margin: 0, fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>{ach.title}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-neutral-600)', fontFamily: 'var(--font-family-body-sm)' }}>
                          {ach.issuer || 'Unknown Issuer'} • {ach.start_date ? new Date(ach.start_date).getFullYear() : 'No date'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              
              {activeTab === 'Posts' && posts.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={`material-symbols-outlined ${styles.emptyStateIcon}`}>article</span>
                  <h3 className={styles.emptyStateTitle}>No Recent Posts</h3>
                  <p className={styles.emptyStateDesc}>This athlete has not posted anything yet.</p>
                </div>
              ) : activeTab === 'Posts' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                  {posts.map((post) => (
                    <article key={post.id} className={styles.card} style={{ padding: 'var(--spacing-4)' }}>
                      <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--color-primary-100)' }}>
                           {post.author?.avatar_url ? (
                             <img src={post.author.avatar_url} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                           ) : (
                             <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-700)', fontWeight: 'bold' }}>{initials}</div>
                           )}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--color-neutral-900)' }}>{post.author?.full_name || 'Anonymous'}</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-neutral-500)' }}>
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <p style={{ margin: '0 0 var(--spacing-3) 0', fontSize: '14px', lineHeight: 1.5, color: 'var(--color-neutral-800)' }}>
                        {post.content}
                      </p>
                      
                      {post.image_url && (
                        <div style={{ margin: '0 -var(--spacing-4) var(--spacing-3) -var(--spacing-4)' }}>
                           <img src={post.image_url} alt="Post content" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', borderTop: '1px solid var(--color-neutral-100)', paddingTop: 'var(--spacing-3)', gap: 'var(--spacing-4)' }}>
                        <button 
                          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: post.isLiked ? 'var(--color-danger-500)' : 'var(--color-neutral-600)', cursor: 'pointer', padding: 0 }}
                          onClick={() => handleToggleLike(post)}
                        >
                          <span className="material-symbols-outlined" style={post.isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                          <span style={{ fontSize: '14px' }}>{post.likesCount || 0}</span>
                        </button>
                        <button 
                          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-neutral-600)', cursor: 'pointer', padding: 0 }}
                          onClick={() => handleToggleComments(post.id)}
                        >
                          <span className="material-symbols-outlined">chat_bubble_outline</span>
                          <span style={{ fontSize: '14px' }}>{post.commentsCount || 0}</span>
                        </button>
                      </div>

                      {activeCommentPostId === post.id && (
                        <div style={{ marginTop: 'var(--spacing-3)', padding: 'var(--spacing-3)', backgroundColor: 'var(--color-neutral-50)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', marginBottom: '8px' }}>
                            {(postComments[post.id] || []).map(c => (
                              <div key={c.id} style={{ fontSize: '13px', color: 'var(--color-neutral-800)' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--color-neutral-900)' }}>{c.author?.full_name}:</span> {c.content}
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="text" 
                              placeholder="Add a comment..." 
                              style={{ flex: 1, padding: '6px 12px', border: '1px solid var(--color-neutral-200)', borderRadius: '20px', fontSize: '13px', outline: 'none' }}
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                            />
                            <button 
                              style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }} 
                              onClick={() => submitComment(post.id)}
                            >Post</button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className={`material-symbols-outlined ${styles.emptyStateIcon}`}>article</span>
                  <h3 className={styles.emptyStateTitle}>No Recent Activity</h3>
                  <p className={styles.emptyStateDesc}>There are no {activeTab.toLowerCase()} to display at this time.</p>
                </div>
              )}
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
    </div>
  );
}
