import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { ROUTES } from '../../../../routing/routes';
import { SPORTS_LIST } from '../../../../shared/constants/sports';
import { POSITIONS_BY_SPORT } from '../../../../shared/constants/positions';
import { useNumericInput } from '../../../../shared/hooks/useNumericInput';
import { ModernSelect } from '../../../../shared/components/ModernSelect/ModernSelect';
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
  const [positions, setPositions] = useState<Record<string, string>>(initialState.positions || {});
  const [experience, setExperience] = useState(initialState.experience || '');
  const [error, setError] = useState('');

  const [selectedSports] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('sportiq_onboarding_selected_sports');
    return saved ? JSON.parse(saved) : [];
  });

  // Removed availablePositions logic since we will map per sport

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
    const primarySportId = selectedSports[0];
    const primaryPos = primarySportId ? positions[primarySportId] : '';
    sessionStorage.setItem('sportiq_onboarding_playing_info', JSON.stringify({
      dominantFoot,
      primary_position: primaryPos || '',
      positions,
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

            {/* Per-Sport Positions (Dropdowns) */}
            {selectedSports.map((sportId) => {
              const sportPositions = POSITIONS_BY_SPORT[sportId];
              if (!sportPositions || sportPositions.length === 0) return null;
              
              const sportName = SPORTS_LIST.find(s => s.id === sportId)?.name || sportId;
              const isPrimary = sportId === selectedSports[0];
              const label = isPrimary ? `Primary Position (${sportName})` : `Position (${sportName})`;

              return (
                <div key={sportId} className={styles.inputGroup}>
                  <label className={styles.inputLabel} htmlFor={`position-${sportId}`}>{label}</label>
                  <ModernSelect
                    id={`position-${sportId}`}
                    value={positions[sportId] || ''}
                    onChange={(val) => setPositions(prev => ({ ...prev, [sportId]: val }))}
                    options={[
                      { value: '', label: 'Select position' },
                      ...sportPositions.map((pos: string) => ({ value: pos, label: pos }))
                    ]}
                    placeholder="Select position"
                  />
                </div>
              );
            })}

            {/* Years of Experience (Input) */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="experience">Years of Experience</label>
              <input
                id="experience"
                type="number"
                min="0"
                maxLength={2}
                className={styles.inputField}
                placeholder="e.g. 5"
                value={experience}
                onChange={(e) => {
                  const val = e.target.value;
                  setExperience(val.length > 2 ? val.slice(0, 2) : val);
                }}
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
            disabled={
              selectedSports.some(sportId => {
                const sp = POSITIONS_BY_SPORT[sportId];
                return sp && sp.length > 0 && !positions[sportId];
              }) || !dominantFoot || experience === ''
            }
          >
            Next Step
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
