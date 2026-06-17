import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client voor Server Components, Route Handlers en Server Actions.
// Gebruikt de Next.js cookie-store voor sessiebeheer.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll kan vanuit een Server Component falen — dat is veilig te
            // negeren wanneer de middleware de sessie alsnog ververst.
          }
        },
      },
    }
  );
}
