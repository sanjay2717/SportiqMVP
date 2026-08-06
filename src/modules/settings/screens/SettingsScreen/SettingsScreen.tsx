import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../../../shared/layouts/AppLayout';
import { useAuth } from '../../../../core/auth/AuthProvider';
import styles from './SettingsScreen.module.css';

interface MenuItemProps {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

function MenuItem({ icon, label, onClick, disabled = true }: MenuItemProps) {
  return (
    <button 
      className={`${styles.menuItem} ${disabled ? styles.menuItemDisabled : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      <div className={styles.menuItemContent}>
        <span className={`material-symbols-outlined ${styles.menuIcon}`}>{icon}</span>
        <span className={styles.menuLabel}>{label}</span>
      </div>
      {disabled ? (
        <span className={styles.comingSoonBadge}>Coming Soon</span>
      ) : (
        <span className={`material-symbols-outlined ${styles.chevronIcon}`}>chevron_right</span>
      )}
    </button>
  );
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <AppLayout>
      <main className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className={styles.title}>Settings</h1>
        </header>

        <div className={styles.content}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileInfo}>
              <div className={styles.avatar}>
                <span className={`material-symbols-outlined ${styles.avatarIcon}`} style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
              <div className={styles.profileText}>
                <h2 className={styles.profileName}>{user?.name || 'User Name'}</h2>
                <p className={styles.profileEmail}>{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <span className={`material-symbols-outlined ${styles.chevronIcon}`}>chevron_right</span>
          </div>

          {/* Section: General */}
          <section className={styles.section} aria-labelledby="general-title">
            <h3 id="general-title" className={styles.sectionTitle}>General</h3>
            <div className={styles.sectionCard}>
              <MenuItem icon="person" label="Personal Info" />
              <MenuItem icon="payments" label="Payments" />
              <MenuItem icon="language" label="Language" />
            </div>
          </section>

          {/* Section: Security */}
          <section className={styles.section} aria-labelledby="security-title">
            <h3 id="security-title" className={styles.sectionTitle}>Security</h3>
            <div className={styles.sectionCard}>
              <MenuItem icon="lock" label="Password" />
              <MenuItem icon="visibility" label="Privacy" />
              <MenuItem icon="fingerprint" label="Biometrics" />
            </div>
          </section>

          {/* Section: Preferences */}
          <section className={styles.section} aria-labelledby="preferences-title">
            <h3 id="preferences-title" className={styles.sectionTitle}>Preferences</h3>
            <div className={styles.sectionCard}>
              <MenuItem icon="notifications" label="Notifications" />
              <MenuItem icon="dark_mode" label="Dark Mode" />
              <MenuItem icon="swap_horiz" label="Switch Role" />
            </div>
          </section>

          {/* Logout Action */}
          <button className={styles.logoutButton} onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </main>
    </AppLayout>
  );
}
