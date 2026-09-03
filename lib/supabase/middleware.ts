import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CHEMINS_PUBLICS = ["/login", "/auth/confirm", "/confidentialite"];

export async function mettreAJourSession(request: NextRequest) {
  let reponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesAPoser) {
          for (const { name, value } of cookiesAPoser) {
            request.cookies.set(name, value);
          }
          reponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesAPoser) {
            reponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cheminPublic = CHEMINS_PUBLICS.some((chemin) =>
    request.nextUrl.pathname.startsWith(chemin)
  );

  if (!user && !cheminPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return reponse;
}
