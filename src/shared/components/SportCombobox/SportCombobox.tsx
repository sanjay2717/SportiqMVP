import { useState, useRef, useEffect } from 'react';
import { SPORTS_LIST } from '../../constants/sports';
import { supabase } from '../../../core/database/supabaseClient';
import styles from './SportCombobox.module.css';

export interface SportComboboxProps {
  value: string;
  onChange: (id: string) => void;
  includeAll?: boolean;
  allLabel?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function SportCombobox({
  value,
  onChange,
  includeAll,
  allLabel = 'All Sports',
  disabled,
  'aria-label': ariaLabel
}: SportComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({ name: '', location: '', popularity: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
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

  const filteredSports = SPORTS_LIST.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSport = SPORTS_LIST.find(s => s.id === value);
  const displayValue = selectedSport ? selectedSport.name : (value === 'all' && includeAll ? allLabel : 'Select sport...');

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportData.name.trim()) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('sport_reports').insert({
        reported_by: user?.id || null,
        sport_name: reportData.name,
        location: reportData.location,
        popularity_note: reportData.popularity
      });
      setSubmitted(true);
      setTimeout(() => {
        setShowReportForm(false);
        setSubmitted(false);
        setReportData({ name: '', location: '', popularity: '' });
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              placeholder="Search sports..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.list}>
            {includeAll && (!search || allLabel.toLowerCase().includes(search.toLowerCase())) && (
              <button 
                type="button" 
                className={`${styles.option} ${value === 'all' ? styles.selected : ''}`}
                onClick={() => handleSelect('all')}
              >
                {allLabel}
              </button>
            )}
            
            {filteredSports.map(sport => (
              <button
                key={sport.id}
                type="button"
                className={`${styles.option} ${value === sport.id ? styles.selected : ''}`}
                onClick={() => handleSelect(sport.id)}
              >
                {sport.name}
              </button>
            ))}

            {filteredSports.length === 0 && !showReportForm && (
              <div className={styles.noResults}>
                <p>Can't find your sport?</p>
                <button 
                  type="button" 
                  className={styles.reportLink}
                  onClick={() => setShowReportForm(true)}
                >
                  Report it
                </button>
              </div>
            )}

            {showReportForm && (
              <div className={styles.reportForm}>
                {submitted ? (
                  <div className={styles.successMessage}>
                    <span className="material-symbols-outlined">check_circle</span>
                    Report submitted!
                  </div>
                ) : (
                  <form onSubmit={handleReport}>
                    <h4 className={styles.reportTitle}>Report Missing Sport</h4>
                    <input 
                      type="text" 
                      placeholder="Sport Name" 
                      className={styles.reportInput}
                      value={reportData.name}
                      onChange={e => setReportData({...reportData, name: e.target.value})}
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Where is it played? (Region/Country)" 
                      className={styles.reportInput}
                      value={reportData.location}
                      onChange={e => setReportData({...reportData, location: e.target.value})}
                    />
                    <select 
                      className={styles.reportSelect}
                      value={reportData.popularity}
                      onChange={e => setReportData({...reportData, popularity: e.target.value})}
                    >
                      <option value="">How popular is it?</option>
                      <option value="Global">Global / Worldwide</option>
                      <option value="National">National Level</option>
                      <option value="Regional">Regional / Local</option>
                      <option value="Niche">Niche / Small community</option>
                    </select>
                    <div className={styles.reportActions}>
                      <button type="button" onClick={() => setShowReportForm(false)} className={styles.cancelBtn}>Cancel</button>
                      <button type="submit" disabled={isSubmitting || !reportData.name.trim()} className={styles.submitBtn}>
                        {isSubmitting ? 'Sending...' : 'Submit'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
