"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase/client";
import Loader from "@/components/Loader";
import ChampMotDePasse from "@/components/ChampMotDePasse";

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
        <h1 className="titre text-3xl">Mot de passe changé</h1>
        <p className="text-encre-douce">On t&apos;emmène sur l&apos;appli...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <h1 className="titre text-3xl">Nouveau mot de passe</h1>
      <form onSubmit={soumettre} className="flex w-full max-w-sm flex-col gap-4">
        <ChampMotDePasse
          required
          autoFocus
          placeholder="Nouveau mot de passe"
          value={motDePasse}
          onChange={setMotDePasse}
        />
        <ChampMotDePasse
          required
          placeholder="Confirme le mot de passe"
          value={confirmation}
          onChange={setConfirmation}
        />
        {erreur && (
          <p className="libelle border-l-2 border-accent bg-surface px-3 py-2.5 text-accent">{erreur}</p>
        )}
        <button
          type="submit"
          disabled={enCours}
          className="libelle flex h-14 items-center justify-center gap-2 bg-encre text-surface transition-transform duration-150 active:scale-[0.97] disabled:opacity-40"
        >
          {enCours && <Loader taille={18} />}
          {enCours ? "" : "Valider"}
        </button>
      </form>
    </div>
  );
}
