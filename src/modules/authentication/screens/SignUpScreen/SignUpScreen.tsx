import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { UserRole } from '../../../../core/auth/types';
import { ROUTES } from '../../../../routing/routes';
import styles from './SignUpScreen.module.css';

export function SignUpScreen() {
  const navigate = useNavigate();
  const { setUser, signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Athlete);
  const [error, setError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [confirmCapsLockOn, setConfirmCapsLockOn] = useState(false);

  // ── Password strength helpers ──────────────────────────────────────────────
  const criteria = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number (0–9)', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One special character (!@#$…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  const metCount = criteria.filter((c) => c.test(password)).length;

  const strengthLabel =
    password.length === 0
      ? null
      : metCount <= 2
      ? 'Weak'
      : metCount <= 4
      ? 'Medium'
      : 'Strong';

  const strengthClass =
    strengthLabel === 'Weak'
      ? styles.strengthWeak
      : strengthLabel === 'Medium'
      ? styles.strengthMedium
      : strengthLabel === 'Strong'
      ? styles.strengthStrong
      : '';

  const isPasswordValid = metCount === criteria.length;

  // ── Caps Lock detection ────────────────────────────────────────────────────
  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleConfirmPasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setConfirmCapsLockOn(e.getModifierState('CapsLock'));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet the strength requirements. Please check the checklist below the password field.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await signUp(fullName, email, password, selectedRole);
      // Redirect to Verify Email (do not authenticate yet)
      navigate(ROUTES.VERIFY_EMAIL, { state: { email } });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                onKeyDown={handlePasswordKeyDown}
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

            {/* Caps Lock warning — password field */}
            {capsLockOn && passwordFocused && (
              <div className={styles.capsLockWarning} role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Caps Lock is on
              </div>
            )}

            {/* Real-time strength indicator — shown once user starts typing */}
            {password.length > 0 && (
              <div className={styles.strengthSection}>
                {/* Bar */}
                <div className={styles.strengthBarTrack}>
                  <div
                    className={`${styles.strengthBarFill} ${strengthClass}`}
                    style={{ width: `${(metCount / criteria.length) * 100}%` }}
                  />
                </div>
                {strengthLabel && (
                  <span className={`${styles.strengthLabel} ${strengthClass}`}>
                    {strengthLabel}
                  </span>
                )}
                {/* Per-criterion checklist */}
                <ul className={styles.criteriaList} aria-label="Password requirements">
                  {criteria.map((c) => {
                    const met = c.test(password);
                    return (
                      <li
                        key={c.label}
                        className={`${styles.criteriaItem} ${met ? styles.criteriaMet : styles.criteriaUnmet}`}
                      >
                        <span className={styles.criteriaIcon} aria-hidden="true">
                          {met ? '✓' : '○'}
                        </span>
                        {c.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password input */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.inputContainer}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleConfirmPasswordKeyDown}
                onBlur={() => setConfirmCapsLockOn(false)}
                required
              />
              <button
                type="button"
                className={styles.visibilityToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
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

            {/* Caps Lock warning — confirm field */}
            {confirmCapsLockOn && (
              <div className={styles.capsLockWarning} role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Caps Lock is on
              </div>
            )}
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
