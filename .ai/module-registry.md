# Module Ownership Registry

**Authoritative Stitch Project ID:** `3941284064310403069` — SportIQ Mobile Design System
**Governance rule:** See `.ai/stitch-workflow.md` → Project Governance section. Single project, no remixing, read-only shared MCP access for non-architects.
**Last synced:** 2026-08-04
**Source inventories:** Full codebase state inventory + full Stitch workspace inventory, originally produced 2026-07-25; Government Dashboard status updated 2026-08-04 post-rebuild.

---

## Module Summary Table

| Module | Owner | Branch | Build Status | Screens Built / Total | Blocked On |
|---|---|---|---|---|---|
| Authentication | Unassigned | Not created | **Complete** | 6 / 7 *(Account Created deferred)* | — |
| Profile | Unassigned | Not created | In progress | 7 / 13 (12 active, 1 held) | Shared component interfaces (Button, Input) must be frozen first |
| Social | Unassigned | Not created | Not started | 0 / 8 *(excl. assets)* | Post Detail ambiguity — operator must pick v1 or v2 before work begins; shared component interfaces |
| Search | Unassigned | Not created | Not started | 0 / 4 | Shared component interfaces |
| Messaging | Unassigned | Not created | Not started | 0 / 2 | Shared component interfaces |
| Notifications | Unassigned | Not created | Not started | 0 / 1 | Shared component interfaces |
| Settings | Unassigned | Not created | Not started | 0 / 1 | Shared component interfaces |
| Role Dashboards | Unassigned | Not created | ACTIVE — MVP Demo Sprint | 4 / 4 *(all 4 exact-fidelity rebuilt)* | Partially wired real queries with mock fallback |

---

## Per-Module Screen Detail

### Authentication

All screens wrapped in `<PublicRoute>`. Verified navigation flow documented in `src/modules/authentication/README.md`.

**Core Infrastructure Note:**
- **OnboardingGate:** Implemented to guard the root `/` dashboard route. It is **Athlete-only**: redirects to `/select-sports` when `onboarding_complete` is `false`. It explicitly does **not** affect Coach, Organiser, or Government roles.

| Screen Name | Screen ID | Build Status | Notes |
|---|---|---|---|
| Splash Screen | `e6284d8b57064d34b643bee9cdeb12c4` | Built | `SplashScreen.tsx` — auto-navigates after 2500 ms |
| Welcome to SportIQ | `5dd2f754420c452f8661d1a9b739fdb9` | Built | `WelcomeScreen.tsx` — Get Started / Sign In / Explore as Guest |
| Login | `904ea4a3b2a94ea9b2a95c4a45b702a3` | Built | `LoginScreen.tsx` — credential form + Google login mock |
| Sign Up | `1ecbe3fbb0e64da187c25f35ed61722b` | Built | `SignUpScreen.tsx` — role selector, persists to localStorage |
| Verify Email | `223bbcb17016423580c0ce687e3ce88a` | Built | `VerifyEmailScreen.tsx` — Currently **unreachable** due to "Confirm Email" disabled in Supabase. This is an accepted, documented gap per operator decision, not a bug to fix. |
| Forgot Password | `aa5f559dd1d140c9bfadb231a301ebf9` | Built | `ForgotPasswordScreen.tsx` — email form + inline success state |
| Account Created | `f64fb0ec78e149a989612c50b892d55e` | Deferred | Flow currently skips this screen (SignUp -> VerifyEmail directly). Pending operator decision on whether to build it. Not an oversight. |

---

### Profile

Route: `/profile` (registered, Protected, currently renders `PlaceholderScreen`). 13 screens assigned from Stitch.

AMBIGUITY — Three Profile View Screens: Own Profile, Public Profile, and Profile Preview are three distinct screens. Do NOT treat them as duplicates or variants of each other. Own Profile is the authenticated user's editable view; Public Profile is another user's read-only view; Profile Preview is a lightweight card shown before navigating to the full profile.

AMBIGUITY — Two Achievements Screens: "Achievements" (`b25601c5f3a14d5d8b77068b1c7a5d54`, 780x2126) is a standalone full page. "Achievements Section" (`4a2fe79c7eff405da3579fdbb7e545eb`, 780x3940) is an embedded section likely rendered inside another screen (e.g., Own Profile). These are not the same and should not be conflated.

RESOLVED 2026-07-25 — Onboarding Wizard Step Structure: A Stitch diagnostic revealed conflicting "Step X of Y" labels across onboarding screens (Create Sports Profile showed Step 1/4; Playing Information showed Step 3/4; Profile Picture Upload showed Step 1/5 — irreconcilable without operator input). Resolution per operator decision 2026-07-25:
- The **required wizard is 4 steps**: Create Sports Profile (1/4) → Personal Information (2/4) → Playing Information (3/4) → Profile Completion (4/4, terminal).
- **Profile Picture Upload is optional and reusable** — inserted in the flow after Create Sports Profile, but skippable, and NOT counted in the 4-step progress indicator. It is also intended to be callable from Edit Profile / Settings (i.e., not onboarding-exclusive).
- **Full resolved screen order**: Select Sports (pre-wizard, no step counter) → Create Sports Profile (Step 1/4) → Profile Picture Upload (optional, skippable insert) → Personal Information (Step 2/4) → Playing Information (Step 3/4) → Profile Completion (Step 4/4).

| Screen Name | Screen ID | Build Status | Notes |
|---|---|---|---|
| Own Profile | `dea731f2d6d046cba33074bea97f0dc7` | ✅ Built — OwnProfileScreen.tsx | Authenticated user's full profile — editable view. Replaced ROUTES.OWN_PROFILE with ROUTES.PROFILE |
| Public Profile | `2afba692135d42719f2f1d65ead9bfc9` | Not built | Another user's profile — read-only view |
| Profile Preview | `96974a1bd17340dab744ce7fbbb1af6c` | 🔸 HELD — deferred from current MVP scope per operator decision 2026-07-25. Do not build until explicitly reactivated. | Lightweight card before navigating to full profile |
| Create Sports Profile | `36a44b1ec6244d9db3556da84ddc7948` | ✅ Built — CreateSportsProfileScreen.tsx | Onboarding setup wizard for sports-specific details |
| Profile Completion | `c022afa7e2084368b6bbdba3eaa078d2` | ✅ Built — ProfileCompletionScreen.tsx | Terminal onboarding screen (Step 4/4). Calls completeOnboarding() on mount — consolidates all sessionStorage-stopgapped fields + sets onboarding_complete = true in a single Supabase UPDATE. PREREQUISITE: migration 005_add_personal_and_playing_info.sql must be applied manually. |
| Edit Profile | `539c8051c32e4e7787bc7233c2aa0730` | Not built | Form to update name, bio, and personal fields |
| Personal Information | `ab64f6d07cdd4308b9e9d5f0524946a4` | ✅ Built — PersonalInformationScreen.tsx | Onboarding Step 2/4 — Full Name, Location (Region), Age, Height, Weight. **SCHEMA GAP RESOLVED** by migration 005. Location/Age/Height/Weight now persisted via completeOnboarding() in ProfileCompletionScreen. |
| Playing Information | `c50b8ebdd26e49e088f221712c631fc6` | ✅ Built — PlayingInformationScreen.tsx | Onboarding Step 3/4 — Dominant Foot, Primary Position, Years of Experience. **SCHEMA GAP RESOLVED** by migration 005. Fields now persisted via completeOnboarding() in ProfileCompletionScreen. |
| Profile Picture Upload | `447f102ffc074887858038b1db75698c` | ✅ Built — ProfilePictureUploadScreen.tsx (optional, reusable) | ⚠️ Optional/reusable — NOT counted in the 4-step progress. Inserted between Step 1 and Step 2 in onboarding; also callable from Edit Profile / Settings. |
| Statistics | `a5ab76d056d5477d8dd8f2e0ba0ed81c` | ✅ Built — StatisticsScreen.tsx | Static demo data, relocated from Athlete Dashboard |
| Achievements | `b25601c5f3a14d5d8b77068b1c7a5d54` | Not built | Full standalone achievements page (780x2126) |
| Achievements Section | `4a2fe79c7eff405da3579fdbb7e545eb` | Not built | Embedded achievements panel within another page (780x3940) — likely inside Own Profile |
| Select Sports | `9dcf3c98d6014b138364c73940b03698` | ✅ Built — SelectSportsScreen.tsx | Multi-select grid for sports of interest — onboarding |

Profile Settings (`f53e82b64d484729a86a69d17e0619cd`) — see Settings module below; ownership split is pending operator decision.

⚠️ OPEN PRODUCT DECISION — onboarding_complete flag: The `onboarding_complete` boolean is now set to `true` by `ProfileCompletionScreen` on successful save. However, Login/SignUp do NOT yet read this flag to auto-redirect new users into the onboarding wizard (Select Sports → … → Profile Completion) on first login. Wiring that routing decision is explicitly deferred — pending operator decision on how to handle users who partially completed onboarding, users who skip steps, and whether to re-enter onboarding on subsequent logins if the flag is false.

---

### Social

Route: No dedicated route yet (no Home Feed, Create Post routes registered). 8 buildable screens.

BLOCKER — Post Detail ambiguity: Two separate Stitch entries share the name "Post Detail":
  Post Detail v1: `bc326d7ec976480cb73568c23fcc9bac` (780x2682)
  Post Detail v2: `e91d12a23c784df3973fffe4818d7b34` (780x2454)
The operator must confirm which is authoritative before Social module work begins. Do not assume. Do not implement both.

| Screen Name | Screen ID | Build Status | Notes |
|---|---|---|---|
| Home Feed | `6e6713d235b04d0eb2b65d50e0b87179` | ✅ Built — AthleteDashboardScreen.tsx | **ACTIVE — MVP Demo Sprint.** Activated early for athlete dashboard; rest of Social module remains deferred. Static demo. |
| Post Detail (v1) | `bc326d7ec976480cb73568c23fcc9bac` | Not built | 780x2682 — see ambiguity flag above |
| Post Detail (v2) | `e91d12a23c784df3973fffe4818d7b34` | Not built | 780x2454 — see ambiguity flag above |
| Empty Feed | `fdaacdf294d243d29a940b171a3fa037` | Not built | Empty state when feed has no content |
| Create Post | `8cacd67b59894b2c9768fa930968233a` | Not built | Composer form to author a new post |
| Sports Community | `d24d1ca83f164c0395059e64a0de57d4` | Not built | Community groups or topic-based discussion listing |
| Connections | `f55432c01428410488ad5899fb5bd953` | Not built | List of followers / following |
| Share Sheet | `52b6aae41f2d42c885e6eb2802970ee2` | Not built | Bottom sheet to share content externally |

---

### Search

Route: `/search` (registered, Protected, currently renders `PlaceholderScreen`). 4 screens.

| Screen Name | Screen ID | Build Status | Notes |
|---|---|---|---|
| Search Home | `c7a5817367f64ef3ba36193b3530f780` | Not built | Default search landing with suggestions/categories |
| Athlete Search (Generic) | `f5ce6050839b419c8792ef94d655b4ba` | Not built | Generic athlete search |
| Athlete Search (Coach View) | `4870121b7dc646bab512912d0bf9dff5` | ✅ Built — CoachAthleteSearchScreen.tsx | **ACTIVE — MVP Demo Sprint.** Activated early for coach dashboard; rest of Search module remains deferred. |
| Search Filters | `1b55904d583948998d4da9b580cd64bc` | Not built | Filter panel to refine search results |
| Empty Search | `bd16514846f54da8aef23cf32a49c779` | Not built | Empty state when search returns no results |

---

### Messaging

Route: `/messages` (registered, Protected, currently renders `PlaceholderScreen`). 2 screens.

| Screen Name | Screen ID | Build Status | Notes |
|---|---|---|---|
| Messages | `e96861ef8d874036840cbf5e3c787634` | Not built | Inbox / conversation list view |
| Private Chat | `0c73ecbd86984b6492c5f13155a694f0` | Not built | Direct messaging thread between two users |

---

### Notifications

Route: `/notifications` (registered, Protected, currently renders `PlaceholderScreen`). 1 screen.

| Screen Name | Screen ID | Build Status | Notes |
|---|---|---|---|
| Notifications | `cb5af3fbadc24b4e8921daec97788808` | Not built | Chronological list of alerts and activity updates |

---

### Settings

Route: `/settings` (registered, Protected, currently renders `PlaceholderScreen`). 1 screen.

Ownership resolved: "Profile Settings" (`f53e82b64d484729a86a69d17e0619cd`) belongs to the Settings module.

| Screen Name | Screen ID | Build Status | Notes |
|---|---|---|---|
| Profile Settings | `f53e82b64d484729a86a69d17e0619cd` | Not built | Application and account settings panel |

---

### Role Dashboards (Modules 8-10)

| Screen Name | Screen ID | Build Status | Notes |
|---|---|---|---|
| Athlete Dashboard | `6e6713d235b04d0eb2b65d50e0b87179` *(repurposed Home Feed)* | ✅ DONE — Rebuilt/Restored | Displays social feed content (posts, match cards, likes/comments). Uses static demo data (`// STATIC DEMO`). Note: The performance-stats content previously shown here is preserved separately at `/profile/statistics` (`StatisticsScreen.tsx`, Stitch ID `a5ab76d056d5477d8dd8f2e0ba0ed81c`). |
| Coach Dashboard | `c806e8b69788433483ffab466ad4bd71` | ✅ DONE — Exact-fidelity rebuild | Partially real: Total Athletes stat executes real Supabase query (`getTotalAthletesCount()`) with mock fallback when null/error; all other stats, schedule, Academy Chart, and Recent Activity use `COACH_MOCK_DATA`. Quick Action `MY_ATHLETES` routes to real `CoachAthleteSearchScreen`. |
| Organiser Dashboard | `03c76d2b022749369496ed362c229f98` | ✅ DONE — Exact-fidelity rebuild | Real with mock fallback: Upcoming Events executes real `getUpcomingEvents()` Supabase service query with `ORGANISER_MOCK_DATA.upcomingEvents` fallback when empty or error; Bento KPI stats, Quick Actions, Active Tournaments, and Recent Activity use `ORGANISER_MOCK_DATA`. Quick Action `CREATE_EVENT` routes to real `CreateEventScreen`. |
| Government Dashboard | `8e35604d174d41f1bc256072de7c7f53` | ✅ DONE — Exact-fidelity rebuild | **Real with mock fallback**: All 4 KPI stats (Total Registered Athletes, Verified Coaches, Organizations, Active Events) execute real Supabase aggregate queries via `getGovernmentAnalytics()` in `analyticsService.ts`; when `analytics` is null (loading/error) they fall back to `GOVERNMENT_MOCK_DATA.stats` values. Registration Trend chart renders real `athletesByDistrict` data (empty state with "No district data available" message when none). Top Sports renders real `athletesBySport` data with `GOVERNMENT_MOCK_DATA.topSports` fallback when empty. Recent Activity always uses `GOVERNMENT_MOCK_DATA.activities` (no real pipeline yet). Quick Actions: "Athletes" → real `CoachAthleteSearchScreen` (`ROUTES.ATHLETE_DIRECTORY`); "Organizations" → real `OrganizationDirectoryScreen` (`ROUTES.ORGANIZATION_DIRECTORY`); "Report" → `PlaceholderScreen` (`ROUTES.REPORTS`); "Leaderboards" → `PlaceholderScreen` (`ROUTES.LEADERBOARDS`). Government nav "Reports & Analytics" tab → `PlaceholderScreen` (`ROUTES.ANALYTICS`). |

#### Unlinked-But-Present Demo & Secondary Screens on Disk
The following files exist on disk in `src/modules/dashboard/screens/` but are explicitly **unlinked from routing** in `AppRouter.tsx` (their corresponding routes render `PlaceholderScreen`). They contain static demo or secondary content and are not currently reachable:
- `CreateTournamentScreen` and `TeamManagementScreen` (Organiser role demo screens; `ROUTES.CREATE_TOURNAMENT` and `ROUTES.TEAM_MANAGEMENT` map to `PlaceholderScreen`).
- `ReportsScreen`, `LeaderboardsScreen`, and `GovernmentAnalyticsScreen` (`ROUTES.REPORTS`, `ROUTES.LEADERBOARDS`, `ROUTES.ANALYTICS` map to `PlaceholderScreen`).

#### Athlete Role Custom Navigation & Header (Operator-Authored)
Unlike Coach, Organiser, and Government roles—which use Stitch-derived dashboards and standard 5-tab navigation—the Athlete role uses custom **operator-authored content (not Stitch-sourced)**:
- **`AthleteTopBar`** (`src/shared/components/AthleteTopBar/AthleteTopBar.tsx`): Sticky top header rendering SportIQ wordmark, search icon, and profile icon showing the logged-in user's real `avatar_url` (with clean generic icon fallback when null).
- **`BottomNavBar` (Athlete Config)** (`navigationByRole[UserRole.Athlete]` in `src/core/navigation/config.ts`): Configured with exactly 5 items: `Home` (`/`), `Tournaments` (`ROUTES.TOURNAMENTS`), `Create-FAB` (`ROUTES.CREATE`, in-row elevated FAB item), `Network` (`ROUTES.NETWORK`), and `Messages` (`ROUTES.MESSAGES`). There is no Profile tab in the bottom bar; profile navigation is handled via `AthleteTopBar`.
- **AI Coach Widget**: A static, non-functional floating widget rendering a feature sheet for an AI Coach.

---

### Events

Route: `/events` and `/events/create` (registered, Protected). This module is fully functional and uses real Supabase queries via `eventService`.

⚠️ **LAW TWO EXCEPTION**: This module was built WITHOUT a Stitch trace (operator-authorized 2026-07-26/27) due to unresolved duplicate-name ambiguity in the Events module's Stitch screens.
**MIGRATION STATUS**: Relies on `006_create_events_table.sql`.

| Screen Name | Screen ID | Build Status | Notes |
|---|---|---|---|
| Events List | N/A | ✅ Built — EventsListScreen.tsx | Displays real events from Supabase. No Stitch trace (Law Two Exception). |
| Create Event | N/A | ✅ Built — CreateEventScreen.tsx | Real form inserting into Supabase. Promoted from placeholder. No Stitch trace (Law Two Exception). |

---

## Deferred Module Design Assets

These screens exist in the Stitch workspace but belong to Phase 2+ deferred modules. Per Law One (module isolation), they must not be implemented in `src/modules/` until their respective phase is active.

Design reference only — do not implement, module not active per Law One.

| Screen Name | Screen ID | Deferred Module |
|---|---|---|
| Leaderboards | `3b207c1506f040fdb4d7435901209a0d` | Leaderboards (Phase 2) |
| Events Hub | `09124d10bf104ecfb1418abfa4ace1bf` | Events (Phase 2) |

---

## Non-Screen Assets

These entries exist in the Stitch workspace but are not buildable screens. They must never be assigned a route or implemented as standalone screens.

| Asset Name | Screen ID | What It Is | Useful For |
|---|---|---|---|
| SportIQ Brand Logo | `78ae045fc771443c82590079868d1aa5` | 1024x1024 logo image; htmlCode is empty | Source asset for logo img tags across all screens |
| Shader | `42feb90fcc9642d2bcdf4ae98d8a88ec` | 512x512 gradient/shader fragment; no screenshot | Reference when implementing background gradient animations (e.g., Splash or Welcome ambient effects) |
| Loading Experience | `70d4900c5b46473f9311665ed3e69b4d` | Dimensions 100%x100%; reusable loading overlay fragment, not a page | Reference when building a global loading spinner or skeleton shared component |
| SportIQ Design System Specs | `5e1e402a98c0476197927df0ede19819` | Full design token documentation page (780x4432) | Reference for color, typography, and spacing values when cross-checking tokens.css |
| Feed Card Variations (v1) | `2e310dfa955444e7ad225a6d817680ec` | Component library sheet showing card design variants (780x2300) | Reference when building the Social FeedCard shared component |
| Feed Card Variations (v2) | `94c15f7037cb48c8a06ee9a43b2c0b9c` | Duplicate component library sheet (780x2300) | Same as v1 — may represent a later design iteration; compare both before finalising FeedCard |

---

## Shared Component Status

As of codebase inventory 2026-07-25, all 11 shared components are type-stubs only — they contain a types.ts with an empty interface and an index.ts barrel, with no implementation.

PRIMARY CROSS-MODULE BLOCKER: Button and Input prop interfaces must be frozen and implemented before Profile and Social module work begins in parallel. Parallel module work against stub interfaces will result in conflicting assumptions and breaking changes when the real components ship.

| Component | Location | Current Status |
|---|---|---|
| Avatar | `src/shared/components/Avatar/` | Type-stub only — AvatarProps {} |
| Badge | `src/shared/components/Badge/` | Type-stub only — BadgeProps {} |
| Button | `src/shared/components/Button/` | Interface frozen — pending implementation |
| Card | `src/shared/components/Card/` | Interface frozen — pending implementation |
| ComingSoon | `src/shared/components/ComingSoon/` | Type-stub only — ComingSoonProps {} |
| Dialog | `src/shared/components/Dialog/` | Type-stub only — DialogProps {} |
| EmptyState | `src/shared/components/EmptyState/` | Type-stub only — EmptyStateProps {} |
| Input | `src/shared/components/Input/` | Interface frozen — pending implementation |
| Loading | `src/shared/components/Loading/` | Type-stub only — LoadingProps {} |
| Tag | `src/shared/components/Tag/` | Type-stub only — TagProps {} |
| Typography | `src/shared/components/Typography/` | Interface frozen — pending implementation |
| Navigation System | `src/shared/layouts/AppLayout/`, `src/shared/navigation/BottomNav/` | ✅ Built — Shared role-aware Navigation. Sourced from Stitch ID `6abbefa84f6f43a8953a782b9d635176` ("Navigation & Menus" — a component reference sheet). Enforces `navigationByRole` config and currently wraps 16 routes (Dashboard root, Profile, Edit Profile, Search, Messages, Notifications, Settings, My Athletes, Events, Create Event, Leaderboards, Achievements, Schedule, Tournaments, Analytics, Create). |

Note: PlaceholderScreen is the only currently implemented shared component (`src/shared/components/PlaceholderScreen/PlaceholderScreen.tsx`). It is used by all 5 orphaned post-auth placeholder routes.
