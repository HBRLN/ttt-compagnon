"use client";

import { useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const ORDRE = ["/", "/rdv", "/compta"];
const SEUIL_PX = 60;

export default function NavigationGeste({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const debut = useRef<{ x: number; y: number } | null>(null);

  const indexActuel = ORDRE.indexOf(pathname);

  function surTouchStart(e: React.TouchEvent) {
    if (indexActuel === -1) return;
    const t = e.touches[0];
    debut.current = { x: t.clientX, y: t.clientY };
  }

  function surTouchEnd(e: React.TouchEvent) {
    if (indexActuel === -1 || !debut.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - debut.current.x;
    const dy = t.clientY - debut.current.y;
    debut.current = null;

    if (Math.abs(dx) < SEUIL_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    const prochainIndex = indexActuel + (dx < 0 ? 1 : -1);
    if (prochainIndex < 0 || prochainIndex >= ORDRE.length) return;
    router.push(ORDRE[prochainIndex]);
  }

  return (
    <div className="contents" onTouchStart={surTouchStart} onTouchEnd={surTouchEnd}>
      {children}
    </div>
  );
}
