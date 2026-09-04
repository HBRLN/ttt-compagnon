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
      {/* L'indicateur est un filet de laiton qui coulisse le long de la
          ligne de base — un mouvement d'axe, pas un pavé qui saute. */}
      {indicateur && (
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-accent"
          style={{
            width: indicateur.width,
            transform: `translateX(${indicateur.left}px)`,
            transition: "transform 0.24s cubic-bezier(0.23,1,0.32,1)",
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
          className={`libelle relative z-10 flex h-10 shrink-0 items-center whitespace-nowrap px-4 transition-colors duration-150 ${
            actifLocal === onglet.cle ? "text-encre" : "text-encre-douce"
          }`}
        >
          {onglet.label}
        </button>
      ))}
    </div>
  );
}
