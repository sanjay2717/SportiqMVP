export enum UserRole {
  Athlete = 'athlete',
  Coach = 'coach',
  Organiser = 'organiser',
  Government = 'government',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
  avatar_url?: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingComplete: boolean | null;
}
