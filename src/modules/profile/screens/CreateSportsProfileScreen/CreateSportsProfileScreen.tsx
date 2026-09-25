import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { updateProfileOnboarding, updateAvatarUrl } from '../../services/profileService';
import { ROUTES } from '../../../../routing/routes';
import styles from './CreateSportsProfileScreen.module.css';

interface LocationState {
  selectedSports?: string[];
}

export function CreateSportsProfileScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile } = useAuth();
  
  // Extract passed state
  const state = location.state as LocationState | null;
  const initialSports = state?.selectedSports || (() => {
    const saved = sessionStorage.getItem('sportiq_onboarding_selected_sports');
    return saved ? JSON.parse(saved) : [];
  })();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [primaryRole, setPrimaryRole] = useState(user?.role || '');
  const [bio, setBio] = useState('');
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File must be smaller than 5MB');
        return;
      }
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fallback: if no user is found in context, though ProtectedRoute should handle this
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, navigate]);

  // Handle Google Avatar Prefill
  useEffect(() => {
    if (user?.avatar_url && user.avatar_url.includes('googleusercontent.com')) {
      setAvatarPreview(user.avatar_url);
    }
  }, [user?.avatar_url]);

  // Optionally split full name to pre-fill
  useEffect(() => {
    if (user?.name) {
      const parts = user.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [user]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSaveDraft = () => {
    // MOCK: Save draft functionality
    console.log('Saving draft...');
  };

  const handleNextStep = async () => {
    setError('');
    
    if (!user) {
      setError('User not authenticated.');
      return;
    }

    // Basic validation
    if (!firstName || !lastName || !primaryRole) {
      setError('Please fill in your name and primary role.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedFile) {
        await updateAvatarUrl(user.id, selectedFile);
      }
      
      await updateProfileOnboarding(user.id, {
        selectedSports: initialSports,
        bio,
      });

      if (selectedFile) {
        await refreshProfile();
      }

      sessionStorage.removeItem('sportiq_onboarding_selected_sports');

      setShowConfirmation(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Profile Created Confirmation view
  if (showConfirmation) {
    return (
      <div className={styles.container}>
        <main className={styles.mainContent} style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className={`${styles.formArea} animate-fade-in`} style={{ textAlign: 'center', alignItems: 'center' }}>
            <div className={`animate-pulse ${styles.avatarCircle}`} style={{ width: 120, height: 120, margin: '0 auto 24px' }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className={`material-symbols-outlined ${styles.avatarIcon}`} style={{ fontSize: 64 }}>person</span>
              )}
            </div>
            <h1 className={styles.title} style={{ marginBottom: 8 }}>Profile Created!</h1>
            <p className={styles.subtitle} style={{ marginBottom: 32 }}>
              Welcome to SportIQ, {firstName} {lastName}.
              <br />
              {primaryRole && `Your role is set to ${primaryRole}.`}
            </p>
            <button 
              className={styles.primaryBtn} 
              type="button" 
              onClick={() => navigate(ROUTES.PERSONAL_INFORMATION)}
              style={{ width: 'auto', padding: '0 32px' }}
            >
              Continue Setup
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* TopAppBar / Progress Shell */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft} onClick={handleBack}>
            <span className={`material-symbols-outlined ${styles.backIcon}`}>arrow_back</span>
            <span className={styles.backText}>Back</span>
          </div>
          
          <div className={styles.progressWrapper}>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressFill} style={{ width: '10%' }} />
            </div>
          </div>
          
          <div className={styles.stepLabel}>Step 1 of 4</div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className={styles.mainContent}>
        {/* Left Side: Form Area */}
        <div className={styles.formArea}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Create Your Professional Identity</h1>
            <p className={styles.subtitle}>Let's start with the basics. This information helps teams, coaches, and sponsors find you.</p>
          </div>
          
          {error && (
            <div className={styles.errorAlert}>
              <span className={`material-symbols-outlined ${styles.errorIcon}`}>error</span>
              <span>{error}</span>
            </div>
          )}

          <form className={styles.form}>
            {/* Avatar Upload Area */}
            <div className={styles.avatarSection}>
              <label className={styles.avatarLabel}>Profile Photo</label>
              <div className={styles.avatarContent}>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }}
                />
                <div className={styles.avatarPlaceholder} onClick={handleAvatarClick}>
                  <div className={styles.avatarCircle}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className={`material-symbols-outlined ${styles.avatarIcon}`}>add_a_photo</span>
                    )}
                  </div>
                </div>
                <div className={styles.avatarInfo}>
                  <span className={styles.avatarHint}>High quality, professional headshot recommended.</span>
                  <button className={styles.uploadBtn} type="button" onClick={handleAvatarClick}>Upload Image</button>
                </div>
              </div>
            </div>

            {/* Basic Info Grid */}
            <div className={styles.nameGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="firstName">First Name</label>
                <input 
                  className={styles.inputField}
                  id="firstName"
                  type="text"
                  placeholder="e.g., Marcus"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="lastName">Last Name</label>
                <input 
                  className={styles.inputField}
                  id="lastName"
                  type="text"
                  placeholder="e.g., Rashford"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="primaryRole">Primary Role</label>
              <div className={styles.selectWrapper}>
                <select 
                  className={styles.selectField}
                  id="primaryRole"
                  value={primaryRole}
                  onChange={(e) => setPrimaryRole(e.target.value)}
                >
                  <option value="" disabled>Select your main role</option>
                  <option value="Athlete">Athlete</option>
                  <option value="Coach">Coach</option>
                  <option value="Scout">Scout</option>
                  <option value="Fan">Fan</option>
                </select>
                <span className={`material-symbols-outlined ${styles.selectIcon}`}>expand_more</span>
              </div>
            </div>

            {/* Bio Text Area */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="bio">
                <span>Professional Bio</span>
                <span className={styles.labelHint}>Max 500 characters</span>
              </label>
              <textarea 
                className={styles.textareaField}
                id="bio"
                rows={4}
                placeholder="Briefly describe your career, current status, and professional goals..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
              />
            </div>

            {/* Actions */}
            <div className={styles.actionGroup}>
              <button 
                className={styles.ghostBtn} 
                type="button" 
                onClick={handleSaveDraft}
                disabled={true}
              >
                Save Draft (Coming Soon)
              </button>
              <button 
                className={styles.primaryBtn} 
                type="button" 
                onClick={handleNextStep}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Next Step'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Decorative/Visual Support */}
        <div className={styles.visualSide}>
          <div className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardAvatar}>
                <span className={`material-symbols-outlined ${styles.cardAvatarIcon}`}>person</span>
              </div>
              <div className={styles.cardLines}>
                <div className={styles.cardLine1} />
                <div className={styles.cardLine2} />
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardBodyLine1} />
              <div className={styles.cardBodyLine2} />
              <div className={styles.cardBodyLine3} />
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.cardFooterItem}>
                <div className={styles.cardFooterLine} />
              </div>
              <div className={styles.cardFooterItem}>
                <div className={styles.cardFooterLine} />
              </div>
            </div>
          </div>
          <div className={styles.decorBlob1} />
          <div className={styles.decorBlob2} />
        </div>
      </main>
    </div>
  );
}
