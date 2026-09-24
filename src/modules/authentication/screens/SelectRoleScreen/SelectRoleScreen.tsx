import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { UserRole } from '../../../../core/auth/types';
import { ROUTES } from '../../../../routing/routes';
import { supabase } from '../../../../core/database/supabaseClient';
import { RoleSelector } from '../../../../shared/components/RoleSelector/RoleSelector';
import styles from './SelectRoleScreen.module.css';

export function SelectRoleScreen() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select a role to continue.');
      return;
    }
    
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      // UPDATEs profiles.role for the current user ONLY. 
      // Do NOT set onboarding_complete to anything — leave it exactly as the DB default
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();

      // Navigate downstream
      if (selectedRole === UserRole.Athlete) {
        navigate(ROUTES.SELECT_SPORTS);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (err: any) {
      console.error('Failed to update role:', err);
      setError('We could not save your role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.appShell}>
        <header className={styles.appBar}>
          <h2 className={styles.appBarTitle}>Choose Your Role</h2>
        </header>

        <main className={styles.content}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Welcome to SportIQ!</h1>
            <p className={styles.subtitle}>
              We noticed you signed in with Google. How will you be using the platform?
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.formGroup}>
            {error && <div className={styles.errorAlert}>{error}</div>}

            <RoleSelector 
              selectedRole={selectedRole} 
              onChange={setSelectedRole} 
            />

            <div className={styles.actionContainer}>
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={!selectedRole || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
