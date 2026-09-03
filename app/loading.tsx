import Loader from "@/components/Loader";

export default function Chargement() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center text-encre-douce">
      <Loader taille={28} />
    </div>
  );
}
