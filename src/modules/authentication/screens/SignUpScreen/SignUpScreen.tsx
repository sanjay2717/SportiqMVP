import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { UserRole } from '../../../../core/auth/types';
import { ROUTES } from '../../../../routing/routes';
import { validatePassword } from '../../utils/validation';
import { useCapsLockDetection } from '../../hooks/useCapsLockDetection';
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

          {/* Role Selection Grid */}
          <div className={styles.roleContainer}>
            <p className={styles.roleSectionTitle}>Select your role</p>
            <div className={styles.roleGrid}>
              {/* Athlete */}
              <button
                type="button"
                className={`${styles.roleBtn} ${selectedRole === UserRole.Athlete ? styles.roleBtnSelected : ''}`}
                onClick={() => setSelectedRole(UserRole.Athlete)}
              >
                <svg className={styles.roleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
                <span className={styles.roleLabel}>Athlete</span>
              </button>

              {/* Coach */}
              <button
                type="button"
                className={`${styles.roleBtn} ${selectedRole === UserRole.Coach ? styles.roleBtnSelected : ''}`}
                onClick={() => setSelectedRole(UserRole.Coach)}
              >
                <svg className={styles.roleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 22a10 10 0 0 1 20 0" />
                  <circle cx="12" cy="10" r="4" />
                  <path d="M12 2v2" />
                </svg>
                <span className={styles.roleLabel}>Coach</span>
              </button>

              {/* Organiser */}
              <button
                type="button"
                className={`${styles.roleBtn} ${selectedRole === UserRole.Organiser ? styles.roleBtnSelected : ''}`}
                onClick={() => setSelectedRole(UserRole.Organiser)}
              >
                <svg className={styles.roleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className={styles.roleLabel}>Organiser</span>
              </button>

              {/* Official */}
              <button
                type="button"
                className={`${styles.roleBtn} ${selectedRole === UserRole.Government ? styles.roleBtnSelected : ''}`}
                onClick={() => setSelectedRole(UserRole.Government)}
              >
                <svg className={styles.roleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 22v-6a8 8 0 0 1 16 0v6" />
                  <path d="M6 6a6 6 0 1 1 12 0" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                </svg>
                <span className={styles.roleLabel}>Govt Official</span>
              </button>
            </div>
          </div>

          {/* Action button & terms */}
          <div className={styles.actionContainer}>
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
