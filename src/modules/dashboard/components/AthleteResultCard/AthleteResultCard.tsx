import styles from './AthleteResultCard.module.css';
import { useNavigate } from 'react-router-dom';
import { AthleteSearchResult } from '../../services/athleteSearchService';

// Mock function to generate an impact score based on string length to keep it deterministic per user
function generateMockImpactScore(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const score = 80 + (hash % 19) + ((hash % 10) / 10);
  return score.toFixed(1);
}

// Capitalizes sport IDs (e.g., 'football' -> 'Football')
function formatSportName(sportId: string): string {
  if (!sportId) return '';
  return sportId.charAt(0).toUpperCase() + sportId.slice(1);
}

// Maps region IDs (e.g., 'na', 'eu', 'asia') back to readable strings
const REGION_MAP: Record<string, string> = {
  na: 'North America',
  eu: 'Europe',
  asia: 'Asia Pacific',
};

interface AthleteResultCardProps {
  athlete: AthleteSearchResult;
  onViewProfile?: (id: string) => void;
}

export function AthleteResultCard({ athlete, onViewProfile }: AthleteResultCardProps) {
  const navigate = useNavigate();
  const sportDisplay = (athlete.selected_sports && athlete.selected_sports.length > 0) ? formatSportName(athlete.selected_sports[0] as string) : 'Unknown Sport';
  const positionDisplay = athlete.primary_position ? ` • ${athlete.primary_position}` : '';
  const locationDisplay = athlete.location ? (REGION_MAP[athlete.location] || athlete.location) : 'Unknown Location';
  const mockImpactScore = generateMockImpactScore(athlete.id);

  // Generate initials for avatar fallback
  const initials = athlete.full_name
    ? athlete.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'A';

  return (
    <div className={`${styles.card} animate-lift`}>
      <div className={styles.topSection}>
        <div className={styles.badge}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px' }}>trending_up</span> Elite
        </div>
        
        <div className={styles.avatar}>
          {athlete.avatar_url ? (
            <img src={athlete.avatar_url} alt={athlete.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{initials}</span>
          )}
        </div>
        
        <div className={styles.info}>
          <h3 className={styles.name}>{athlete.full_name || 'Unnamed Athlete'}</h3>
          <p className={styles.subtitle}>{sportDisplay}{positionDisplay}</p>
          <div className={styles.tags}>
            {athlete.age ? <span className={styles.tag}>{athlete.age} yrs</span> : null}
            <span className={styles.tag}>{locationDisplay}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.bottomSection}>
        <div className={styles.scoreBlock}>
          <p className={styles.scoreLabel}>Impact Score</p>
          <p className={styles.scoreValue}>{mockImpactScore}</p>
        </div>
        <button 
          className={styles.viewButton} 
          onClick={() => onViewProfile ? onViewProfile(athlete.id) : navigate(`/athletes/${athlete.id}`)}
        >
          View Profile <span className="material-symbols-outlined" style={{ marginLeft: '4px', fontSize: '16px' }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
