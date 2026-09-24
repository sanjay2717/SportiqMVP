import React from 'react';
import { UserRole } from '../../../core/auth/types';
import styles from './RoleSelector.module.css';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ selectedRole, onChange }: RoleSelectorProps) {
  return (
    <div className={styles.roleContainer}>
      <p className={styles.roleSectionTitle}>Select your role</p>
      <div className={styles.roleGrid}>
        {/* Athlete */}
        <button
          type="button"
          className={`${styles.roleBtn} ${selectedRole === UserRole.Athlete ? styles.roleBtnSelected : ''}`}
          onClick={() => onChange(UserRole.Athlete)}
        >
          <svg className={styles.roleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
          </svg>
          <span className={styles.roleLabel}>Athlete</span>
        </button>

        {/* Coach */}
        <button
          type="button"
          className={`${styles.roleBtn} ${selectedRole === UserRole.Coach ? styles.roleBtnSelected : ''}`}
          onClick={() => onChange(UserRole.Coach)}
        >
          <svg className={styles.roleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22a10 10 0 0 1 20 0" />
            <circle cx="12" cy="10" r="4" />
            <path d="M12 2v2" />
          </svg>
          <span className={styles.roleLabel}>Coach</span>
        </button>

        {/* Organiser */}
        <button
          type="button"
          className={`${styles.roleBtn} ${selectedRole === UserRole.Organiser ? styles.roleBtnSelected : ''}`}
          onClick={() => onChange(UserRole.Organiser)}
        >
          <svg className={styles.roleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className={styles.roleLabel}>Organiser</span>
        </button>

        {/* Official */}
        <button
          type="button"
          className={`${styles.roleBtn} ${selectedRole === UserRole.Government ? styles.roleBtnSelected : ''}`}
          onClick={() => onChange(UserRole.Government)}
        >
          <svg className={styles.roleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 22v-6a8 8 0 0 1 16 0v6" />
            <path d="M6 6a6 6 0 1 1 12 0" />
            <line x1="12" y1="12" x2="12" y2="16" />
          </svg>
          <span className={styles.roleLabel}>Govt Official</span>
        </button>
      </div>
    </div>
  );
}
