"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BoutonNouveauRdv() {
  const router = useRouter();
  const [presse, setPresse] = useState(false);

  function surClic(e: React.MouseEvent) {
    e.preventDefault();
    setPresse(true);
    setTimeout(() => router.push("/rdv/nouveau"), 160);
  }

  return (
    <Link
      href="/rdv/nouveau"
      onClick={surClic}
      className={`fixed right-5 bottom-24 z-20 flex h-13 items-center gap-2.5 bg-encre px-5 text-surface transition-transform duration-150 ${
        presse ? "scale-[0.97]" : "scale-100"
      }`}
      style={{ height: "3.25rem" }}
      aria-label="Nouveau rendez-vous"
    >
      <span className="text-xl leading-none">+</span>
      <span className="libelle">Rendez-vous</span>
    </Link>
  );
}
