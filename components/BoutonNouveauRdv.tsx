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
      className={`fixed right-6 bottom-24 z-20 flex items-center gap-2 rounded-full bg-encre px-5 text-sm font-medium text-fond shadow-flottante transition-transform duration-200 ${
        presse ? "scale-[0.96]" : "scale-100"
      }`}
      style={{ height: "3rem" }}
      aria-label="Nouveau rendez-vous"
    >
      <span className="text-lg leading-none">+</span>
      Rendez-vous
    </Link>
  );
}
