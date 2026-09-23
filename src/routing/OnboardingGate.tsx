import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthProvider';
import { UserRole } from '../core/auth/types';
import { ROUTES } from './routes';
import styles from './Routing.module.css';

interface OnboardingGateProps {
  children: React.ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { user, onboardingComplete, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (
    (user?.role === UserRole.Athlete && onboardingComplete === false) ||
    (!user?.role)
  ) {
    return <Navigate to={ROUTES.SELECT_SPORTS} replace />;
  }

  return <>{children}</>;
}
