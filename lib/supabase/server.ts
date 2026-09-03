import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types";

// Client Supabase côté serveur, lié aux cookies de la requête.
// Respecte RLS : chaque utilisateur ne voit que ses propres données.
export async function creerClientServeur() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesAPoser) {
          try {
            for (const { name, value, options } of cookiesAPoser) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Appelé depuis un Server Component : le middleware s'occupe
            // du rafraîchissement de session, on peut ignorer ici.
          }
        },
      },
    }
  );
}
