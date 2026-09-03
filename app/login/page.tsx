"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase/client";
import Loader from "@/components/Loader";
import ChampMotDePasse from "@/components/ChampMotDePasse";

type Mode = "connexion" | "inscription" | "oubli";

function traduireErreurLien(erreur: string): string {
  if (erreur === "lien_incomplet") {
    return "Ce lien est incomplet — réessaie de le copier depuis l'email, ou redemande-en un nouveau.";
  }
  if (/expired/i.test(erreur)) {
    return "Ce lien a expiré. Redemande-en un nouveau ci-dessous.";
  }
  return `Ce lien n'a pas fonctionné (${erreur}). Redemande-en un nouveau ci-dessous.`;
}

function FormulaireConnexion() {
  const router = useRouter();
  const parametres = useSearchParams();
  const erreurLien = parametres.get("erreur");

  const [mode, setMode] = useState<Mode>("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<{ texte: string; erreur: boolean } | null>(
    erreurLien ? { texte: traduireErreurLien(erreurLien), erreur: true } : null
  );
  const [enCours, setEnCours] = useState(false);

  function changerMode(nouveauMode: Mode) {
    setMode(nouveauMode);
    setMessage(null);
    setMotDePasse("");
    setConfirmation("");
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setEnCours(true);

    const supabase = creerClientNavigateur();

    if (mode === "connexion") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: motDePasse,
      });
      setEnCours(false);
      if (error) {
        const texte = /invalid login credentials/i.test(error.message)
          ? "Email ou mot de passe incorrect."
          : `Connexion impossible (${error.message}).`;
        setMessage({ texte, erreur: true });
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    if (mode === "inscription") {
      if (motDePasse.length < 6) {
        setEnCours(false);
        setMessage({
          texte: "Le mot de passe doit faire au moins 6 caractères.",
          erreur: true,
        });
        return;
      }
      if (motDePasse !== confirmation) {
        setEnCours(false);
        setMessage({ texte: "Les deux mots de passe ne correspondent pas.", erreur: true });
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password: motDePasse,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      setEnCours(false);
      if (error) {
        setMessage({ texte: `Impossible de créer le compte (${error.message}).`, erreur: true });
        return;
      }
      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }
      setMessage({
        texte: "Compte créé. Vérifie tes emails pour le confirmer, puis connecte-toi.",
        erreur: false,
      });
      changerMode("connexion");
      return;
    }

    // mode === "oubli"
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/auth/nouveau-mot-de-passe`,
    });
    setEnCours(false);
    if (error) {
      setMessage({ texte: `Impossible d'envoyer l'email (${error.message}).`, erreur: true });
      return;
    }
    setMessage({
      texte: "Si un compte existe avec cet email, un lien pour choisir un nouveau mot de passe vient d'être envoyé.",
      erreur: false,
    });
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <h1 className="text-2xl font-semibold">Compagnon</h1>

      <form onSubmit={soumettre} className="flex w-full max-w-sm flex-col gap-4">
        <input
          type="email"
          required
          autoFocus
          placeholder="ton@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-lg border border-ligne bg-surface px-4 text-base text-encre shadow-legere"
        />

        {mode !== "oubli" && (
          <ChampMotDePasse
            required
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={setMotDePasse}
          />
        )}

        {mode === "inscription" && (
          <ChampMotDePasse
            required
            placeholder="Confirme le mot de passe"
            value={confirmation}
            onChange={setConfirmation}
          />
        )}

        {message && (
          <p className={`text-sm ${message.erreur ? "text-rouge" : "text-green-700"}`}>
            {message.texte}
          </p>
        )}

        <button
          type="submit"
          disabled={enCours}
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-accent text-base font-medium text-sur-accent shadow-legere disabled:opacity-50"
        >
          {enCours && <Loader taille={18} />}
          {enCours
            ? ""
            : mode === "connexion"
              ? "Se connecter"
              : mode === "inscription"
                ? "Créer mon compte"
                : "Recevoir le lien"}
        </button>
      </form>

      <div className="flex flex-col items-center gap-2 text-sm">
        {mode === "connexion" && (
          <>
            <button onClick={() => changerMode("oubli")} className="text-encre-douce underline">
              Mot de passe oublié ?
            </button>
            <button onClick={() => changerMode("inscription")} className="text-encre-douce underline">
              Créer un compte
            </button>
          </>
        )}
        {mode !== "connexion" && (
          <button onClick={() => changerMode("connexion")} className="text-encre-douce underline">
            Retour à la connexion
          </button>
        )}
      </div>
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
