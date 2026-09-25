import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { UserRole } from '../../../../core/auth/types';
import { ROUTES } from '../../../../routing/routes';
import { supabase } from '../../../../core/database/supabaseClient';
import { config } from '../../../../core/config';
import { validatePassword } from '../../utils/validation';
import { useCapsLockDetection } from '../../hooks/useCapsLockDetection';
import { RoleSelector } from '../../../../shared/components/RoleSelector/RoleSelector';
import styles from './SignUpScreen.module.css';

export function SignUpScreen() {
  const navigate = useNavigate();
  const { setUser, signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Athlete);
  const [error, setError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { capsLockOn, handleKeyDown, handleKeyUp, clearCapsLock } = useCapsLockDetection();

  // ── Password strength helpers ──────────────────────────────────────────────
  const validationResults = validatePassword(password);
  
  const criteria = [
    { label: 'At least 8 characters', met: validationResults.length },
    { label: 'One uppercase letter (A–Z)', met: validationResults.uppercase },
    { label: 'One lowercase letter (a–z)', met: validationResults.lowercase },
    { label: 'One number (0–9)', met: validationResults.number },
    { label: 'One special character (!@#$…)', met: validationResults.symbol },
  ];

  const isPasswordValid = Object.values(validationResults).every(Boolean);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet the requirements. Please check the checklist below.');
      return;
    }

    try {
      await signUp(fullName, email, password, selectedRole);
      // Redirect to Verify Email (do not authenticate yet)
      navigate(ROUTES.VERIFY_EMAIL, { state: { email } });
    } catch (err: any) {
      // Friendly message if Supabase rejects server-side
      setError(err.message || 'We could not create your account at this time. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${config.appUrl}${ROUTES.AUTH_CALLBACK}`,
        }
      });
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.appShell}>
        {/* Top App Bar */}
        <header className={styles.appBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(ROUTES.LOGIN)}
            aria-label="Back to Login"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12,19 5,12 12,5" />
            </svg>
          </button>
          <h2 className={styles.appBarTitle}>Create Account</h2>
        </header>

        {/* Scrollable Form Area */}
        <form className={styles.formContent} onSubmit={handleSignUp}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          {/* Full Name input */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Email input */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password input */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputContainer}>
              <input
                type="password"
                className={styles.input}
                placeholder="Create a password"
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

            {/* Caps Lock warning — password field */}
            {capsLockOn && passwordFocused && (
              <div className={styles.capsLockWarning} role="alert" aria-live="polite">
                <span className={styles.warningIcon} aria-hidden="true">warning</span>
                Caps Lock is on
              </div>
            )}

            {/* NON-STITCH EXCEPTION (Law Two): the password strength rules and the
                Caps Lock indicator below are not present in the Stitch Sign Up
                design (screen 1ecbe3fbb0e64da187c25f35ed61722b, re-checked
                2026-09-22). Built directly against tokens.css per project
                convention for functionality Stitch does not cover. */}
            {/* Real-time requirements indicator */}
            <div className={styles.strengthSection}>
              {/* Per-criterion checklist */}
              <ul className={styles.criteriaList} aria-label="Password requirements">
                {criteria.map((c) => {
                  // Do not show unmet rules as errors before the user has typed anything.
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

          <RoleSelector 
            selectedRole={selectedRole} 
            onChange={setSelectedRole} 
          />

          {/* Action button & terms */}
          <div className={styles.actionContainer}>
            {/* NON-STITCH EXCEPTION (Law Two): Google Login (Stitch lacked Google button for Sign Up) */}
            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <span className={styles.dividerText}>Or continue with</span>
            </div>

            <button type="button" className={styles.socialBtn} onClick={handleGoogleLogin}>
              <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
              </svg>
              Google
            </button>

            <button type="submit" className={styles.submitBtn}>
              Create Account
            </button>
            <p className={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Link to={ROUTES.TERMS} className={styles.termsLink}>Terms of Service</Link> and{' '}
              <Link to={ROUTES.PRIVACY} className={styles.termsLink}>Privacy Policy</Link>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
