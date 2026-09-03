import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

// Client service_role : contourne RLS. Ne doit jamais être importé
// depuis du code exécuté côté client (le mot-clé "server-only" le garantit).
// Réservé aux routes qui n'ont pas de session utilisateur : le flux .ics
// public et la fonction de relances.
export function creerClientAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
