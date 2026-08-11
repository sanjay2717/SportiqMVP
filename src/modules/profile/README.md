# Profile Module

This module encompasses the user's Profile flows, including the onboarding sequence for profile creation, and the steady-state profile viewing and editing screens.

## Screens Built So Far

| Screen | Route | Stitch ID | Purpose |
|---|---|---|---|
| Select Sports | `/select-sports` | `9dcf3c98d6014b138364c73940b03698` | Multi-select grid for sports of interest during onboarding. First step in the sequence. |
| Create Sports Profile | `/create-sports-profile` | `36a44b1ec6244d9db3556da84ddc7948` | Gathers basic professional info (name, role, bio, photo). Second step. |
| Profile Picture Upload | `/profile-picture-upload` | `447f102ffc074887858038b1db75698c` | Optional insert for photo upload. |
| Personal Information | `/personal-information` | `ab64f6d07cdd4308b9e9d5f0524946a4` | Gathers location and physical metrics. Second step. |
| Playing Information | `/playing-information` | `c50b8ebdd26e49e088f221712c631fc6` | Gathers dominant foot, primary position, and years of experience. Third step. |
| Playing Information | `/playing-information` | `c50b8ebdd26e49e088f221712c631fc6` | Gathers dominant foot, primary position, and years of experience. Third step. |
| Profile Completion | `/profile-completion` | `c022afa7e2084368b6bbdba3eaa078d2` | Terminal screen — consolidates all onboarding data + sets onboarding_complete. Fourth step. |
| Own Profile | `/profile` | `dea731f2d6d046cba33074bea97f0dc7` | Authenticated user's profile view. Closes the onboarding loop and displays real user data. |
| Edit Profile | `/profile/edit` | `539c8051c32e4e7787bc7233c2aa0730` | Role-aware form for all four user types. Renders universal fields vs Athlete-only fields. |
| Achievements | `/achievements` | `b25601c5f3a14d5d8b77068b1c7a5d54` | Full standalone achievements gallery using real `achievements` table. |
| Achievement Form | `/achievements/form` | `4a2fe79c7eff405da3579fdbb7e545eb` | Form to create and insert into real `achievements` table. |

## Onboarding Wizard Structure (Resolved 2026-07-25)

The wizard is **4 required steps**, with one optional/reusable screen inserted after Step 1. Full resolved order:

| Position | Screen | Status | Step Counter |
|---|---|---|---|
| Pre-wizard | **Select Sports** | ✅ Built | None (separate 35% bar) |
| Required Step 1/4 | **Create Sports Profile** | ✅ Built | Step 1 of 4 |
| Optional insert | **Profile Picture Upload** | ✅ Built | Not counted — optional & skippable; also reusable from Edit Profile / Settings |
| Required Step 2/4 | **Personal Information** | ✅ Built | Step 2 of 4 |
| Required Step 3/4 | **Playing Information** | ✅ Built | Step 3 of 4 |
| Required Step 4/4 | **Profile Completion** | ✅ Built | Step 4 of 4 (terminal screen) |

> **✅ Core 4-step onboarding wizard is now fully built end-to-end.** All four required steps (Create Sports Profile, Personal Information, Playing Information, Profile Completion) plus the optional Profile Picture Upload screen are implemented.


## Integration Gaps

> **IMPORTANT:** Onboarding flow is NOT yet auto-triggered after Login/SignUp. This is a deliberate, tracked gap — see integration task list — pending an 'onboarding complete' flag on `StoredUser`.

## Module Scope Notes

- **Profile Preview:** The Profile Preview screen (`96974a1bd17340dab744ce7fbbb1af6c`) is currently **HELD** and removed from the MVP scope per `module-registry.md`. Do not build it unless explicitly reactivated.
- **Achievements:** ✅ **Resolved**. Both the standalone page (gallery) and the embedded section (form) are now implemented. They map to the real `achievements` table via migration `008`.

## Database Schema

The `public.profiles` table stores extended user information.

**Schema:**
- `id` (uuid, primary key, references `auth.users(id)` cascading delete)
- `full_name` (text)
- `role` (text)
- `selected_sports` (text array, defaults to `{}`)
- `onboarding_complete` (boolean, defaults to `false`)
- `created_at` (timestamptz, defaults to `now()`)
- `updated_at` (timestamptz, defaults to `now()`)

**Automation:**
- A database trigger (`handle_new_user`) automatically populates a row here on signup, pulling `full_name` and `role` from the `auth.users` raw metadata.

**Security (RLS):**
- Row Level Security (RLS) is enabled.
- Users are restricted to SELECT, UPDATE, and INSERT their **own** row only (`auth.uid() = id`).
- > **Note:** A policy to allow users to view/edit others' profiles (for the future Public Profile screen) is a deliberate follow-up task and is NOT yet implemented.

**Schema Gaps — Status:**
- **Bio** ✅ **Resolved** — Migration `002_add_bio_avatar_to_profiles.sql` adds a `bio text` column with a `CHECK (char_length(bio) <= 500)` constraint. Bio is now persisted via `updateProfileOnboarding()` in `profileService.ts`.
- **Avatar URL** ⏳ **Still pending** — Migration `002` adds the `avatar_url text` column to the schema, but file upload to Supabase Storage is a separate future task. The UI `Upload Image` button is present but non-functional for persistence. `avatar_url` is intentionally excluded from the current `updateProfileOnboarding()` call until a storage bucket and upload flow are implemented.
- **Physical Metrics & Location** ✅ **Resolved** — Migration `005_add_personal_and_playing_info.sql` adds `location`, `age`, `height_cm`, `weight_kg` columns. Now persisted via `completeOnboarding()` in `profileService.ts` (called by `ProfileCompletionScreen` on mount). **APPLY MANUALLY before this flow works in production.**
- **Playing Information** ✅ **Resolved** — Migration `005_add_personal_and_playing_info.sql` adds `dominant_foot`, `primary_position`, `years_of_experience` columns. Now persisted via `completeOnboarding()`. **APPLY MANUALLY.**
- **ROUTES.PROFILE** now points to the real `OwnProfileScreen`. `ROUTES.EDIT_PROFILE` now points to the real role-aware `EditProfileScreen`.
- **Empty States**: The Stitch design for Own Profile references mock stats ("Impact Score", "Top Speed") and achievements/matches. Since there is currently no backend support for these features outside of dashboard mock data, `OwnProfileScreen` renders structured empty states for these sections rather than inventing fake data.
