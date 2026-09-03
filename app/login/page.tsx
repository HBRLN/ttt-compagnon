"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase/client";

function traduireErreurLien(erreur: string): string {
  if (erreur === "lien_incomplet") {
    return "Ce lien de connexion est incomplet — réessaie de le copier depuis l'email, ou redemande-en un nouveau.";
  }
  if (/expired/i.test(erreur)) {
    return "Ce lien a expiré. Redemande-en un nouveau ci-dessous.";
  }
  if (/already been used|used|invalid/i.test(erreur)) {
    return "Ce lien a déjà été utilisé (souvent parce qu'une appli de messagerie l'a ouvert automatiquement avant toi). Redemande-en un nouveau et clique dessus directement, sans passer par un aperçu.";
  }
  return `Ce lien de connexion n'a pas fonctionné (${erreur}). Redemande-en un nouveau ci-dessous.`;
}

function FormulaireConnexion() {
  const parametres = useSearchParams();
  const erreurLien = parametres.get("erreur");

  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(
    erreurLien ? traduireErreurLien(erreurLien) : null
  );
  const [enCours, setEnCours] = useState(false);

  async function envoyerLien(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    setEnCours(false);

    if (error) {
      setErreur(`Impossible d'envoyer le lien (${error.message}). Réessaie dans un instant.`);
      return;
    }

    setEnvoye(true);
  }

  if (envoye) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-semibold">Vérifie tes emails</h1>
        <p className="text-neutral-600">
          On a envoyé un lien de connexion à <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <h1 className="text-2xl font-semibold">Compagnon</h1>
      <form onSubmit={envoyerLien} className="flex w-full max-w-sm flex-col gap-4">
        <input
          type="email"
          required
          autoFocus
          placeholder="ton@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-lg border border-neutral-300 px-4 text-base"
        />
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        <button
          type="submit"
          disabled={enCours}
          className="h-12 rounded-lg bg-neutral-900 text-base font-medium text-white disabled:opacity-50"
        >
          {enCours ? "Envoi..." : "Recevoir le lien de connexion"}
        </button>
      </form>
    </div>
  );
}

export default function PageConnexion() {
  return (
    <Suspense fallback={null}>
      <FormulaireConnexion />
    </Suspense>
  );
}
