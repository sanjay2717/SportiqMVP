import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { postService, Post } from '../../services/postService';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';
import { ROUTES } from '../../../../routing/routes';
import styles from './AthleteDashboardScreen.module.css';

// Mock data for the Empty State "Recommended" list
const RECOMMENDED_USERS = [
  { id: '1', name: 'Marcus Silva', role: 'Pro Footballer', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_8ltiYjkyO2HcBieNQ0CmilPAGHMvnaRSHlA634xDchRHqzfl-KYJdYeh01AulSQHl7DrEQijs7UYZArdYnXs2BiZfuwfhd1LoQXzK7SVw02BEhQ-ZiUsizi6dEHG7NREP5aNA4hylyMwD-n4rgoZWwKQvPjjtVjzlUoZm5dRB-SiunhtKtlWlyqT-J4eLZAD--zZL3c8izi8J-QZ_zDHoRrmt2R8pfF0emj-Ebh9nzXwX9MCSOemXvtCalqQ1MpAMFpEDn_Yuiw' },
  { id: '2', name: 'Elena Rostova', role: 'Head Coach', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_B56InBNoCDn7B_Zq1uChrwy93f6poto_RC2DG4QiP71GbYXGgLZ3M0F2bzQRRKsuLoAl5_vwEc7mOuETFF3niutyNjoem4XHUDAC0I4jiD0QKuij-hEFOBvSN-PxFReWrnFAgav62_lHRu2y-qG2DQU6JnAiP8ii-2ry6l3iXHXIauiF50u5UCqfroWnNbzpwPxu4DY43oQ6jFA4bfcRttxOruDGRdVpH8RkzYRpdevj6GYDKPT4c6xcCRZLXUJRlpetmcGnKt4' },
  { id: '3', name: 'David Chen', role: 'Rising Star', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS0e6TA60ws3SlyKE0nh1lC1tPOIRLecV_chxB4LBZVDVVTyF4Yx05v-Oijb82OWewNXnmtT02YYuFlwl7hdfysbwY1_F2pRq0FXRaPLGAmnKXxFJEwPAtrOaTXQHDQTWRDEEIS1DXs5eaLCRha6GkM9A16FZ3Fqj0-gqShI5leGG-eEH4eEs__5G1lT1TzsBtXEo6TeN0t-KmK2yyU3NeIvwyKj5QFVfohIMe19JtkZXSS4ryDeN7CQz44bLW2GnHAZXHEVq6qoI' },
  { id: '4', name: 'Apex Academy', role: 'Institution', avatar: null }
];

export function AthleteDashboardScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

            <div className={styles.recommendedSection}>
              <div className={styles.recommendedHeader}>
                <h3 className={styles.recommendedTitle}>Recommended for you</h3>
                <button className={styles.viewAllBtn} onClick={() => navigate(ROUTES.NETWORK)}>View all</button>
              </div>
              <div className={styles.recommendedList}>
                {RECOMMENDED_USERS.map(ru => (
                  <div key={ru.id} className={styles.recommendedCard}>
                    <div className={styles.recommendedAvatar}>
                      {ru.avatar ? (
                        <img src={ru.avatar} alt={ru.name} />
                      ) : (
                        <span className="material-symbols-outlined">domain</span>
                      )}
                    </div>
                    <h4 className={styles.recommendedName}>{ru.name}</h4>
                    <p className={styles.recommendedRole}>{ru.role}</p>
                    <button className={styles.followBtn}>Follow</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <section className={styles.feedSection}>
            {posts.map(post => (
              <article key={post.id} className={styles.feedCard}>
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
                    <button className={styles.actionButton}>
                      <span className="material-symbols-outlined">thumb_up</span>
                      <span>0</span>
                    </button>
                    <button className={styles.actionButton}>
                      <span className="material-symbols-outlined">chat_bubble_outline</span>
                      <span>0</span>
                    </button>
                    <button className={styles.actionButton}>
                      <span className="material-symbols-outlined">share</span>
                    </button>
                  </div>
                  <button className={styles.actionButton}>
                    <span className="material-symbols-outlined">bookmark_border</span>
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {/* FAB for Create Post */}
      <button 
        className={styles.fab}
        onClick={() => navigate(ROUTES.CREATE)}
        aria-label="Create Post"
      >
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
