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
      className="flex h-11 flex-1 items-center justify-center rounded-lg border border-red-300 font-medium text-red-600 disabled:opacity-50"
    >
      Annuler
    </button>
  );
}
