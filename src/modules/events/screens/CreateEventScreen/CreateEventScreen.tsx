import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { ROUTES } from '../../../../routing/routes';
import { createEvent, CreateEventPayload } from '../../services/eventService';
import { REGION_LIST } from '../../../../shared/constants/regions';
import { SPORTS_LIST } from '../../../../shared/constants/sports';
import styles from './CreateEventScreen.module.css';

export function CreateEventScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [sport, setSport] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Combine date and time into a single ISO string for timestamptz
      const dateTimeString = `${eventDate}T${eventTime}:00`;
      const dateObj = new Date(dateTimeString);
      
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date or time');
      }

      const payload: CreateEventPayload = {
        title,
        description,
        event_date: dateObj.toISOString(),
        location,
        sport,
        created_by: user.id
      };

      await createEvent(payload);
      navigate(ROUTES.EVENTS);
    } catch (err: any) {
      setError(err.message || 'Failed to create event. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className={styles.title}>Create Event</h1>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <span className="material-symbols-outlined">error</span>
          <p>{error}</p>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="title">Event Title <span className={styles.required}>*</span></label>
          <input
            id="title"
            type="text"
            className={styles.input}
            placeholder="e.g., Summer Basketball Tournament"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="description">Description</label>
          <textarea
            id="description"
            className={styles.textarea}
            placeholder="Provide details about the event..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="eventDate">Date <span className={styles.required}>*</span></label>
            <input
              id="eventDate"
              type="date"
              className={styles.input}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="eventTime">Time <span className={styles.required}>*</span></label>
            <input
              id="eventTime"
              type="time"
              className={styles.input}
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="location">District <span className={styles.required}>*</span></label>
            <select
              id="location"
              className={styles.select}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="" disabled>Select a district</option>
              {REGION_LIST.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="sport">Sport <span className={styles.required}>*</span></label>
            <select
              id="sport"
              className={styles.select}
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              required
            >
              <option value="" disabled>Select a sport</option>
              {SPORTS_LIST.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </main>
  );
}
