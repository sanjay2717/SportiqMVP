import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { ROUTES } from '../../../../routing/routes';
import { updatePersonalInformation } from '../../services/profileService';
import { REGION_LIST } from '../../../../shared/constants/regions';
import { useNumericInput } from '../../../../shared/hooks/useNumericInput';
import styles from './PersonalInformationScreen.module.css';

export function PersonalInformationScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Initialize from sessionStorage stopgap if it exists
  const getInitialState = () => {
    const saved = sessionStorage.getItem('sportiq_onboarding_personal_info');
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

  const [fullName, setFullName] = useState(initialState.fullName || user?.name || '');
  const [location, setLocation] = useState(initialState.location || '');
  const [age, setAge] = useState(initialState.age || '');
  const [height, setHeight] = useState(initialState.height || '');
  const [weight, setWeight] = useState(initialState.weight || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Protect route just in case
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSkip = () => {
    // Save what we have locally just in case, then move forward
    saveStopgapToSession();
    navigate(ROUTES.PLAYING_INFORMATION);
  };

  const saveStopgapToSession = () => {
    sessionStorage.setItem('sportiq_onboarding_personal_info', JSON.stringify({
      fullName,
      location,
      age,
      height,
      weight
    }));
  };

  const handleAgeKeyDown = useNumericInput(setError, false);
  const handleHeightKeyDown = useNumericInput(setError, false);
  const handleWeightKeyDown = useNumericInput(setError, true);

  const handleContinue = async () => {
    setError('');

    if (!user) {
      setError('User not authenticated.');
      return;
    }

    if (!fullName) {
      setError('Please provide your full name.');
      return;
    }

    // Bounds checking
    if (age && (Number(age) < 10 || Number(age) > 100)) {
      setError('Age must be between 10 and 100 years.');
      return;
    }
    if (height && (Number(height) < 50 || Number(height) > 250)) {
      setError('Height must be between 50 and 250 cm.');
      return;
    }
    if (weight && (Number(weight) < 20 || Number(weight) > 300)) {
      setError('Weight must be between 20 and 300 kg.');
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePersonalInformation(user.id, {
        fullName,
        location,
        age,
        height,
        weight
      });

      // Update the stopgap local storage
      saveStopgapToSession();

      navigate(ROUTES.PLAYING_INFORMATION);
    } catch (err: any) {
      setError(err.message || 'Failed to save personal information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Top App Bar */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button 
            type="button" 
            className={styles.backBtn} 
            onClick={handleBack} 
            aria-label="Go back"
          >
            <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
          </button>
          <div className={styles.headerTitle}>SportIQ</div>
          <div className={styles.headerSpacer}></div>
        </div>
        {/* Progress Bar (50%) */}
        <div className={styles.progressContainer}>
          <div className={styles.progressFill} style={{ width: '50%' }}></div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Personal Information</h1>
          <p className={styles.subtitle}>Set up your athletic profile for personalized insights.</p>
        </div>

        {/* Warning Alert for Stopgap */}
        <div className={styles.warningAlert}>
          <span className={`material-symbols-outlined ${styles.warningIcon}`} data-icon="warning">warning</span>
          <span className={styles.warningText}>
            Notice: Location, Age, Height, and Weight will be temporarily saved locally for this session pending a database upgrade.
          </span>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <span className={`material-symbols-outlined ${styles.errorIcon}`} data-icon="error">error</span>
            <span>{error}</span>
          </div>
        )}

        <form className={styles.form}>
          {/* Basic Info Group */}
          <section className={styles.formSection}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                className={styles.inputField}
                placeholder="e.g. Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="location">Location</label>
              <div className={styles.selectWrapper}>
                <select
                  id="location"
                  className={styles.selectField}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Region</option>
                  {REGION_LIST.map((region) => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
                <span className={`material-symbols-outlined ${styles.selectIcon}`} data-icon="expand_more">expand_more</span>
              </div>
            </div>
          </section>

          {/* Physical Metrics */}
          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Physical Metrics</h2>
            <div className={styles.metricsGrid}>
              
              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={`material-symbols-outlined ${styles.metricIcon}`} data-icon="calendar_month">calendar_month</span>
                  <label className={styles.metricLabel} htmlFor="age">Age</label>
                </div>
                <div className={styles.metricInputWrapper}>
                  <input
                    id="age"
                    type="number"
                    min="10"
                    max="100"
                    className={styles.metricInput}
                    placeholder="--"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    onKeyDown={handleAgeKeyDown}
                    required
                  />
                  <span className={styles.metricUnit}>yrs</span>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={`material-symbols-outlined ${styles.metricIcon}`} data-icon="height">height</span>
                  <label className={styles.metricLabel} htmlFor="height">Height</label>
                </div>
                <div className={styles.metricInputWrapper}>
                  <input
                    id="height"
                    type="number"
                    min="50"
                    max="250"
                    className={styles.metricInput}
                    placeholder="--"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    onKeyDown={handleHeightKeyDown}
                    required
                  />
                  <span className={styles.metricUnit}>cm</span>
                </div>
              </div>

              <div className={`${styles.metricCard} ${styles.weightCard}`}>
                <div className={styles.metricHeader}>
                  <span className={`material-symbols-outlined ${styles.metricIcon}`} data-icon="monitor_weight">monitor_weight</span>
                  <label className={styles.metricLabel} htmlFor="weight">Weight</label>
                </div>
                <div className={styles.metricInputWrapper}>
                  <input
                    id="weight"
                    type="number"
                    min="20"
                    max="300"
                    step="0.1"
                    className={styles.metricInput}
                    placeholder="--"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    onKeyDown={handleWeightKeyDown}
                    required
                  />
                  <span className={styles.metricUnit}>kg</span>
                </div>
              </div>

            </div>
          </section>
        </form>
      </main>

      {/* Bottom Action Area */}
      <div className={styles.bottomArea}>
        <div className={styles.bottomContent}>
          <button 
            type="button" 
            className={styles.skipBtn} 
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip
          </button>
          <button 
            type="button" 
            className={styles.continueBtn} 
            onClick={handleContinue}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
            <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
