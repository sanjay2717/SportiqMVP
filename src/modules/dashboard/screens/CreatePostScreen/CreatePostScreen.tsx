import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { getOwnProfile, ProfileData } from '../../../profile/services/profileService';
import { postService } from '../../services/postService';
import { SPORTS_LIST } from '../../../../shared/constants/sports';
import { ROUTES } from '../../../../routing/routes';
import styles from './CreatePostScreen.module.css';

export function CreatePostScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [content, setContent] = useState('');
  const [sport, setSport] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      getOwnProfile(user.id).then(setProfile).catch(console.error);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0] || null);
    }
  };

  const handlePost = async () => {
    if (isSubmitting) return;
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = undefined;
      if (imageFile) {
        imageUrl = await postService.uploadPostImage(user.id, imageFile);
      }

      await postService.createPost({
        content: content.trim(),
        image_url: imageUrl,
        sport: sport || undefined
      });

      navigate(ROUTES.HOME);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          className={styles.closeBtn} 
          onClick={() => navigate(-1)}
          aria-label="Close"
          disabled={isSubmitting}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h1 className={styles.title}>Create Post</h1>
        <button 
          className={styles.postBtn}
          onClick={handlePost}
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </header>

      {/* Main Content Area */}
      <main className={styles.main}>
        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}

        <div className={styles.profileRow}>
          <div className={styles.avatar}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className={styles.avatarImg} />
            ) : (
              <span className="material-symbols-outlined">person</span>
            )}
          </div>
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{profile?.full_name || 'Anonymous'}</span>
            
            <div className={styles.visibilityBtn}>
              <span className={`material-symbols-outlined ${styles.iconSm}`}>public</span>
              <span className={styles.visibilityText}>Public</span>
              <span className={`material-symbols-outlined ${styles.iconSm}`}>arrow_drop_down</span>
            </div>
          </div>
        </div>

        <div className={styles.editorWrapper}>
          <textarea
            className={styles.textarea}
            placeholder="Share your professional progress..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        {imageFile && (
          <div className={styles.imagePreviewContainer}>
            <img 
              src={URL.createObjectURL(imageFile)} 
              alt="Preview" 
              className={styles.imagePreview} 
            />
            <button 
              className={styles.removeImageBtn}
              onClick={() => setImageFile(null)}
              disabled={isSubmitting}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
      </main>

      {/* Attachment Options Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.actionList}>
          <button 
            className={styles.actionItem} 
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <span className={`material-symbols-outlined ${styles.iconColorPrimary}`}>image</span>
            <span>Add Image</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleFileChange}
          />

          <div className={styles.sportSelectWrapper}>
            <span className={`material-symbols-outlined ${styles.iconColorTertiary}`}>sports_score</span>
            <select 
              className={styles.sportSelect}
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Tag Sport (Optional)</option>
              {SPORTS_LIST.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
