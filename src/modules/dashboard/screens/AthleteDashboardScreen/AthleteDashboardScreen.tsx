import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { postService, Post } from '../../services/postService';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';
import { ROUTES } from '../../../../routing/routes';
import styles from './AthleteDashboardScreen.module.css';


export function AthleteDashboardScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Optimistic local-only interaction — not persisted, resets on refresh. Real persistence is separate future work (post_likes/post_comments tables).
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [sharedPostId, setSharedPostId] = useState<string | null>(null);

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const data = await postService.getFeedPosts();
        setPosts(data);
      } catch (err) {
        console.error('Failed to fetch feed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [user]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <section className={styles.feedSection}>
          <div className={styles.feedCard}>
            <div className={styles.cardHeader}>
              <Skeleton width="48px" height="48px" style={{ borderRadius: 'var(--radius-full)' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton width="40%" height="20px" />
                <Skeleton width="30%" height="16px" />
              </div>
            </div>
            <div className={styles.cardContent}>
              <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
              <Skeleton width="90%" height="16px" style={{ marginBottom: '8px' }} />
              <Skeleton width="80%" height="16px" style={{ marginBottom: '16px' }} />
              <Skeleton width="100%" height="200px" style={{ borderRadius: 'var(--radius-md)' }} />
            </div>
          </div>
          <div className={styles.feedCard}>
            <div className={styles.cardHeader}>
              <Skeleton width="48px" height="48px" style={{ borderRadius: 'var(--radius-full)' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton width="50%" height="20px" />
                <Skeleton width="40%" height="16px" />
              </div>
            </div>
            <div className={styles.cardContent}>
              <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
              <Skeleton width="60%" height="16px" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Announcements Placeholder */}
        <section className={styles.feedSection} style={{ marginBottom: 'var(--spacing-4)' }}>
          <article className={styles.feedCard}>
            <div className={styles.cardHeader}>
              <div className={styles.authorInfo}>
                <div className={styles.avatar}>
                  <span className="material-symbols-outlined">campaign</span>
                </div>
                <div className={styles.authorMeta}>
                  <h3 className={styles.authorName}>Announcements</h3>
                  <p className={styles.authorSubtitle}>Coming soon to this feed</p>
                </div>
              </div>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.postText}>
                Official updates, schedules, and urgent notices from your coaches and organizers will appear here once connected.
              </p>
            </div>
          </article>
        </section>

        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyContent}>
              <div className={styles.emptyIllustration}>
                <div className={styles.illustrationBg}></div>
                <span className="material-symbols-outlined">stadium</span>
              </div>
              <h2 className={styles.emptyTitle}>Your Arena is Waiting</h2>
              <p className={styles.emptySubtitle}>Follow athletes, coaches, and academies to see professional updates in your feed.</p>
              <button className={styles.emptyAction} onClick={() => navigate(ROUTES.NETWORK)}>
                Discover Network
              </button>
            </div>
          </div>
        ) : (
          <section className={styles.feedSection}>
            {posts.map((post, index) => {
              const isLiked = likedPosts.has(post.id);
              const isCommenting = activeCommentPostId === post.id;
              const isSharing = sharedPostId === post.id;
              
              return (
              <article 
                key={post.id} 
                className={`${styles.feedCard} animate-fade-in`} 
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.authorInfo}>
                    <div className={styles.avatar}>
                      {post.author?.avatar_url ? (
                        <img src={post.author.avatar_url} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <span className="material-symbols-outlined">person</span>
                      )}
                    </div>
                    <div className={styles.authorMeta}>
                      <h3 className={styles.authorName}>{post.author?.full_name || 'Anonymous'}</h3>
                      <p className={styles.authorSubtitle}>{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  {post.sport && (
                    <span className={styles.sportBadge}>
                      <span className="material-symbols-outlined">sports_score</span> {post.sport}
                    </span>
                  )}
                </div>

                <div className={styles.cardContent}>
                  <p className={styles.postText}>{post.content}</p>
                  {post.image_url && (
                    <div className={styles.postImageContainer}>
                      <img src={post.image_url} alt="Post Attachment" className={styles.postImage} />
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <div className={styles.actionGroup}>
                    <button 
                      className={`${styles.actionButton} animate-press ${isLiked ? styles.likeActive : ''}`} 
                      onClick={() => toggleLike(post.id)}
                    >
                      <span className={`material-symbols-outlined ${isLiked ? 'animate-burst' : ''}`} style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        favorite
                      </span>
                      <span>{isLiked ? '1' : '0'}</span>
                    </button>
                    <button 
                      className={`${styles.actionButton} animate-press`}
                      onClick={() => setActiveCommentPostId(isCommenting ? null : post.id)}
                    >
                      <span className="material-symbols-outlined">chat_bubble_outline</span>
                      <span>0</span>
                    </button>
                    <button 
                      className={`${styles.actionButton} animate-press ${isSharing ? 'animate-pulse' : ''}`}
                      onClick={() => {
                        setSharedPostId(post.id);
                        setTimeout(() => setSharedPostId(null), 300);
                      }}
                    >
                      <span className="material-symbols-outlined">share</span>
                    </button>
                  </div>
                  <button className={`${styles.actionButton} animate-press`}>
                    <span className="material-symbols-outlined">bookmark_border</span>
                  </button>
                </div>
                
                {isCommenting && (
                  <div className={`${styles.commentArea} animate-fade-in`}>
                    <input type="text" placeholder="Add a comment..." className={styles.commentInput} />
                    <button className={styles.commentSubmitBtn}>Post</button>
                  </div>
                )}
              </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
