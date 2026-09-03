"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { creerClientNavigateur } from "@/lib/supabase/client";

// Supabase peut renvoyer le lien magique sous deux formes selon la
// configuration du projet : les jetons dans le fragment de l'URL
// (#access_token=...), ou un token_hash + type dans la query string.
// On gère les deux ici, côté client, plutôt que de parier sur l'une des deux.
export default function PageConfirmation() {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = creerClientNavigateur();

      const hash = new URLSearchParams(window.location.hash.slice(1));
      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (!error) {
          router.replace("/");
          return;
        }
        setErreur(error.message);
        return;
      }

      const recherche = new URLSearchParams(window.location.search);
      const token_hash = recherche.get("token_hash");
      const type = recherche.get("type") as EmailOtpType | null;

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        if (!error) {
          router.replace("/");
          return;
        }
        setErreur(error.message);
        return;
      }

      setErreur("lien_incomplet");
    })();
  }, [router]);

  if (!erreur) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-neutral-500">Connexion en cours...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold">Ce lien n&apos;a pas fonctionné</h1>
      <p className="max-w-sm text-sm text-neutral-600">
        {erreur === "lien_incomplet"
          ? "Le lien semble incomplet."
          : erreur}
      </p>
      <Link
        href="/login"
        className="mt-2 flex h-12 items-center justify-center rounded-lg bg-neutral-900 px-6 text-base font-medium text-white"
      >
        Redemander un lien
      </Link>
    </div>
  );
}
