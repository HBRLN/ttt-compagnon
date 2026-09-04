"use client";

import { createContext, useContext, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Origine = { x: number; y: number };

const DUREE_MS = 400;
const DECALAGE_BLANC_MS = 80;

const ContexteTransition = createContext<{
  declencher: (origine: Origine, destination: string) => void;
} | null>(null);

export function useTransitionFab() {
  const ctx = useContext(ContexteTransition);
  if (!ctx) throw new Error("useTransitionFab doit être utilisé dans TransitionFabProvider");
  return ctx;
}

export default function TransitionFabProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [brunActif, setBrunActif] = useState(false);
  const [blancActif, setBlancActif] = useState(false);
  const [origine, setOrigine] = useState<Origine>({ x: 0, y: 0 });
  const [destinationAttendue, setDestinationAttendue] = useState<string | null>(null);

  function declencher(o: Origine, destination: string) {
    const reduitMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduitMotion) {
      router.push(destination);
      return;
    }

    setOrigine(o);
    setBrunActif(true);
    setDestinationAttendue(destination);

    // La vraie page se charge tout de suite, pendant que les cercles
    // balaient encore l'écran.
    router.push(destination);

    // Le blanc suit le marron de très près (quelques frames).
    setTimeout(() => setBlancActif(true), DECALAGE_BLANC_MS);

    setTimeout(() => {
      setBrunActif(false);
      setBlancActif(false);
      setDestinationAttendue(null);
    }, DECALAGE_BLANC_MS + DUREE_MS + 50);
  }

  // Dès que la vraie page arrivée correspond à la destination (le
  // routeur a fini de basculer), son contenu passe au-dessus des
  // cercles : le texte n'attend pas la fin de leur animation, il
  // apparaît par-dessus, en même temps qu'ils continuent de grandir.
  const pageArrivee = destinationAttendue !== null && pathname === destinationAttendue;

  const clipInactif = `circle(0% at ${origine.x}px ${origine.y}px)`;
  const clipActif = `circle(150% at ${origine.x}px ${origine.y}px)`;

  return (
    <ContexteTransition.Provider value={{ declencher }}>
      <div style={pageArrivee ? { position: "relative", zIndex: 60 } : undefined}>
        {children}
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 bg-accent transition-[clip-path] ease-in-out"
        style={{
          clipPath: brunActif ? clipActif : clipInactif,
          transitionDuration: `${DUREE_MS}ms`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 bg-fond transition-[clip-path] ease-in-out"
        style={{
          clipPath: blancActif ? clipActif : clipInactif,
          transitionDuration: `${DUREE_MS}ms`,
        }}
      />
    </ContexteTransition.Provider>
  );
}
