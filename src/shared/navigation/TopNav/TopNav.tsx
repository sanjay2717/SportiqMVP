import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routing/routes';
import { useAuth } from '../../../core/auth/AuthProvider';
import styles from './TopNav.module.css';

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  function isActive(itemPath: string): boolean {
    if (itemPath === '/') return location.pathname === '/';
    return location.pathname === itemPath;
  }

  return (
    <header className={styles.topNav}>
      <div className={styles.navContainer}>
        {/* Left: Logo */}
        <div className={styles.logoArea} onClick={() => navigate(ROUTES.HOME)}>
          <h1 className={styles.logoText}>SportIQ</h1>
        </div>

        {/* Center: Search (Visual Only) */}
        <div className={styles.searchContainer}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search Players, Coaches, Academies, Tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right: Profile */}
        <nav className={styles.navItems} aria-label="Top navigation">

          {/* Profile Icon */}
          <button
            className={`${styles.navTab} ${isActive(ROUTES.PROFILE) ? styles.navTabActive : ''}`}
            onClick={() => navigate(ROUTES.PROFILE)}
            aria-label="Profile"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className={styles.navAvatar} />
            ) : (
              <span className={`material-symbols-outlined ${styles.navIcon}`}>
                person
              </span>
            )}
            <span className={styles.navLabel}>Me</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
