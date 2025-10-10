import { createClient } from "@supabase/supabase-js";

// Supabase configuration from environment variables
// These should be set in Replit Secrets:
// - VITE_SUPABASE_URL: Your Supabase project URL (e.g., https://your-project.supabase.co)
// - VITE_SUPABASE_KEY: Your Supabase anon/public key (safe to expose in browser)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

// Create Supabase client only if credentials are provided
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

/**
 * Upload video to Supabase Storage
 * Note: Supabase Storage supports files up to 5GB
 * Returns the public URL if successful, null if Supabase not configured
 */
export async function uploadVideoToSupabase(
  interviewId: string,
  videoBlob: Blob
): Promise<string | null> {
  if (!supabase) {
    console.warn('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY environment variables.');
    return null;
  }

  const fileName = `${interviewId}.webm`;
  const filePath = `interviews/${fileName}`;

  try {
    // Upload the video blob
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, videoBlob, {
        contentType: 'video/webm',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading video to Supabase:', uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Exception uploading video to Supabase:', error);
    return null;
  }
}

/**
 * Upload thumbnail to Supabase Storage
 * Returns the public URL if successful, null if Supabase not configured
 */
export async function uploadThumbnailToSupabase(
  interviewId: string,
  thumbnailBlob: Blob
): Promise<string | null> {
  if (!supabase) {
    console.warn('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY environment variables.');
    return null;
  }

  const fileName = `${interviewId}.jpg`;
  const filePath = `thumbnails/${fileName}`;

  try {
    // Upload the thumbnail blob
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, thumbnailBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading thumbnail to Supabase:', uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Exception uploading thumbnail to Supabase:', error);
    return null;
  }
}
