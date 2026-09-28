import { useState, useRef } from 'react';
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
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const currentDef = currentUserReaction ? REACTIONS.find(r => r.type === currentUserReaction) : null;

  return (
    <div 
      className={styles.reactionContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
    >
      <button 
        className={`${styles.actionButton} animate-press`} 
        onClick={handleClick}
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
