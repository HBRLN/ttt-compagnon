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
    <div className="relative inline-flex items-center border-2 border-encre">
      {indicateur && (
        <div
          className="absolute top-0 bottom-0 left-0 bg-accent"
          style={{
            width: indicateur.width,
            transform: `translateX(${indicateur.left}px)`,
            transition: "transform 0.15s cubic-bezier(0.2,0,0,1)",
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
          className={`libelle relative z-10 flex h-9 shrink-0 items-center whitespace-nowrap px-4 ${
            actifLocal === onglet.cle ? "text-sur-accent" : "text-encre-douce"
          }`}
        >
          {onglet.label}
        </button>
      ))}
    </div>
  );
}
