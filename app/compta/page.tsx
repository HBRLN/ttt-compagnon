import Link from "next/link";
import { creerClientServeur } from "@/lib/supabase/server";
import type { Depense, Gain, Rdv } from "@/lib/types";
import NavBar from "@/components/NavBar";
import TableauCompta from "./TableauCompta";

export default async function PageCompta() {
  const supabase = await creerClientServeur();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session!.user.id;

  const anneeCourante = new Date().getFullYear();
  const debutAnnee = new Date(anneeCourante, 0, 1);
  const finAnnee = new Date(anneeCourante + 1, 0, 1);

  const debutAnneeIso = debutAnnee.toISOString().slice(0, 10);
  const finAnneeIso = finAnnee.toISOString().slice(0, 10);

  const [{ data: rdvs }, { data: depenses }, { data: gains }] = await Promise.all([
    supabase
      .from("rdv")
      .select("debut, tarif_estime")
      .eq("tatoueur_id", userId)
      .eq("annule", false)
      .gte("debut", debutAnnee.toISOString())
      .lt("debut", finAnnee.toISOString()),
    supabase
      .from("depense")
      .select("*")
      .eq("tatoueur_id", userId)
      .gte("date", debutAnneeIso)
      .lt("date", finAnneeIso)
      .order("date", { ascending: false }),
    supabase
      .from("gain")
      .select("*")
      .eq("tatoueur_id", userId)
      .gte("date", debutAnneeIso)
      .lt("date", finAnneeIso)
      .order("date", { ascending: false }),
  ]);

  return (
    <div className="flex min-h-dvh flex-col pb-36">
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <h1 className="text-xl font-semibold">Compta</h1>
        <Link
          href="/reglages"
          className="flex h-11 w-11 items-center justify-center rounded-full text-encre-douce active:bg-surface-douce"
          aria-label="Réglages"
        >
          <IconeReglages />
        </Link>
      </header>

      <TableauCompta
        rdvs={(rdvs as Pick<Rdv, "debut" | "tarif_estime">[]) || []}
        depenses={(depenses as Depense[]) || []}
        gains={(gains as Gain[]) || []}
      />

      <NavBar />
    </div>
  );
}

function IconeReglages() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
