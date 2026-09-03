"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type Onglet = { cle: string; label: string; href: string };

export default function OngletsRdv({
  onglets,
  actif,
}: {
  onglets: Onglet[];
  actif: string;
}) {
  const router = useRouter();
  // Reflète `actif` localement, mais peut être avancé de façon optimiste
  // au clic, avant que la navigation ne confirme le nouveau prop — c'est
  // le motif React recommandé pour ajuster un état dérivé d'une prop,
  // fait pendant le rendu plutôt que dans un effet.
  const [actifPrecedent, setActifPrecedent] = useState(actif);
  const [actifLocal, setActifLocal] = useState(actif);
  if (actif !== actifPrecedent) {
    setActifPrecedent(actif);
    setActifLocal(actif);
  }

  const boutonsRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicateur, setIndicateur] = useState<{ left: number; width: number } | null>(
    null
  );

  useLayoutEffect(() => {
    const bouton = boutonsRef.current[actifLocal];
    if (bouton) {
      setIndicateur({ left: bouton.offsetLeft, width: bouton.offsetWidth });
    }
  }, [actifLocal, onglets]);

  function surClic(onglet: Onglet) {
    setActifLocal(onglet.cle);
    router.push(onglet.href);
  }

  return (
    <div className="relative inline-flex items-center rounded-full bg-surface-douce p-1">
      {indicateur && (
        <div
          className="absolute top-1 bottom-1 rounded-full bg-accent shadow-legere"
          style={{
            left: indicateur.left,
            width: indicateur.width,
            transition:
              "left 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      )}
      {onglets.map((onglet) => (
        <button
          key={onglet.cle}
          type="button"
          ref={(el) => {
            boutonsRef.current[onglet.cle] = el;
          }}
          onClick={() => surClic(onglet)}
          className={`relative z-10 flex h-8 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors duration-200 ${
            actifLocal === onglet.cle ? "text-sur-accent" : "text-encre-douce"
          }`}
        >
          {onglet.label}
        </button>
      ))}
    </div>
  );
}
