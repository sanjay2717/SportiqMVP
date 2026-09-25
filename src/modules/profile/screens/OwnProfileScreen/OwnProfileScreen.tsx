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
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Posts'>('Overview');
  
  // Post interaction states
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch profile
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
      
    // Fetch posts
    import('../../../dashboard/services/postService').then(({ postService }) => {
      postService.getPostsByAuthor(user.id, user.id).then(setPosts).catch(console.error);
    });
  }, [user]);

  const handleEditSubmit = async (postId: string) => {
    if (!user || !editContent.trim()) return;
    try {
      const { postService } = await import('../../../dashboard/services/postService');
      await postService.updatePost(postId, user.id, { content: editContent });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editContent } : p));
      setEditingPostId(null);
    } catch (err) {
      console.error('Failed to update post', err);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const { postService } = await import('../../../dashboard/services/postService');
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
      const { postService } = await import('../../../dashboard/services/postService');
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

  const handleToggleLike = async (post: any) => {
    if (!user) return;
    const currentlyLiked = !!post.isLiked;
    setPosts(prev => prev.map(p => 
      p.id === post.id 
        ? { ...p, isLiked: !currentlyLiked, likesCount: (p.likesCount || 0) + (currentlyLiked ? -1 : 1) }
        : p
    ));
    try {
      const { postService } = await import('../../../dashboard/services/postService');
      await postService.toggleLike(post.id, user.id, currentlyLiked);
    } catch (err) {
      console.error('Like failed', err);
    }
  };

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
            {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Not set'}
          </p>

          {profile.location && (
            <p className={styles.profileLocation}>
              <span className="material-symbols-outlined">location_on</span>
              {profile.location}
            </p>
          )}

          <div className={styles.actionButtons}>
            <button className={`${styles.primaryButton} animate-press`} onClick={() => navigate(ROUTES.EDIT_PROFILE)}>
              Edit Profile
            </button>
            <button className={styles.secondaryButton}>
              Share
            </button>
            <button 
              className={styles.secondaryButton} 
              style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
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

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={`${styles.tabItem} ${activeTab === 'Overview' ? styles.tabActive : ''}`} onClick={() => setActiveTab('Overview')} style={{ cursor: 'pointer' }}>Overview</div>
        <div className={`${styles.tabItem} ${activeTab === 'Posts' ? styles.tabActive : ''}`} onClick={() => setActiveTab('Posts')} style={{ cursor: 'pointer' }}>Posts</div>
      </div>

      <div className={styles.contentSection}>
        
        {activeTab === 'Overview' && (
          <>
            {/* Physical Profile (Real Data) */}
        {profile.role === UserRole.Athlete && (
          <section className={styles.section}>
            <ProfileSectionHeader title="Physical Profile" />
            <div className={styles.statsCardGrid}>
              
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Age</span>
                <span className={styles.statValue}>
                  {profile.age ? `${profile.age} yrs` : 'Not set'}
                </span>
              </div>

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
              className={`${styles.primaryButton} animate-press`}
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
          </>
        )}

        {/* Posts Tab */}
        {activeTab === 'Posts' && (
          <section className={styles.section}>
            {posts.length === 0 ? (
              <div className={styles.emptyStateContainer}>
                <span className="material-symbols-outlined">article</span>
                <p className={styles.emptyStateText}>No posts yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                {posts.map((post) => (
                  <article key={post.id} style={{ backgroundColor: 'var(--color-neutral-0)', borderRadius: '12px', padding: 'var(--spacing-4)', border: '1px solid var(--color-neutral-200)' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--color-primary-100)' }}>
                         {post.author?.avatar_url ? (
                           <img src={post.author.avatar_url} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                         ) : (
                           <span className="material-symbols-outlined" style={{ padding: '8px' }}>person</span>
                         )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--color-neutral-900)' }}>{post.author?.full_name || 'Anonymous'}</h4>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-neutral-500)' }}>
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-500)' }}
                        onClick={() => {
                          setEditingPostId(post.id);
                          setEditContent(post.content);
                        }}
                        title="Edit Post"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </div>
                    
                    {editingPostId === post.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                        <textarea 
                          value={editContent} 
                          onChange={e => setEditContent(e.target.value)} 
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--color-neutral-300)', fontFamily: 'var(--font-family)' }}
                          rows={3}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditingPostId(null)} style={{ padding: '6px 12px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                          <button onClick={() => handleEditSubmit(post.id)} style={{ padding: '6px 12px', background: 'var(--color-primary-500)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ margin: '0 0 var(--spacing-3) 0', fontSize: '14px', lineHeight: 1.5, color: 'var(--color-neutral-800)' }}>
                        {post.content}
                      </p>
                    )}
                    
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
                          {(postComments[post.id] || []).map((c: any) => (
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
            )}
          </section>
        )}
        
      </div>
    </div>
  );
}
