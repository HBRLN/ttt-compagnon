"use client";

import { useState, useTransition } from "react";
import { enregistrerNotes } from "@/lib/actions/rdv";

export default function NotesEditables({
  id,
  notesInitiales,
}: {
  id: string;
  notesInitiales: string;
}) {
  const [notes, setNotes] = useState(notesInitiales);
  const [enregistre, setEnregistre] = useState(true);
  const [enCours, startTransition] = useTransition();

  function surChangement(valeur: string) {
    setNotes(valeur);
    setEnregistre(false);
  }

  function enregistrer() {
    startTransition(async () => {
      await enregistrerNotes(id, notes);
      setEnregistre(true);
    });
  }

  return (
    <section>
      <h2 className="mb-1 text-sm font-medium text-neutral-500">Notes</h2>
      <textarea
        rows={3}
        value={notes}
        onChange={(e) => surChangement(e.target.value)}
        onBlur={enregistrer}
        placeholder="Rien pour l'instant"
        className="w-full resize-none rounded-lg border border-neutral-300 p-3 text-base"
      />
      {!enregistre && (
        <p className="mt-1 text-sm text-neutral-400">
          {enCours ? "Enregistrement..." : "Modifications non enregistrées"}
        </p>
      )}
    </section>
  );
}
