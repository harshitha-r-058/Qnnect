import { createClient } from "@supabase/supabase-js";

// Extract Supabase URL and key from DATABASE_URL
// DATABASE_URL format: postgresql://[user]:[password]@[host]/[database]
// We'll construct Supabase URL from the host
function getSupabaseConfig() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  // Extract host from DATABASE_URL
  const match = dbUrl.match(/@([^:\/]+)/);
  if (!match) {
    throw new Error("Could not parse DATABASE_URL");
  }

  const host = match[1];
  
  // Supabase project URL format: https://[project-ref].supabase.co
  // Extract project-ref from host (format: db.[project-ref].supabase.co)
  const projectMatch = host.match(/db\.([^\.]+)\.supabase\.co/);
  if (!projectMatch) {
    throw new Error("Not a valid Supabase database URL");
  }

  const projectRef = projectMatch[1];
  const supabaseUrl = `https://${projectRef}.supabase.co`;
  
  // For Supabase Storage, we need the anon key
  // This should be set as an environment variable
  const supabaseKey = process.env.SUPABASE_KEY || "";
  
  if (!supabaseKey) {
    console.warn("SUPABASE_KEY not set - storage features will not work");
  }

  return { supabaseUrl, supabaseKey };
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
