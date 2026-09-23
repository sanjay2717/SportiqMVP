import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/auth/AuthProvider';
import { ROUTES } from '@routing/routes';
import styles from './TopBar.module.css';

interface TopBarProps {
  showSearch?: boolean;
}

export function TopBar({ showSearch = false }: TopBarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

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
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
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
