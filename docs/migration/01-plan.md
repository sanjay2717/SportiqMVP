# SportIQ Native Mobile Client Migration: Phase 1 Plan
**Date:** 2026-10-15  
**Author:** Lead Mobile Engineer (Antigravity)  
**Status:** PROPOSED — GATE 1 (Awaiting Operator Approval)  
**Target:** React Native Native Client (Bare TypeScript CLI) in `mobile/`  

---

## 1. Verified Toolchain & Dependency Matrix

All versions and requirements have been verified against official package releases and documentation as of October 2026:

| Tool / Dependency | Verified Version | Purpose | Source Verification & Minimum Requirements |
|---|---|---|---|
| **React Native** | `0.87.1` | Native Mobile Framework | [reactnative.dev](https://reactnative.dev/docs/set-up-your-environment) (Stable 0.87). Requires Node >= 22.11.0, JDK 17. |
| **React** | `19.2.3` | UI Core Library | Peer dependency of `react-native@0.87.1` (verified via npm registry). |
| **TypeScript** | `5.6.3+` | Strict Type Safety | Strict configuration matching root project. |
| **Node.js** | Current: `v26.4.0` | Runtime / Bundler Host | Exceeds minimum requirement (Node 22.11+). |
| **Java Development Kit** | `JDK 17` | Android Gradle Compilation | [reactnative.dev Android Setup](https://reactnative.dev/docs/set-up-your-environment). Temurin 17 or Microsoft OpenJDK 17. |
| **Android SDK / Build-Tools**| `35.0.0` / API 35 | Target Android Platform | Android 15 (VanillaIceCream) / Android 14 (API 34/35). |
| **React Navigation** | `@react-navigation/native@^7.5.1` | Native Navigation Container | [reactnavigation.org](https://reactnavigation.org). Native stack transitions, hardware back button. |
| **React Navigation Native Stack**| `@react-navigation/native-stack@^7.2.0` | Screen Stack Controller | Native iOS UINavigationController / Android Fragment navigation. |
| **React Navigation Bottom Tabs** | `@react-navigation/bottom-tabs@^7.2.0` | Role-Aware Bottom Navigation | Tab bar matching SportIQ bottom navigation designs. |
| **Supabase Client** | `@supabase/supabase-js@^2.110.8` | Database & Auth Client | Matches current web client version. |
| **AsyncStorage** | `@react-native-async-storage/async-storage@^3.1.1` | Auth Session Persistence | [supabase.com React Native Guide](https://supabase.com/docs/guides/auth/native-mobile-deep-linking). |
| **URL Polyfill** | `react-native-url-polyfill@^4.0.0` | URL Standard Compatibility | Required by `supabase-js` in React Native environments. |
| **In-App Browser** | `react-native-inappbrowser-reborn@^3.7.0` | Secure OAuth / Google Auth | Chrome Custom Tabs (Android) & ASWebAuthenticationSession (iOS). |
| **Safe Area Context** | `react-native-safe-area-context@^5.10.1` | Notch & Gesture Bar Handling | Standard React Navigation peer dependency. |
| **Screens** | `react-native-screens@^4.30.0` | Native View Hierarchy | Standard React Navigation peer dependency. |
| **ESLint React Native** | `eslint-plugin-react-native@^5.0.0` | Token & Style Rule Enforcement | `no-color-literals`, `no-inline-styles`. |

---

## 2. Environment Checklist for Host Machine

### 2.1 Host Environment Audit
The development host has been inspected via native shell queries:

| Component | Status | Details / Location | Action Required |
|---|---|---|---|
| **Operating System** | ✅ Detected | Windows 11 Pro / Enterprise (`win32`) | Android development fully supported. iOS native compilation blocked locally. |
| **Node.js** | ✅ Passed | `v26.4.0` | None (exceeds minimum Node 22 requirement). |
| **npm** | ✅ Passed | `11.17.0` | None. |
| **JDK (Java)** | ❌ **MISSING** | Neither `java` nor `javac` found in PATH | **Must install JDK 17** (e.g., Eclipse Temurin 17 or Microsoft Build of OpenJDK 17) and configure `JAVA_HOME`. |
| **Android SDK / Studio** | ❌ **MISSING** | No SDK found in `%LOCALAPPDATA%\Android\Sdk` | **Must install Android Studio** (or Android Command Line Tools), install Platform-Tools (`adb`), Build-Tools 35, and set `ANDROID_HOME`. |
| **Connected Device / AVD**| ❌ **MISSING** | No `adb` executable available | Must configure an Android Virtual Device (AVD) or enable USB Debugging on a physical Android test device. |

### 2.2 What Is Blocked for iOS & Available Options
Because the host machine is running **Windows**, Apple's toolchain (macOS, Xcode, CocoaPods, and the iOS Simulator) cannot run locally:
1. **Local iOS Builds/Emulation:** Completely blocked on Windows.
2. **Options for iOS Testing/Releases:**
   - **Option A (Recommended for Pilot):** Focus Phase 1–3 Android verification on local machine/devices (since Karur pilot users use Android devices). Run automated CI builds (GitHub Actions with `macos-latest` runner) to verify iOS compilation.
   - **Option B (Cloud Builds):** Use a managed CI service (such as GitHub Actions or EAS Build) to generate iOS `.ipa` builds and distribute via TestFlight.
   - **Option C (Dedicated Mac):** Use a Mac workstation or cloud Mac instance (MacStadium, AWS EC2 Mac) for final iOS release signing.

---

## 3. Proposed v1 Scope: The Vertical Slice

We propose a focused, end-to-end vertical slice that delivers immediate value to the Karur pilot while proving the full architectural stack (Native UI → Theme Tokens → AsyncStorage Session → Supabase Database/Storage → Realtime).

### 3.1 Proposed Slice: Athlete Onboarding, Dashboard Feed, and Direct Messaging

```
[Splash / Auth] ───> [Role-Aware Home] ───> [Athlete Profile] ───> [Cross-User: Messaging / Feed]
   - Email/Pass          - Athlete Feed          - Own Profile           - 1-on-1 Realtime Chat
   - Session Restore     - Role Tabs             - Edit Profile          - Feed Post Cards
```

### 3.2 Scope Breakdown & Classification

| Feature Module | Specific Screen / Capability | Classification | Justification |
|---|---|---|---|
| **Authentication** | Splash Screen (`SplashScreen`) | **Launch-Critical** | Session check, brand entry, auto-routing. |
| **Authentication** | Welcome Screen (`WelcomeScreen`) | **Launch-Critical** | Unauthenticated landing page. |
| **Authentication** | Login Screen (`LoginScreen`) | **Launch-Critical** | Core email/password credential login. |
| **Authentication** | Sign Up Screen (`SignUpScreen`) | **Launch-Critical** | Role selection (Athlete, Coach, Organiser), account creation. |
| **Authentication** | Forgot Password (`ForgotPasswordScreen`) | **Later** | Non-critical for initial pilot testing; accounts can be reset via Supabase dashboard. |
| **Profile (Onboarding)** | Select Sports (`SelectSportsScreen`) | **Launch-Critical** | Core athlete profile step (sports of interest). |
| **Profile (Onboarding)** | Personal & Playing Info (`PersonalInformationScreen`, `PlayingInformationScreen`) | **Launch-Critical** | Collects essential sports data (location, age, position, experience). |
| **Profile (Onboarding)** | Profile Completion (`ProfileCompletionScreen`) | **Launch-Critical** | Sets `onboarding_complete = true` in Supabase `profiles`. |
| **Navigation Shell** | Role-Aware Bottom Tab Bar (`BottomNavBar`) | **Launch-Critical** | Enforces role-based access for Athlete, Coach, Organiser. |
| **Dashboard** | Athlete Home Feed (`AthleteDashboardScreen`) | **Launch-Critical** | Primary daily active view: reads real `posts` table joined with profiles. |
| **Profile** | Own Profile (`OwnProfileScreen`) | **Launch-Critical** | User's sports profile card, age calculation, achievements preview. |
| **Profile** | Edit Profile (`EditProfileScreen`) | **Launch-Critical** | Updating bio, position, location, date of birth. |
| **Cross-User Feature**| Real-Time Messaging (`MessagesScreen` & `PrivateChatScreen`) | **Launch-Critical** | **Selected cross-user candidate:** Proves Supabase Realtime subscriptions, bi-directional communication between athletes and coaches. |
| **Cross-User Feature**| Social Feed Posting (`CreatePostScreen`) | **Later** | Secondary to basic viewing and direct communication. |
| **Events** | Events List & Details (`EventsListScreen`, `EventDetailsScreen`) | **Later** | Can follow once the core athlete/coach loop is verified. |
| **Tournaments** | Tournaments List & Details | **Later** | Subsequent milestone. |
| **Achievements** | Achievement Gallery & Form | **Later** | Can be viewed on web during initial slice validation. |
| **Government Dashboard**| Macro Analytics | **EXCLUDED** | Stays on desktop web per product specification. |

---

## 4. Architecture Specifications

### 4.1 Folder Structure (`mobile/`)
```
mobile/
├── android/                      # Native Android project
├── ios/                          # Native iOS project (for CI/Mac)
├── scripts/
│   └── check-tokens.mjs          # Custom AST design token validator
├── src/
│   ├── app/                      # App.tsx root, navigation container, global providers
│   ├── core/
│   │   ├── auth/                 # AuthProvider, useAuth, auth types
│   │   ├── config/               # App config, Supabase URLs, environment keys
│   │   ├── database/             # supabaseClient.ts (configured with AsyncStorage)
│   │   ├── navigation/           # RootNavigator, role-based navigation configs
│   │   └── theme/                # theme.ts, ThemeProvider, typography, spacing
│   ├── modules/
│   │   ├── authentication/
│   │   │   ├── components/       # AuthCard, PasswordRulesIndicator
│   │   │   ├── screens/          # SplashScreen, WelcomeScreen, LoginScreen, SignUpScreen
│   │   │   └── services/         # authService.ts
│   │   ├── dashboard/
│   │   │   ├── components/       # PostCard, StatCard
│   │   │   ├── screens/          # AthleteDashboardScreen, CoachDashboardScreen, OrganiserDashboardScreen
│   │   │   └── services/         # feedService.ts
│   │   ├── messages/
│   │   │   ├── components/       # ChatBubble, ConversationItem
│   │   │   ├── screens/          # MessagesScreen, PrivateChatScreen
│   │   │   └── services/         # messageService.ts (with Realtime)
│   │   └── profile/
│   │       ├── components/       # ProfileHeader, StatGrid
│   │       ├── screens/          # OwnProfileScreen, EditProfileScreen, Onboarding screens
│   │       └── services/         # profileService.ts
│   └── shared/
│       ├── components/           # Button, Input, Card, Modal, ScreenContainer, TopBar
│       ├── constants/            # locations.ts, positions.ts, sports.ts (reused from web)
│       └── utils/                # dateUtils.ts (calculateAge), validation.ts
├── .eslintrc.js                  # ESLint with react-native/no-color-literals & no-inline-styles
├── package.json
└── tsconfig.json                 # TypeScript strict mode
```

### 4.2 Navigation Tree
Using React Navigation v7:
```
RootNavigator (Stack)
├── [PublicStack] (when !isAuthenticated)
│   ├── Splash
│   ├── Welcome
│   ├── Login
│   └── SignUp
│
└── [ProtectedStack] (when isAuthenticated)
    ├── [OnboardingWizardStack] (Athlete only, when !onboardingComplete)
    │   ├── SelectSports
    │   ├── CreateSportsProfile
    │   ├── PersonalInformation
    │   ├── PlayingInformation
    │   └── ProfileCompletion
    │
    └── [MainTabNavigator] (when onboardingComplete)
        ├── Tab 1: Home / Feed (AthleteDashboard / CoachDashboard / OrganiserDashboard)
        ├── Tab 2: Tournaments / Directory
        ├── Tab 3: Create Action (Elevated FAB)
        ├── Tab 4: Network / Connections
        └── Tab 5: Messages (MessagesScreen)
            └── [Stack Push]: PrivateChatScreen (hides bottom tab)
        ├── [Modal / Stack Push]: OwnProfileScreen
        └── [Modal / Stack Push]: EditProfileScreen
```

### 4.3 Design Token Implementation (`theme.ts`)
Zero hardcoded colors, spacing, or radii. Every style rule in `StyleSheet.create` references `theme.*`.

```typescript
// mobile/src/core/theme/theme.ts
export const theme = {
  colors: {
    primary: {
      50: '#F0FAF5',
      100: '#C8EDD9',
      200: '#6DFCB7',
      300: '#4CDF9D',
      400: '#00B87A', // Main brand CTA
      500: '#006C46', // Brand anchor
      600: '#005234',
      700: '#004128',
      800: '#002112',
      900: '#001208',
    },
    neutral: {
      0: '#FFFFFF',
      50: '#F8F9FB',  // Canvas background
      100: '#F2F4F6', // Cards / panels
      200: '#ECEEF0',
      300: '#E6E8EA',
      400: '#E0E3E5',
      500: '#BBCABF',
      600: '#6C7A70', // Outline
      700: '#3C4A41', // Secondary text
      800: '#191C1E', // Primary text
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
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  typography: {
    size: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 32,
    },
    weight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  layout: {
    appShellMaxWidth: 480,
    navHeight: 56,
  },
} as const;

export type Theme = typeof theme;
```

---

## 5. Data-Layer & Mobile Supabase Plan

### 5.1 Auth Session Storage
Per Supabase's official native recommendations, `mobile/src/core/database/supabaseClient.ts` will be configured as:
```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { config } from '../config';

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Manage token refresh on AppState transitions
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
```

### 5.2 Weak-Connectivity & Error Handling (Karur Pilot Reality)
Pilot users in Karur may experience intermittent 3G/4G coverage:
1. **Network Connectivity Awareness:** Use `@react-native-community/netinfo` to detect offline transitions. When offline, display an unobtrusive offline badge.
2. **Standard Error States:** Every query hook returns `{ data, error, isLoading, refetch }`. Screens must never render empty white space on network failure; they must render a styled `ErrorStateCard` with a retry button.
3. **Pull-to-Refresh:** All scrollable lists (`FlatList`) must implement `RefreshControl` with `theme.colors.primary[500]` tint color.

---

## 6. Web & Mobile Coexistence Plan

1. **Zero Schema Mutations:** The mobile app introduces **no** new tables, columns, or RLS alterations. It queries existing tables (`profiles`, `posts`, `conversations`, `messages`, `events`) using the existing PostgreSQL schemas.
2. **Session Independence:** Web sessions are keyed in browser `localStorage`. Mobile sessions are keyed in native `AsyncStorage`. Supabase GoTrue treats each client as an independent session instance under the same user ID. Logging in on mobile does not terminate the web session.
3. **Storage Conformance:** Avatar and media uploads in mobile must conform to the existing bucket limits set in migration `019_create_media_buckets.sql`:
   - `avatars`: max 5MB, MIME types `image/jpeg`, `image/png`, `image/webp`.
   - `posts`: max 10MB.
   - Files are uploaded to the user's scoped directory: `${userId}/${filename}`.

---

## 7. Design Workflow & Stitch Evaluation

### 7.1 Stitch MCP Status & Google `stitch::react-native` Evaluation
- **Stitch MCP Server:** The Stitch MCP server is registered in this environment, exposing `get_screen`, `list_screens`, etc., connecting to Authoritative Project `3941284064310403069`.
- **`stitch::react-native` Skill:** **UNVERIFIED / NOT AVAILABLE.** An exhaustive check of global skills (`C:\Users\admin\.gemini\config\skills`) and IDE plugins confirms that no `stitch::react-native` skill is installed in this runtime.
- **Evaluation:** As noted in the prompt, community/Labs automated HTML-to-RN conversion tools often produce messy, unmaintainable nested `<View>` structures with absolute positioning that fail accessibility and keyboard handling.

### 7.2 Authoritative Hand-Translation Workflow
Instead of unverified automated converters, we use a disciplined, token-bound hand translation:
1. **Source Inspection:** Query Stitch MCP `get_screen` for the screen's visual hierarchy, layout, and screenshot.
2. **Token Binding:** Every color, spacing, radius, and font size in the Stitch design is mapped strictly to `theme.*` tokens.
3. **Component Decomposition:** Deconstruct the screen into atomic pieces (<300 lines) using `ScreenContainer`, `Button`, `Input`, and `Card`.
4. **Native Behavior Integration:** Apply `KeyboardAvoidingView`, safe area insets, virtualized `FlatList`, and Android `BackHandler`.

---

## 8. Testing Strategy & Definition of Done

### 8.1 Testing Strategy
1. **Unit & Logic Tests (Jest):**
   - Reusable utils (`calculateAge`, validation rules).
   - Onboarding state transition logic.
   - Auth session resolver (`resolveProfile`).
2. **Static Analysis & Linting:**
   - `tsc --noEmit` (TypeScript strict mode, zero errors).
   - `eslint . --ext .ts,.tsx` (enforcing `no-color-literals` and `no-inline-styles`).
   - `node scripts/check-tokens.mjs` (AST scan verifying zero hardcoded spacing/radii).
3. **Android Target Verification:**
   - Run on an Android target (device or emulator).
   - Capture build output, install log, and verify smooth navigation, input response, and Supabase round-trip queries.

### 8.2 Definition of Done (for Phase 2 Scaffolding & Phase 3 Slices)
A module or phase is considered **Done** only when:
- [ ] TypeScript strict typecheck passes with zero errors (`tsc --noEmit`).
- [ ] ESLint passes with zero warnings or errors.
- [ ] Zero hardcoded hex colors, spacing, or font sizes (token check passes).
- [ ] List views use virtualized components (`FlatList` / `SectionList`) with empty, loading, and error states.
- [ ] Safe areas (`SafeAreaView`) and Android back button navigation are handled.
- [ ] Real Supabase queries work against live data with graceful mock fallbacks.
- [ ] Evidence pasted in report (actual terminal logs).

---

## 9. Gate 1: Required Operator Approvals Before Phase 2

Before proceeding to Phase 2 (Scaffolding `mobile/`), please approve or provide guidance on:

1. **Host Environment Setup:** Since JDK 17 and Android SDK/Studio are currently missing on this Windows machine, should we:
   - **(A) Recommend Operator installs JDK 17 & Android Studio locally** so we can run native emulator builds in Phase 2/3.
   - **(B) Scaffold `mobile/` with strict TypeScript, ESLint, theme, mock tests, and bundler compilation first**, while the native SDK is installed in parallel.
2. **Vertical Slice Approval:** Do you confirm the proposed slice: **Authentication + Role-Aware Shell + Athlete Profile / Onboarding + Direct Realtime Messaging (`MessagesScreen` / `PrivateChatScreen`)** as the Phase 3 deliverable?
3. **Navigation Framework Confirmation:** Confirm React Navigation v7 (bare TypeScript CLI, no Expo-managed workflow).
