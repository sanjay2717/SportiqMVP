import { supabase } from '../../../core/database/supabaseClient';

export interface ProfileOnboardingPayload {
  selectedSports: string[];
  bio: string;
  // avatar_url is intentionally omitted here — file upload to Supabase Storage
  // is a separate future task. The UI collects the file but we do not persist
  // it until a storage bucket and upload flow are implemented.
}

/**
 * Writes onboarding profile data (selected sports + bio) to the user's
 * public.profiles row. Uses UPDATE (not insert) — the row already exists
 * from the signup trigger. Avatar URL is not persisted here; see above.
 */
export async function updateProfileOnboarding(
  userId: string,
  payload: ProfileOnboardingPayload
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      selected_sports: payload.selectedSports,
      bio: payload.bio,
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

export interface PersonalInformationPayload {
  fullName: string;
  location?: string;
  age?: string;
  height?: string;
  weight?: string;
}

/**
 * Writes personal information data (Full Name) to the user's public.profiles row.
 * NOTE: Location, Age, Height, and Weight currently lack schema columns.
 * They are passed here but we explicitly log a warning.
 */
export async function updatePersonalInformation(
  userId: string,
  payload: PersonalInformationPayload
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: payload.fullName,
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }

  // Stopgap schema warning for unpersisted fields
  if (payload.location || payload.age || payload.height || payload.weight) {
    console.warn(
      'SCHEMA GAP: Location, Age, Height, and Weight cannot be persisted to Supabase yet. ' +
      'Ensure they are handled client-side (e.g. sessionStorage) pending a database migration.'
    );
  }
}

/**
 * Uploads a profile picture to Supabase Storage and updates the user's profile row.
 * Reusable function callable from onboarding or settings.
 * 
 * @param userId The user's ID
 * @param file The file to upload
 * @returns The public URL of the uploaded avatar
 */
export async function updateAvatarUrl(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

  // 1. Upload to Supabase Storage (PENDING BUCKET CREATION)
  // If the 'avatars' bucket does not exist, this will throw a StorageError
  // which is expected until the operator creates the bucket manually.
  const { error: uploadError, data } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  // 2. Get the public URL for the newly uploaded file
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const avatarUrl = publicUrlData.publicUrl;

  // 3. Update the profiles table with the new avatar_url
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (updateError) {
    throw updateError;
  }

  return avatarUrl;
}

/**
 * Terminal onboarding step: reads all sessionStorage-stopgapped data from
 * Personal Information and Playing Information screens, merges it into a single
 * Supabase UPDATE, and sets onboarding_complete = true.
 *
 * Called on mount by ProfileCompletionScreen. Clears both sessionStorage keys
 * on success. Throws on failure so the UI can show an error instead of fake success.
 *
 * PREREQUISITE: Migration 005_add_personal_and_playing_info.sql must be applied
 * in Supabase before this function can succeed.
 */
export async function completeOnboarding(userId: string): Promise<void> {
  // Read Personal Information stopgap (key verified against PersonalInformationScreen.tsx L13)
  let personalInfo: Record<string, string> = {};
  try {
    const raw = sessionStorage.getItem('sportiq_onboarding_personal_info');
    if (raw) personalInfo = JSON.parse(raw);
  } catch {
    // Missing or corrupt — treat all personal fields as absent (write null)
  }

  // Read Playing Information stopgap (key verified against PlayingInformationScreen.tsx L13)
  let playingInfo: Record<string, string> = {};
  try {
    const raw = sessionStorage.getItem('sportiq_onboarding_playing_info');
    if (raw) playingInfo = JSON.parse(raw);
  } catch {
    // Missing or corrupt — treat all playing fields as absent (write null)
  }

  // Parse numeric fields safely — null if absent/invalid
  const age = personalInfo.age ? parseInt(personalInfo.age, 10) : null;
  const height_cm = personalInfo.height ? parseFloat(personalInfo.height) : null;
  const weight_kg = personalInfo.weight ? parseFloat(personalInfo.weight) : null;
  const years_of_experience = playingInfo.experience ? parseInt(playingInfo.experience, 10) : null;

  // Single consolidated update — all fields + onboarding_complete in one call
  const { error } = await supabase
    .from('profiles')
    .update({
      location: personalInfo.location || null,
      age: isNaN(age as number) ? null : age,
      height_cm: isNaN(height_cm as number) ? null : height_cm,
      weight_kg: isNaN(weight_kg as number) ? null : weight_kg,
      dominant_foot: playingInfo.dominantFoot ? playingInfo.dominantFoot.toLowerCase() : null,
      primary_position: playingInfo.position || null,
      years_of_experience: isNaN(years_of_experience as number) ? null : years_of_experience,
      onboarding_complete: true,
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }

  // Clear both stopgap keys on success only
  sessionStorage.removeItem('sportiq_onboarding_personal_info');
  sessionStorage.removeItem('sportiq_onboarding_playing_info');
}

export interface ProfileData {
  id: string;
  full_name: string;
  role: string;
  bio: string | null;
  location: string | null;
  selected_sports: string[] | null;
  height_cm: number | null;
  weight_kg: number | null;
  dominant_foot: string | null;
  primary_position: string | null;
  years_of_experience: number | null;
  onboarding_complete: boolean;
  avatar_url: string | null;
}

export async function getOwnProfile(userId: string): Promise<ProfileData | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as ProfileData;
}

export interface EditProfilePayload {
  firstName: string;
  lastName: string;
  location: string;
  primarySport: string;
  position: string;
  bio: string;
  
  // Unmapped fields
  dateOfBirth?: string;
  currentTeam?: string;
  highlightReelUrl?: string;
  instagramUsername?: string;
}

/**
 * Updates the user's profile from the Edit Profile screen.
 * Handles the existing mapped fields, and logs a schema gap warning for unmapped ones.
 */
export async function updateEditProfile(
  userId: string,
  payload: EditProfilePayload
): Promise<void> {
  const fullName = `${payload.firstName} ${payload.lastName}`.trim();
  const selectedSports = payload.primarySport ? [payload.primarySport] : [];

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      location: payload.location || null,
      selected_sports: selectedSports,
      primary_position: payload.position || null,
      bio: payload.bio || null,
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }

  // Stopgap schema warning for unpersisted fields
  if (
    payload.dateOfBirth ||
    payload.currentTeam ||
    payload.highlightReelUrl ||
    payload.instagramUsername
  ) {
    console.warn(
      'SCHEMA GAP: Date of Birth, Current Team, Highlight Reel URL, and Instagram Username ' +
      'cannot be persisted to Supabase yet. Ensure they are handled client-side pending a database migration.'
    );
  }
}

