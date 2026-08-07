import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  style,
}: SkeletonProps) {
  const inlineStyles: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  const combinedClassName = `${styles.skeleton} ${styles[variant]} ${className}`.trim();

  return (
    <div className={combinedClassName} style={inlineStyles} aria-hidden="true" />
  );
}
