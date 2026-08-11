# Dashboard Module (`src/modules/dashboard`)

This directory houses the role-specific landing dashboards and secondary analytical screens for SportIQ's four user roles: **Athlete**, **Coach**, **Organiser**, and **Government**.

_Last updated: 2026-08-04 (Government Dashboard exact-fidelity rebuild complete — all 4 roles done)._

---

## 1. Role Landing Dashboards: Status & Data Pipeline

| Role Dashboard | Component File | Stitch Screen ID | Rebuild Status | Data Split (Real vs. Mock) |
|---|---|---|---|---|
| **Athlete** | `AthleteDashboardScreen.tsx` | `6e6713d235b04d0eb2b65d50e0b87179` *(repurposed Home Feed)* | ✅ **DONE** (Real) | **Real Feed**: The social feed queries the real `posts` table (populated by `CreatePostScreen`), joined with the author's profile. Empty state is intrinsically handled if no posts exist. Note: The social interaction buttons (Like, Comment, Share) remain explicitly non-functional to prevent fake persistence. Performance-stats content previously shown here is preserved separately at `/profile/statistics`. |
| **Coach** | `CoachDashboardScreen.tsx` | `c806e8b69788433483ffab466ad4bd71` | ✅ **DONE** (Exact Fidelity) | **Partially Real**: "Total Athletes" KPI executes a real Supabase query (`getTotalAthletesCount()` in `athleteSearchService.ts`) with a mock fallback when null or error. Other sections (remaining stats, Today's Schedule, Academy Performance Chart, Recent Activity) use `COACH_MOCK_DATA`. Quick Action `MY_ATHLETES` routes to real `CoachAthleteSearchScreen`. |
| **Organiser** | `OrganiserDashboardScreen.tsx` | `03c76d2b022749369496ed362c229f98` | ✅ **DONE** (Exact Fidelity) | **Real with Mock Fallback**: "Upcoming Events" section executes a real Supabase query (`getUpcomingEvents()` in `organiserService.ts`) with `ORGANISER_MOCK_DATA.upcomingEvents` fallback when result is empty or errors. Bento KPI stats, Quick Actions, Active Tournaments, and Recent Activity use `ORGANISER_MOCK_DATA`. Quick Action `CREATE_EVENT` routes to real `CreateEventScreen`. |
| **Government** | `GovernmentDashboardScreen.tsx` | `8e35604d174d41f1bc256072de7c7f53` | ✅ **DONE** (Exact Fidelity) | **Real with Mock Fallback**: All 4 KPI stats execute real Supabase aggregate queries via `getGovernmentAnalytics()` in `analyticsService.ts`; fall back to `GOVERNMENT_MOCK_DATA.stats` values when `analytics` is null (loading/error). Registration Trend chart renders real `athletesByDistrict` data (shows empty-state message when none). Top Sports renders real `athletesBySport` data, falling back to `GOVERNMENT_MOCK_DATA.topSports` when empty. Recent Activity always uses `GOVERNMENT_MOCK_DATA.activities` (no real pipeline yet). Quick Actions: "Athletes" → real `CoachAthleteSearchScreen` (`ROUTES.ATHLETE_DIRECTORY`); "Organizations" → real `OrganizationDirectoryScreen` (`ROUTES.ORGANIZATION_DIRECTORY`); "Report" → `PlaceholderScreen` (`ROUTES.REPORTS`); "Leaderboards" → `PlaceholderScreen` (`ROUTES.LEADERBOARDS`). Government nav tab "Reports & Analytics" → `PlaceholderScreen` (`ROUTES.ANALYTICS`). |

### 1.1 Other Dashboard Features
| Feature | Component File | Stitch Screen ID | Rebuild Status | Data Split (Real vs. Mock) |
|---|---|---|---|---|
| **Create Post** | `CreatePostScreen.tsx` | `8cacd67b59894b2c9768fa930968233a` | ✅ **DONE** (Real) | **Real**: Composer form inserting directly into the real `posts` table (migration `009`). Uses `postService.createPost()`. Navigates back to the Dashboard upon success to view the newly created post in the feed. |

---

## 2. Unlinked-But-Present Demo & Secondary Screens on Disk

The following component files exist on disk in `src/modules/dashboard/screens/` but are **explicitly unlinked from routing** in `src/routing/AppRouter.tsx` (their corresponding routes render `PlaceholderScreen`). They contain static demo or secondary content, are preserved on disk for future integration, but are **not currently reachable**:

- **`CreateTournamentScreen.tsx`** & **`TeamManagementScreen.tsx`**:
  - Organiser role demo screens.
  - In `AppRouter.tsx`, `ROUTES.CREATE_TOURNAMENT` (`/tournaments/create`) and `ROUTES.TEAM_MANAGEMENT` (`/teams/manage`) map to `<PlaceholderScreen title="Coming Soon" ... />`.
- **`ReportsScreen.tsx`**, **`LeaderboardsScreen.tsx`**, & **`GovernmentAnalyticsScreen.tsx`**:
  - Secondary analytical screens (Government role).
  - In `AppRouter.tsx`, `ROUTES.REPORTS` (`/reports`), `ROUTES.LEADERBOARDS` (`/leaderboards`), and `ROUTES.ANALYTICS` (`/analytics`) all map to `<PlaceholderScreen title="Coming Soon" ... />`.
  - Note: All three component files are still imported at the top of `AppRouter.tsx` (lines 18–20) even though none of their three routes render them — dead imports intentionally preserved to keep the files tracked.

> **Rule for Developers:** Do not delete these unlinked screen files from disk. Do not route to them until their data integration and fidelity audits are scheduled.

---

## 3. Athlete Role Navigation & Header (Operator-Authored Content)

Unlike Coach, Organiser, and Government roles—which use Stitch-derived dashboards and standard 5-tab bottom navigation—the **Athlete** role uses custom **operator-authored content (not Stitch-sourced)**:

- **`AthleteTopBar`** (`src/shared/components/AthleteTopBar/AthleteTopBar.tsx`):
  - Renders only for the Athlete role (guarded in `AppLayout.tsx`).
  - Displays exactly 3 elements: **SportIQ Wordmark** (left), **Search Icon** (right), and **Profile Icon** (far right).
  - The profile icon fetches the logged-in user's real `avatar_url` via `getOwnProfile(user.id)` and falls back cleanly to a generic Material Symbols `person` icon when `avatar_url` is null.
  - Clicking the profile icon navigates directly to `ROUTES.PROFILE` (`/profile`).
- **`BottomNavBar` (Athlete Role Configuration)** (`navigationByRole[UserRole.Athlete]` in `src/core/navigation/config.ts`):
  - Renders exactly 5 items:
    1. **Home** (`/` — `home` icon)
    2. **Tournaments** (`ROUTES.TOURNAMENTS` — `emoji_events` icon)
    3. **Create-FAB** (`ROUTES.CREATE` — `add` icon, rendered in-row as an elevated FAB sibling)
    4. **Network** (`ROUTES.NETWORK` — `group` icon)
    5. **Messages** (`ROUTES.MESSAGES` — `chat` icon)
  - **No Profile Tab:** There is no Profile tab in the bottom bar for Athletes; profile access is handled exclusively via `AthleteTopBar`.
- **AI Coach Widget** (`AICoachWidget.tsx`):
  - Renders a static, non-functional AI Coach demo card for pitch purposes.
