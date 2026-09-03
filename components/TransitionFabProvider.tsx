"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

type Origine = { x: number; y: number };

const DUREE_MS = 300;
const DECALAGE_BLANC_MS = 50;

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
  const [brunActif, setBrunActif] = useState(false);
  const [blancActif, setBlancActif] = useState(false);
  const [origine, setOrigine] = useState<Origine>({ x: 0, y: 0 });

  function declencher(o: Origine, destination: string) {
    const reduitMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduitMotion) {
      router.push(destination);
      return;
    }

    setOrigine(o);
    setBrunActif(true);

    // Le blanc suit le marron de très près (quelques frames), pas
    // seulement une fois le marron arrivé — effet « double vague ».
    setTimeout(() => setBlancActif(true), DECALAGE_BLANC_MS);

    // La navigation a lieu quand le marron seul couvre déjà tout
    // l'écran : l'échange de page reste invisible même si le blanc
    // n'a pas fini de le rattraper.
    setTimeout(() => router.push(destination), DUREE_MS);

    setTimeout(() => {
      setBrunActif(false);
      setBlancActif(false);
    }, DECALAGE_BLANC_MS + DUREE_MS + 50);
  }

  const clipInactif = `circle(0% at ${origine.x}px ${origine.y}px)`;
  const clipActif = `circle(150% at ${origine.x}px ${origine.y}px)`;

  return (
    <ContexteTransition.Provider value={{ declencher }}>
      {children}
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
