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
      className={`fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl font-light text-sur-accent shadow-flottante transition-transform duration-150 ${
        presse ? "scale-90" : "scale-100"
      }`}
      aria-label="Nouveau RDV"
    >
      +
    </Link>
  );
}
