import { useState, useRef, useEffect, useId } from 'react';
import { ReactionType } from '../../../modules/dashboard/services/postService';
import styles from './PostReactionPicker.module.css';

export interface PostReactionPickerProps {
  currentUserReaction: ReactionType | null | undefined;
  onSelect: (reaction: ReactionType) => void;
  onRemove: () => void;
}

const REACTIONS: { type: ReactionType; icon: string; color: string; label: string }[] = [
  { type: 'like', icon: 'thumb_up', color: 'var(--color-primary-500)', label: 'Like' },
  { type: 'love', icon: 'favorite', color: 'var(--color-error)', label: 'Love' },
  { type: 'support', icon: 'volunteer_activism', color: 'var(--color-success)', label: 'Support' },
  { type: 'congrats', icon: 'celebration', color: 'var(--color-warning)', label: 'Congrats' },
  { type: 'insightful', icon: 'lightbulb', color: 'var(--color-info)', label: 'Insightful' },
];

export function PostReactionPicker({ currentUserReaction, onSelect, onRemove }: PostReactionPickerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const ignoreClickRef = useRef(false);
  const lastTouchTimeRef = useRef(0);
  
  const instanceId = useId();

  // 1. Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    };
  }, []);

  // 2. One popover at a time
  useEffect(() => {
    const handleOtherOpened = (e: CustomEvent) => {
      if (e.detail !== instanceId) {
        setIsHovered(false);
      }
    };
    window.addEventListener('sportiq:reaction-picker-open', handleOtherOpened as EventListener);
    return () => {
      window.removeEventListener('sportiq:reaction-picker-open', handleOtherOpened as EventListener);
    };
  }, [instanceId]);

  // 4. Tap outside
  useEffect(() => {
    if (!isHovered) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsHovered(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
    };
  }, [isHovered]);

  const openPopover = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
    window.dispatchEvent(new CustomEvent('sportiq:reaction-picker-open', { detail: instanceId }));
  };

  const handleMouseEnter = () => {
    if (Date.now() - lastTouchTimeRef.current < 500) return;
    openPopover();
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  const handleTouchStart = () => {
    lastTouchTimeRef.current = Date.now();
    ignoreClickRef.current = false;
    
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    
    touchTimeoutRef.current = setTimeout(() => {
      ignoreClickRef.current = true;
      openPopover();
    }, 450);
  };

  const cancelTouch = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (ignoreClickRef.current) {
      ignoreClickRef.current = false;
      return;
    }
    
    if (currentUserReaction) {
      onRemove();
    } else {
      onSelect('like');
    }
  };

  const handleOptionClick = (e: React.MouseEvent, reactionType: ReactionType) => {
    e.stopPropagation();
    if (currentUserReaction === reactionType) {
      onRemove();
    } else {
      onSelect(reactionType);
    }
    setIsHovered(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const currentDef = currentUserReaction ? REACTIONS.find(r => r.type === currentUserReaction) : null;

  return (
    <div 
      ref={containerRef}
      className={styles.reactionContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelTouch}
      onTouchMove={cancelTouch}
      onTouchCancel={cancelTouch}
    >
      <button 
        className={`${styles.actionButton} animate-press`} 
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={currentDef ? { color: currentDef.color } : {}}
      >
        <span className={`material-symbols-outlined ${currentDef ? 'animate-burst' : ''}`} style={currentDef ? { fontVariationSettings: "'FILL' 1" } : {}}>
          {currentDef ? currentDef.icon : 'thumb_up'}
        </span>
        <span className={styles.actionLabel} style={currentDef ? { color: currentDef.color } : {}}>
          {currentDef ? currentDef.label : 'Like'}
        </span>
      </button>

      {isHovered && (
        <div className={`${styles.reactionPopoverWrapper} animate-fade-in`}>
          <div className={styles.reactionPopover}>
            {REACTIONS.map(reaction => (
              <button
                key={reaction.type}
                className={`${styles.reactionOption} animate-press`}
                onClick={(e) => handleOptionClick(e, reaction.type)}
                style={{ color: reaction.color }}
                title={reaction.label}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {reaction.icon}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
