"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { rechercherClientParTel, type ChampsRdv } from "@/lib/actions/rdv";
import { creerClientNavigateur } from "@/lib/supabase/client";
import type { Rdv } from "@/lib/types";

const DUREES = [30, 60, 90, 120, 150, 180, 240, 300, 360];

function libelleDuree(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const reste = min % 60;
  return reste ? `${h} h ${reste}` : `${h} h`;
}

function versDateEtHeureLocales(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const heure = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, heure };
}

export default function FormulaireRdv({
  titre,
  rdvInitial,
  chercherHistorique = true,
  onValider,
}: {
  titre: string;
  rdvInitial?: Rdv;
  chercherHistorique?: boolean;
  onValider: (champs: ChampsRdv) => Promise<void>;
}) {
  const initDate = rdvInitial ? versDateEtHeureLocales(rdvInitial.debut) : null;

  const [prenom, setPrenom] = useState(rdvInitial?.client_prenom || "");
  const [nom, setNom] = useState(rdvInitial?.client_nom || "");
  const [tel, setTel] = useState(rdvInitial?.client_tel || "");
  const [email, setEmail] = useState(rdvInitial?.client_email || "");
  const [date, setDate] = useState(initDate?.date || "");
  const [heure, setHeure] = useState(initDate?.heure || "");
  const [duree, setDuree] = useState(rdvInitial?.duree_min ?? 120);
  const [projet, setProjet] = useState(rdvInitial?.projet || "");
  const [emplacement, setEmplacement] = useState(rdvInitial?.emplacement || "");
  const [tarif, setTarif] = useState(rdvInitial?.tarif_estime?.toString() || "");
  const [acompteMontant, setAcompteMontant] = useState(
    rdvInitial?.acompte_montant?.toString() || ""
  );
  const [acomptePaye, setAcomptePaye] = useState(rdvInitial?.acompte_paye || false);
  const [notes, setNotes] = useState(rdvInitial?.notes || "");
  const [photoUrl, setPhotoUrl] = useState(rdvInitial?.photo_url || "");
  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const [plusDeDetails, setPlusDeDetails] = useState(!!rdvInitial);

  const [historique, setHistorique] = useState<{
    nbSeances: number;
    prenom: string;
    email: string | null;
  } | null>(null);

  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const dernierTel = useRef("");

  useEffect(() => {
    if (!chercherHistorique) return;
    const telTrimme = tel.trim();
    const identifiant = telTrimme;
    const minuteur = setTimeout(async () => {
      if (telTrimme.length < 6) {
        if (dernierTel.current === identifiant) setHistorique(null);
        return;
      }
      const resultat = await rechercherClientParTel(telTrimme);
      if (dernierTel.current !== identifiant) return;
      setHistorique(resultat);
      if (resultat) {
        setPrenom((p) => p || resultat.prenom);
        setEmail((e) => e || resultat.email || "");
      }
    }, 400);
    dernierTel.current = identifiant;
    return () => clearTimeout(minuteur);
  }, [tel, chercherHistorique]);

  async function surChoixPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setEnvoiPhoto(true);
    setErreur(null);
    try {
      const supabase = creerClientNavigateur();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Non connecté");

      const chemin = `${userData.user.id}/${crypto.randomUUID()}-${fichier.name}`;
      const { error } = await supabase.storage.from("photos").upload(chemin, fichier);
      if (error) throw error;

      setPhotoUrl(chemin);
    } catch {
      setErreur("Impossible d'envoyer la photo. Réessaie.");
    } finally {
      setEnvoiPhoto(false);
    }
  }

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!prenom.trim() || !date || !heure) {
      setErreur("Prénom, date et heure sont nécessaires.");
      return;
    }

    const debut = new Date(`${date}T${heure}:00`);
    if (Number.isNaN(debut.getTime())) {
      setErreur("Date ou heure invalide.");
      return;
    }

    startTransition(async () => {
      try {
        await onValider({
          client_prenom: prenom,
          client_nom: nom || undefined,
          client_tel: tel || undefined,
          client_email: email || undefined,
          debut: debut.toISOString(),
          duree_min: duree,
          projet: projet || undefined,
          emplacement: emplacement || undefined,
          tarif_estime: tarif ? Number(tarif) : undefined,
          acompte_montant: acompteMontant ? Number(acompteMontant) : undefined,
          acompte_paye: acomptePaye,
          photo_url: photoUrl || undefined,
          notes: notes || undefined,
        });
      } catch (err) {
        if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
        setErreur("Impossible d'enregistrer. Réessaie.");
      }
    });
  }

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <header className="flex items-center gap-2 px-4 pt-6 pb-2">
        <Link
          href={rdvInitial ? `/rdv/${rdvInitial.id}` : "/"}
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 active:bg-neutral-100"
          aria-label="Retour"
        >
          ←
        </Link>
        <h1 className="text-lg font-semibold">{titre}</h1>
      </header>

      <form onSubmit={soumettre} className="flex flex-col gap-4 px-5 pt-2">
        <Champ label="Prénom">
          <input
            required
            autoFocus={!rdvInitial}
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="champ"
          />
        </Champ>

        <Champ label="Téléphone">
          <input
            type="tel"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            className="champ"
          />
          {historique && (
            <p className="mt-1 text-sm text-neutral-500">
              Déjà venu·e — {historique.nbSeances} séance
              {historique.nbSeances > 1 ? "s" : ""}
            </p>
          )}
        </Champ>

        <Champ label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="champ"
          />
        </Champ>

        <div className="grid grid-cols-2 gap-3">
          <Champ label="Date">
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="champ"
            />
          </Champ>
          <Champ label="Heure">
            <input
              type="time"
              required
              value={heure}
              onChange={(e) => setHeure(e.target.value)}
              className="champ"
            />
          </Champ>
        </div>

        <Champ label="Durée">
          <select
            value={duree}
            onChange={(e) => setDuree(Number(e.target.value))}
            className="champ"
          >
            {DUREES.map((min) => (
              <option key={min} value={min}>
                {libelleDuree(min)}
              </option>
            ))}
          </select>
        </Champ>

        <Champ label="Projet">
          <textarea
            rows={3}
            value={projet}
            onChange={(e) => setProjet(e.target.value)}
            className="champ resize-none"
          />
        </Champ>

        <button
          type="button"
          onClick={() => setPlusDeDetails((v) => !v)}
          className="py-2 text-left text-sm font-medium text-neutral-500"
        >
          {plusDeDetails ? "− Moins de détails" : "+ Plus de détails"}
        </button>

        {plusDeDetails && (
          <div className="flex flex-col gap-4">
            <Champ label="Nom">
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="champ"
              />
            </Champ>
            <Champ label="Emplacement">
              <input
                value={emplacement}
                onChange={(e) => setEmplacement(e.target.value)}
                placeholder="avant-bras gauche, dos..."
                className="champ"
              />
            </Champ>
            <Champ label="Tarif estimé (€)">
              <input
                type="number"
                inputMode="decimal"
                value={tarif}
                onChange={(e) => setTarif(e.target.value)}
                className="champ"
              />
            </Champ>
            <Champ label="Acompte (€)">
              <input
                type="number"
                inputMode="decimal"
                value={acompteMontant}
                onChange={(e) => setAcompteMontant(e.target.value)}
                className="champ"
              />
            </Champ>
            <label className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                checked={acomptePaye}
                onChange={(e) => setAcomptePaye(e.target.checked)}
                className="h-5 w-5"
              />
              <span>Acompte payé</span>
            </label>
            <Champ label="Photo de référence">
              <input
                type="file"
                accept="image/*"
                onChange={surChoixPhoto}
                className="champ"
              />
              {envoiPhoto && (
                <p className="mt-1 text-sm text-neutral-500">Envoi...</p>
              )}
              {photoUrl && !envoiPhoto && (
                <p className="mt-1 text-sm text-neutral-500">Photo enregistrée.</p>
              )}
            </Champ>
            <Champ label="Notes">
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="champ resize-none"
              />
            </Champ>
          </div>
        )}

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <button
          type="submit"
          disabled={enCours}
          className="mt-2 h-12 rounded-lg bg-neutral-900 text-base font-medium text-white disabled:opacity-50"
        >
          {enCours ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

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
