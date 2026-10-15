# SportIQ Native Mobile Client Migration: Phase 0 Audit
**Date:** 2026-10-15  
**Auditor:** Lead Mobile Engineer (Antigravity)  
**Status:** COMPLETE (Read-Only Audit — No App Code Modified)  
**Target:** React Native Native Client (Bare TypeScript CLI) alongside Web App  

---

## Executive Summary

SportIQ is an active sports ecosystem platform deployed in production (React 18 + Vite + Capacitor + Supabase) currently piloted in Karur, Tamil Nadu. This audit inspects the current repository to establish an authoritative baseline for rebuilding the client as a native React Native application in `mobile/`. 

Per the project mandate, **the existing web app, Supabase database schema, RLS policies, and storage configurations remain untouched and operational**. The native mobile app will serve **Athletes, Coaches, and Organisers**, while the Government Analytics dashboard remains a dedicated web application.

---

## 1. Architecture Map

```
sportiq-mvp/
├── .ai/                          # AI knowledge base & architectural laws
├── docs/                         # Specifications & migration docs
│   ├── future-modules/
│   └── migration/
├── src/                          # Current web client (React 18 + Vite + Capacitor)
│   ├── app/                      # App root shell, ErrorBoundary, deep link handler
│   ├── core/                     # Foundational infrastructure
│   │   ├── auth/                 # AuthProvider & auth types
│   │   ├── config/               # App configuration & environment variables
│   │   ├── database/             # Supabase client singleton
│   │   ├── navigation/           # Role-based navigation configs & types
│   │   └── theme/                # ThemeProvider context
│   ├── modules/                  # Feature modules (feature-based isolation)
│   │   ├── authentication/       # Login, SignUp, Splash, Welcome, Password flows
│   │   ├── dashboard/            # Role dashboards (Athlete, Coach, Organiser, Govt)
│   │   ├── events/               # Events list, creation, details
│   │   ├── messages/             # Conversations list, realtime private chat
│   │   ├── network/              # Connections & follower graph
│   │   ├── notifications/        # User notifications & read state
│   │   ├── profile/              # Own profile, public profile, onboarding wizard, achievements
│   │   ├── search/               # Coach athlete directory & search stubs
│   │   ├── settings/             # Settings screen & session signout
│   │   ├── social/               # Scaffold stubs (repurposed into AthleteDashboard)
│   │   └── tournaments/          # Tournaments list & detail screens
│   ├── routing/                  # Routes enum, AppRouter, ProtectedRoute, OnboardingGate
│   ├── shared/                   # Cross-module reusable components, constants, layouts
│   └── theme/                    # CSS tokens (tokens.css), animations, global CSS
└── supabase/                     # Supabase migrations (001 through 029)
```

### 1.1 Routing Architecture (`src/routing/routes.ts` & `src/routing/AppRouter.tsx`)
- **Route Constants:** Defined in [`src/routing/routes.ts:1-55`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/routing/routes.ts#L1-L55) as a frozen object `ROUTES` with 37+ named path strings.
- **Router Implementation:** [`src/routing/AppRouter.tsx:61-329`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/routing/AppRouter.tsx#L61-L329) uses `react-router-dom` (`BrowserRouter`, `Routes`, `Route`, `Navigate`).
- **Guards:**
  - `PublicRoute` ([`AppRouter.tsx:47-59`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/routing/AppRouter.tsx#L47-L59)): Redirects authenticated users from public routes (`/login`, `/signup`, `/welcome`) to `/`.
  - `ProtectedRoute` ([`src/routing/ProtectedRoute.tsx:1-20`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/routing/ProtectedRoute.tsx#L1-L20)): Checks `isAuthenticated`. Redirects unauthenticated sessions to `/login`.
  - `OnboardingGate` ([`src/routing/OnboardingGate.tsx:1-26`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/routing/OnboardingGate.tsx#L1-L26)): Athlete-only gate. If `user.role === UserRole.Athlete` and `onboardingComplete === false`, intercepts navigation to `/` and redirects to `/select-sports`.
  - `DashboardRouter` ([`AppRouter.tsx:332-347`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/routing/AppRouter.tsx#L332-L347)): Evaluates `user?.role` at route `/` and dynamically mounts `AthleteDashboardScreen`, `CoachDashboardScreen`, `OrganiserDashboardScreen`, or `GovernmentDashboardScreen`.

### 1.2 State Management
- Lightweight **React Context** only. No Redux, Zustand, or MobX.
  1. `AuthContext` ([`src/core/auth/AuthProvider.tsx:1-181`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/core/auth/AuthProvider.tsx#L1-L181)): Manages `user`, `isAuthenticated`, `isLoading`, `onboardingComplete`, `login`, `signUp`, `refreshProfile`, and `signOut`.
  2. `NavigationContext` ([`src/core/navigation/NavigationProvider.tsx:1-35`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/core/navigation/NavigationProvider.tsx#L1-L35)): Exposes `activeRole` and role navigation tabs.
  3. `ThemeContext` ([`src/core/theme/ThemeProvider.tsx:1-25`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/core/theme/ThemeProvider.tsx#L1-L25)): Provides theme toggle state (light/dark).
- Feature screens maintain local component state (`useState`, `useEffect`).
- Multi-step onboarding temporarily coordinates intermediate draft steps via `sessionStorage` stopgaps before saving to Supabase at step 4 (`ProfileCompletionScreen`).

### 1.3 Data Layer & Supabase Integration
- **Client Instance:** [`src/core/database/supabaseClient.ts:1-11`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/core/database/supabaseClient.ts#L1-L11) creates a single client using `createClient(supabaseUrl, supabaseAnonKey)`.
- **Query Mechanism:** All queries are direct PostgREST calls (`supabase.from('table').select(...)`) and Storage API calls (`supabase.storage.from('bucket').upload(...)`).
- **RPC Usage:** Zero `.rpc(` calls found anywhere in the codebase.
- **Realtime:** [`src/modules/messages/services/messageService.ts:139-156`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/messages/services/messageService.ts#L139-L156) uses `supabase.channel('messages:${conversationId}')` to listen for `postgres_changes` on the `messages` table.

### 1.4 Auth Flow
1. **Initial Hydration:** `supabase.auth.getSession()` on app mount ([`AuthProvider.tsx:61-77`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/core/auth/AuthProvider.tsx#L61-L77)).
2. **Profile Resolution:** `resolveProfile(userId, metadataRole)` ([`AuthProvider.tsx:32-52`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/core/auth/AuthProvider.tsx#L32-L52)) executes:
   ```sql
   SELECT role, onboarding_complete, full_name, avatar_url FROM public.profiles WHERE id = userId
   ```
   If the database row does not yet exist (e.g., signup trigger latency), it falls back gracefully to `user_metadata`.
3. **Auth State Changes:** `supabase.auth.onAuthStateChange` ([`AuthProvider.tsx:80-103`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/core/auth/AuthProvider.tsx#L80-L103)) updates session state and re-runs `resolveProfile`.
4. **Google OAuth & Deep Linking:** [`src/app/App.tsx:11-44`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/app/App.tsx#L11-L44) listens to Capacitor's `appUrlOpen` event for `auth/callback`. On native, it exchanges OAuth code via `supabase.auth.exchangeCodeForSession(code)` or sets the session via hash tokens, then closes the in-app browser.

---

## 2. Reuse Inventory

Every file in `src/` has been verified and classified into three tiers:
- **(a) Reusable As-Is:** Pure TypeScript, zero DOM/web imports, zero CSS dependencies.
- **(b) Reusable with Changes:** Business logic and Supabase queries valid, but tangled with DOM APIs (`sessionStorage`, `window`, browser `File` uploads) or web auth storage.
- **(c) Must Be Rewritten:** All JSX screens, HTML elements, CSS modules, web routing components.

### 2.1 Reusable As-Is (Tier A)
| File Path | Description / Verified Content |
|---|---|
| [`src/core/auth/types.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/core/auth/types.ts) | `UserRole` enum (`Athlete`, `Coach`, `Organiser`, `Government`), `User`, `AuthState` interfaces. |
| [`src/core/navigation/types.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/core/navigation/types.ts) | `NavItem`, `NavigationConfig` interfaces. |
| [`src/core/navigation/config.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/core/navigation/config.ts) | Canonical `navigationByRole` tab configurations for all 4 roles. |
| [`src/shared/constants/locations.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/shared/constants/locations.ts) | 241 curated Indian states, UTs, and major cities (`{ id, name }`). |
| [`src/shared/constants/positions.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/shared/constants/positions.ts) | `POSITIONS_BY_SPORT` mapping sport names to player positions. |
| [`src/shared/constants/regions.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/shared/constants/regions.ts) | List of Indian states and UTs. |
| [`src/shared/constants/sports.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/shared/constants/sports.ts) | `SPORTS_LIST` catalog (names, categories, IDs). |
| [`src/shared/utils/dateUtils.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/shared/utils/dateUtils.ts) | `calculateAge(dobString): number \| null` helper function. |
| [`src/modules/authentication/types/index.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/authentication/types/index.ts) | Auth module form schemas and credential payload interfaces. |
| [`src/modules/authentication/utils/validation.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/authentication/utils/validation.ts) | Supabase-aligned password strength criteria and email validator. |
| [`src/modules/dashboard/types/index.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/dashboard/types/index.ts) | Dashboard KPI and activity feed interfaces. |
| [`src/modules/dashboard/constants/mockData.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/dashboard/constants/mockData.ts) | Fallback mock datasets for Coach, Organiser, and Government dashboards. |
| [`src/modules/messages/types/index.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/messages/types/index.ts) | `Conversation`, `Message` data models. |
| [`src/modules/notifications/types/index.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/notifications/types/index.ts) | `Notification` item types and notification categories. |
| [`src/modules/profile/types/index.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/profile/types/index.ts) | `Profile`, `Achievement`, `SportProfile` models. |
| [`src/modules/tournaments/services/tournamentService.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/tournaments/services/tournamentService.ts) | Pure PostgREST `getTournaments`, `getTournamentById`. |
| [`src/modules/events/services/eventService.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/events/services/eventService.ts) | Pure PostgREST `getEvents`, `getEventById`, `createEvent`. |
| [`src/modules/network/services/networkService.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/network/services/networkService.ts) | Pure PostgREST follow/unfollow and connections queries. |
| [`src/modules/dashboard/services/athleteSearchService.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/dashboard/services/athleteSearchService.ts) | PostgREST queries filtering profiles by sport, region, role. |
| [`src/modules/dashboard/services/organiserService.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/dashboard/services/organiserService.ts) | PostgREST queries for organiser events. |
| [`src/theme/tokens.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/theme/tokens.ts) | Breakpoints and animation duration constants. |

### 2.2 Reusable with Changes (Tier B)
| File Path | What Needs Changing |
|---|---|
| [`src/core/database/supabaseClient.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/core/database/supabaseClient.ts) | Replace web `createClient` with RN-compatible configuration: supply `AsyncStorage` to `auth.storage`, set `detectSessionInUrl: false`, import `react-native-url-polyfill/auto`, and add `AppState` listener for token refresh. |
| [`src/core/auth/AuthProvider.tsx`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/core/auth/AuthProvider.tsx) | Remove `sessionStorage.removeItem(...)` at lines 148–150. Use mobile storage or state store for onboarding draft cleanup. Session persistence itself delegates to Supabase client's `auth.storage`. |
| [`src/modules/profile/services/profileService.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/profile/services/profileService.ts) | Lines 122–131 & 176–178 directly access `sessionStorage` inside `completeOnboarding()`. Must refactor `completeOnboarding(payload: CompleteOnboardingData)` to take parameters directly rather than reading browser globals. Line 79 `uploadAvatar(userId, file: File)` must accept React Native file URI or Blob/ArrayBuffer. |
| [`src/modules/profile/services/achievementService.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/profile/services/achievementService.ts) | Line 104 `uploadCertificate(athleteId, file: File)` takes browser DOM `File`. Refactor to accept file URI / binary payload for React Native file picker. |
| [`src/modules/dashboard/services/postService.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/dashboard/services/postService.ts) | Line 113 `uploadPostMedia(userId, file: File)` takes browser DOM `File`. Refactor to native media asset format. |
| [`src/modules/notifications/services/notificationService.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/notifications/services/notificationService.ts) | Lines 67 & 87 dispatch `window.dispatchEvent(new Event(NOTIFICATION_READ_EVENT))`. Replace browser custom event dispatching with a React state setter, Context callback, or tiny event emitter. |
| [`src/modules/messages/services/messageService.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/messages/services/messageService.ts) | Realtime channel subscription logic is intact, but channel cleanup and lifecycle must bind to screen focus/blur (`useFocusEffect`) or component unmount to prevent leaks on mobile backgrounding. |
| [`src/modules/dashboard/services/analyticsService.ts`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/dashboard/services/analyticsService.ts) | PostgREST queries are pure, but this service powers the Government Dashboard which stays on web; only minimal subsets are needed if any cross-role aggregates are shown on mobile. |

### 2.3 Must Be Rewritten (Tier C)
- **All 30+ UI Screens:** Built with HTML elements (`<div>`, `<span>`, `<button>`, `<input>`, `<form>`), CSS modules (`styles.*`), and web event handlers (`onClick`, `onKeyDown`). Must be rewritten as React Native primitives (`View`, `Text`, `TouchableOpacity` / `Pressable`, `TextInput`, `ScrollView`, `FlatList`).
- **All Layouts & Nav Shells:** `AppLayout.tsx`, `AuthLayout.tsx`, `TopBar.tsx`, `BottomNav.tsx`, `TopNav.tsx`. Must be rewritten using React Navigation (`@react-navigation/bottom-tabs` and native stacks).
- **All Shared Custom Form Components:** `ModernSelect.tsx`, `ModernDatePicker.tsx`, `SportCombobox.tsx`, `LocationCombobox.tsx`, `RoleSelector.tsx`, `Skeleton.tsx`. Must be re-implemented natively using `Modal` / `FlatList` / native pickers.
- **Routing Infrastructure:** `AppRouter.tsx`, `ProtectedRoute.tsx`, `OnboardingGate.tsx` must be converted to a React Navigation navigation container with conditional stack screen trees.

### 2.4 Tangled Business Logic in UI Components (Flagged for Extraction)
1. **`SportCombobox.tsx` ([lines 59–65](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/shared/components/SportCombobox/SportCombobox.tsx#L59-L65)):** Component directly calls `supabase.auth.getUser()` and inserts into table `sport_reports`. Needs extraction into `sportService.reportMissingSport()`.
2. **`AthletePublicProfileScreen.tsx` ([lines 35–69](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/profile/screens/AthletePublicProfileScreen/AthletePublicProfileScreen.tsx#L35-L69)):** Directly performs multi-table Supabase queries (`profiles`, `achievements`) inside `useEffect` rather than delegating to `profileService.getPublicProfile(id)`.
3. **`OrganizationDirectoryScreen.tsx` ([lines 15–28](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/dashboard/screens/OrganizationDirectoryScreen/OrganizationDirectoryScreen.tsx#L15-L28)) & `OrganizationDetailScreen.tsx` ([lines 30–60](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/dashboard/screens/OrganizationDetailScreen/OrganizationDetailScreen.tsx#L30-L60)):** Direct inline queries on `profiles` where `role = 'organiser'`. Needs extraction to `organisationService.ts`.
4. **`PrivateChatScreen.tsx` ([lines 21, 42](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/modules/messages/screens/PrivateChatScreen/PrivateChatScreen.tsx#L21)):** Reads and writes `localStorage.getItem('sportiq_chat_theme')` directly inside the screen.
5. **Auth Screens (`LoginScreen.tsx`, `SignUpScreen.tsx`, `ResetPasswordScreen.tsx`, `ForgotPasswordScreen.tsx`):** Contain inline `supabase.auth.*` calls, URL parsing, and platform checks. Must be encapsulated into `authService.ts` and `AuthProvider`.

---

## 3. Web-Only Dependencies & Native Replacements

| Web Feature / Dependency | Web Location / Usage | React Native Replacement | Justification / Notes |
|---|---|---|---|
| `react-router-dom` | `src/routing/*`, screen navigations (`useNavigate`, `useLocation`) | `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs` | Standard industry solution for native stack transitions, tab bars, hardware back button support, and deep linking. |
| `react-dom` | `src/main.tsx` (`createRoot`), HTML DOM elements | `react-native` (`View`, `Text`, `Pressable`, `TextInput`, etc.) | Native UI primitives with yoga flexbox layout engine. |
| CSS Modules (`*.module.css`) & CSS Variables (`var(--...)`) | Every component and screen in `src/` | `StyleSheet.create` + typed `theme.ts` | Zero-runtime-overhead native styling. Type-checked against design tokens. |
| `@capacitor/core`, `@capacitor/app`, `@capacitor/browser` | `src/app/App.tsx`, `LoginScreen.tsx`, `SignUpScreen.tsx` | React Native `Linking` + `react-native-inappbrowser-reborn` (or `@react-native-google-signin/google-signin`) | Capacitor web wrapper plugins do not exist in bare React Native. Native in-app browser handles Supabase OAuth redirection cleanly. |
| `localStorage` | `src/modules/messages/screens/PrivateChatScreen/PrivateChatScreen.tsx` | `@react-native-async-storage/async-storage` (or `react-native-mmkv`) | Standard asynchronous key-value persistence on iOS/Android. |
| `sessionStorage` | Onboarding screens (`SelectSportsScreen`, `PersonalInformationScreen`, `PlayingInformationScreen`, `ProfileCompletionScreen`) and `profileService.ts` | In-memory React Context / Zustand draft store, or transient AsyncStorage keys | Mobile apps do not have browser tabs; an in-memory onboarding state provider survives screen navigations during wizard completion and resets on cancel. |
| DOM Event Listeners (`window.addEventListener('keydown')`, `document.addEventListener('mousedown')`) | `OwnProfileScreen.tsx`, `SportCombobox.tsx`, `ModernSelect.tsx`, `PostReactionPicker.tsx` | Native touch responder system, `Modal`, `TouchableWithoutFeedback` backdrop | Hardware keyboard listeners are replaced by Android `BackHandler` and touch backdrop dismissal. |
| `window.location.reload()` | Error states in `OwnProfileScreen.tsx:168`, `AthletePublicProfileScreen.tsx:290`, `NotificationsScreen.tsx:121` | Component-level retry handler (re-invoking fetch function) + pull-to-refresh (`RefreshControl`) | Calling `window.location.reload()` does not exist in native; native apps trigger data re-fetch. |
| `navigator.clipboard.writeText` | Profile share link in `OwnProfileScreen.tsx:433`, `AthleteDashboardScreen.tsx:347` | `@react-native-clipboard/clipboard` or React Native `Share.share()` | Native Share dialog is much more natural on mobile than copying a URL to clipboard. |
| Google Material Symbols Web Font (`index.html`) | `<span className="material-symbols-outlined">...</span>` used across 40+ files | `react-native-vector-icons/MaterialIcons` or custom SVG icons via `react-native-svg` | Ligature font loading in web HTML is replaced with vector icon glyphs or crisp SVG assets. |
| `gsap`, `lenis`, `@designcodeio/threeui` | Listed in `package.json:15,17,18` | **Omit completely** | Verified via grep: none of these packages are actually imported anywhere in `src/`. They are leftover web boilerplate. |

---

## 4. Feature Inventory by Role

### 4.1 Common / Authentication Features
| Feature / Screen | Screen ID (Stitch) | Supabase Tables & Storage Buckets | RPCs | Status in Web App |
|---|---|---|---|---|
| Splash Screen | `e6284d8b57064d34b643bee9cdeb12c4` | None (checks active session) | None | Built (`SplashScreen.tsx`) |
| Welcome Screen | `5dd2f754420c452f8661d1a9b739fdb9` | None | None | Built (`WelcomeScreen.tsx`) |
| Login Screen | `904ea4a3b2a94ea9b2a95c4a45b702a3` | `auth.users`, `public.profiles` | None | Built (`LoginScreen.tsx`) |
| Sign Up Screen | `1ecbe3fbb0e64da187c25f35ed61722b` | `auth.users`, `public.profiles` (via trigger `handle_new_user`) | None | Built (`SignUpScreen.tsx`) |
| Forgot Password | `aa5f559dd1d140c9bfadb231a301ebf9` | `auth.users` (`resetPasswordForEmail`) | None | Built (`ForgotPasswordScreen.tsx`) |
| Reset Password | N/A | `auth.users` (`updateUser`) | None | Built (`ResetPasswordScreen.tsx`) |
| Select Role | N/A | `public.profiles` (`UPDATE role`) | None | Built (`SelectRoleScreen.tsx`) |
| Privacy Policy & Terms | N/A | None (static text) | None | Built (`PrivacyPolicyScreen.tsx`, `TermsOfServiceScreen.tsx`) |

### 4.2 Athlete Features
| Feature / Screen | Screen ID (Stitch) | Supabase Tables & Storage Buckets | RPCs | Status in Web App |
|---|---|---|---|---|
| Select Sports (Onboarding Pre-step) | `9dcf3c98d6014b138364c73940b03698` | Draft state (persists to `profiles.sports_of_interest`) | None | Built (`SelectSportsScreen.tsx`) |
| Create Sports Profile (Onboarding 1/4) | `36a44b1ec6244d9db3556da84ddc7948` | `storage.objects` (`avatars` bucket), `profiles` | None | Built (`CreateSportsProfileScreen.tsx`) |
| Personal Information (Onboarding 2/4) | `ab64f6d07cdd4308b9e9d5f0524946a4` | Draft state (`full_name`, `location`, `age`, `date_of_birth`, `height_cm`, `weight_kg`) | None | Built (`PersonalInformationScreen.tsx`) |
| Playing Information (Onboarding 3/4) | `c50b8ebdd26e49e088f221712c631fc6` | Draft state (`dominant_foot`, `primary_position`, `positions`, `years_of_experience`) | None | Built (`PlayingInformationScreen.tsx`) |
| Profile Completion (Onboarding 4/4) | `c022afa7e2084368b6bbdba3eaa078d2` | `public.profiles` (single consolidated update, `onboarding_complete = true`) | None | Built (`ProfileCompletionScreen.tsx`) |
| Athlete Dashboard / Feed | `6e6713d235b04d0eb2b65d50e0b87179` | `public.posts` JOIN `public.profiles`, `public.post_likes`, `public.post_reactions` | None | Built (`AthleteDashboardScreen.tsx`) |
| Own Profile | `dea731f2d6d046cba33074bea97f0dc7` | `public.profiles`, `public.achievements` | None | Built (`OwnProfileScreen.tsx`) |
| Edit Profile | `539c8051c32e4e7787bc7233c2aa0730` | `public.profiles`, `storage.objects` (`avatars` bucket) | None | Built (`EditProfileScreen.tsx`) |
| Athlete Public Profile | `2afba692135d42719f2f1d65ead9bfc9` | `public.profiles`, `public.achievements` | None | Built (`AthletePublicProfileScreen.tsx`) |
| Statistics | `a5ab76d056d5477d8dd8f2e0ba0ed81c` | Static demo data | None | Built (`StatisticsScreen.tsx`) |
| Achievements Gallery & Add/Edit | `b25601c5f3a14d5d8b77068b1c7a5d54`, `4a2fe79c7eff405da3579fdbb7e545eb` | `public.achievements`, `storage.objects` (`achievements` bucket) | None | Built (`AchievementsGalleryScreen.tsx`, `AchievementForm.tsx`) |
| Create Post | `8cacd67b59894b2c9768fa930968233a` | `public.posts`, `storage.objects` (`posts` bucket) | None | Built (`CreatePostScreen.tsx`) |
| Tournaments Browser & Detail | N/A | `public.tournaments` | None | Built (`TournamentsListScreen.tsx`, `TournamentDetailScreen.tsx`) |
| Events Browser & Detail | N/A (Law Two Exception) | `public.events` | None | Built (`EventsListScreen.tsx`, `EventDetailsScreen.tsx`) |
| Network / Connections | `f55432c01428410488ad5899fb5bd953` | `public.network_connections` JOIN `public.profiles` | None | Built (`NetworkScreen.tsx`) |
| Messages & Private Chat | `e96861ef8d874036840cbf5e3c787634`, `0c73ecbd86984b6492c5f13155a694f0` | `public.conversations`, `public.messages` (Realtime subscription) | None | Built (`MessagesScreen.tsx`, `PrivateChatScreen.tsx`) |
| Notifications | `cb5af3fbadc24b4e8921daec97788808` | `public.notifications` | None | Built (`NotificationsScreen.tsx`) |
| Settings | `f53e82b64d484729a86a69d17e0619cd` | None (local settings + auth signout) | None | Built (`SettingsScreen.tsx`) |

### 4.3 Coach Features
| Feature / Screen | Screen ID (Stitch) | Supabase Tables & Storage Buckets | RPCs | Status in Web App |
|---|---|---|---|---|
| Coach Dashboard | `c806e8b69788433483ffab466ad4bd71` | `public.profiles` (`role = 'athlete'` count) + `COACH_MOCK_DATA` | None | Built (`CoachDashboardScreen.tsx`) |
| Athlete Directory & Search | `4870121b7dc646bab512912d0bf9dff5` | `public.profiles` (`role = 'athlete'`) | None | Built (`CoachAthleteSearchScreen.tsx`) |
| Assign Training | N/A | Static demo state | None | Built (`AssignTrainingScreen.tsx`) |
| Team Management | N/A | Static demo state | None | Built (`MyCoachesScreen.tsx` / `TeamManagementScreen.tsx`) |

### 4.4 Organiser Features
| Feature / Screen | Screen ID (Stitch) | Supabase Tables & Storage Buckets | RPCs | Status in Web App |
|---|---|---|---|---|
| Organiser Dashboard | `03c76d2b022749369496ed362c229f98` | `public.events` (`organiser_id = auth.uid()`) + `ORGANISER_MOCK_DATA` | None | Built (`OrganiserDashboardScreen.tsx`) |
| Create Event | N/A (Law Two Exception) | `public.events` | None | Built (`CreateEventScreen.tsx`) |
| Event Details | N/A (Law Two Exception) | `public.events` | None | Built (`EventDetailsScreen.tsx`) |
| Create Tournament | N/A | `public.tournaments` | None | Built (`CreateTournamentScreen.tsx`) |
| Organization Directory & Detail | N/A | `public.profiles` (`role = 'organiser'`) | None | Built (`OrganizationDirectoryScreen.tsx`, `OrganizationDetailScreen.tsx`) |

### 4.5 Government Authority Features (Stays on Web)
- `GovernmentDashboardScreen.tsx` (`8e35604d174d41f1bc256072de7c7f53`): Aggregates across `profiles` and `events`. District registration charts and sport analytics.
- **Decision:** As specified in the product mandate, the Government authority/analytics dashboard is a desktop/tablet web tool and is **excluded from mobile client scope**.

---

## 5. Design Tokens: `tokens.css` → Proposed `theme.ts`

Extracted from [`src/theme/tokens.css:1-207`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/theme/tokens.css#L1-L207) and [`src/theme/tokens.ts:1-13`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/src/theme/tokens.ts#L1-L13):

```typescript
export const theme = {
  colors: {
    primary: {
      50: '#F0FAF5',
      100: '#C8EDD9',
      200: '#6DFCB7',  // primary_fixed
      300: '#4CDF9D',  // primary_fixed_dim
      400: '#00B87A',  // primary_container — main CTA
      500: '#006C46',  // primary — brand anchor
      600: '#005234',  // on_primary_fixed_variant
      700: '#004128',  // on_primary_container
      800: '#002112',  // on_primary_fixed
      900: '#001208',
    },
    neutral: {
      0: '#FFFFFF',    // surface_container_lowest
      50: '#F8F9FB',   // surface / background
      100: '#F2F4F6',  // surface_container_low
      200: '#ECEEF0',  // surface_container
      300: '#E6E8EA',  // surface_container_high
      400: '#E0E3E5',  // surface_container_highest / surface_variant
      500: '#BBCABF',  // outline_variant
      600: '#6C7A70',  // outline
      700: '#3C4A41',  // on_surface_variant
      800: '#191C1E',  // on_surface / on_background
      900: '#0C1209',
    },
    semantic: {
      success: '#00B87A',
      warning: '#F59E0B',
      error: '#BA1A1A',
      info: '#005FAE',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F9FB',
      tertiary: '#ECEEF0',
    },
    text: {
      primary: '#191C1E',
      secondary: '#3C4A41',
      tertiary: '#6C7A70',
      inverse: '#FFFFFF',
    },
    dark: {
      surface: '#121212',
      surfaceAlt: '#1e1e1e',
      neutral100: '#2c2c2c',
      neutral200: '#333333',
      neutral300: '#444444',
      neutral400: '#555555',
      neutral500: '#666666',
      textPrimary: '#e0e0e0',
      textSecondary: '#aaaaaa',
    },
  },
  typography: {
    fontFamily: {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium',
      semibold: 'Inter-SemiBold',
      bold: 'Inter-Bold',
    },
    size: {
      xs: 12,     // --font-size-xs: 0.75rem (12px)
      sm: 14,     // --font-size-sm: 0.875rem (14px)
      base: 16,   // --font-size-base: 1rem (16px)
      lg: 18,     // --font-size-lg: 1.125rem (18px)
      xl: 20,     // --font-size-xl: 1.25rem (20px)
      '2xl': 24,  // --font-size-2xl: 1.5rem (24px)
      '3xl': 30,  // --font-size-3xl: 1.875rem (30px)
      '4xl': 32,  // --font-size-4xl: 2rem (32px)
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    1: 4,    // --spacing-1: 0.25rem (4px)
    2: 8,    // --spacing-2: 0.5rem (8px)
    3: 12,   // --spacing-3: 0.75rem (12px)
    4: 16,   // --spacing-4: 1rem (16px)
    5: 20,   // --spacing-5: 1.25rem (20px)
    6: 24,   // --spacing-6: 1.5rem (24px)
    8: 32,   // --spacing-8: 2rem (32px)
    10: 40,  // --spacing-10: 2.5rem (40px)
    12: 48,  // --spacing-12: 3rem (48px)
    16: 64,  // --spacing-16: 4rem (64px)
    20: 80,  // --spacing-20: 5rem (80px)
    24: 96,  // --spacing-24: 6rem (96px)
  },
  radius: {
    sm: 4,      // --radius-sm: 4px
    md: 8,      // --radius-md: 8px (buttons / inputs)
    lg: 12,     // --radius-lg: 12px
    xl: 16,     // --radius-xl: 16px (cards)
    '2xl': 24,  // --radius-2xl: 24px
    full: 9999, // --radius-full: 9999px
  },
  elevation: {
    sm: {
      shadowColor: '#191C1E',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#191C1E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    lg: {
      shadowColor: '#191C1E',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 6,
    },
  },
  layout: {
    appShellMaxWidth: 480, // --app-shell-max-width: 30rem (480px)
    navHeight: 56,         // --nav-height: 3.5rem (56px)
  },
  icons: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
} as const;

export type Theme = typeof theme;
```

---

## 6. Architectural Laws Review

| Existing Architectural Law / Convention | Source in Repo | Verdict | Evidence & Justification for React Native |
|---|---|---|---|
| **Law 1: Module Isolation** | [`.ai/coding-rules.md:13-23`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/.ai/coding-rules.md#L13-L23), [`.ai/module-registry.md:236`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/.ai/module-registry.md#L236) | **Carries over** | Feature-based modular structure (`mobile/src/modules/<feature>/{components,screens,services,types}`) prevents cross-feature coupling and makes parallel feature implementation safe. |
| **Law 2: Stitch as Authoritative Design Source** | [`.ai/stitch-workflow.md:1-83`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/.ai/stitch-workflow.md#L1-L83), [`.ai/module-registry.md:3-6`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/.ai/module-registry.md#L3-L6) | **Needs Rewriting** | Stitch project `3941284064310403069` remains the visual source of truth. However, Stitch generates browser HTML/CSS, not native React Native JSX. Screen IDs still map 1:1, but the conversion workflow is a native fidelity mapping rather than direct HTML extraction. Also, the experimental Google `stitch::react-native` skill is UNVERIFIED/NOT PRESENT in this environment. |
| **Law 3: Zero Hardcoded Colors/Spacing (Strict Token Adherence)** | [`.ai/coding-rules.md:8-10`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/.ai/coding-rules.md#L8-L10), [`.ai/architecture.md:24`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/.ai/architecture.md#L24) | **Carries over (Enhanced)** | In the web app, this was audited via Type A (undefined `var()`) and Type B (hardcoded CSS values) passes. In React Native, this will be enforced via `eslint-plugin-react-native` and an AST token scanner script. |
| **Law 4: Git Command Confirmation Policy — MANDATORY** | [`.ai/agent-rules.md:23-47`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/.ai/agent-rules.md#L23-L47) | **Carries over** | Non-negotiable safety policy: Every state-altering git command (`commit`, `push`, `merge`, `reset`) requires explicit operator approval in the active turn. |
| **Law 5: Code Quality Constraints (<300 lines per file, composition, no business logic in UI)** | [`.ai/coding-rules.md:21-28`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/.ai/coding-rules.md#L21-L28) | **Carries over** | Critical for React Native. Screens that mix styling, state, and API queries quickly balloon past 500 lines. Keeping screens under 300 lines by delegating styling and queries to services/subcomponents is essential. |
| **Law 6: Centralized Shared Components** | [`.ai/architecture.md:20-22`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/.ai/architecture.md#L20-L22) | **Carries over** | Buttons, Inputs, Cards, and Headers must live in `mobile/src/shared/components/` rather than being re-invented per screen. |
| **Law 7: CSS Token-Checking Script (`scan.cjs` & Type A/B checks)** | [`scan.cjs:1-57`](file:///c:/Users/admin/Documents/Projects/sportiq-mvp/scan.cjs#L1-L57), commit `442618b` | **Needs Rewriting for RN** | `scan.cjs` scanned `.md` files for legacy strings, while CSS Type A checks scanned for missing `var(--...)`. React Native does not use CSS files. Proposed RN replacement detailed below. |

### 6.1 Token Enforcement & Lint Evaluation (`eslint-plugin-react-native`)
- **`react-native/no-color-literals`:** **Fits perfectly.** Verified via official documentation (`Intellicode/eslint-plugin-react-native`). It flags any hex codes (`#006c46`), rgb/rgba strings, or named colors in `StyleSheet.create` or JSX props. All colors must be imported from `theme.colors.*`.
- **`react-native/no-inline-styles`:** **Fits.** Discourages ad-hoc inline styles `<View style={{ padding: 10 }} />`, enforcing clean `StyleSheet.create` definitions.
- **Limitation of standard plugin:** `eslint-plugin-react-native` does **not** check for hardcoded numeric spacing or border radii (e.g. `margin: 15` instead of `theme.spacing[4]`).
- **Proposed Native Token Enforcement Script (`mobile/scripts/check-tokens.mjs`):** A custom Node.js script using Babel/TypeScript AST parsing that scans all `StyleSheet.create` blocks in `mobile/src/` and flags:
  1. Numeric literals in `margin`, `padding`, `gap`, `top`, `bottom`, `left`, `right` not referencing `theme.spacing`.
  2. Numeric literals in `borderRadius` not referencing `theme.radius`.
  3. Numeric literals in `fontSize` not referencing `theme.typography.size`.
  This guarantees 100% token fidelity across the native app.

---

## 7. Risk List

1. **Shared Live Database Collisions (HIGH RISK):**
   - The pilot in Karur is actively using the production Supabase database.
   - Any uncoordinated schema modification, table alteration, or RLS change will immediately break live web users.
   - **Mitigation:** Zero schema modifications. The mobile app must operate strictly as a client against the existing schema and policies. Any necessary database migration must be proposed in writing and approved before execution.

2. **Supabase Auth Session Invalidation Risk (MEDIUM RISK):**
   - If a pilot user logs into both the web app and the native mobile app, GoTrue token rotation could race if refresh tokens are handled improperly.
   - **Mitigation:** Configure Supabase client in React Native with `autoRefreshToken: true`, `persistSession: true`, and `AppState` background listener to pause refresh while in background, preventing refresh token thrashing.

3. **Storage Binary Upload Mismatch (MEDIUM RISK):**
   - Web uses standard HTML5 `File` and `Blob` APIs for profile avatars, post images, and tournament certificates. React Native's file picker returns `content://` (Android) or `file://` (iOS) URIs.
   - **Mitigation:** Wrap file uploads using standard native multipart `FormData` or `ArrayBuffer` conversion compatible with Supabase Storage v2.

4. **Realtime Websocket Battery / Connection Drain (LOW–MEDIUM RISK):**
   - Persistent web sockets (`supabase.channel`) in `messageService.ts` can drain mobile battery and cause stale listener leaks if kept open while the app is in the background.
   - **Mitigation:** Subscribe to chat channels only while the `PrivateChatScreen` is actively focused, unsubscribing on screen blur / unmount.

5. **Local Machine Native Toolchain Gaps (CRITICAL OPERATIONAL RISK):**
   - The development machine is Windows (win32) with Node v26.4.0.
   - **JDK (Java) is NOT installed or in PATH.**
   - **Android SDK / Android Studio / `adb` are NOT installed.**
   - Building and running an Android APK locally is impossible until these dependencies are installed. iOS builds are completely impossible on Windows without macOS / remote CI.
   - Detailed breakdown and setup plan addressed in Phase 1.
