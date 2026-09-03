import { type NextRequest } from "next/server";
import { mettreAJourSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return mettreAJourSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|api/ics|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
