"use client";

import { useRouter, useSearchParams } from "next/navigation";

function libelleMois(iso: string): string {
  const [annee, mois] = iso.split("-").map(Number);
  const libelle = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date(annee, mois - 1, 1));
  return libelle.charAt(0).toUpperCase() + libelle.slice(1);
}

function genererOptionsMois(): string[] {
  const options: string[] = [];
  const maintenant = new Date();
  for (let i = -12; i <= 3; i++) {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() + i, 1);
    options.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return options;
}

export default function SelecteurMois({ moisActuel }: { moisActuel: string }) {
  const router = useRouter();
  const parametres = useSearchParams();
  const options = genererOptionsMois();

  function surChangement(valeur: string) {
    const params = new URLSearchParams(parametres.toString());
    if (valeur) params.set("mois", valeur);
    else params.delete("mois");
    const requete = params.toString();
    router.push(requete ? `/?${requete}` : "/");
  }

  return (
    <select
      value={moisActuel}
      onChange={(e) => surChangement(e.target.value)}
      className="h-9 rounded-lg border border-ligne bg-surface px-2 text-sm text-encre-douce"
    >
      <option value="">Tous les mois</option>
      {options.map((m) => (
        <option key={m} value={m}>
          {libelleMois(m)}
        </option>
      ))}
    </select>
  );
}
