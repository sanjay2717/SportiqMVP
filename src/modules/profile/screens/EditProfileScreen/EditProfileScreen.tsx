import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../routing/routes';
import { useAuth } from '../../../../core/auth/AuthProvider';
import {
  getOwnProfile,
  updateEditProfile,
  updateAvatarUrl,
} from '../../services/profileService';
import styles from './EditProfileScreen.module.css';

export function EditProfileScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading and Error states
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(''); // Just for display
  const [dateOfBirth, setDateOfBirth] = useState(''); // Unmapped
  const [location, setLocation] = useState('');
  
  const [primarySport, setPrimarySport] = useState('Football (Soccer)');
  const [position, setPosition] = useState('');
  const [currentTeam, setCurrentTeam] = useState(''); // Unmapped
  const [bio, setBio] = useState('');
  
  const [highlightReelUrl, setHighlightReelUrl] = useState(''); // Unmapped
  const [instagramUsername, setInstagramUsername] = useState(''); // Unmapped
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        setError(null);
        setEmail(user.email ?? '');
        const profileData = await getOwnProfile(user.id);
        
        if (profileData) {
          // Parse full name
          const names = (profileData.full_name || '').split(' ');
          setFirstName(names[0] || '');
          setLastName(names.slice(1).join(' ') || '');
          
          setLocation(profileData.location || '');
          
          if (profileData.selected_sports && profileData.selected_sports.length > 0) {
            setPrimarySport(profileData.selected_sports[0] || 'Football (Soccer)');
          }
          setPosition(profileData.primary_position || '');
          setBio(profileData.bio || '');
          
          if (profileData.avatar_url) {
            setAvatarUrl(profileData.avatar_url);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load profile data.');
      } finally {
        setIsInitializing(false);
      }
    }
    
    loadProfile();
  }, [user]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        const objUrl = URL.createObjectURL(file);
        setPreviewUrl(objUrl);
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // 1. Upload Avatar if changed
      if (selectedFile) {
        try {
          await updateAvatarUrl(user.id, selectedFile);
        } catch (uploadErr: any) {
          console.error("Avatar upload failed:", uploadErr);
          // If it's a storage bucket error (expected if not created), we just log it and continue
          // to update the text fields, rather than completely failing the profile save.
        }
      }
      
      // 2. Save text fields
      await updateEditProfile(user.id, {
        firstName,
        lastName,
        location,
        primarySport,
        position,
        bio,
        dateOfBirth,
        currentTeam,
        highlightReelUrl,
        instagramUsername
      });
      
      // 3. Navigate back to profile
      navigate(ROUTES.PROFILE);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isInitializing) {
    return (
      <div className={styles.loadingOverlay}>
        <span className={`material-symbols-outlined ${styles.spinner}`}>sync</span>
        <p>Loading your profile...</p>
      </div>
    );
  }

  const displayAvatar = previewUrl || avatarUrl;

  return (
    <div className={styles.container}>
      {/* TopAppBar */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarLeft}>
            <button 
              type="button"
              className={styles.closeButton} 
              onClick={() => navigate(-1)}
              title="Cancel"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h1 className={styles.pageTitle}>Edit Profile</h1>
          </div>
          <button 
            type="button"
            className={styles.saveButton} 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      {error && (
        <div className={styles.errorAlert}>
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Profile Picture Section */}
      <section className={styles.section}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
            {displayAvatar ? (
              <img src={displayAvatar} alt="Profile" className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarFallback}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>person</span>
              </div>
            )}
            <div className={styles.avatarOverlay}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-on-primary)', fontVariationSettings: "'FILL' 1" }}>
                photo_camera
              </span>
            </div>
            <div className={styles.editIconBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                edit
              </span>
            </div>
          </div>
          <h2 className={styles.sectionTitle}>Profile Picture</h2>
          <p className={styles.sectionSubtitle}>
            Upload a clear, professional photo to help coaches and scouts recognize you.
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*" 
            className={styles.fileInput} 
          />
        </div>
      </section>

      {/* Basic Info Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionHeader}>Basic Information</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>First Name</label>
            <input 
              className={styles.input} 
              type="text" 
              value={firstName} 
              onChange={e => setFirstName(e.target.value)} 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Last Name</label>
            <input 
              className={styles.input} 
              type="text" 
              value={lastName} 
              onChange={e => setLastName(e.target.value)} 
            />
          </div>
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Email Address</label>
            <input 
              className={`${styles.input} ${styles.inputDisabled}`} 
              type="email" 
              value={email} 
              disabled 
            />
            <p className={styles.helperText}>Contact support to change email.</p>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Date of Birth</label>
            <input 
              className={styles.input} 
              type="date" 
              value={dateOfBirth} 
              onChange={e => setDateOfBirth(e.target.value)} 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Location</label>
            <div className={styles.inputWrapper}>
              <input 
                className={`${styles.input} ${styles.inputWithIconLeft}`} 
                type="text" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                placeholder="London, UK"
              />
              <span className={`material-symbols-outlined ${styles.iconLeft}`}>location_on</span>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Details Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionHeader}>Professional Details</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Primary Sport</label>
            <div className={styles.inputWrapper}>
              <select 
                className={styles.input} 
                style={{ appearance: 'none', paddingRight: '40px' }}
                value={primarySport}
                onChange={e => setPrimarySport(e.target.value)}
              >
                <option value="Football (Soccer)">Football (Soccer)</option>
                <option value="Basketball">Basketball</option>
                <option value="Tennis">Tennis</option>
                <option value="Athletics">Athletics</option>
              </select>
              <span className={`material-symbols-outlined ${styles.iconRight}`}>expand_more</span>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Position / Role</label>
            <input 
              className={styles.input} 
              type="text" 
              value={position} 
              onChange={e => setPosition(e.target.value)} 
            />
          </div>
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Current Team / Affiliation</label>
            <input 
              className={styles.input} 
              type="text" 
              value={currentTeam} 
              onChange={e => setCurrentTeam(e.target.value)} 
            />
          </div>
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Career Bio</label>
            <textarea 
              className={`${styles.input} ${styles.textarea}`} 
              rows={4} 
              value={bio} 
              onChange={e => setBio(e.target.value)} 
              maxLength={500}
            />
            <div className={styles.charCountRow}>
              <p className={styles.helperText}>Briefly describe your experience and goals.</p>
              <p className={styles.helperText}>{bio.length} / 500</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social & Links Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionHeader}>Social & Links</h3>
        <div className={styles.formGroupFull}>
          <label className={styles.label}>Highlight Reel URL</label>
          <div className={styles.inputWrapper}>
            <input 
              className={`${styles.input} ${styles.inputWithIconLeft}`} 
              type="url" 
              value={highlightReelUrl} 
              onChange={e => setHighlightReelUrl(e.target.value)} 
              placeholder="https://youtube.com/watch?v=..."
            />
            <span className={`material-symbols-outlined ${styles.iconLeft}`}>play_circle</span>
          </div>
        </div>
        <div className={styles.formGroupFull}>
          <label className={styles.label}>Instagram Username</label>
          <div className={styles.inputWrapper}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-body-lg)', fontSize: 'var(--text-body-lg)', color: 'var(--color-on-surface-variant)' }}>
              @
            </span>
            <input 
              className={styles.input} 
              style={{ paddingLeft: '40px' }}
              type="text" 
              value={instagramUsername} 
              onChange={e => setInstagramUsername(e.target.value)} 
            />
          </div>
        </div>
      </section>
      
      {/* Loading overlay for saves */}
      {isSaving && (
        <div className={styles.loadingOverlay}>
          <span className={`material-symbols-outlined ${styles.spinner}`}>sync</span>
          <p>Saving changes...</p>
        </div>
      )}
    </div>
  );
}
