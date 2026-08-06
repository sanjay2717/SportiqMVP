import type { ReactNode } from 'react';
import { useAuth } from '@core/auth/AuthProvider';
import { UserRole } from '@core/auth/types';
import { BottomNavBar } from '@shared/navigation/BottomNav';
import { AICoachWidget } from '@shared/components/AICoachWidget';
import { TopBar } from '@shared/components/TopBar';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const isAthlete = user?.role === UserRole.Athlete;

  return (
    <div className={`${styles.layout} ${styles.layoutTopNav}`}>
      <TopBar showSearch={isAthlete} />
      {children}
      <BottomNavBar />
      {isAthlete && <AICoachWidget />}
    </div>
  );
}

