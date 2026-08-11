import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { ROUTES } from '../../../../routing/routes';
import { UserRole } from '../../../../core/auth/types';
import { messageService } from '../../services/messageService';
import { ConversationWithProfiles } from '../../types';
import styles from './MessagesScreen.module.css';

export function MessagesScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationWithProfiles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await messageService.getConversations(user.id);
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleConversationClick = (id: string) => {
    navigate(ROUTES.PRIVATE_CHAT.replace(':conversationId', id));
  };

  const getOtherParticipant = (conv: ConversationWithProfiles) => {
    return conv.participant_one === user?.id
      ? conv.participant_two_profile
      : conv.participant_one_profile;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const getDiscoveryRoute = () => {
    switch (user?.role) {
      case UserRole.Coach:
        return ROUTES.ATHLETE_DIRECTORY;
      case UserRole.Government:
        return ROUTES.ORGANIZATION_DIRECTORY;
      case UserRole.Athlete:
      case UserRole.Organiser:
      default:
        return ROUTES.NETWORK;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.searchArea}>
          <div className={styles.searchBarSkeleton} />
        </div>
        <div className={styles.list}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={styles.itemSkeleton}>
              <div className={styles.avatarSkeleton} />
              <div className={styles.contentSkeleton}>
                <div className={styles.titleSkeleton} />
                <div className={styles.subtitleSkeleton} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <span className={`material-symbols-outlined ${styles.emptyIcon}`} style={{ color: 'var(--color-error)' }}>error</span>
          <h3 className={styles.emptyTitle}>Oops!</h3>
          <p className={styles.emptySubtitle}>{error}</p>
          <button onClick={loadConversations} style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family-label-md)', fontWeight: 'bold' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchArea}>
        <div className={styles.searchBox}>
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search conversations..."
          />
        </div>
      </div>
      
      <div className={styles.list}>
        {conversations.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={`material-symbols-outlined ${styles.emptyIcon}`}>chat_bubble</span>
            <h3 className={styles.emptyTitle}>No messages yet</h3>
            <p className={styles.emptySubtitle}>Start a conversation with a coach or athlete.</p>
            <button 
              type="button" 
              onClick={() => navigate(getDiscoveryRoute())} 
              style={{ marginTop: 'var(--spacing-4)', display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2) var(--spacing-5)', backgroundColor: 'var(--color-primary-500)', color: 'var(--color-on-primary)', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-family-label-lg)', fontWeight: 500, cursor: 'pointer', transition: 'background-color 0.2s ease' }}
            >
              Discover People
            </button>
          </div>
        ) : (
          conversations.map((conv) => {
            const otherUser = getOtherParticipant(conv);
            return (
              <div
                key={conv.id}
                className={styles.chatItem}
                onClick={() => handleConversationClick(conv.id)}
              >
                <div className={styles.avatarContainer}>
                  {otherUser?.avatar_url ? (
                    <img src={otherUser.avatar_url} alt="Avatar" className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarFallback}>
                      <span className="material-symbols-outlined">person</span>
                    </div>
                  )}
                  <div className={styles.onlineIndicator} />
                </div>
                <div className={styles.chatInfo}>
                  <div className={styles.chatHeader}>
                    <h3 className={styles.chatName}>
                      {otherUser?.full_name || 'Unknown User'}
                    </h3>
                    <span className={styles.chatTime}>
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>
                  <div className={styles.chatFooter}>
                    <p className={styles.chatPreview}>Tap to view messages</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
