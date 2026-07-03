import { createClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
  // Use dedicated environment variables for Supabase, similar to the client-side setup.
  // This is more robust than parsing the DATABASE_URL.
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is not set. This is required for storage operations.");
  }

  if (!supabaseKey) {
    // The service_role key is recommended for server-side operations.
    // If using the anon key, ensure your bucket policies are configured for server-side uploads.
    console.warn("SUPABASE_KEY is not set. Storage features may not work as expected without a valid service_role or anon key.");
  }
  return { supabaseUrl, supabaseKey: supabaseKey || "" };
}

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    const { supabaseUrl, supabaseKey } = getSupabaseConfig();
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

// Storage helper functions
export async function uploadVideo(
  interviewId: string,
  videoBlob: Buffer,
  mimeType: string = "video/webm"
): Promise<string> {
  const supabase = getSupabaseClient();
  const fileName = `${interviewId}.webm`;
  const filePath = `interviews/${fileName}`;

  const { data, error } = await supabase.storage
    .from("videos")
    .upload(filePath, videoBlob, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload video: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("videos")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function uploadThumbnail(
  interviewId: string,
  thumbnailBlob: Buffer
): Promise<string> {
  const supabase = getSupabaseClient();
  const fileName = `${interviewId}.jpg`;
  const filePath = `thumbnails/${fileName}`;

  const { data, error } = await supabase.storage
    .from("videos")
    .upload(filePath, thumbnailBlob, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload thumbnail: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("videos")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
