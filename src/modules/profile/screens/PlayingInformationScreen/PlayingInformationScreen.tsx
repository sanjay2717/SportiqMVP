import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { ROUTES } from '../../../../routing/routes';
import { SPORTS_LIST } from '../../../../shared/constants/sports';
import { POSITIONS_BY_SPORT } from '../../../../shared/constants/positions';
import { useNumericInput } from '../../../../shared/hooks/useNumericInput';
import styles from './PlayingInformationScreen.module.css';

export function PlayingInformationScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Initialize from sessionStorage stopgap if it exists
  const getInitialState = () => {
    const saved = sessionStorage.getItem('sportiq_onboarding_playing_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  };

  const initialState = getInitialState();

  const [dominantFoot, setDominantFoot] = useState(initialState.dominantFoot || '');
  const [position, setPosition] = useState(initialState.position || '');
  const [experience, setExperience] = useState(initialState.experience || '');
  const [error, setError] = useState('');

  const [selectedSports] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('sportiq_onboarding_selected_sports');
    return saved ? JSON.parse(saved) : [];
  });

  const availablePositions = React.useMemo(() => {
    const sportsWithPositions = selectedSports.filter(sportId => POSITIONS_BY_SPORT[sportId]);
    if (sportsWithPositions.length === 0) return [];

    if (sportsWithPositions.length === 1) {
      const singleSport = sportsWithPositions[0]!;
      return (POSITIONS_BY_SPORT[singleSport] || []).map((pos: string) => ({
        value: pos,
        label: pos
      }));
    }

    const combined: { value: string, label: string }[] = [];
    sportsWithPositions.forEach(sportId => {
      const sportName = SPORTS_LIST.find(s => s.id === sportId)?.name || sportId;
      (POSITIONS_BY_SPORT[sportId] || []).forEach((pos: string) => {
        combined.push({
          value: pos,
          label: `${sportName}: ${pos}`
        });
      });
    });
    return combined;
  }, [selectedSports]);

  // Protect route just in case
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleExperienceKeyDown = useNumericInput(setError, false);

  const saveStopgapToSession = () => {
    sessionStorage.setItem('sportiq_onboarding_playing_info', JSON.stringify({
      dominantFoot,
      position,
      experience
    }));
  };

  const handleNextStep = () => {
    // Note: Schema gap for these fields. We save locally and move forward.
    saveStopgapToSession();
    navigate(ROUTES.PROFILE_COMPLETION);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          className={styles.backBtn} 
          onClick={handleBack} 
          aria-label="Go back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className={styles.headerTitleWrapper}>
          <h1 className={styles.headerTitle}>Profile Setup</h1>
        </div>
      </header>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressLabels}>
          <span className={styles.stepLabel}>Step 3 of 4</span>
          <span className={styles.percentLabel}>65%</span>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressFill} style={{ width: '65%' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          <div className={styles.titleArea}>
            <h2 className={styles.title}>Playing Information</h2>
            <p className={styles.subtitle}>Help coaches and scouts understand your on-field profile.</p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <span className={`material-symbols-outlined ${styles.errorIcon}`}>error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
            
            {/* Dominant Foot (Chips) */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Dominant Foot</label>
              <div className={styles.chipGroup}>
                <button
                  type="button"
                  className={`${styles.chip} ${dominantFoot === 'Right' ? styles.chipActive : styles.chipInactive}`}
                  onClick={() => setDominantFoot('Right')}
                >
                  Right
                </button>
                <button
                  type="button"
                  className={`${styles.chip} ${dominantFoot === 'Left' ? styles.chipActive : styles.chipInactive}`}
                  onClick={() => setDominantFoot('Left')}
                >
                  Left
                </button>
                <button
                  type="button"
                  className={`${styles.chip} ${dominantFoot === 'Both' ? styles.chipActive : styles.chipInactive}`}
                  onClick={() => setDominantFoot('Both')}
                >
                  Both
                </button>
              </div>
            </div>

            {/* Primary Position (Dropdown) */}
            {availablePositions.length > 0 && (
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="position">Primary Position</label>
                <div className={styles.selectWrapper}>
                  <select
                    id="position"
                    className={styles.selectField}
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select position</option>
                    {availablePositions.map((opt: {value: string, label: string}, i: number) => (
                      <option key={i} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className={styles.selectIcon}>
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>
            )}

            {/* Years of Experience (Input) */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="experience">Years of Experience</label>
              <input
                id="experience"
                type="number"
                min="0"
                className={styles.inputField}
                placeholder="e.g. 5"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                onKeyDown={handleExperienceKeyDown}
                required
              />
            </div>

          </form>
        </div>
      </main>

      {/* Bottom Action Area */}
      <div className={styles.bottomArea}>
        <div className={styles.bottomContent}>
          <button 
            type="button" 
            className={styles.nextBtn}
            onClick={handleNextStep}
            disabled={(!position && availablePositions.length > 0) || !dominantFoot || experience === ''}
          >
            Next Step
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
