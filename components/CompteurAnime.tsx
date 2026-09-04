"use client";

import { useEffect, useRef, useState } from "react";

export default function CompteurAnime({
  valeur,
  suffixe = "",
  prefixe = "",
}: {
  valeur: number;
  suffixe?: string;
  prefixe?: string;
}) {
  const [affiche, setAffiche] = useState(0);
  const valeurDepart = useRef(0);
  const depart = useRef<number | null>(null);

  useEffect(() => {
    valeurDepart.current = affiche;
    depart.current = null;
    const reduitMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Court : dans cette direction le mouvement claque, il ne glisse pas.
    const duree = reduitMotion ? 0 : 320;
    let frame: number;

    function etape(t: number) {
      if (depart.current === null) depart.current = t;
      const progres = duree === 0 ? 1 : Math.min(1, (t - depart.current) / duree);
      const facilite = 1 - Math.pow(1 - progres, 3);
      setAffiche(valeurDepart.current + (valeur - valeurDepart.current) * facilite);
      if (progres < 1) frame = requestAnimationFrame(etape);
    }
    frame = requestAnimationFrame(etape);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valeur]);

  return (
    <>
      {prefixe}
      {Math.round(affiche).toLocaleString("fr-FR")}
      {suffixe}
    </>
  );
}
