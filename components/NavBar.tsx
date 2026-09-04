"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

const ONGLETS = [
  { href: "/", label: "Dashboard", icone: IconeAccueil },
  { href: "/rdv", label: "RDV", icone: IconeCalendrier },
  { href: "/compta", label: "Compta", icone: IconeCompta },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-ligne bg-surface pb-[max(env(safe-area-inset-bottom),0.5rem)]">
      {ONGLETS.map(({ href, label, icone: Icone }) => {
        const estActif = href === pathname;
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-col items-center gap-1.5 pt-3 pb-1 active:bg-surface-douce ${
              estActif ? "text-encre" : "text-encre-douce"
            }`}
          >
            {/* Barre de laiton pleine largeur sur l'onglet actif : le
                « bandeau de couleur qui porte l'en-tête » de la recette,
                réduit à l'échelle d'un onglet. */}
            {estActif && (
              <span className="animate-trace absolute inset-x-0 top-0 h-0.5 bg-accent" />
            )}
            <IconeAvecEtat Icone={Icone} />
            <span className="libelle">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Pendant la navigation, un filet se trace sous l'icône plutôt qu'un
// anneau qui tourne : le mouvement suit les axes de la grille.
function IconeAvecEtat({ Icone }: { Icone: ComponentType }) {
  const { pending } = useLinkStatus();
  return (
    <span className="relative flex h-7 w-9 items-center justify-center">
      <Icone />
      {pending && (
        <span className="animate-trace absolute -bottom-1 left-0 h-0.5 w-full bg-accent" />
      )}
    </span>
  );
}

function IconeAccueil() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function IconeCalendrier() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4M16 3v4" />
    </svg>
  );
}

function IconeCompta() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20V10M11 20V4M18 20v-7" />
    </svg>
  );
}
