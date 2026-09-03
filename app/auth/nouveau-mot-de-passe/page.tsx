"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase/client";

export default function PageNouveauMotDePasse() {
  const router = useRouter();
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [reussi, setReussi] = useState(false);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (motDePasse.length < 6) {
      setErreur("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setEnCours(true);
    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setEnCours(false);

    if (error) {
      setErreur(error.message);
      return;
    }
    setReussi(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1200);
  }

  if (reussi) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-semibold">Mot de passe changé</h1>
        <p className="text-neutral-600">On t&apos;emmène sur l&apos;appli...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <h1 className="text-2xl font-semibold">Nouveau mot de passe</h1>
      <form onSubmit={soumettre} className="flex w-full max-w-sm flex-col gap-4">
        <input
          type="password"
          required
          autoFocus
          placeholder="Nouveau mot de passe"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="h-12 rounded-lg border border-neutral-300 px-4 text-base"
        />
        <input
          type="password"
          required
          placeholder="Confirme le mot de passe"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="h-12 rounded-lg border border-neutral-300 px-4 text-base"
        />
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        <button
          type="submit"
          disabled={enCours}
          className="h-12 rounded-lg bg-neutral-900 text-base font-medium text-white disabled:opacity-50"
        >
          {enCours ? "..." : "Valider"}
        </button>
      </form>
    </div>
  );
}
