import styles from './SportSelect.module.css';
import { SPORTS_LIST } from '../../constants/sports';

export interface SportSelectProps {
  value: string;
  onChange: (id: string) => void;
  includeAll?: boolean;
  allLabel?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function SportSelect({
  value,
  onChange,
  includeAll,
  allLabel = 'All Sports',
  disabled,
  'aria-label': ariaLabel
}: SportSelectProps) {
  return (
    <div className={styles.inputWrapper}>
      <select
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {includeAll && <option value="all">{allLabel}</option>}
        {SPORTS_LIST.map((sport) => (
          <option key={sport.id} value={sport.id}>
            {sport.name}
          </option>
        ))}
      </select>
      <span className={`material-symbols-outlined ${styles.iconRight}`}>
        expand_more
      </span>
    </div>
  );
}
