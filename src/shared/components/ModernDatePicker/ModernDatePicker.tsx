import { useState, useEffect } from 'react';
import styles from './ModernDatePicker.module.css';

interface ModernDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  disabled?: boolean;
}

export function ModernDatePicker({ value, onChange, disabled }: ModernDatePickerProps) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0] || '');
        setMonth(parts[1] || '');
        setDay(parts[2] || '');
      }
    } else {
      setYear('');
      setMonth('');
      setDay('');
    }
  }, [value]);

  const handleUpdate = (y: string, m: string, d: string) => {
    if (y && m && d) {
      onChange(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    } else {
      onChange(''); // clear it if incomplete
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' },
  ];
  const daysInMonth = (y: string, m: string) => {
    if (!y || !m) return 31;
    return new Date(parseInt(y, 10), parseInt(m, 10), 0).getDate();
  };
  const currentDays = daysInMonth(year, month);
  const days = Array.from({ length: currentDays }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <div className={styles.container}>
      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={month}
          onChange={(e) => {
            const m = e.target.value;
            setMonth(m);
            handleUpdate(year, m, day);
          }}
          disabled={disabled}
        >
          <option value="" disabled>Month</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <span className={`material-symbols-outlined ${styles.icon}`}>expand_more</span>
      </div>

      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={day}
          onChange={(e) => {
            const d = e.target.value;
            setDay(d);
            handleUpdate(year, month, d);
          }}
          disabled={disabled}
        >
          <option value="" disabled>Day</option>
          {days.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <span className={`material-symbols-outlined ${styles.icon}`}>expand_more</span>
      </div>

      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={year}
          onChange={(e) => {
            const y = e.target.value;
            setYear(y);
            handleUpdate(y, month, day);
          }}
          disabled={disabled}
        >
          <option value="" disabled>Year</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
        <span className={`material-symbols-outlined ${styles.icon}`}>expand_more</span>
      </div>
    </div>
  );
}
