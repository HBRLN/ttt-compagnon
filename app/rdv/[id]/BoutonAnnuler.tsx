"use client";

import { useTransition } from "react";
import { annulerRdv } from "@/lib/actions/rdv";

export default function BoutonAnnuler({ id }: { id: string }) {
  const [enCours, startTransition] = useTransition();

  function annuler() {
    if (!confirm("Annuler ce RDV ?")) return;
    startTransition(() => annulerRdv(id));
  }

  return (
    <button
      type="button"
      onClick={annuler}
      disabled={enCours}
      className="libelle flex h-12 flex-1 items-center justify-center border-2 border-accent text-accent disabled:opacity-40"
    >
      Annuler
    </button>
  );
}
