import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { ROUTES } from '../../../../routing/routes';
import { 
  getAchievementById, 
  createAchievement, 
  updateAchievement,
  AchievementPayload
} from '../../services/achievementService';
import { updateAvatarUrl } from '../../services/profileService';
import styles from './AchievementForm.module.css';

const ICON_OPTIONS = [
  'workspace_premium',
  'sports_score',
  'school',
  'emoji_events',
  'military_tech',
  'star',
  'speed',
  'verified'
];

export function AchievementForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [iconName, setIconName] = useState(ICON_OPTIONS[0]);
  const [metricValue, setMetricValue] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchAchievement() {
      if (!id) return;
      try {
        setIsLoading(true);
        const ach = await getAchievementById(id);
        if (ach) {
          setTitle(ach.title);
          setIssuer(ach.issuer || '');
          setDescription(ach.description || '');
          setStartDate(ach.start_date || '');
          setEndDate(ach.end_date || '');
          setIconName(ach.icon_name || ICON_OPTIONS[0]);
          setMetricValue(ach.metric_value || '');
          setExistingImageUrl(ach.image_url);
        } else {
          setError("Achievement not found.");
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load achievement.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAchievement();
  }, [id]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0] || null);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!user) return;
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let finalImageUrl = existingImageUrl;
      
      // Upload new image if selected
      if (selectedFile) {
        try {
          // Re-using avatar upload pattern but saving the URL to the achievement payload
          // Ideally we'd have a separate bucket, but we'll use the service logic
          finalImageUrl = await updateAvatarUrl(user.id, selectedFile);
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          // If storage bucket isn't set up, this fails gracefully.
        }
      }

      const payload: AchievementPayload = {
        title,
        issuer: issuer || null,
        description: description || null,
        start_date: startDate || null,
        end_date: endDate || null,
        icon_name: iconName || null,
        metric_value: metricValue || null,
        image_url: finalImageUrl,
      };

      if (id) {
        await updateAchievement(id, payload);
      } else {
        await createAchievement(user.id, payload);
      }

      navigate(ROUTES.ACHIEVEMENTS);
    } catch (err: any) {
      setError(err.message || 'Failed to save achievement.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingOverlay}>
        <span className={`material-symbols-outlined ${styles.spinner}`}>sync</span>
        <p>Loading...</p>
      </div>
    );
  }

  const modeText = id ? "Edit an existing milestone." : "Add a new milestone to your profile.";

  return (
    <div className={styles.container}>
      {/* TopAppBar */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarLeft}>
            <button 
              type="button"
              className={styles.closeButton} 
              onClick={() => navigate(ROUTES.ACHIEVEMENTS)}
              title="Back"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className={styles.pageTitle}>SportIQ</h1>
          </div>
        </div>
      </header>

      {/* Header Section */}
      <section>
        <h2 className={styles.pageTitle}>{id ? 'Edit Achievement' : 'Add Achievement'}</h2>
        <p className={styles.headerText}>{modeText}</p>
      </section>

      {error && (
        <div className={styles.errorAlert}>
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form Details */}
      <section className={styles.section}>
        <div className={styles.formGrid}>
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Achievement Title *</label>
            <input 
              className={styles.input} 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. UEFA Pro License"
            />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Issuer / Organization</label>
            <input 
              className={styles.input} 
              type="text" 
              value={issuer} 
              onChange={e => setIssuer(e.target.value)}
              placeholder="e.g. National Sports Authority"
            />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Description</label>
            <textarea 
              className={`${styles.input} ${styles.textarea}`} 
              rows={3}
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Briefly describe what this achievement signifies."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Start Date / Issue Date</label>
            <input 
              className={styles.input} 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>End Date / Expiry (Optional)</label>
            <input 
              className={styles.input} 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Icon</label>
            <div className={styles.inputWrapper}>
              <select 
                className={styles.input}
                style={{ appearance: 'none', paddingRight: '40px' }}
                value={iconName}
                onChange={e => setIconName(e.target.value)}
              >
                {ICON_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                ))}
              </select>
              <span className={`material-symbols-outlined ${styles.iconRight}`}>expand_more</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Metric Value (Optional)</label>
            <input 
              className={styles.input} 
              type="text" 
              value={metricValue} 
              onChange={e => setMetricValue(e.target.value)}
              placeholder="e.g. 500+ or 38:42"
            />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Cover Image (Optional)</label>
            {existingImageUrl && !selectedFile && (
              <p className={styles.helperText}>Image currently uploaded.</p>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className={styles.fileInput} 
            />
          </div>
        </div>
      </section>

      {/* Bottom Actions */}
      <section className={styles.bottomActions}>
        <button 
          className={styles.skipButton}
          onClick={() => navigate(ROUTES.ACHIEVEMENTS)}
        >
          {id ? 'Cancel' : 'Skip'}
        </button>
        <button 
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : (id ? 'Save Changes' : 'Save')}
        </button>
      </section>

      {isSaving && (
        <div className={styles.loadingOverlay}>
          <span className={`material-symbols-outlined ${styles.spinner}`}>sync</span>
          <p>Saving achievement...</p>
        </div>
      )}
    </div>
  );
}
