import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { ROUTES } from '../../../../routing/routes';
import { createTournament, CreateTournamentPayload } from '../../../tournaments/services/tournamentService';
import { SportCombobox } from '../../../../shared/components/SportCombobox/SportCombobox';
import styles from './CreateTournamentScreen.module.css';

export function CreateTournamentScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sport, setSport] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // --- Date validation (same pattern as CreateEventScreen) ---
      const startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) {
        throw new Error('Invalid start date.');
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const startDateOnly = new Date(startDate);
      startDateOnly.setHours(0, 0, 0, 0);

      if (startDateOnly < now) {
        throw new Error('Start date cannot be in the past.');
      }

      const currentYear = now.getFullYear();
      const startYear = startDateOnly.getFullYear();
      if (startYear < currentYear || startYear > currentYear + 5) {
        throw new Error(`Start year must be between ${currentYear} and ${currentYear + 5}.`);
      }

      if (endDate) {
        const endDateOnly = new Date(endDate);
        endDateOnly.setHours(0, 0, 0, 0);

        if (endDateOnly < startDateOnly) {
          throw new Error('End date cannot be before start date.');
        }

        const endYear = endDateOnly.getFullYear();
        if (endYear < currentYear || endYear > currentYear + 5) {
          throw new Error(`End year must be between ${currentYear} and ${currentYear + 5}.`);
        }
      }

      const payload: CreateTournamentPayload = {
        title,
        description: description || undefined,
        sport: sport || undefined,
        start_date: startDate,
        end_date: endDate || undefined,
        location: location || undefined,
        organiser_id: user.id,
      };

      await createTournament(payload);
      navigate(ROUTES.TOURNAMENTS);
    } catch (err: any) {
      setError(err.message || 'Failed to create tournament. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
          <span className={`material-symbols-outlined ${styles.backIcon}`}>arrow_back</span>
          <span>Back</span>
        </button>
        <h1 className={styles.title}>Create Tournament</h1>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <span className="material-symbols-outlined">error</span>
          <p>{error}</p>
        </div>
      )}

      <form className={styles.formContainer} onSubmit={handleSubmit}>
        {/* Tournament Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="tourney-title">
            Tournament Name <span className={styles.required}>*</span>
          </label>
          <input
            id="tourney-title"
            type="text"
            className={styles.input}
            placeholder="e.g. Summer Cup 2026"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Sport */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="tourney-sport">
            Sport <span className={styles.required}>*</span>
          </label>
          <SportCombobox
            value={sport}
            onChange={(val) => setSport(val === 'all' ? '' : val)}
            includeAll
            allLabel="Select a sport"
          />
        </div>

        {/* Date Row */}
        <div className={styles.dateRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="tourney-start-date">
              Start Date <span className={styles.required}>*</span>
            </label>
            <input
              id="tourney-start-date"
              type="date"
              className={styles.input}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="tourney-end-date">End Date</label>
            <input
              id="tourney-end-date"
              type="date"
              className={styles.input}
              value={endDate}
              min={startDate || undefined}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Location */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="tourney-location">Location</label>
          <input
            id="tourney-location"
            type="text"
            className={styles.input}
            placeholder="e.g. Main Stadium, Chennai"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="tourney-description">Description</label>
          <textarea
            id="tourney-description"
            className={styles.textarea}
            placeholder="Provide details about the tournament..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Tournament'}
          </button>
        </div>
      </form>
    </main>
  );
}
