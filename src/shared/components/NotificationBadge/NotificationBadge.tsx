import { useState, useEffect } from 'react';
import { useAuth } from '@core/auth/AuthProvider';
import { getUnreadCount, NOTIFICATION_READ_EVENT } from '../../../modules/notifications/services/notificationService';
import styles from './NotificationBadge.module.css';

export function NotificationBadge() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchCount = async () => {
      try {
        const unread = await getUnreadCount(user.id);
        if (isMounted) {
          setCount(unread);
        }
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };

    fetchCount();

    // Poll every 30 seconds matching other realtime workarounds
    const interval = setInterval(fetchCount, 30000);

    window.addEventListener(NOTIFICATION_READ_EVENT, fetchCount);
    window.addEventListener('focus', fetchCount);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener(NOTIFICATION_READ_EVENT, fetchCount);
      window.removeEventListener('focus', fetchCount);
    };
  }, [user]);

  if (count === 0) return null;

  const displayCount = count > 9 ? '9+' : count;

  return (
    <div className={styles.badge}>
      {displayCount}
    </div>
  );
}
