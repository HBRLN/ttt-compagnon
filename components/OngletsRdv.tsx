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
    <div className="relative inline-flex items-center border-b border-ligne">
      {/* Filet d'encre qui coulisse sous l'onglet actif. */}
      {indicateur && (
        <div
          className="absolute -bottom-px left-0 h-0.5 bg-encre"
          style={{
            width: indicateur.width,
            transform: `translateX(${indicateur.left}px)`,
            transition: "transform 0.28s cubic-bezier(0.16,1,0.3,1)",
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
          className={`relative z-10 flex h-11 shrink-0 items-center px-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
            actifLocal === onglet.cle ? "text-encre" : "text-encre-douce"
          }`}
        >
          {onglet.label}
        </button>
      ))}
    </div>
  );
}
