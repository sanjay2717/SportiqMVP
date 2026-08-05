import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AssignTrainingScreen.module.css';

export function AssignTrainingScreen() {
  const [showDbAlert, setShowDbAlert] = useState(false);
  const navigate = useNavigate();

  const handleAssignTraining = (e: React.FormEvent) => {
    e.preventDefault();
    // Honest UI fallback since there is no backend table for training_sessions yet
    setShowDbAlert(true);
  };

  return (
    <main className={styles.container}>
      {/* Left Column: Assignment Form */}
      <div className={styles.formColumn}>
        <div className={styles.header}>
          <h2 className={styles.title}>Assign Training</h2>
          <p className={styles.subtitle}>Create and distribute custom training modules to your athletes.</p>
        </div>

        {showDbAlert && (
          <div className={styles.alert}>
            <span className={`material-symbols-outlined ${styles.alertIcon}`}>warning</span>
            <p className={styles.alertText}>
              <strong>Not Connected:</strong> The training sessions database table does not exist yet. This form is currently in a visual mockup state for the MVP.
            </p>
          </div>
        )}

        <form className={styles.formGroup} onSubmit={handleAssignTraining}>
          {/* Training Details Group */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Training Details</h3>
            <div className={styles.formGroup}>
              <div className={styles.fieldWrapper}>
                <label className={styles.fieldLabel}>Training Title</label>
                <input 
                  className={styles.textInput} 
                  type="text" 
                  placeholder="e.g., Anaerobic Sprint Intervals" 
                />
              </div>

              <div className={styles.fieldWrapper}>
                <label className={styles.fieldLabel}>Description & Goals</label>
                <textarea 
                  className={styles.textArea} 
                  rows={3} 
                  placeholder="Outline the key objectives and specific focus areas for this session..."
                ></textarea>
              </div>

              <div className={styles.gridFields}>
                {/* Intensity Level */}
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>Intensity Level</label>
                  <div className={styles.segmentedControl}>
                    <button type="button" className={styles.segmentBtn}>Recovery</button>
                    <button type="button" className={`${styles.segmentBtn} ${styles.segmentBtnActive}`}>Moderate</button>
                    <button type="button" className={styles.segmentBtn}>Maximum</button>
                  </div>
                </div>

                {/* Duration Picker */}
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>Est. Duration</label>
                  <div className={styles.selectWrapper}>
                    <select className={styles.selectInput} defaultValue="45 Minutes">
                      <option>30 Minutes</option>
                      <option>45 Minutes</option>
                      <option>60 Minutes</option>
                      <option>90 Minutes</option>
                      <option>120+ Minutes</option>
                    </select>
                    <span className={`material-symbols-outlined ${styles.selectIcon}`}>expand_more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Athlete Selection */}
          <div className={styles.sectionCard}>
            <div className={styles.headerRow}>
              <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Select Athletes</h3>
              <button type="button" className={styles.selectAllBtn}>Select All</button>
            </div>
            
            <div className={styles.searchWrapper}>
              <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
              <input 
                className={styles.searchInput} 
                type="text" 
                placeholder="Search by name, position, or team..." 
              />
            </div>

            <div className={styles.chipsScroll}>
              {/* Athlete Chips */}
              <button type="button" className={`${styles.chip} ${styles.chipActive}`}>
                <img 
                  className={styles.chipAvatar} 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD01ZedSz6V3VpE3_6C4SMffIV1PRhBQU3dR20LOF6JQqyXcnrXj0sq0dkfzGj9Lg3D1D4h4HYL-MluD5270e0UMDAuFK3FgTY4Q1pZ_XZ2CENuJ_U0ag-s3ZwvflBmBlFKd9yt3DKIT53OCCtc1K8JDFbzuE8k4f5A2UBi1PMyMn-4pFi_wVZiYgi1IN3nI7WvkRMY8g7N2BAYIQhrlPmQWTBnzYPlyaYrIVKZjfTLr7Cs4ZID9fQS2BybFHJhzpGBAH0udr3m2Rc" 
                  alt="J. Doe" 
                />
                <span className={styles.chipLabel}>J. Doe</span>
                <span className={`material-symbols-outlined ${styles.chipClose}`}>close</span>
              </button>
              <button type="button" className={styles.chip}>
                <div className={styles.chipInitials}>SM</div>
                <span className={styles.chipLabel}>S. Miller</span>
              </button>
              <button type="button" className={styles.chip}>
                <img 
                  className={styles.chipAvatar} 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAUsRVjRAVbm8-lAu13rdUsTJ2YUQLaE9n45eZI5FO8s8px6DZzanNEEtxEe3tIM6VmEyUoVP6WQaWuTZXyc2Vk9PzbFuZb0gDeOX6X_1ZD5aBwB0z8kLeWHbb8-5zfcjCphyByeKl01m8vrRijU3seEtVpYy8F6cDu9ap2LrSmDTWlZca_bK5oRzNQBIUrhAeF3dLsVOS5mxM99l_hupVO_-ESmNRr1FJzjUomfg5ETSfFcTyFUactV2qCKCyXr5CDoXtRLpkkW4" 
                  alt="A. Chen" 
                />
                <span className={styles.chipLabel}>A. Chen</span>
              </button>
            </div>
          </div>

          {/* Attachments */}
          <div className={styles.gridFields}>
            <button type="button" className={styles.attachmentBtn}>
              <div className={styles.attachmentIconBox}>
                <span className={`material-symbols-outlined ${styles.attachmentIcon}`}>upload_file</span>
              </div>
              <span className={styles.attachmentTitle}>Attach Files</span>
              <span className={styles.attachmentSub}>PDF, MP4, JPG</span>
            </button>

            <button type="button" className={`${styles.attachmentBtn} ${styles.recordBtn}`}>
              <div className={styles.recordWave}></div>
              <div className={`${styles.attachmentIconBox} ${styles.recordIconBox}`}>
                <span className={`material-symbols-outlined ${styles.recordIcon}`}>mic</span>
              </div>
              <span className={styles.attachmentTitle} style={{ color: 'var(--color-text-primary)' }}>Record Voice Note</span>
              <span className={styles.attachmentSub}>Hold to speak</span>
            </button>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className={styles.draftBtn}>Save Draft</button>
            <button type="submit" className={styles.submitBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
              Assign Training
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Recent Activity */}
      <div className={styles.historyColumn}>
        <h3 className={styles.sectionTitle}>Recent Assignments</h3>
        <div className={styles.historyList}>
          {/* Activity Card 1 */}
          <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
              <div className={styles.statusWrapper}>
                <div className={`${styles.statusDot} ${styles.statusDotActive}`}></div>
                <span className={styles.statusLabel}>In Progress</span>
              </div>
              <span className={styles.activityTime}>2h ago</span>
            </div>
            <h4 className={styles.activityTitle}>Pre-Match Mobility</h4>
            <p className={styles.activityDesc}>Assigned to: First Team Squad</p>
            <div className={styles.activityFooter}>
              <div className={styles.avatarStack}>
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDinCl2YCXcodrjMJPWTzhWOfP4U2kqk2YUJU6uG6sjDhJKTHP60S3DYLRtsJB1DuGSuquvB6IXLGKx3PGMEZDN-KyLYU4ampQc3-V_s_GkNZL_m5_ZhCwCVY4s6LlFGkfeOTObdus8g_1zOnPe3DWVT6OzLQ5Y24N1Nhck6dbY_U2cG71xZcWOp57MHJWs74bJDP-FCQWAErbv5nv-1-4fi7VCh4HTOfCJb3yVyfcGmfVNI6hP1w9QKQzuSPlqgBOrEL-IqOTduyM" alt="Athlete" />
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYtPXVDQ3_jQzYqvkgTBS2L4NHlNnFHSW0h9fctYui8lnBxZ4Qkxtx-khOSGH4-S_XIIDZFBPSnv5shaa1UkUUzNxOI0wZkH6jl7EzO-qQqg4_cVRJcKhvOXlTB3d3eaeOpbBfuRg3kdyDX7LPyuq6VZgdNMu40U2YOfD4HFBA3TLBMsZj1Oy5AO4MJIA8oZ_suYN78i23A8q2_FoiRnDAf3V3u6UDdqsddw4v-jpFurro31zbcsn9j-8yoGNZnOL-TST7jYvolQ4" alt="Athlete" />
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSuawxNNg20k4zw54OTGB6NHSHYs8OdBwVDqQ1cAsHTNhFXUsDuvUGWSNTKEg2ry12d4tBOaH5xhDVFzONGYryYV_E4hMVBRb-Of9zHbEcPTcqFIBzfaWd70zunPUO04wWlspq23sK8LxSwRg5eY0ZSp05PDRdu6hsplbKAjW7htKnpi5lqYkwicKO_Qx9wrvzTOxVmEGk8-c1hK7kjReTxZhiKaPb3bMdt6fFJD7p8cit4Vt42B-72j-cUoqUBx5jErNYuvWl3I4" alt="Athlete" />
                <div className={styles.avatarStackMore}>+8</div>
              </div>
              <span className={styles.completionBadge}>80% Completion</span>
            </div>
          </div>

          {/* Activity Card 2 */}
          <div className={`${styles.activityCard} ${styles.activityCardCompleted}`}>
            <div className={styles.activityHeader}>
              <div className={styles.statusWrapper}>
                <div className={`${styles.statusDot} ${styles.statusDotCompleted}`}></div>
                <span className={styles.statusLabel}>Completed</span>
              </div>
              <span className={styles.activityTime}>Yesterday</span>
            </div>
            <h4 className={styles.activityTitle}>Core Strength V2</h4>
            <p className={styles.activityDesc}>Assigned to: J. Doe</p>
            <div className={styles.activityFooter}>
              <div className={styles.viewMetrics}>
                <span className={`material-symbols-outlined ${styles.viewMetricsIcon}`}>bar_chart</span>
                <span className={styles.statusLabel}>View Metrics</span>
              </div>
            </div>
          </div>
        </div>
        <button type="button" className={styles.viewAllBtn}>View All History</button>
      </div>
    </main>
  );
}
