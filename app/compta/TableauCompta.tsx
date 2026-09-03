"use client";

import { useState, useTransition } from "react";
import { ajouterDepense, supprimerDepense } from "@/lib/actions/depenses";
import Loader from "@/components/Loader";
import type { Depense, Rdv } from "@/lib/types";

type Vue = "mois" | "annee";

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

export default function TableauCompta({
  rdvs,
  depenses,
}: {
  rdvs: Pick<Rdv, "debut" | "tarif_estime">[];
  depenses: Depense[];
}) {
  const [vue, setVue] = useState<Vue>("annee");
  const [barreSelectionnee, setBarreSelectionnee] = useState<number | null>(null);

  const [libelle, setLibelle] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(dateLocaleAujourdhui);
  const [enCours, startTransition] = useTransition();

  const moisCourant = new Date().getMonth();

  const gainsParMois = Array(12).fill(0);
  for (const r of rdvs) {
    gainsParMois[new Date(r.debut).getMonth()] += r.tarif_estime || 0;
  }

  const depensesParMois = Array(12).fill(0);
  for (const d of depenses) {
    depensesParMois[new Date(`${d.date}T00:00:00`).getMonth()] += d.montant;
  }

  const gainsParSemaine = Array(5).fill(0);
  for (const r of rdvs) {
    const d = new Date(r.debut);
    if (d.getMonth() === moisCourant) {
      const semaine = Math.min(4, Math.floor((d.getDate() - 1) / 7));
      gainsParSemaine[semaine] += r.tarif_estime || 0;
    }
  }

  const depensesAnnee = depensesParMois.reduce((s, v) => s + v, 0);
  const depensesMoisCourant = depensesParMois[moisCourant];

  const labels = vue === "annee" ? MOIS_LABELS : SEMAINE_LABELS;
  const valeurs = vue === "annee" ? gainsParMois : gainsParSemaine;
  const total = valeurs.reduce((s, v) => s + v, 0);
  const totalDepenses = vue === "annee" ? depensesAnnee : depensesMoisCourant;
  const net = total - totalDepenses;
  const max = Math.max(...valeurs, 1);

  function changerVue(v: Vue) {
    setVue(v);
    setBarreSelectionnee(null);
  }

  function soumettreDepense(e: React.FormEvent) {
    e.preventDefault();
    if (!libelle.trim() || !montant) return;
    startTransition(async () => {
      await ajouterDepense({ libelle, montant: Number(montant), date });
      setLibelle("");
      setMontant("");
    });
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
          Gains {vue === "mois" ? "du mois" : "de l'année"}
        </p>
        <p className="mt-1 text-3xl font-semibold">{formaterMontant(total)}</p>

        <div className="mt-5 flex h-32 items-end gap-1">
          {valeurs.map((valeur, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setBarreSelectionnee(i === barreSelectionnee ? null : i)}
              title={`${labels[i]} : ${formaterMontant(valeur)}`}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              {barreSelectionnee === i && (
                <span className="text-xs font-medium text-encre">
                  {formaterMontant(valeur)}
                </span>
              )}
              <div
                className="w-full rounded-t-md bg-accent"
                style={{ height: `${Math.max(4, (valeur / max) * 100)}%` }}
              />
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

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface p-4 shadow-legere">
          <p className="text-xs font-medium text-encre-douce">Dépenses</p>
          <p className="mt-1 text-xl font-semibold">{formaterMontant(totalDepenses)}</p>
        </div>
        <div className="rounded-2xl bg-surface p-4 shadow-legere">
          <p className="text-xs font-medium text-encre-douce">Net</p>
          <p className="mt-1 text-xl font-semibold">{formaterMontant(net)}</p>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-encre-douce">Ajouter une dépense</h2>
        <form
          onSubmit={soumettreDepense}
          className="flex flex-col gap-2 rounded-2xl bg-surface p-4 shadow-legere"
        >
          <input
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            placeholder="Matériel, loyer, encre..."
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
      </section>

      {depenses.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-encre-douce">Dépenses de l&apos;année</h2>
          <ul className="flex flex-col gap-2">
            {depenses.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 shadow-legere"
              >
                <span className="w-14 shrink-0 text-sm text-encre-douce">
                  {formaterDateDepense(d.date)}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{d.libelle}</span>
                <span className="shrink-0 font-medium">{formaterMontant(d.montant)}</span>
                <button
                  type="button"
                  onClick={() => startTransition(() => supprimerDepense(d.id))}
                  className="shrink-0 text-encre-douce"
                  aria-label="Supprimer cette dépense"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
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
