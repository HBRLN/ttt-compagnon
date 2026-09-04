"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

type Origine = { x: number; y: number };
type Phase = "repos" | "ferme" | "ouvre";

const DUREE_MS = 400;
const DECALAGE_MS = 80;

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
  const [phase, setPhase] = useState<Phase>("repos");
  const [origine, setOrigine] = useState<Origine>({ x: 0, y: 0 });

  function declencher(o: Origine, destination: string) {
    const reduitMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduitMotion) {
      router.push(destination);
      return;
    }

    setOrigine(o);
    setBrunActif(true);

    // La vraie page se charge tout de suite : ce n'est pas une
    // couleur factice qui se révèle ensuite, c'est la page elle-même
    // (son propre fond, son propre contenu déjà prêt) qu'on découpe
    // et qu'on dévoile — elle sert de fond à sa propre transition.
    router.push(destination);

    setTimeout(() => {
      setPhase("ferme");
      requestAnimationFrame(() => setPhase("ouvre"));
    }, DECALAGE_MS);

    setTimeout(() => {
      setBrunActif(false);
      setPhase("repos");
    }, DECALAGE_MS + DUREE_MS + 50);
  }

  const clipFerme = `circle(0% at ${origine.x}px ${origine.y}px)`;
  const clipOuvert = `circle(150% at ${origine.x}px ${origine.y}px)`;
  const clipRepos = "circle(150% at 50% 50%)";

  const clipPath = phase === "repos" ? clipRepos : phase === "ferme" ? clipFerme : clipOuvert;

  return (
    <ContexteTransition.Provider value={{ declencher }}>
      <div
        style={{
          position: "relative",
          zIndex: phase === "repos" ? undefined : 45,
          clipPath,
          transition: phase === "ouvre" ? `clip-path ${DUREE_MS}ms ease-in-out` : "none",
        }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40 bg-accent transition-[clip-path] ease-in-out"
        style={{
          clipPath: brunActif ? clipOuvert : clipFerme,
          transitionDuration: `${DUREE_MS}ms`,
        }}
      />
    </ContexteTransition.Provider>
  );
}
