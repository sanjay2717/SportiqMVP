import { useEffect } from 'react';
import { ThemeProvider } from '../core/theme/ThemeProvider';
import { AuthProvider } from '../core/auth/AuthProvider';
import { NavigationProvider } from '../core/navigation/NavigationProvider';
import { AppRouter } from '../routing/AppRouter';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '../core/database/supabaseClient';

export function App() {
  useEffect(() => {
    let listener: any = null;
    const setupListener = async () => {
      listener = await CapacitorApp.addListener('appUrlOpen', async (event) => {
        const url = event.url;
        
        if (url.includes('auth/callback')) {
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get('code');
          
          if (code) {
            await supabase.auth.exchangeCodeForSession(code);
          } else {
            // Implicit flow fallback
            const hashParams = new URLSearchParams(urlObj.hash.substring(1));
            const access_token = hashParams.get('access_token');
            const refresh_token = hashParams.get('refresh_token');
            if (access_token && refresh_token) {
              await supabase.auth.setSession({ access_token, refresh_token });
            }
          }
          
          await Browser.close();
        }
      });
    };
    setupListener();

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationProvider>
          <AppRouter />
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
