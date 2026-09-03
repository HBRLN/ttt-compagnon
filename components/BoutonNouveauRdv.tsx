"use client";

import { useRef } from "react";
import { useTransitionFab } from "./TransitionFabProvider";

export default function BoutonNouveauRdv() {
  const { declencher } = useTransitionFab();
  const ref = useRef<HTMLButtonElement>(null);

  function surClic() {
    const rect = ref.current?.getBoundingClientRect();
    const origine = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth - 48, y: window.innerHeight - 120 };
    declencher(origine, "/rdv/nouveau");
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={surClic}
      className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl font-light text-sur-accent shadow-flottante transition-transform duration-150 active:scale-90 active:opacity-90"
      aria-label="Nouveau RDV"
    >
      +
    </button>
  );
}
