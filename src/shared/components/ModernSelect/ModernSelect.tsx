import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ModernSelect.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface ModernSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
  id?: string;
}

export function ModernSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled,
  'aria-label': ariaLabel,
  id,
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Close on click outside
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  const open = () => {
    if (disabled) return;
    const currentIndex = options.findIndex(o => o.value === value);
    setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    setIsOpen(true);
  };

  const select = useCallback((optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        open();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(i => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          const focused = options[focusedIndex];
          if (focused) select(focused.value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const selectedLabel = options.find(o => o.value === value)?.label;
  const displayValue = selectedLabel || placeholder;
  const hasValue = Boolean(selectedLabel);

  return (
    <div
      className={`${styles.container} ${isOpen ? styles.open : ''}`}
      ref={containerRef}
    >
      <button
        id={id}
        type="button"
        className={`${styles.trigger} ${disabled ? styles.disabled : ''} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => (isOpen ? (setIsOpen(false), setFocusedIndex(-1)) : open())}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        aria-activedescendant={focusedIndex >= 0 ? `option-${focusedIndex}` : undefined}
      >
        <span className={hasValue ? styles.valueText : styles.placeholderText}>
          {displayValue}
        </span>
        <span className={`material-symbols-outlined ${styles.chevron} ${isOpen ? styles.chevronUp : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          className={styles.dropdown}
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((opt, i) => (
            <li
              key={opt.value}
              id={`option-${i}`}
              role="option"
              aria-selected={opt.value === value}
              className={`${styles.option} ${opt.value === value ? styles.selected : ''} ${i === focusedIndex ? styles.focused : ''}`}
              onMouseEnter={() => setFocusedIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur
                select(opt.value);
              }}
            >
              {opt.value === value && (
                <span className={`material-symbols-outlined ${styles.checkIcon}`}>check</span>
              )}
              <span className={opt.value === value ? '' : styles.optionIndent}>{opt.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
