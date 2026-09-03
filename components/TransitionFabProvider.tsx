"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "inactif" | "brun" | "blanc";
type Origine = { x: number; y: number };

const DUREE_PHASE_MS = 400;

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
  const [phase, setPhase] = useState<Phase>("inactif");
  const [origine, setOrigine] = useState<Origine>({ x: 0, y: 0 });

  function declencher(o: Origine, destination: string) {
    const reduitMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduitMotion) {
      router.push(destination);
      return;
    }

    setOrigine(o);
    setPhase("brun");
    setTimeout(() => {
      router.push(destination);
      setPhase("blanc");
      setTimeout(() => setPhase("inactif"), DUREE_PHASE_MS);
    }, DUREE_PHASE_MS);
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
          clipPath: phase === "brun" || phase === "blanc" ? clipActif : clipInactif,
          transitionDuration: `${DUREE_PHASE_MS}ms`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 bg-fond transition-[clip-path] ease-in-out"
        style={{
          clipPath: phase === "blanc" ? clipActif : clipInactif,
          transitionDuration: `${DUREE_PHASE_MS}ms`,
        }}
      />
    </ContexteTransition.Provider>
  );
}
