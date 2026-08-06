import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routes';
import { ProtectedRoute } from './ProtectedRoute';
import { OnboardingGate } from './OnboardingGate';
import { useAuth } from '../core/auth/AuthProvider';
import { WelcomeScreen, SplashScreen, LoginScreen, SignUpScreen, VerifyEmailScreen, ForgotPasswordScreen } from '../modules/authentication/screens';
import { SelectSportsScreen, CreateSportsProfileScreen, ProfilePictureUploadScreen, PersonalInformationScreen, PlayingInformationScreen, ProfileCompletionScreen, OwnProfileScreen, AthletePublicProfileScreen, StatisticsScreen } from '../modules/profile/screens';
import { PlaceholderScreen } from '@shared/components/PlaceholderScreen';
import { AppLayout } from '@shared/layouts/AppLayout';
import { UserRole } from '../core/auth/types';
import { 
  AthleteDashboardScreen, 
  CoachDashboardScreen, 
  OrganiserDashboardScreen, 
  GovernmentDashboardScreen,
  CoachAthleteSearchScreen,
  OrganizationDirectoryScreen,
  OrganizationDetailScreen,
  ReportsScreen,
  LeaderboardsScreen,
  GovernmentAnalyticsScreen,
  AssignTrainingScreen,
  AnnouncementsScreen
} from '../modules/dashboard/screens';


import {
  EventsListScreen,
  CreateEventScreen
} from '../modules/events/screens';

import { NotificationsScreen } from '../modules/notifications/screens';
import { SettingsScreen } from '../modules/settings/screens';

import styles from './Routing.module.css';

// Helper component to redirect authenticated users away from public auth pages
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to={ROUTES.HOME} replace /> : <>{children}</>;
}

export function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect Root to Splash if not authenticated, otherwise Role-Aware Dashboard is loaded */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <ProtectedRoute>
                <OnboardingGate>
                  <AppLayout>
                    <DashboardRouter />
                  </AppLayout>
                </OnboardingGate>
              </ProtectedRoute>
            ) : (
              <Navigate to={ROUTES.SPLASH} replace />
            )
          }
        />

        {/* Public Auth Routes */}
        <Route
          path={ROUTES.WELCOME}
          element={
            <PublicRoute>
              <WelcomeScreen />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.SPLASH}
          element={
            <PublicRoute>
              <SplashScreen />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginScreen />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.SIGNUP}
          element={
            <PublicRoute>
              <SignUpScreen />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.VERIFY_EMAIL}
          element={
            <PublicRoute>
              <VerifyEmailScreen />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.FORGOT_PASSWORD}
          element={
            <PublicRoute>
              <ForgotPasswordScreen />
            </PublicRoute>
          }
        />

        {/* Protected App Routes */}
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <AppLayout>
                <OwnProfileScreen />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.STATISTICS}
          element={
            <ProtectedRoute>
              <AppLayout>
                <StatisticsScreen />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EDIT_PROFILE}
          element={
            <ProtectedRoute>
              <AppLayout>
                <PlaceholderScreen title="Edit Profile" description="Edit profile will be implemented here." />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SELECT_SPORTS}
          element={
            <ProtectedRoute>
              <SelectSportsScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CREATE_SPORTS_PROFILE}
          element={
            <ProtectedRoute>
              <CreateSportsProfileScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE_PICTURE_UPLOAD}
          element={
            <ProtectedRoute>
              <ProfilePictureUploadScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PERSONAL_INFORMATION}
          element={
            <ProtectedRoute>
              <PersonalInformationScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PLAYING_INFORMATION}
          element={
            <ProtectedRoute>
              <PlayingInformationScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE_COMPLETION}
          element={
            <ProtectedRoute>
              <ProfileCompletionScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SEARCH}
          element={
            <ProtectedRoute>
              <AppLayout>
                <PlaceholderScreen title="Search" description="Search will be implemented here." />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MESSAGES}
          element={
            <ProtectedRoute>
              <AppLayout>
                <PlaceholderScreen title="Messages" description="Messaging will be implemented here." />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route 
          path={ROUTES.NOTIFICATIONS} 
          element={
            <ProtectedRoute>
              <AppLayout>
                <NotificationsScreen />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTES.SETTINGS} 
          element={
            <ProtectedRoute>
              <AppLayout>
                <SettingsScreen />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* Quick Actions Temporary Placeholders */}
        <Route path={ROUTES.ASSIGN_TRAINING} element={<ProtectedRoute><AppLayout><AssignTrainingScreen /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.MY_ATHLETES} element={<ProtectedRoute><AppLayout><CoachAthleteSearchScreen /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.ANNOUNCEMENTS} element={<ProtectedRoute><AppLayout><AnnouncementsScreen /></AppLayout></ProtectedRoute>} />
        
        {/* Events Module */}
        <Route path={ROUTES.EVENTS} element={<ProtectedRoute><AppLayout><EventsListScreen /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.CREATE_EVENT} element={<ProtectedRoute><AppLayout><CreateEventScreen /></AppLayout></ProtectedRoute>} />
        
        <Route path={ROUTES.CREATE_TOURNAMENT} element={<ProtectedRoute><AppLayout><PlaceholderScreen title="Coming Soon" description="// TODO: replace with real Create Tournament screen" /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.APPROVALS} element={<ProtectedRoute><AppLayout><PlaceholderScreen title="Approvals" description="// TODO: replace with real Approvals screen" /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.TEAM_MANAGEMENT} element={<ProtectedRoute><AppLayout><PlaceholderScreen title="Coming Soon" description="// TODO: replace with real Team Management screen" /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.ATHLETE_DIRECTORY} element={<ProtectedRoute><AppLayout><CoachAthleteSearchScreen /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.ATHLETE_PUBLIC_PROFILE} element={<ProtectedRoute><AppLayout><AthletePublicProfileScreen /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.ORGANIZATION_DIRECTORY} element={<ProtectedRoute><AppLayout><OrganizationDirectoryScreen /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.ORGANIZATION_DETAIL} element={<ProtectedRoute><AppLayout><OrganizationDetailScreen /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.REPORTS} element={<ProtectedRoute><AppLayout><PlaceholderScreen title="Coming Soon" description="// TODO: replace with real Reports screen" /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.LEADERBOARDS} element={<ProtectedRoute><AppLayout><PlaceholderScreen title="Coming Soon" description="// TODO: replace with real Leaderboards screen" /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.ACHIEVEMENTS} element={<ProtectedRoute><AppLayout><PlaceholderScreen title="Achievements" description="// TODO: replace with real Achievements screen" /></AppLayout></ProtectedRoute>} />
        
        <Route path={ROUTES.SCHEDULE} element={<ProtectedRoute><AppLayout><PlaceholderScreen title="Schedule" description="// TODO: replace with real Schedule screen" /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.TOURNAMENTS} element={<ProtectedRoute><AppLayout><PlaceholderScreen title="Tournaments" description="// TODO: replace with real Tournaments screen" /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.ANALYTICS} element={<ProtectedRoute><AppLayout><PlaceholderScreen title="Coming Soon" description="// TODO: replace with real Analytics screen" /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.POSTS} element={<ProtectedRoute><AppLayout><PlaceholderScreen title="Posts" description="// TODO: replace with real Posts screen" /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.NETWORK} element={<ProtectedRoute><AppLayout><PlaceholderScreen title="Network" description="// TODO: replace with real Network screen" /></AppLayout></ProtectedRoute>} />
        <Route path={ROUTES.CREATE} element={<ProtectedRoute><AppLayout><PlaceholderScreen title="Create Post — Coming Soon" description="Post creation will live here." /></AppLayout></ProtectedRoute>} />

        {/* Fallback */}
        <Route
          path="*"
          element={<PlaceholderScreen title="Not Found" description="This page does not exist." />}
        />
      </Routes>
    </BrowserRouter>
  );
}

// Role-aware dashboard routing
function DashboardRouter() {
  const { user } = useAuth();
  
  switch (user?.role) {
    case UserRole.Athlete:
      return <AthleteDashboardScreen />;
    case UserRole.Coach:
      return <CoachDashboardScreen />;
    case UserRole.Organiser:
      return <OrganiserDashboardScreen />;
    case UserRole.Government:
      return <GovernmentDashboardScreen />;
    default:
      return <PlaceholderScreen title="Dashboard - Role Unknown" description="The user role is unrecognized or unset." />;
  }
}
