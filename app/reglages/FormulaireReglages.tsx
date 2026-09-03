"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  enregistrerProfil,
  regenererLienIcs,
  seDeconnecter,
} from "@/lib/actions/profil";
import type { Profil } from "@/lib/types";

export default function FormulaireReglages({
  profil,
  email,
}: {
  profil: Profil;
  email: string;
}) {
  const [nomArtiste, setNomArtiste] = useState(profil.nom_artiste || "");
  const [emailReponse, setEmailReponse] = useState(profil.email_reponse || "");
  const [tel, setTel] = useState(profil.tel || "");
  const [adresse, setAdresse] = useState(profil.adresse || "");
  const [instagram, setInstagram] = useState(profil.instagram || "");
  const [signature, setSignature] = useState(profil.signature || "");
  const [rappelDelai, setRappelDelai] = useState(profil.rappel_delai_h);
  const [soinActif, setSoinActif] = useState(profil.soin_actif);
  const [icsToken, setIcsToken] = useState(profil.ics_token);

  const [enregistre, setEnregistre] = useState(true);
  const [copie, setCopie] = useState(false);
  const [enCours, startTransition] = useTransition();

  const origine = typeof window !== "undefined" ? window.location.origin : "";
  const lienIcs = `${origine}/api/ics/${icsToken}`;

  function enregistrer() {
    startTransition(async () => {
      await enregistrerProfil({
        nom_artiste: nomArtiste,
        email_reponse: emailReponse,
        tel,
        adresse,
        instagram,
        signature,
        rappel_delai_h: rappelDelai,
        soin_actif: soinActif,
      });
      setEnregistre(true);
    });
  }

  function surChangement<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setEnregistre(false);
    };
  }

  async function copierLien() {
    await navigator.clipboard.writeText(lienIcs);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  async function regenererLien() {
    if (!confirm("Régénérer le lien ? L'ancien lien cessera de fonctionner."))
      return;
    const nouveauToken = await regenererLienIcs();
    setIcsToken(nouveauToken);
  }

  return (
    <div className="flex min-h-dvh flex-col pb-16">
      <header className="flex items-center gap-2 px-4 pt-6 pb-2">
        <Link
          href="/"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 active:bg-neutral-100"
          aria-label="Retour"
        >
          ←
        </Link>
        <h1 className="text-lg font-semibold">Réglages</h1>
      </header>

      <div className="flex flex-col gap-4 px-5 pt-2">
        <p className="text-sm text-neutral-500">Connecté en tant que {email}</p>

        <Champ label="Nom d'artiste">
          <input
            value={nomArtiste}
            onChange={(e) => surChangement(setNomArtiste)(e.target.value)}
            className="champ"
          />
        </Champ>

        <Champ label="Email de réponse">
          <input
            type="email"
            value={emailReponse}
            onChange={(e) => surChangement(setEmailReponse)(e.target.value)}
            className="champ"
          />
        </Champ>

        <Champ label="Téléphone">
          <input
            type="tel"
            value={tel}
            onChange={(e) => surChangement(setTel)(e.target.value)}
            className="champ"
          />
        </Champ>

        <Champ label="Adresse du studio">
          <input
            value={adresse}
            onChange={(e) => surChangement(setAdresse)(e.target.value)}
            className="champ"
          />
        </Champ>

        <Champ label="Instagram">
          <input
            value={instagram}
            onChange={(e) => surChangement(setInstagram)(e.target.value)}
            placeholder="@..."
            className="champ"
          />
        </Champ>

        <Champ label="Signature">
          <textarea
            rows={2}
            value={signature}
            onChange={(e) => surChangement(setSignature)(e.target.value)}
            className="champ resize-none"
          />
        </Champ>

        <Champ label="Délai de rappel">
          <select
            value={rappelDelai}
            onChange={(e) => surChangement(setRappelDelai)(Number(e.target.value))}
            className="champ"
          >
            <option value={24}>24 h avant</option>
            <option value={48}>48 h avant</option>
            <option value={72}>72 h avant</option>
          </select>
        </Champ>

        <label className="flex min-h-11 items-center justify-between gap-3">
          <span>Message de soins automatique</span>
          <input
            type="checkbox"
            checked={soinActif}
            onChange={(e) => surChangement(setSoinActif)(e.target.checked)}
            className="h-5 w-5"
          />
        </label>

        {!enregistre && (
          <button
            type="button"
            onClick={enregistrer}
            disabled={enCours}
            className="h-12 rounded-lg bg-neutral-900 text-base font-medium text-white disabled:opacity-50"
          >
            {enCours ? "Enregistrement..." : "Enregistrer"}
          </button>
        )}

        <hr className="my-2 border-neutral-200" />

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-neutral-500">
            Abonnement à l&apos;agenda
          </h2>
          <p className="break-all rounded-lg bg-neutral-50 p-3 font-mono text-sm text-neutral-600">
            {lienIcs}
          </p>
          <button
            type="button"
            onClick={copierLien}
            className="h-11 rounded-lg border border-neutral-300 font-medium"
          >
            {copie ? "Copié !" : "Copier"}
          </button>
          <p className="text-sm text-neutral-500">
            Colle ce lien dans Réglages → Calendrier → Comptes → Ajouter un
            abonnement (iPhone), ou dans Google Agenda → Autres agendas → À partir
            de l&apos;URL.
          </p>
          <button
            type="button"
            onClick={regenererLien}
            className="mt-1 self-start text-sm font-medium text-red-600"
          >
            Régénérer le lien
          </button>
        </section>

        <hr className="my-2 border-neutral-200" />

        <Link href="/confidentialite" className="text-sm text-neutral-500 underline">
          Confidentialité
        </Link>

        <button
          type="button"
          onClick={() => seDeconnecter()}
          className="mt-4 h-11 rounded-lg border border-neutral-300 font-medium text-neutral-700"
        >
          Se déconnecter
        </button>
      </div>

      <style>{`
        .champ {
          min-height: 44px;
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #d4d4d4;
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-neutral-600">{label}</span>
      {children}
    </label>
  );
}
