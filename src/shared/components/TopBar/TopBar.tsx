import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/auth/AuthProvider';
import { getOwnProfile } from '@modules/profile/services/profileService';
import { ROUTES } from '@routing/routes';
import styles from './TopBar.module.css';

interface TopBarProps {
  showSearch?: boolean;
}

export function TopBar({ showSearch = false }: TopBarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    getOwnProfile(user.id)
      .then((profile) => {
        if (isMounted && profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch avatar_url for TopBar:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <header className={styles.topBar}>
      <div className={styles.left}>
        <span className={styles.wordmark}>SportIQ</span>
      </div>
      <div className={styles.right}>
        {showSearch && (
          <button 
            className={styles.iconButton} 
            onClick={() => navigate(ROUTES.SEARCH)} 
            aria-label="Search" 
            type="button"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
        )}
        <button 
          className={styles.iconButton} 
          onClick={() => navigate(ROUTES.NOTIFICATIONS)} 
          aria-label="Notifications" 
          type="button"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button 
          className={styles.iconButton} 
          onClick={() => navigate(ROUTES.PROFILE)} 
          aria-label="Profile"
          type="button"
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Profile avatar" 
              className={styles.avatarImg} 
            />
          ) : (
            <span className="material-symbols-outlined">person</span>
          )}
        </button>
      </div>
    </header>
  );
}
