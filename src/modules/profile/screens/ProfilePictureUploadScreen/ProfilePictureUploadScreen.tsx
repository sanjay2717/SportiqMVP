import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { updateAvatarUrl } from '../../services/profileService';
import { ROUTES } from '../../../../routing/routes';
import { supabase } from '../../../../core/database/supabaseClient';
import styles from './ProfilePictureUploadScreen.module.css';

interface LocationState {
  returnTo?: string;
}

export function ProfilePictureUploadScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPrefilledGoogleAvatar, setHasPrefilledGoogleAvatar] = useState(false);

  React.useEffect(() => {
    if (user?.avatar_url && user.avatar_url.includes('googleusercontent.com')) {
      setPreviewUrl(user.avatar_url);
      setHasPrefilledGoogleAvatar(true);
    }
  }, [user?.avatar_url]);

  // Read returnTo from state, default to Personal Information
  const state = location.state as LocationState | null;
  const returnTo = state?.returnTo || ROUTES.PERSONAL_INFORMATION;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file) return;

      // Basic client-side validation
      if (file.size > 5 * 1024 * 1024) {
        setError('File must be smaller than 5MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleTriggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSkip = async () => {
    if (hasPrefilledGoogleAvatar && user) {
      setIsSkipping(true);
      try {
        await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
        await refreshProfile();
      } catch (err) {
        console.error('Failed to clear prefilled avatar on skip:', err);
      } finally {
        setIsSkipping(false);
      }
    }
    navigate(returnTo);
  };

  const canProceed = !!selectedFile || hasPrefilledGoogleAvatar;

  const handleNext = async () => {
    if (!canProceed || !user) {
      handleSkip();
      return;
    }

    if (selectedFile) {
      setIsSubmitting(true);
      setError(null);

      try {
        await updateAvatarUrl(user.id, selectedFile);
        await refreshProfile();
        navigate(returnTo);
      } catch (err: any) {
        console.error('Error uploading avatar:', err);
        setError(err.message || 'Failed to upload photo. Please check your connection and try again.');
        setIsSubmitting(false);
      }
    } else {
      // Proceeding with prefilled Google avatar
      navigate(returnTo);
    }
  };

  // Cleanup object URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={styles.container}>
      {/* Main Container */}
      <main className={styles.mainCard}>
        {/* Header (Back) */}
        <header className={styles.header}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className={styles.backButton}
          >
            <span className="material-symbols-outlined" data-icon="arrow_back" aria-hidden="true">
              arrow_back
            </span>
          </button>
          
          <div className={styles.headerSpacer}>
            {/* Progress indicator removed per design intent for reusable screen */}
          </div>
          
          {/* Invisible spacer to balance the back button */}
          <div className={styles.headerInvisibleSpacer}></div>
        </header>

        {/* Content Area */}
        <div className={styles.contentArea}>
          {/* Titles */}
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>
              Add a Profile Photo
            </h1>
            <p className={styles.subtitle}>
              Help teammates and coaches recognize you. Choose a professional headshot or a clear action photo.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Avatar Upload Area */}
          <div 
            className={styles.avatarUploadArea}
            onClick={handleTriggerFilePicker}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleTriggerFilePicker();
              }
            }}
            aria-label="Select profile photo"
          >
            {/* Avatar Placeholder/Preview */}
            <div className={styles.avatarPlaceholder}>
              {previewUrl ? (
                <img src={previewUrl} alt="Profile Preview" className={styles.avatarImage} />
              ) : (
                <span className={`material-symbols-outlined ${styles.avatarIcon}`} data-icon="person" aria-hidden="true">
                  person
                </span>
              )}
              
              {/* Hover Overlay */}
              <div className={styles.hoverOverlay}>
                <span className={`material-symbols-outlined ${styles.hoverIcon}`} data-icon="add_a_photo" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
                  add_a_photo
                </span>
              </div>
            </div>

            {/* Decorative Background Ring */}
            <div className={styles.avatarRing}></div>
          </div>

          {/* Hidden File Input */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg, image/png, image/gif"
            className={styles.hiddenInput}
            aria-hidden="true"
          />

          {/* Upload Action */}
          <button
            type="button"
            onClick={handleTriggerFilePicker}
            disabled={isSubmitting}
            className={styles.uploadButton}
          >
            <span className="material-symbols-outlined" data-icon="upload_file" aria-hidden="true">
              upload_file
            </span>
            {previewUrl ? 'Change Photo' : 'Upload Photo'}
          </button>
          
          <p className={styles.helpText}>
            JPG, PNG or GIF (Max 5MB)
          </p>
        </div>

        {/* Footer Actions */}
        <footer className={styles.footer}>
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting || isSkipping}
            className={styles.skipButton}
          >
            {isSkipping ? 'Skipping...' : 'Skip'}
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed || isSubmitting || isSkipping}
            className={`${styles.nextButton} ${canProceed && !isSubmitting && !isSkipping ? styles.nextButtonActive : styles.nextButtonDisabled}`}
          >
            {isSubmitting ? 'Saving...' : 'Next'}
            {!isSubmitting && (
              <span className="material-symbols-outlined" data-icon="arrow_forward" aria-hidden="true">
                arrow_forward
              </span>
            )}
          </button>
        </footer>
      </main>
    </div>
  );
}
