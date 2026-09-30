import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routing/routes';
import { ProfileCompleteness } from '../../../modules/profile/services/profileService';
import styles from './ProfileCompletenessModal.module.css';

export interface ProfileCompletenessModalProps {
  completeness: ProfileCompleteness;
}

export function ProfileCompletenessModal({ completeness }: ProfileCompletenessModalProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if < 100% and not dismissed this session
    if (completeness.percentage < 100) {
      const dismissed = sessionStorage.getItem('sportiq_completeness_modal_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, [completeness]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('sportiq_completeness_modal_dismissed', 'true');
    setIsVisible(false);
  };

  const handleComplete = () => {
    // Also dismiss it so it doesn't show up immediately upon return
    sessionStorage.setItem('sportiq_completeness_modal_dismissed', 'true');
    setIsVisible(false);
    navigate(ROUTES.EDIT_PROFILE);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconWrapper}>
          <span className={`material-symbols-outlined ${styles.icon}`}>account_circle</span>
        </div>
        
        <h2 className={styles.title}>Complete Your Profile</h2>
        
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressText}>Profile Completeness</span>
            <span className={styles.progressPercent}>{completeness.percentage}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>
        </div>

        <p className={styles.description}>
          You are missing <strong>{completeness.missingFields.length}</strong> fields (e.g. {completeness.missingFields.slice(0, 2).join(', ')}). 
          Complete your profile to get the most out of SportIQ and stand out to others!
        </p>

        <div className={styles.actions}>
          <button 
            type="button" 
            className={styles.dismissBtn} 
            onClick={handleDismiss}
          >
            Dismiss now
          </button>
          <button 
            type="button" 
            className={styles.completeBtn} 
            onClick={handleComplete}
          >
            Complete now
          </button>
        </div>
      </div>
    </div>
  );
}
