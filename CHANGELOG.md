# Changelog

## [0.2.0] — 2026-07-24

### Added
- Integration of Google Stitch designs for the Authentication module.
- Splash Screen featuring animated loading indicator, logo, and automatic redirection logic.
- Login Screen with form validations, password visibility toggle, and real Google sign-in using Supabase OAuth.
- Sign Up Screen with validation, signup data persistence (using localStorage), and role selection (Athlete, Coach, Organiser, Govt Official).
- Guarded routes via `ProtectedRoute` and `PublicRoute` wrappers in `AppRouter`.
- Interactive logout mechanism in placeholder layouts to allow end-to-end flow testing.

## [0.1.0] — 2026-07-23


### Added
- Project initialization with React 18, TypeScript, and Vite
- Design token system (colors, typography, spacing, radius, elevation, animation)
- Core infrastructure (AuthProvider, NavigationProvider, ThemeProvider, config, network)
- Routing architecture with placeholder routes
- Shared component folder structure
- 6 active MVP module scaffolds (authentication, profile, social, search, notifications, settings)
- Future module documentation in docs/future-modules/
- AI knowledge base in .ai/
