import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { UserRole } from '../../../../core/auth/types';
import { ROUTES } from '../../../../routing/routes';
import { supabase } from '../../../../core/database/supabaseClient';
import { config } from '../../../../core/config';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import styles from './LoginScreen.module.css';

export function LoginScreen() {
  const navigate = useNavigate();
  const { setUser, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      await login(email, password);
      // Let AuthProvider handle session/user syncing
      navigate(ROUTES.HOME);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const isNative = Capacitor.isNativePlatform();
      const redirectTo = isNative ? 'com.sportiq.app://auth/callback' : `${config.appUrl}${ROUTES.AUTH_CALLBACK}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative
        }
      });
      
      if (error) throw error;
      
      if (isNative && data?.url) {
        await Browser.open({ url: data.url });
      }
    } catch (err: any) {
      setError(err.message || 'Google login failed. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.card}>
        <header className={styles.header}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUa4Z3rL-97NHfHaL4jD1PLi96IC1obZJgajDwrh6Gs14WwDzgWXQBa7R7HhNFMp0rwJSykded-IB870wUZPaoeEqbEKW3bdB0NLRI9evFnJY_pSE7yh9hVjBoQRS6j2_J79QC4ZGBYPIYB3WVGt3RIJ_w6pkKb6jg2w2OhSgKJ0tX5W-_3Zu5_7WNU412cY81ynFjXVNzMokS1rUyy8VBTMSAWPg6PfK3qDS0nUmUykO7OgYw19DustUDzK7P8HiewaJliBczwUQ"
            alt="SportIQ Logo"
            className={styles.logo}
          />
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your SportIQ workspace.</p>
        </header>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form className={styles.form} onSubmit={handleLogin}>
          {/* Email field */}
          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <div className={styles.inputContainer}>
              <div className={styles.inputIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="athlete@sportiq.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className={styles.fieldGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputContainer}>
              <div className={styles.inputIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.visibilityToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Options row */}
          <div className={styles.optionsRow}>
            <label className={styles.rememberMeLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className={styles.rememberMeText}>Remember Me</span>
            </label>
            <Link to={ROUTES.FORGOT_PASSWORD} className={styles.forgotPassword}>Forgot Password?</Link>
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.submitBtn}>
            Login
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <span className={styles.dividerText}>Or continue with</span>
        </div>

        {/* Google Login */}
        <button type="button" className={styles.socialBtn} onClick={handleGoogleLogin}>
          <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
          </svg>
          Google
        </button>

        {/* Footer Link */}
        <div className={styles.footer}>
          Don't have an account? <Link to={ROUTES.SIGNUP} className={styles.footerLink}>Sign Up</Link>
        </div>
      </main>

      {/* Background patterns */}
      <div className={styles.backgroundPatterns}>
        <div className={styles.patternTop}></div>
        <div className={styles.patternBottom}></div>
      </div>
    </div>
  );
}
