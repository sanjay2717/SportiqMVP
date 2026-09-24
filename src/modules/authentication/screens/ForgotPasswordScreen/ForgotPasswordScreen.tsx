import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../../../routing/routes';
import { supabase } from '../../../../core/database/supabaseClient';
import { isValidEmail } from '../../utils/validation';
import styles from './ForgotPasswordScreen.module.css';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
      });

      if (resetError) {
        throw resetError;
      }
      
      // Supabase does not return an error for non-existent emails to prevent enumeration.
      // Success here means the request was processed, and IF the email exists, an email was sent.
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Password reset request failed:', err);
      // Handle genuine network or rate limit errors distinctively
      setError(
        err.message?.toLowerCase().includes('rate limit') 
          ? 'Too many requests. Please wait a moment and try again.' 
          : 'We encountered a network issue. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Ambient Background Effect */}
      <div className={styles.ambientBackground}>
        <div className={styles.ambientBlobPrimary}></div>
        <div className={styles.ambientBlobSecondary}></div>
      </div>

      <main className={styles.mainContent}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <h1 className={styles.brandTitle}>SportIQ</h1>
        </div>

        {/* Content Card */}
        <div className={styles.card}>
          {isSuccess ? (
            <div className={styles.successState}>
              <div className={styles.iconContainer}>
                <span className={`material-symbols-outlined ${styles.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  mark_email_read
                </span>
              </div>
              <h2 className={styles.title}>Link Sent!</h2>
              <p className={styles.subtitle}>
                If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
              </p>
              <p className={styles.subtitle} style={{ marginTop: 'var(--spacing-4)', color: 'var(--color-primary-400)' }}>
                Didn't see it? Check your spam or junk folder — the link usually arrives within a few minutes.
              </p>
              <div className={styles.backToLoginContainer}>
                <Link to={ROUTES.LOGIN} className={styles.backToLoginLink}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Security Icon */}
              <div className={styles.iconContainer}>
                <span className={`material-symbols-outlined ${styles.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock_reset
                </span>
              </div>

              {/* Headers & Text */}
              <div className={styles.textCenter}>
                <h2 className={styles.title}>Reset Password</h2>
                <p className={styles.subtitle}>
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              {error && <div className={styles.errorAlert}>{error}</div>}

              {/* Form */}
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.srOnly} style={{ display: 'none' }}>Email Address</label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIconContainer}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-neutral-600)' }}>
                        mail
                      </span>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={styles.inputField}
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Link'}
                  {!isSubmitting && <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>}
                </button>
              </form>

              {/* Back to Login Link */}
              <div className={styles.backToLoginContainer}>
                <Link to={ROUTES.LOGIN} className={styles.backToLoginLink}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Subtle Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Securely managed by SportIQ Authentication
          </p>
        </div>
      </main>
    </div>
  );
}
