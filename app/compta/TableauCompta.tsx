"use client";

import { useEffect, useState, useTransition } from "react";
import { ajouterDepense, supprimerDepense } from "@/lib/actions/depenses";
import { ajouterGain, supprimerGain } from "@/lib/actions/gains";
import Loader from "@/components/Loader";
import CompteurAnime from "@/components/CompteurAnime";
import type { Depense, Gain, Rdv } from "@/lib/types";

type Vue = "mois" | "annee";
type Formulaire = "depense" | "gain" | null;
type Mouvement = (Depense | Gain) & { type: "gain" | "depense" };

const MOIS_LABELS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];
const SEMAINE_LABELS = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"];
const MOIS_COMPLETS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function formaterMontant(montant: number): string {
  return `${Math.round(montant).toLocaleString("fr-FR")} €`;
}

function formaterDateDepense(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
    new Date(`${date}T00:00:00`)
  );
}

function dateLocaleAujourdhui(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function moisDeLaDate(date: string): number {
  return new Date(`${date}T00:00:00`).getMonth();
}

export default function TableauCompta({
  rdvs,
  depenses,
  gains,
}: {
  rdvs: Pick<Rdv, "debut" | "tarif_estime">[];
  depenses: Depense[];
  gains: Gain[];
}) {
  const [vue, setVue] = useState<Vue>("annee");
  const [barreSelectionnee, setBarreSelectionnee] = useState<number | null>(null);
  const [formulaireOuvert, setFormulaireOuvert] = useState<Formulaire>(null);
  const [filtreMois, setFiltreMois] = useState("");
  const [enCours, startTransition] = useTransition();

  const moisCourant = new Date().getMonth();

  const gainsRdvParMois = Array(12).fill(0);
  for (const r of rdvs) {
    gainsRdvParMois[new Date(r.debut).getMonth()] += r.tarif_estime || 0;
  }

  const gainsManuelsParMois = Array(12).fill(0);
  for (const g of gains) {
    gainsManuelsParMois[moisDeLaDate(g.date)] += g.montant;
  }

  const depensesParMois = Array(12).fill(0);
  for (const d of depenses) {
    depensesParMois[moisDeLaDate(d.date)] += d.montant;
  }

  const gainsParMois = gainsRdvParMois.map((g, i) => g + gainsManuelsParMois[i]);

  const gainsParSemaine = Array(5).fill(0);
  for (const r of rdvs) {
    const d = new Date(r.debut);
    if (d.getMonth() === moisCourant) {
      const semaine = Math.min(4, Math.floor((d.getDate() - 1) / 7));
      gainsParSemaine[semaine] += r.tarif_estime || 0;
    }
  }
  for (const g of gains) {
    const d = new Date(`${g.date}T00:00:00`);
    if (d.getMonth() === moisCourant) {
      const semaine = Math.min(4, Math.floor((d.getDate() - 1) / 7));
      gainsParSemaine[semaine] += g.montant;
    }
  }

  const depensesParSemaine = Array(5).fill(0);
  for (const d of depenses) {
    const dd = new Date(`${d.date}T00:00:00`);
    if (dd.getMonth() === moisCourant) {
      const semaine = Math.min(4, Math.floor((dd.getDate() - 1) / 7));
      depensesParSemaine[semaine] += d.montant;
    }
  }

  const netParMois = gainsParMois.map((g, i) => g - depensesParMois[i]);
  const netParSemaine = gainsParSemaine.map((g, i) => g - depensesParSemaine[i]);

  const gainsAnnee = gainsParMois.reduce((s, v) => s + v, 0);
  const depensesAnnee = depensesParMois.reduce((s, v) => s + v, 0);
  const gainsMoisCourant = gainsParSemaine.reduce((s, v) => s + v, 0);
  const depensesMoisCourant = depensesParSemaine.reduce((s, v) => s + v, 0);

  const labels = vue === "annee" ? MOIS_LABELS : SEMAINE_LABELS;
  const valeurs = vue === "annee" ? netParMois : netParSemaine;
  const totalGains = vue === "annee" ? gainsAnnee : gainsMoisCourant;
  const totalDepenses = vue === "annee" ? depensesAnnee : depensesMoisCourant;
  const net = totalGains - totalDepenses;
  const maxAbs = Math.max(...valeurs.map(Math.abs), 1);

  const depensesAffichees =
    filtreMois === ""
      ? depenses
      : depenses.filter((d) => moisDeLaDate(d.date) === Number(filtreMois));
  const gainsAffiches =
    filtreMois === "" ? gains : gains.filter((g) => moisDeLaDate(g.date) === Number(filtreMois));
  const periodeListe =
    filtreMois === "" ? "de l'année" : `— ${MOIS_COMPLETS[Number(filtreMois)]}`;

  const mouvementsAffiches: Mouvement[] = [
    ...gainsAffiches.map((g) => ({ ...g, type: "gain" as const })),
    ...depensesAffichees.map((d) => ({ ...d, type: "depense" as const })),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  function changerVue(v: Vue) {
    setVue(v);
    setBarreSelectionnee(null);
  }

  function basculerFormulaire(f: Formulaire) {
    setFormulaireOuvert((actuel) => (actuel === f ? null : f));
  }

  function surClicBarre(i: number) {
    if (i === barreSelectionnee) {
      setBarreSelectionnee(null);
      if (vue === "annee") setFiltreMois("");
    } else {
      setBarreSelectionnee(i);
      if (vue === "annee") setFiltreMois(String(i));
    }
  }

  function surChangementFiltre(valeur: string) {
    setFiltreMois(valeur);
    if (vue === "annee") setBarreSelectionnee(valeur === "" ? null : Number(valeur));
  }

  return (
    <div className="flex flex-col gap-4 px-5">
      <div className="inline-flex w-fit border-2 border-encre">
        {(["mois", "annee"] as Vue[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => changerVue(v)}
            className={`libelle px-4 py-2.5 ${
              vue === v ? "bg-accent text-sur-accent" : "text-encre-douce"
            }`}
          >
            {v === "mois" ? "Ce mois" : "Cette année"}
          </button>
        ))}
      </div>

      <div className="filet pt-4">
        <div className="flex items-baseline gap-3">
          <span className="numero">01</span>
          <span className="libelle text-encre-douce">
            Net {vue === "mois" ? "du mois" : "de l'année"}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className={`massif text-6xl tabular-nums ${net < 0 ? "text-accent" : ""}`}>
            <CompteurAnime
              valeur={Math.abs(net)}
              prefixe={net < 0 ? "− " : "+ "}
              suffixe=" €"
            />
          </p>
          {barreSelectionnee !== null && (
            <p
              className={`libelle ${
                valeurs[barreSelectionnee] < 0 ? "text-accent" : "text-encre-douce"
              }`}
            >
              {labels[barreSelectionnee]} : {formaterMontant(valeurs[barreSelectionnee])}
            </p>
          )}
        </div>

        <GraphiqueBarres
          key={vue}
          valeurs={valeurs}
          labels={labels}
          maxAbs={maxAbs}
          barreSelectionnee={barreSelectionnee}
          onClicBarre={surClicBarre}
        />
        <div className="mt-2 flex gap-1 pb-6">
          {labels.map((label) => (
            <span key={label} className="libelle flex-1 text-center text-[9px] text-encre-douce">
              {label}
            </span>
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => basculerFormulaire("depense")}
          className="libelle flex h-12 items-center justify-between border-2 border-encre px-4 transition-transform duration-150 active:scale-[0.98]"
        >
          Ajouter une dépense
          <span className="text-encre-douce">{formulaireOuvert === "depense" ? "−" : "+"}</span>
        </button>
        {formulaireOuvert === "depense" && (
          <FormulaireMontant
            placeholder="Matériel, loyer, encre..."
            enCours={enCours}
            onValider={(champs) =>
              startTransition(async () => {
                await ajouterDepense(champs);
              })
            }
          />
        )}
      </section>

      <section className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => basculerFormulaire("gain")}
          className="libelle flex h-12 items-center justify-between border-2 border-encre px-4 transition-transform duration-150 active:scale-[0.98]"
        >
          Ajouter un gain
          <span className="text-encre-douce">{formulaireOuvert === "gain" ? "−" : "+"}</span>
        </button>
        {formulaireOuvert === "gain" && (
          <FormulaireMontant
            placeholder="Vente, pourboire, flash day..."
            enCours={enCours}
            onValider={(champs) =>
              startTransition(async () => {
                await ajouterGain(champs);
              })
            }
          />
        )}
      </section>

      <select
        value={filtreMois}
        onChange={(e) => surChangementFiltre(e.target.value)}
        className="libelle h-10 w-fit border-2 border-ligne bg-fond px-2 text-encre-douce"
      >
        <option value="">Toute l&apos;année</option>
        {MOIS_COMPLETS.map((label, i) => (
          <option key={label} value={i}>
            {label}
          </option>
        ))}
      </select>

      {mouvementsAffiches.length > 0 ? (
        <ListeMouvements
          titre={`Mouvements ${periodeListe}`}
          mouvements={mouvementsAffiches}
          onSupprimer={(m) =>
            startTransition(() => (m.type === "gain" ? supprimerGain(m.id) : supprimerDepense(m.id)))
          }
        />
      ) : (
        <p className="massif text-2xl text-encre-douce">
          Rien à afficher pour cette période
        </p>
      )}

      <style>{`
        .champ {
          min-height: 48px;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
          border: 2px solid var(--ligne);
          background: var(--fond);
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

function GraphiqueBarres({
  valeurs,
  labels,
  maxAbs,
  barreSelectionnee,
  onClicBarre,
}: {
  valeurs: number[];
  labels: string[];
  maxAbs: number;
  barreSelectionnee: number | null;
  onClicBarre: (i: number) => void;
}) {
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMonte(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="mt-6 flex h-32 gap-1">
      {valeurs.map((valeur, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onClicBarre(i)}
          title={`${labels[i]} : ${formaterMontant(valeur)}`}
          className={`relative flex h-full flex-1 flex-col items-center transition-opacity ${
            barreSelectionnee !== null && barreSelectionnee !== i ? "opacity-40" : ""
          }`}
        >
          <div className="flex w-full flex-1 items-end justify-center">
            {valeur > 0 && (
              <div
                className="w-full origin-bottom bg-encre transition-transform duration-300 ease-out"
                style={{
                  height: `${(valeur / maxAbs) * 100}%`,
                  transform: `scaleY(${monte ? 1 : 0})`,
                }}
              />
            )}
          </div>
          <div className="h-0.5 w-full bg-encre" />
          <div className="flex w-full flex-1 items-start justify-center">
            {valeur < 0 && (
              <div
                className="w-full origin-top bg-accent transition-transform duration-300 ease-out"
                style={{
                  height: `${(Math.abs(valeur) / maxAbs) * 100}%`,
                  transform: `scaleY(${monte ? 1 : 0})`,
                }}
              />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function FormulaireMontant({
  placeholder,
  enCours,
  onValider,
}: {
  placeholder: string;
  enCours: boolean;
  onValider: (champs: { libelle: string; montant: number; date: string }) => void;
}) {
  const [libelle, setLibelle] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(dateLocaleAujourdhui);

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!libelle.trim() || !montant) return;
    onValider({ libelle, montant: Number(montant), date });
    setLibelle("");
    setMontant("");
  }

  return (
    <form
      onSubmit={soumettre}
      className="flex flex-col gap-2 border-2 border-ligne p-4"
    >
      <input
        value={libelle}
        onChange={(e) => setLibelle(e.target.value)}
        placeholder={placeholder}
        className="champ"
      />
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          placeholder="Montant (€)"
          className="champ"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="champ"
        />
      </div>
      <button
        type="submit"
        disabled={enCours || !libelle.trim() || !montant}
        className="libelle flex h-12 items-center justify-center gap-2 bg-accent text-sur-accent transition-transform duration-150 active:scale-95 disabled:opacity-40"
      >
        {enCours && <Loader taille={16} />}
        Ajouter
      </button>
    </form>
  );
}

function ListeMouvements({
  titre,
  mouvements,
  onSupprimer,
}: {
  titre: string;
  mouvements: Mouvement[];
  onSupprimer: (m: Mouvement) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="libelle text-encre-douce">{titre}</h2>
      <ul className="flex flex-col gap-2">
        {mouvements.map((m) => (
          <li
            key={`${m.type}-${m.id}`}
            className="filet-fin flex items-center gap-3 py-3 first:border-t-0"
          >
            <span className="libelle w-12 shrink-0 text-encre-douce">
              {formaterDateDepense(m.date)}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{m.libelle}</span>
            <span
              className={`shrink-0 font-bold tabular-nums ${
                m.type === "gain" ? "text-encre" : "text-accent"
              }`}
            >
              {m.type === "gain" ? "+ " : "− "}
              {formaterMontant(m.montant)}
            </span>
            <button
              type="button"
              onClick={() => onSupprimer(m)}
              className="shrink-0 text-encre-douce"
              aria-label="Supprimer cette ligne"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
