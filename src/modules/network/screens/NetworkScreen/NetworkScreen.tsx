import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { networkService, Connection } from '../../services/networkService';
import { messageService } from '../../../messages/services/messageService';
import { ROUTES } from '../../../../routing/routes';
import styles from './NetworkScreen.module.css';

export function NetworkScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConnections() {
      if (!user) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await networkService.getConnections(user.id);
        setConnections(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load connections.');
      } finally {
        setIsLoading(false);
      }
    }
    loadConnections();
  }, [user]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    const first = parts[0];
    const second = parts[1];
    if (first && second && first[0] && second[0]) {
      return (first[0] + second[0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleMessage = async (e: React.MouseEvent, recipientId: string) => {
    e.stopPropagation(); // prevent card click
    if (!user) return;
    try {
      const conversationId = await messageService.getOrCreateConversation(user.id, recipientId);
      navigate(ROUTES.PRIVATE_CHAT.replace(':conversationId', conversationId));
    } catch (err) {
      console.error('Failed to create conversation', err);
    }
  };

  const handleCardClick = (role: string | null, id: string) => {
    if (role === 'organiser') {
      navigate(ROUTES.ORGANIZATION_DETAIL.replace(':id', id));
    } else {
      navigate(ROUTES.ATHLETE_PUBLIC_PROFILE.replace(':id', id));
    }
  };

  // Note: This is a custom-built screen structurally modeled on MyCoachesScreen, 
  // replacing the Stitch MCP fetch which failed.
  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <button className={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className={styles.pageTitle}>My Network</h1>
      </header>

      <main className={styles.mainContent}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <span className={`material-symbols-outlined ${styles.spinner}`}>sync</span>
            <p>Loading your network...</p>
          </div>
        ) : error ? (
          <div className={styles.errorAlert}>
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        ) : connections.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={`material-symbols-outlined ${styles.emptyIcon}`}>group_add</span>
            <h2 className={styles.emptyTitle}>Grow Your Network</h2>
            <p className={styles.emptyDesc}>
              Follow athletes, coaches, and organizations to see them here.
            </p>
          </div>
        ) : (
          <div className={styles.networkGrid}>
            {connections.map(conn => {
              const profile = conn.recipient_profile;
              if (!profile) return null;
              
              return (
                <div 
                  key={conn.id} 
                  className={styles.networkCard}
                  onClick={() => handleCardClick(profile.role, conn.recipient_id)}
                >
                  <div className={styles.avatarWrapper}>
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className={styles.avatarImage} />
                    ) : (
                      <span className={styles.avatarInitials}>{getInitials(profile.full_name)}</span>
                    )}
                  </div>
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{profile.full_name || 'Unknown User'}</h3>
                    <p className={styles.userRole}>
                      <span className={`material-symbols-outlined ${styles.roleIcon}`}>
                        {profile.role === 'organiser' ? 'corporate_fare' : profile.role === 'coach' ? 'sports' : 'person'}
                      </span>
                      {profile.role || 'Athlete'}
                    </p>
                  </div>
                  <button 
                    className={styles.messageButton} 
                    onClick={(e) => handleMessage(e, conn.recipient_id)}
                    aria-label="Send message"
                  >
                    <span className="material-symbols-outlined">chat</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
