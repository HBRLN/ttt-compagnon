"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Origine = { x: number; y: number };

const DUREE_MS = 400;
const DECALAGE_BLANC_MS = 80;
const DUREE_FONDU_MS = 250;
const DELAI_SECOURS_MS = 1500;

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
  const [visible, setVisible] = useState(false);
  const [origine, setOrigine] = useState<Origine>({ x: 0, y: 0 });
  const [destinationAttendue, setDestinationAttendue] = useState<string | null>(null);
  const masqueEnCours = useRef(false);

  function masquer() {
    if (masqueEnCours.current) return;
    masqueEnCours.current = true;
    // Les cercles ne rétrécissent jamais vers leur point d'origine :
    // ils s'effacent en fondu, déjà pleinement déployés, pendant que
    // le contenu réel (déjà au-dessus) reste inchangé.
    setVisible(false);
    setTimeout(() => {
      setBrunActif(false);
      setBlancActif(false);
      setDestinationAttendue(null);
      masqueEnCours.current = false;
    }, DUREE_FONDU_MS);
  }

  function declencher(o: Origine, destination: string) {
    const reduitMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduitMotion) {
      router.push(destination);
      return;
    }

    masqueEnCours.current = false;
    setOrigine(o);
    setVisible(true);
    setBrunActif(true);
    setDestinationAttendue(destination);

    // La vraie page se charge tout de suite, pendant que les cercles
    // balaient encore l'écran.
    router.push(destination);

    // Le blanc suit le marron de très près (quelques frames).
    setTimeout(() => setBlancActif(true), DECALAGE_BLANC_MS);

    // Filet de sécurité si la navigation ne déclenche jamais la
    // détection d'arrivée ci-dessous.
    setTimeout(masquer, DELAI_SECOURS_MS);
  }

  // Dès que la vraie page arrivée correspond à la destination (le
  // routeur a fini de basculer), son contenu passe au-dessus des
  // cercles, puis on efface ces derniers en fondu.
  const pageArrivee = destinationAttendue !== null && pathname === destinationAttendue;

  useEffect(() => {
    if (pageArrivee) masquer();
  }, [pageArrivee]);

  const clipInactif = `circle(0% at ${origine.x}px ${origine.y}px)`;
  const clipActif = `circle(150% at ${origine.x}px ${origine.y}px)`;

  return (
    <ContexteTransition.Provider value={{ declencher }}>
      <div style={pageArrivee ? { position: "relative", zIndex: 60 } : undefined}>
        {children}
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 bg-accent transition-[clip-path,opacity] ease-in-out"
        style={{
          clipPath: brunActif ? clipActif : clipInactif,
          opacity: visible ? 1 : 0,
          transitionDuration: `${DUREE_MS}ms, ${DUREE_FONDU_MS}ms`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 bg-fond transition-[clip-path,opacity] ease-in-out"
        style={{
          clipPath: blancActif ? clipActif : clipInactif,
          opacity: visible ? 1 : 0,
          transitionDuration: `${DUREE_MS}ms, ${DUREE_FONDU_MS}ms`,
        }}
      />
    </ContexteTransition.Provider>
  );
}
