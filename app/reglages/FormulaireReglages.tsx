"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  enregistrerProfil,
  regenererLienIcs,
  seDeconnecter,
} from "@/lib/actions/profil";
import type { Profil } from "@/lib/types";
import Loader from "@/components/Loader";

export default function FormulaireReglages({
  profil,
  email,
}: {
  profil: Profil;
  email: string;
}) {
  const [nomArtiste, setNomArtiste] = useState(profil.nom_artiste || "");
  const [nomSalon, setNomSalon] = useState(profil.nom_salon || "");
  const [emailReponse, setEmailReponse] = useState(profil.email_reponse || "");
  const [tel, setTel] = useState(profil.tel || "");
  const [adresse, setAdresse] = useState(profil.adresse || "");
  const [instagram, setInstagram] = useState(profil.instagram || "");
  const [signature, setSignature] = useState(profil.signature || "");
  const [rappelDelai, setRappelDelai] = useState(profil.rappel_delai_h);
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
        nom_salon: nomSalon,
        email_reponse: emailReponse,
        tel,
        adresse,
        instagram,
        signature,
        rappel_delai_h: rappelDelai,
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
      <header className="animate-apparition flex items-center gap-2 px-4 pt-8 pb-2">
        <Link
          href="/"
          className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-encre-douce transition-colors active:bg-surface"
          aria-label="Retour"
        >
          ←
        </Link>
        <h1 className="titre text-2xl">Réglages</h1>
      </header>

      <div className="flex flex-col gap-5 px-6 pt-3">
        <p className="text-sm text-encre-douce">Connecté en tant que {email}</p>

        <Champ label="Nom d'artiste">
          <input
            value={nomArtiste}
            onChange={(e) => surChangement(setNomArtiste)(e.target.value)}
            className="champ"
          />
        </Champ>

        <Champ label="Nom du salon">
          <input
            value={nomSalon}
            onChange={(e) => surChangement(setNomSalon)(e.target.value)}
            placeholder="La Belle Hirondelle"
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

        {!enregistre && (
          <button
            type="button"
            onClick={enregistrer}
            disabled={enCours}
            className="flex h-13 items-center justify-center gap-2 rounded-xl bg-encre text-sm font-medium text-fond transition-transform duration-200 active:scale-[0.98] disabled:opacity-40"
          >
            {enCours && <Loader taille={18} />}
            {enCours ? "Enregistrement..." : "Enregistrer"}
          </button>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="libelle">
            Abonnement à l&apos;agenda
          </h2>
          <p className="rounded-xl bg-surface p-4 font-mono text-sm break-all text-encre-douce">
            {lienIcs}
          </p>
          <button
            type="button"
            onClick={copierLien}
            className="h-12 rounded-xl bg-surface text-sm font-medium transition-transform duration-200 active:scale-[0.98]"
          >
            {copie ? "Copié !" : "Copier"}
          </button>
          <p className="text-sm text-encre-douce">
            Colle ce lien dans Réglages → Calendrier → Comptes → Ajouter un
            abonnement (iPhone), ou dans Google Agenda → Autres agendas → À partir
            de l&apos;URL.
          </p>
          <button
            type="button"
            onClick={regenererLien}
            className="mt-1 self-start text-sm font-medium text-alerte"
          >
            Régénérer le lien
          </button>
        </section>

        <Link href="/confidentialite" className="text-sm text-encre-douce underline">
          Confidentialité
        </Link>

        <button
          type="button"
          onClick={() => seDeconnecter()}
          className="mt-4 h-12 rounded-xl bg-surface text-sm font-medium text-encre-douce transition-transform duration-200 active:scale-[0.98]"
        >
          Se déconnecter
        </button>
      </div>

      <style>{`
        .champ {
          min-height: 48px;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
          border: none;
          border-radius: 0.75rem;
          background: var(--surface);
          color: var(--encre);
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
          font-family: inherit;
        }
        .champ::placeholder {
          color: var(--encre-douce);
        }
      `}</style>
    </div>
  );
}

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="libelle">{label}</span>
      {children}
    </label>
  );
}
