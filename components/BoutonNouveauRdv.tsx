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
      className={`fixed right-5 bottom-24 z-20 flex h-14 items-center gap-2 bg-accent px-5 text-sur-accent transition-transform duration-150 ${
        presse ? "scale-95" : "scale-100"
      }`}
      aria-label="Nouveau RDV"
    >
      <span className="text-2xl leading-none font-black">+</span>
      <span className="libelle">RDV</span>
    </Link>
  );
}
