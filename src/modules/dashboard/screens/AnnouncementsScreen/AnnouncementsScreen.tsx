import React, { useState } from 'react';
import styles from './AnnouncementsScreen.module.css';

export function AnnouncementsScreen() {
  const [showModal, setShowModal] = useState(false);
  const [showDbAlert, setShowDbAlert] = useState(false);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDbAlert(true);
  };

  return (
    <main className={styles.container}>
      {/* Pinned Updates Section */}
      <section className={styles.section} aria-labelledby="pinned-updates-title">
        <div className={styles.sectionHeader}>
          <span className={`material-symbols-outlined ${styles.sectionIcon}`} style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>
          <h2 className={styles.sectionTitle} id="pinned-updates-title">Pinned Updates</h2>
        </div>
        <div className={styles.grid}>
          {/* Pinned Card 1 */}
          <article className={`${styles.card} ${styles.cardPinned}`}>
            <div className={styles.cardBorderLeftError}></div>
            <div className={styles.cardHeader}>
              <span className={`${styles.badge} ${styles.badgeUrgent}`}>Urgent</span>
              <time className={styles.time} dateTime="2023-10-25T14:30">14:30 Today</time>
            </div>
            <h3 className={styles.cardTitle}>Venue Change: U18 Finals</h3>
            <p className={styles.cardDesc}>Due to unexpected maintenance at Court 1, the U18 Finals will now be held at the Main Arena. Start time remains unchanged.</p>
          </article>

          {/* Pinned Card 2 */}
          <article className={`${styles.card} ${styles.cardPinned}`}>
            <div className={styles.cardBorderLeftSecondary}></div>
            <div className={styles.cardHeader}>
              <span className={`${styles.badge} ${styles.badgeSchedule}`}>Schedule</span>
              <time className={styles.time} dateTime="2023-10-25T09:00">09:00 Today</time>
            </div>
            <h3 className={styles.cardTitle}>Weather Delay Notice</h3>
            <p className={styles.cardDesc}>All outdoor track events are delayed by 45 minutes due to morning rain. Please check the updated schedule in the app.</p>
          </article>
        </div>
      </section>

      {/* General Notices Section */}
      <section className={styles.section} aria-labelledby="general-notices-title">
        <h2 className={styles.sectionTitle} style={{ marginBottom: 'var(--spacing-4)' }} id="general-notices-title">General Notices</h2>
        <div className={styles.list}>
          {/* General Card 1 */}
          <article className={`${styles.card} ${styles.generalCard}`}>
            <div className={styles.cardIconWrapper}>
              <span className={`material-symbols-outlined ${styles.cardIconPrimary}`} style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardHeaderGeneral}>
                <h3 className={styles.cardTitle}>New Coaching Seminar</h3>
                <time className={styles.time} dateTime="2023-10-24">Yesterday</time>
              </div>
              <p className={styles.cardDesc} style={{ marginBottom: 'var(--spacing-2)' }}>Registration is now open for the advanced tactics seminar next month. Early bird pricing ends Friday.</p>
              <button type="button" className={styles.readMoreBtn}>Read More</button>
            </div>
          </article>

          {/* General Card 2 */}
          <article className={`${styles.card} ${styles.generalCard}`}>
            <div className={styles.cardIconWrapper}>
              <span className={`material-symbols-outlined ${styles.cardIconTertiary}`} style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardHeaderGeneral}>
                <h3 className={styles.cardTitle}>Equipment Room Hours</h3>
                <time className={styles.time} dateTime="2023-10-23">Oct 23</time>
              </div>
              <p className={styles.cardDesc}>The main equipment room will close early at 18:00 this Thursday for inventory check.</p>
            </div>
          </article>

          {/* Image Example Card */}
          <article className={`${styles.card} ${styles.imageCard}`}>
            <div className={styles.imageWrapper}>
              <img 
                className={styles.cardImage} 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDFA3ig2_USP1Zr-xGORmQ4iqkvSgorMcR8-oJRfvQmvlY5668YE3LOsxFlgQi_9jSd3vv2wBS5jRGygvKEcdFR8piij28gS7q9cFc5I2Jxt-G2V-mMVd83zeJ3hhRqnSAXHLh3mqmGglXpY5TW-8YUiXaYgiRL7d9AaXqCqNcpQE6y681rdg6IJGyo8Vgc_PeaxqR5SCY3rGVYB7JRNnU5N8qzo7O8Aw9VMeEs0703EgKFXpjTbZ0LD7_NmgNe4wPqDcNU6KvUBM" 
                alt="Facility" 
              />
            </div>
            <div className={styles.imageCardContent}>
              <div className={styles.imageCardIcon}>
                <span className={`material-symbols-outlined ${styles.cardIconPrimary}`} style={{ fontVariationSettings: "'FILL' 1" }}>sports</span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeaderGeneral}>
                  <h3 className={styles.cardTitle}>New Facility Open</h3>
                  <time className={styles.time} dateTime="2023-10-20">Oct 20</time>
                </div>
                <p className={styles.cardDesc}>The highly anticipated West Wing training center is now open for all senior squads.</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Floating Action Button (Create Announcement) */}
      <button 
        type="button"
        aria-label="Create Announcement" 
        className={styles.fab}
        onClick={() => setShowModal(true)}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>

      {/* Hand-coded Create Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create Announcement</h2>
              <button className={styles.closeBtn} onClick={() => { setShowModal(false); setShowDbAlert(false); }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {showDbAlert && (
              <div className={styles.alert}>
                <span className={`material-symbols-outlined ${styles.alertIcon}`}>warning</span>
                <p className={styles.alertText}>
                  <strong>Not Connected:</strong> The announcements database table does not exist yet. This form is currently in a visual mockup state for the MVP.
                </p>
              </div>
            )}

            <form className={styles.modalForm} onSubmit={handleCreateAnnouncement}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Title</label>
                <input type="text" className={styles.modalInput} placeholder="Enter title..." required />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Content</label>
                <textarea className={styles.modalTextarea} rows={4} placeholder="Type your announcement here..." required></textarea>
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancelBtn} onClick={() => { setShowModal(false); setShowDbAlert(false); }}>Cancel</button>
                <button type="submit" className={styles.modalSubmitBtn}>Post Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
