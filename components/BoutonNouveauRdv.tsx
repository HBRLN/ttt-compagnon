import Link from "next/link";

export default function BoutonNouveauRdv() {
  return (
    <Link
      href="/rdv/nouveau"
      className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl font-light text-sur-accent shadow-flottante transition-transform duration-150 active:scale-90 active:opacity-90"
      aria-label="Nouveau RDV"
    >
      +
    </Link>
  );
}
