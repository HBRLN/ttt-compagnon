"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import Loader from "@/components/Loader";
import { rechercherClientParTel, type ChampsRdv } from "@/lib/actions/rdv";
import { creerClientNavigateur } from "@/lib/supabase/client";
import type { Rdv } from "@/lib/types";

const DUREES = [30, 60, 90, 120, 150, 180, 240, 300, 360];

type Photo = { chemin: string; apercu: string };

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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [envoiPhotoEnCours, setEnvoiPhotoEnCours] = useState(false);
  const [survolDepot, setSurvolDepot] = useState(false);
  const [plusDeDetails, setPlusDeDetails] = useState(!!rdvInitial);
  const inputFichierRef = useRef<HTMLInputElement>(null);

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

  // Photos déjà présentes sur un RDV existant : on récupère des aperçus
  // (bucket privé, donc URL signée) une seule fois au chargement.
  useEffect(() => {
    const cheminsExistants = rdvInitial?.photo_urls;
    if (!cheminsExistants?.length) return;

    (async () => {
      const supabase = creerClientNavigateur();
      const { data } = await supabase.storage
        .from("photos")
        .createSignedUrls(cheminsExistants, 3600);
      if (!data) return;
      setPhotos(
        data
          .map((resultat, i) => ({
            chemin: cheminsExistants[i],
            apercu: resultat.signedUrl,
          }))
          .filter((p): p is Photo => !!p.apercu)
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ajouterPhotos(fichiers: FileList | File[]) {
    const liste = Array.from(fichiers).filter((f) => f.type.startsWith("image/"));
    if (liste.length === 0) return;

    setEnvoiPhotoEnCours(true);
    setErreur(null);
    try {
      const supabase = creerClientNavigateur();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Non connecté");

      const nouvelles: Photo[] = [];
      for (const fichier of liste) {
        const chemin = `${userData.user.id}/${crypto.randomUUID()}-${fichier.name}`;
        const { error } = await supabase.storage.from("photos").upload(chemin, fichier);
        if (error) throw error;
        nouvelles.push({ chemin, apercu: URL.createObjectURL(fichier) });
      }
      setPhotos((p) => [...p, ...nouvelles]);
    } catch {
      setErreur("Impossible d'envoyer une ou plusieurs photos. Réessaie.");
    } finally {
      setEnvoiPhotoEnCours(false);
    }
  }

  function retirerPhoto(chemin: string) {
    setPhotos((p) => p.filter((photo) => photo.chemin !== chemin));
  }

  function surDepot(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setSurvolDepot(false);
    if (e.dataTransfer.files?.length) ajouterPhotos(e.dataTransfer.files);
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
          photo_urls: photos.map((p) => p.chemin),
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
          href={rdvInitial ? `/rdv/${rdvInitial.id}` : "/rdv"}
          className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-encre-douce active:bg-surface-douce"
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
            <p className="mt-1 text-sm text-encre-douce">
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

        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-3">
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

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-encre-douce">
            Photos d&apos;inspiration
          </span>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setSurvolDepot(true);
            }}
            onDragLeave={() => setSurvolDepot(false)}
            onDrop={surDepot}
            onClick={() => inputFichierRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg p-6 text-center text-sm shadow-legere transition-colors ${
              survolDepot ? "bg-surface text-encre" : "bg-surface-douce text-encre-douce"
            }`}
          >
            <span>Glisse des photos ici, ou touche pour choisir</span>
            <input
              ref={inputFichierRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) ajouterPhotos(e.target.files);
                e.target.value = "";
              }}
              className="hidden"
            />
          </div>
          {envoiPhotoEnCours && (
            <p className="flex items-center gap-2 text-sm text-encre-douce">
              <Loader taille={14} /> Envoi...
            </p>
          )}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div
                  key={photo.chemin}
                  className="relative aspect-square overflow-hidden rounded-lg bg-surface-douce"
                >
                  <Image
                    src={photo.apercu}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => retirerPhoto(photo.chemin)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm text-white"
                    aria-label="Retirer cette photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setPlusDeDetails((v) => !v)}
          className="py-2 text-left text-sm font-medium text-encre-douce"
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

        {erreur && <p className="text-sm text-rouge">{erreur}</p>}

        <button
          type="submit"
          disabled={enCours}
          className="mt-2 flex h-12 items-center justify-center gap-2 rounded-lg bg-accent text-base font-medium text-sur-accent shadow-legere transition-transform duration-150 active:scale-95 disabled:opacity-50"
        >
          {enCours && <Loader taille={18} />}
          {enCours ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      <style>{`
        .champ {
          min-height: 44px;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
          border-radius: 0.5rem;
          background: var(--surface);
          color: var(--encre);
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
          font-family: inherit;
          box-shadow: var(--ombre-legere);
        }
        .champ::placeholder {
          color: var(--encre-douce);
        }
      `}</style>
    </div>
  );
}

function Champ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <span className="text-sm font-medium text-encre-douce">{label}</span>
      {children}
    </label>
  );
}
