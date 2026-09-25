/*
 * BottomNavBar
 * NOTE: The bottom navigation bar styling and structural configuration (icons, spacing,
 * active states, floating action button) are sourced from the live Stitch workspace
 * (Project ID 3941284064310403069), specifically matching the mobile UI pattern found
 * in the "Navigation & Menus" screen.
 */

import { useAuth } from '@core/auth/AuthProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import { navigationByRole } from '@core/navigation/config';
import type { NavItem } from '@core/navigation/types';
import { ROUTES } from '@routing/routes';
import styles from './BottomNav.module.css';

export function BottomNavBar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || !user.role) return null;

  const navConfig = navigationByRole[user.role];
  const items: NavItem[] = navConfig.items;

  function isActive(itemPath: string): boolean {
    if (itemPath === '/') return location.pathname === '/';
    return location.pathname === itemPath;
  }

  return (
    <nav className={styles.nav} aria-label="Bottom navigation">
      <div className={styles.navItems}>
        {items.map((item) => {
          if (item.isFab) {
            return (
              <div key={item.label} className={styles.navFabContainer}>
                <button
                  className={styles.navFab}
                  onClick={() => navigate(item.path)}
                  aria-label={item.label}
                >
                  <span className={`material-symbols-outlined ${styles.navFabIcon}`}>
                    {item.iconName}
                  </span>
                </button>
              </div>
            );
          }
          return (
            <button
              key={item.label}
              className={`${styles.navTab} ${isActive(item.path) ? styles.navTabActive : ''}`}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              {item.path === ROUTES.PROFILE && user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className={styles.navAvatar} />
              ) : (
                <span className={`material-symbols-outlined ${styles.navIcon}`}>
                  {item.iconName}
                </span>
              )}
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
