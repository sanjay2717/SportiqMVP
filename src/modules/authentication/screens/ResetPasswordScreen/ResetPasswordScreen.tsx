import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../core/database/supabaseClient';
import { ROUTES } from '../../../../routing/routes';
import { validatePassword } from '../../utils/validation';
import { useCapsLockDetection } from '../../hooks/useCapsLockDetection';
import styles from './ResetPasswordScreen.module.css';

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  const { capsLockOn, handleKeyDown, handleKeyUp, clearCapsLock } = useCapsLockDetection();

  // Validate password
  const validationResults = validatePassword(password);
  
  const criteria = [
    { label: 'At least 8 characters', met: validationResults.length },
    { label: 'One uppercase letter (A–Z)', met: validationResults.uppercase },
    { label: 'One lowercase letter (a–z)', met: validationResults.lowercase },
    { label: 'One number (0–9)', met: validationResults.number },
    { label: 'One special character (!@#$…)', met: validationResults.symbol },
  ];

  const isPasswordValid = Object.values(validationResults).every(Boolean);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Valid recovery session established
        setSessionValid(true);
        setError('');
        clearTimeout(timeoutId);
      }
    });

    // Fallback: If no PASSWORD_RECOVERY event fires within 3 seconds, 
    // proactively block the user and assume the link is dead/missing.
    timeoutId = setTimeout(() => {
      setSessionValid((prev) => {
        if (prev === null) {
          setError('Your password reset link is invalid or has expired.');
          return false;
        }
        return prev;
      });
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password does not meet the requirements.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      // Explicitly sign the user out to destroy the temporary recovery session
      // before they are sent back to the normal Login screen.
      await supabase.auth.signOut();
      
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Password update error:', err);
      // Supabase returns an error if the token is expired or invalid.
      // We handle it gracefully by directing them back to the forgot password flow.
      setError('Your password reset link is invalid or has expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* NON-STITCH EXCEPTION (Law Two): Reset Password screen was not found in Stitch. 
          Built directly using design system tokens following project conventions. */}
      
      <div className={styles.appShell}>
        <header className={styles.appBar}>
          <h2 className={styles.appBarTitle}>Reset Password</h2>
        </header>

        <main className={styles.formContent}>
          {isSuccess ? (
            <div className={styles.successState}>
              <div className={styles.iconContainer}>
                <span className={`material-symbols-outlined ${styles.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <h2 className={styles.title}>Password Updated</h2>
              <p className={styles.subtitle}>
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <button 
                type="button" 
                className={styles.submitBtn} 
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.formGroup}>
              {error && (
                <div className={styles.errorAlert}>
                  {error}
                  {error.includes('expired') && (
                    <div className={styles.requestNewLink}>
                      <button 
                        type="button"
                        onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                        className={styles.textLinkBtn}
                      >
                        Request a new reset link
                      </button>
                    </div>
                  )}
                </div>
              )}

              {sessionValid !== true ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>
                  {error ? null : 'Validating reset link...'}
                </div>
              ) : (
                <>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>New Password</label>
                    <div className={styles.inputContainer}>
                      <input
                        type="password"
                        className={styles.input}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => {
                          setPasswordFocused(false);
                          clearCapsLock();
                        }}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                        required
                      />
                    </div>

                {capsLockOn && passwordFocused && (
                  <div className={styles.capsLockWarning} role="alert" aria-live="polite">
                    <span className={styles.warningIcon} aria-hidden="true">warning</span>
                    Caps Lock is on
                  </div>
                )}

                <div className={styles.strengthSection}>
                  <ul className={styles.criteriaList} aria-label="Password requirements">
                    {criteria.map((c) => {
                      const isMet = c.met;
                      const isPristine = password.length === 0;
                      const itemClass = isMet ? styles.criteriaMet : (isPristine ? styles.criteriaNeutral : styles.criteriaUnmet);
                      const iconName = isMet ? 'check_circle' : 'cancel';
                      
                      return (
                        <li
                          key={c.label}
                          className={`${styles.criteriaItem} ${itemClass}`}
                        >
                          <span className={styles.criteriaIcon} aria-hidden="true">
                            {iconName}
                          </span>
                          {c.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className={styles.actionContainer}>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={!isPasswordValid || isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
                  </div>
                </>
              )}
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
