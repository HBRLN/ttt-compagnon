"use client";

import { useState } from "react";
import { creerClientNavigateur } from "@/lib/supabase/client";

export default function PageConnexion() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
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
