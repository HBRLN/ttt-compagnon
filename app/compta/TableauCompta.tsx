"use client";

import { useState, useTransition } from "react";
import { ajouterDepense, supprimerDepense } from "@/lib/actions/depenses";
import { ajouterGain, supprimerGain } from "@/lib/actions/gains";
import Loader from "@/components/Loader";
import type { Depense, Gain, Rdv } from "@/lib/types";

type Vue = "mois" | "annee";
type Formulaire = "depense" | "gain" | null;

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
    vue === "mois" ? depenses.filter((d) => moisDeLaDate(d.date) === moisCourant) : depenses;
  const gainsAffiches =
    vue === "mois" ? gains.filter((g) => moisDeLaDate(g.date) === moisCourant) : gains;

  function changerVue(v: Vue) {
    setVue(v);
    setBarreSelectionnee(null);
  }

  function basculerFormulaire(f: Formulaire) {
    setFormulaireOuvert((actuel) => (actuel === f ? null : f));
  }

  return (
    <div className="flex flex-col gap-4 px-5">
      <div className="inline-flex w-fit rounded-full bg-surface-douce p-1">
        {(["mois", "annee"] as Vue[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => changerVue(v)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              vue === v ? "bg-surface text-encre shadow-legere" : "text-encre-douce"
            }`}
          >
            {v === "mois" ? "Ce mois" : "Cette année"}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-surface p-4 shadow-legere">
        <p className="text-xs font-medium text-encre-douce">
          Net {vue === "mois" ? "du mois" : "de l'année"}
        </p>
        <p className={`mt-1 text-3xl font-semibold ${net < 0 ? "text-rouge" : "text-vert"}`}>
          {formaterMontant(net)}
        </p>

        <div className="mt-6 flex h-32 gap-1">
          {valeurs.map((valeur, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setBarreSelectionnee(i === barreSelectionnee ? null : i)}
              title={`${labels[i]} : ${formaterMontant(valeur)}`}
              className="relative flex h-full flex-1 flex-col items-center"
            >
              {barreSelectionnee === i && (
                <span
                  className={`absolute -top-4 inset-x-0 text-center text-xs font-medium ${
                    valeur < 0 ? "text-rouge" : "text-vert"
                  }`}
                >
                  {formaterMontant(valeur)}
                </span>
              )}
              <div className="flex w-full flex-1 items-end justify-center">
                {valeur > 0 && (
                  <div
                    className="w-full rounded-t-md bg-vert"
                    style={{ height: `${(valeur / maxAbs) * 100}%` }}
                  />
                )}
              </div>
              <div className="h-px w-full bg-encre-douce/25" />
              <div className="flex w-full flex-1 items-start justify-center">
                {valeur < 0 && (
                  <div
                    className="w-full rounded-b-md bg-rouge"
                    style={{ height: `${(Math.abs(valeur) / maxAbs) * 100}%` }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-1 flex gap-1">
          {labels.map((label) => (
            <span key={label} className="flex-1 text-center text-[10px] text-encre-douce">
              {label}
            </span>
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => basculerFormulaire("depense")}
          className="flex h-12 items-center justify-between rounded-2xl bg-surface px-4 font-medium shadow-legere"
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
          className="flex h-12 items-center justify-between rounded-2xl bg-surface px-4 font-medium shadow-legere"
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

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface p-4 shadow-legere">
          <p className="text-xs font-medium text-encre-douce">
            Récap gains {vue === "mois" ? "du mois" : "de l'année"}
          </p>
          <p className="mt-1 text-xl font-semibold">{formaterMontant(totalGains)}</p>
        </div>
        <div className="rounded-2xl bg-surface p-4 shadow-legere">
          <p className="text-xs font-medium text-encre-douce">
            Récap dépenses {vue === "mois" ? "du mois" : "de l'année"}
          </p>
          <p className="mt-1 text-xl font-semibold">{formaterMontant(totalDepenses)}</p>
        </div>
      </div>

      {gainsAffiches.length > 0 && (
        <ListeMouvements
          titre={`Gains ajoutés ${vue === "mois" ? "du mois" : "de l'année"}`}
          lignes={gainsAffiches}
          onSupprimer={(id) => startTransition(() => supprimerGain(id))}
        />
      )}

      {depensesAffichees.length > 0 && (
        <ListeMouvements
          titre={`Dépenses ${vue === "mois" ? "du mois" : "de l'année"}`}
          lignes={depensesAffichees}
          onSupprimer={(id) => startTransition(() => supprimerDepense(id))}
        />
      )}

      <style>{`
        .champ {
          min-height: 44px;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
          border-radius: 0.5rem;
          background: var(--surface-douce);
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
      className="flex flex-col gap-2 rounded-2xl bg-surface p-4 shadow-legere"
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
        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-medium text-sur-accent shadow-legere disabled:opacity-50"
      >
        {enCours && <Loader taille={16} />}
        Ajouter
      </button>
    </form>
  );
}

function ListeMouvements({
  titre,
  lignes,
  onSupprimer,
}: {
  titre: string;
  lignes: (Depense | Gain)[];
  onSupprimer: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-encre-douce">{titre}</h2>
      <ul className="flex flex-col gap-2">
        {lignes.map((l) => (
          <li
            key={l.id}
            className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 shadow-legere"
          >
            <span className="w-14 shrink-0 text-sm text-encre-douce">
              {formaterDateDepense(l.date)}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{l.libelle}</span>
            <span className="shrink-0 font-medium">{formaterMontant(l.montant)}</span>
            <button
              type="button"
              onClick={() => onSupprimer(l.id)}
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
