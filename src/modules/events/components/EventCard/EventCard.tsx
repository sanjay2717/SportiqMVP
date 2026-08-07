import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../routing/routes';
import { SportEvent } from '../../services/eventService';
import { REGION_LIST } from '../../../../shared/constants/regions';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: SportEvent;
}

// Maps region IDs back to readable strings
const REGION_MAP: Record<string, string> = {};
REGION_LIST.forEach(r => {
  REGION_MAP[r.id] = r.name;
});

// Capitalizes sport IDs (e.g., 'football' -> 'Football')
function formatSportName(sportId: string | null): string {
  if (!sportId) return 'Unknown Sport';
  return sportId.charAt(0).toUpperCase() + sportId.slice(1);
}

export function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();

  const date = new Date(event.event_date);
  const formattedDate = date.toLocaleDateString(undefined, { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });

  const locationDisplay = event.location ? (REGION_MAP[event.location] || event.location) : 'TBD';
  const sportDisplay = formatSportName(event.sport);

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{event.title}</h3>
          <span className={styles.sportBadge}>{sportDisplay}</span>
        </div>
        
        {event.description && (
          <p className={styles.description}>{event.description}</p>
        )}
        
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={`material-symbols-outlined ${styles.metaIcon}`}>event</span>
            <span className={styles.metaText}>{formattedDate} at {formattedTime}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={`material-symbols-outlined ${styles.metaIcon}`}>location_on</span>
            <span className={styles.metaText}>{locationDisplay}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={`material-symbols-outlined ${styles.metaIcon}`}>person</span>
            <span className={styles.metaText}>Organised by {event.creator_name || 'Unknown'}</span>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <button 
          className={styles.actionButton}
          onClick={() => navigate(ROUTES.EVENT_DETAILS.replace(':id', event.id))}
        >
          View Details
          <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: '4px' }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
