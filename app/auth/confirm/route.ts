import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";

function destination(type: string | null): string {
  return type === "recovery" ? "/auth/nouveau-mot-de-passe" : "/";
}

// Callback des emails d'auth (confirmation d'inscription, réinitialisation
// de mot de passe). Traité côté serveur, pas côté navigateur : le flux
// PKCE de Supabase stocke une info de vérification liée à l'appareil/onglet
// qui a initié la demande, dans un cookie plutôt qu'en localStorage — un
// traitement serveur la retrouve même si le lien est ouvert depuis un
// autre contexte (l'app Mail plutôt que Safari, par exemple).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const supabase = await creerClientServeur();

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(
        `${origin}${destination(searchParams.get("type"))}`
      );
    }
    return NextResponse.redirect(
      `${origin}/login?erreur=${encodeURIComponent(error.message)}`
    );
  }

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${destination(type)}`);
    }
    return NextResponse.redirect(
      `${origin}/login?erreur=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}/login?erreur=lien_incomplet`);
}
