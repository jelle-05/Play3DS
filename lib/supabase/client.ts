import { createBrowserClient } from "@supabase/ssr";

// Supabase client voor Client Components (browser).
// Leest de publieke env-vars; deze zijn niet geheim (anon key is client-safe).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Handig om te checken of Supabase überhaupt geconfigureerd is.
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
