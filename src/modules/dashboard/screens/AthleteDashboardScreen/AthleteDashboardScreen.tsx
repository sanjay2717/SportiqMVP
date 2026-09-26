import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { postService, Post, ReactionType } from '../../services/postService';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';
import { ROUTES } from '../../../../routing/routes';
import styles from './AthleteDashboardScreen.module.css';


export function AthleteDashboardScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [sharedPostId, setSharedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [hoveredReactionPostId, setHoveredReactionPostId] = useState<string | null>(null);

  const REACTIONS: { type: ReactionType; icon: string; color: string; label: string }[] = [
    { type: 'like', icon: 'thumb_up', color: 'var(--color-primary-500)', label: 'Like' },
    { type: 'love', icon: 'favorite', color: 'var(--color-error)', label: 'Love' },
    { type: 'support', icon: 'volunteer_activism', color: 'var(--color-success)', label: 'Support' },
    { type: 'congrats', icon: 'celebration', color: 'var(--color-warning)', label: 'Congrats' },
    { type: 'insightful', icon: 'lightbulb', color: 'var(--color-info)', label: 'Insightful' },
  ];

  const toggleExpand = (id: string) => {
    setExpandedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEditSubmit = async (postId: string) => {
    if (!user || !editContent.trim()) return;
    try {
      await postService.updatePost(postId, user.id, { content: editContent });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editContent } : p));
      setEditingPostId(null);
    } catch (err) {
      console.error('Failed to update post', err);
    }
  };

  const handleReaction = async (post: Post, newReaction?: ReactionType) => {
    if (!user) return;
    
    // Default action (clicking the main button): toggle 'like'
    let targetReaction: ReactionType | null = newReaction || null;
    if (!newReaction) {
      targetReaction = post.currentUserReaction ? null : 'like'; // Toggle
    } else if (post.currentUserReaction === newReaction) {
      targetReaction = null; // Clicking same reaction removes it
    }

    const hadReaction = !!post.currentUserReaction;
    const hasReactionNow = !!targetReaction;

    // Optimistic UI
    setPosts(prev => prev.map(p => 
      p.id === post.id 
        ? { 
            ...p, 
            currentUserReaction: targetReaction, 
            likesCount: (p.likesCount || 0) + (hasReactionNow && !hadReaction ? 1 : (!hasReactionNow && hadReaction ? -1 : 0)) 
          }
        : p
    ));

    try {
      if (targetReaction) {
        await postService.setReaction(post.id, user.id, targetReaction);
      } else {
        await postService.removeReaction(post.id, user.id);
      }
    } catch (err) {
      console.error('Reaction failed', err);
      // Fallback on error could be implemented here
    }
  };

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const data = await postService.getFeedPosts(user?.id);
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
              return (
                <article 
                  key={post.id} 
                  className={`${styles.feedCard} animate-fade-in`} 
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                <div className={styles.cardHeader}>
                  <div 
                    className={styles.authorInfo} 
                    onClick={() => navigate(post.author?.role === 'organiser' ? ROUTES.ORGANIZATION_DETAIL.replace(':id', post.author_id) : ROUTES.ATHLETE_PUBLIC_PROFILE.replace(':id', post.author_id))}
                    style={{ cursor: 'pointer' }}
                  >
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
                  {post.author_id === user?.id && (
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-500)', marginLeft: 'auto' }}
                      onClick={() => {
                        setEditingPostId(post.id);
                        setEditContent(post.content);
                      }}
                      title="Edit Post"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  )}
                </div>

                <div className={styles.cardContent}>
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
                    <>
                      <p className={`${styles.postText} ${!expandedPosts.has(post.id) ? styles.lineClamp : ''}`}>{post.content}</p>
                      {post.content && post.content.length > 100 && (
                        <button 
                          className={styles.readMoreBtn} 
                          onClick={() => toggleExpand(post.id)}
                        >
                          {expandedPosts.has(post.id) ? 'Show less' : '...more'}
                        </button>
                      )}
                    </>
                  )}
                  {post.image_url && (
                    <div className={styles.postImageContainer}>
                      <img src={post.image_url} alt="Post Attachment" className={styles.postImage} />
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <div className={styles.actionGroup} style={{ alignItems: 'center' }}>
                    <div 
                      className={styles.reactionContainer}
                      onMouseEnter={() => setHoveredReactionPostId(post.id)}
                      onMouseLeave={() => setHoveredReactionPostId(null)}
                      onTouchStart={() => setHoveredReactionPostId(post.id)}
                    >
                      <button 
                        className={`${styles.actionButton} animate-press`} 
                        onClick={() => handleReaction(post)}
                        style={post.currentUserReaction ? { color: REACTIONS.find(r => r.type === post.currentUserReaction)?.color } : {}}
                      >
                        <span className={`material-symbols-outlined ${post.currentUserReaction ? 'animate-burst' : ''}`} style={post.currentUserReaction ? { fontVariationSettings: "'FILL' 1" } : {}}>
                          {post.currentUserReaction ? REACTIONS.find(r => r.type === post.currentUserReaction)?.icon : 'thumb_up'}
                        </span>
                        <span className={styles.actionLabel} style={post.currentUserReaction ? { color: REACTIONS.find(r => r.type === post.currentUserReaction)?.color } : {}}>
                          {post.currentUserReaction ? REACTIONS.find(r => r.type === post.currentUserReaction)?.label : 'Like'}
                        </span>
                      </button>

                      {hoveredReactionPostId === post.id && (
                        <div className={`${styles.reactionPopover} animate-fade-in`}>
                          {REACTIONS.map(reaction => (
                            <button
                              key={reaction.type}
                              className={`${styles.reactionOption} animate-press`}
                              onClick={(e) => { e.stopPropagation(); handleReaction(post, reaction.type); setHoveredReactionPostId(null); }}
                              style={{ color: reaction.color }}
                              title={reaction.label}
                            >
                              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {reaction.icon}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <span style={{ fontSize: '14px', color: 'var(--color-neutral-600)', fontWeight: 'bold', marginRight: '8px', marginLeft: '4px' }}>
                      {post.likesCount || 0}
                    </span>
                    <button 
                      className={`${styles.actionButton} animate-press`}
                      onClick={() => handleToggleComments(post.id)}
                    >
                      <span className="material-symbols-outlined">chat_bubble_outline</span>
                      <span className={styles.actionLabel}>{post.commentsCount || 0}</span>
                    </button>
                    <button 
                      className={`${styles.actionButton} animate-press ${sharedPostId === post.id ? 'animate-pulse' : ''}`}
                      onClick={() => {
                        setSharedPostId(post.id);
                        navigator.clipboard.writeText(`${window.location.origin}/`);
                        alert('Link copied to clipboard!');
                        setTimeout(() => setSharedPostId(null), 300);
                      }}
                    >
                      <span className="material-symbols-outlined">share</span>
                    </button>
                  </div>
                  <button className={`${styles.actionButton} animate-press`} onClick={() => alert('Bookmarks coming soon!')}>
                    <span className="material-symbols-outlined">bookmark_border</span>
                  </button>
                </div>
                
                {activeCommentPostId === post.id && (
                  <div className={`${styles.commentArea} animate-fade-in`}>
                    <div className={styles.commentsList}>
                      {(postComments[post.id] || []).map(c => (
                        <div key={c.id} className={styles.commentItem} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--color-primary-100)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {c.author?.avatar_url ? (
                              <img src={c.author.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-primary-700)' }}>person</span>
                            )}
                          </div>
                          <div>
                            <span className={styles.commentAuthor} style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--color-neutral-900)' }}>{c.author?.full_name}:</span> 
                            <span style={{ fontSize: '13px', marginLeft: '4px', color: 'var(--color-neutral-700)' }}>{c.content}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.commentInputRow}>
                      <input 
                        type="text" 
                        placeholder="Add a comment..." 
                        className={styles.commentInput} 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                      />
                      <button className={styles.commentSubmitBtn} onClick={() => submitComment(post.id)}>Post</button>
                    </div>
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
