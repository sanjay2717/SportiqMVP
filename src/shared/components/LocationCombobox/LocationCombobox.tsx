import { useState, useRef, useEffect } from 'react';
import { LOCATIONS_LIST } from '../../constants/locations';
import styles from './LocationCombobox.module.css';

export interface LocationComboboxProps {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export function LocationCombobox({
  value,
  onChange,
  disabled,
  'aria-label': ariaLabel
}: LocationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearch('');
  };

  const filteredLocations = LOCATIONS_LIST.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLocation = LOCATIONS_LIST.find(l => l.id === value || l.name === value);
  const displayValue = selectedLocation ? selectedLocation.name : (value || 'Select location...');

  return (
    <div className={styles.container} ref={containerRef}>
      <button 
        type="button"
        className={styles.trigger}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        <span>{isOpen ? (search || 'Search...') : displayValue}</span>
        <span className={`material-symbols-outlined ${styles.icon}`}>
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchContainer}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
            <input 
              type="text"
              autoFocus
              className={styles.searchInput}
              placeholder="Search locations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.list}>
            {filteredLocations.map(location => (
              <button
                key={location.id}
                type="button"
                className={`${styles.option} ${value === location.id || value === location.name ? styles.selected : ''}`}
                onClick={() => handleSelect(location.name)}
              >
                {location.name}
              </button>
            ))}

            {filteredLocations.length === 0 && (
              <div className={styles.noResults}>
                <p>No locations found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
