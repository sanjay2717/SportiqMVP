import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../core/database/supabaseClient';
import { ROUTES } from '../../../../routing/routes';
import { Skeleton } from '../../../../shared/components/Skeleton/Skeleton';
import styles from './OrganizationDirectoryScreen.module.css';

interface Organization {
  id: string;
  full_name: string;
  location: string | null;
  avatar_url: string | null;
}

export function OrganizationDirectoryScreen() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, location, avatar_url')
          .eq('role', 'organiser');

        if (error) throw error;
        setOrganizations(data || []);
      } catch (err) {
        setError('Failed to fetch organizations.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchOrgs();
  }, []);

  // REAL DATA: This screen queries actual 'profiles' with role='organiser'

  return (
    <main className={styles.container}>
      <section className={styles.headerSection}>
        <div>
          <h2 className={styles.title}>Organization Directory</h2>
          <p className={styles.subtitle}>Search and filter registered sports organizations across regions.</p>
        </div>

        <div className={styles.searchBar}>
          <div className={styles.inputWrapper}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
            <input 
              className={styles.searchInput} 
              placeholder="Search academies, clubs, federations..." 
              type="text"
            />
          </div>
          <div className={styles.divider}></div>
          <div className={styles.filtersWrapper}>
            <button className={styles.filterBtnOutline}>
              <span className={`material-symbols-outlined ${styles.filterIcon}`}>filter_list</span>
              Filters
            </button>
            <button className={styles.filterBtnActive}>All Regions</button>
            <button className={styles.filterBtnOutline}>Academies</button>
          </div>
        </div>
      </section>

      <div className={styles.contentLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>Refine Search</h3>
            <div className={styles.sidebarGroup}>
              <h4 className={styles.sidebarLabel}>Type</h4>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked className={styles.checkbox} /> Academy
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked className={styles.checkbox} /> Club
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} /> Federation
                </label>
              </div>
            </div>
          </div>
        </aside>

        <section className={styles.mainContent}>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsCount}>Showing {organizations.length} organizations</span>
            <button className={styles.sortBtn}>
              Sort by: Relevance
              <span className={`material-symbols-outlined ${styles.sortIcon}`}>keyboard_arrow_down</span>
            </button>
          </div>

          <div className={styles.grid}>
            {isLoading && (
              <>
                {[1, 2, 3, 4, 5, 6].map((key) => (
                  <div key={key} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.avatarWrapper}>
                         <Skeleton width="100%" height="100%" variant="circular" />
                      </div>
                      <div className={styles.cardInfo}>
                        <div className={styles.cardInfoTop}>
                          <Skeleton width="80px" height="24px" style={{ borderRadius: '100px' }} />
                          <Skeleton width="160px" height="24px" style={{ marginTop: '8px' }} />
                        </div>
                        <Skeleton width="120px" height="20px" style={{ marginTop: '8px' }} />
                      </div>
                    </div>
                    <div className={styles.cardFooter}>
                      <Skeleton width="100%" height="40px" variant="rectangular" style={{ borderRadius: '100px' }} />
                    </div>
                  </div>
                ))}
              </>
            )}
            {error && <p className={styles.errorText}>{error}</p>}
            {!isLoading && !error && organizations.length === 0 && (
              <p>No organizations found.</p>
            )}
            {!isLoading && (
              <div className="animate-fade-in" style={{ display: 'contents' }}>
                {organizations.map((org) => (
                  <div key={org.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.avatarWrapper}>
                        {org.avatar_url ? (
                          <img src={org.avatar_url} alt={org.full_name} className={styles.avatar} />
                        ) : (
                          <span className={`material-symbols-outlined ${styles.fallbackIcon}`}>corporate_fare</span>
                        )}
                      </div>
                      <div className={styles.cardInfo}>
                        <div className={styles.cardInfoTop}>
                          <div className={styles.tags}>
                            <span className={styles.tag}>Organization</span>
                          </div>
                          <h3 className={styles.orgName}>{org.full_name}</h3>
                        </div>
                        <p className={styles.location}>
                          <span className={`material-symbols-outlined ${styles.locationIcon}`}>location_on</span>
                          {org.location || 'Unknown Location'}
                        </p>
                      </div>
                    </div>
                    <div className={styles.cardFooter}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => navigate(ROUTES.ORGANIZATION_DETAIL.replace(':id', org.id))}
                        type="button"
                      >
                        View Organization
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
