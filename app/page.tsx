import Link from "next/link";
import { creerClientServeur } from "@/lib/supabase/server";
import { formaterDateCourte, formaterHeure } from "@/lib/date";
import type { Rdv } from "@/lib/types";
import NavBar from "@/components/NavBar";
import CompteurAnime from "@/components/CompteurAnime";
import BoutonNouveauRdv from "@/components/BoutonNouveauRdv";

export default async function PageDashboard() {
  const supabase = await creerClientServeur();
  const { data: userData } = await supabase.auth.getUser();

  const maintenant = new Date();
  const debutMoisCourant = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  const finMoisCourant = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1);
  const debutMoisIso = debutMoisCourant.toISOString().slice(0, 10);
  const finMoisIso = finMoisCourant.toISOString().slice(0, 10);

  const [
    { data: profil },
    { data: rdvsMoisCourant },
    { data: gainsMoisCourant },
    { data: depensesMoisCourant },
    { data: prochainRdv },
  ] = await Promise.all([
    supabase.from("profil").select("nom_artiste").eq("id", userData.user!.id).single(),
    supabase
      .from("rdv")
      .select("tarif_estime, debut")
      .eq("tatoueur_id", userData.user!.id)
      .eq("annule", false)
      .gte("debut", debutMoisCourant.toISOString())
      .lt("debut", finMoisCourant.toISOString()),
    supabase
      .from("gain")
      .select("montant, date")
      .eq("tatoueur_id", userData.user!.id)
      .gte("date", debutMoisIso)
      .lt("date", finMoisIso),
    supabase
      .from("depense")
      .select("montant")
      .eq("tatoueur_id", userData.user!.id)
      .gte("date", debutMoisIso)
      .lt("date", finMoisIso),
    supabase
      .from("rdv")
      .select("*")
      .eq("tatoueur_id", userData.user!.id)
      .eq("annule", false)
      .gte("debut", maintenant.toISOString())
      .order("debut", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const nombreRdvMois = rdvsMoisCourant?.length || 0;

  const gainsRdvRealises = (rdvsMoisCourant || [])
    .filter((r) => new Date(r.debut) <= maintenant)
    .reduce((somme, r) => somme + (r.tarif_estime || 0), 0);
  const gainsRdvTotal = (rdvsMoisCourant || []).reduce(
    (somme, r) => somme + (r.tarif_estime || 0),
    0
  );

  const gainsManuelsRealises = (gainsMoisCourant || [])
    .filter((g) => new Date(`${g.date}T00:00:00`) <= maintenant)
    .reduce((somme, g) => somme + g.montant, 0);
  const gainsManuelsTotal = (gainsMoisCourant || []).reduce(
    (somme, g) => somme + g.montant,
    0
  );

  const depensesTotal = (depensesMoisCourant || []).reduce(
    (somme, d) => somme + d.montant,
    0
  );

  const gainsDuMois = gainsRdvRealises + gainsManuelsRealises;
  const estimationMois = gainsRdvTotal + gainsManuelsTotal - depensesTotal;

  return (
    <div className="flex min-h-dvh flex-col pb-36">
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <h1 className="text-xl font-semibold">
          Coucou {profil?.nom_artiste || ""} !
        </h1>
        <Link
          href="/reglages"
          className="flex h-11 w-11 items-center justify-center rounded-full text-encre-douce active:bg-surface-douce"
          aria-label="Réglages"
        >
          <IconeReglages />
        </Link>
      </header>

      <div className="flex flex-col gap-3 px-5">
        {prochainRdv ? (
          <Link
            href={`/rdv/${prochainRdv.id}`}
            className="animate-fade-in-up rounded-2xl bg-accent p-5 text-sur-accent shadow-legere transition-transform duration-150 active:scale-[0.97] active:opacity-90"
          >
            <p className="text-sm font-medium opacity-80">Prochain RDV</p>
            <p className="mt-2 text-2xl font-semibold">
              {(prochainRdv as Rdv).client_prenom}
            </p>
            <p className="mt-1 text-sm opacity-90">
              {formaterDateCourte((prochainRdv as Rdv).debut)} à{" "}
              {formaterHeure((prochainRdv as Rdv).debut)}
              {(prochainRdv as Rdv).projet ? ` · ${(prochainRdv as Rdv).projet}` : ""}
            </p>
          </Link>
        ) : (
          <div className="animate-fade-in-up rounded-2xl bg-accent p-5 text-sur-accent shadow-legere">
            <p className="text-sm font-medium opacity-80">Prochain RDV</p>
            <p className="mt-2 text-lg font-semibold">Rien de prévu.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div
            className="animate-fade-in-up rounded-2xl bg-surface p-4 shadow-legere"
            style={{ animationDelay: "50ms" }}
          >
            <p className="text-xs font-medium text-encre-douce">RDV ce mois</p>
            <p className="mt-2 text-2xl font-semibold">
              <CompteurAnime valeur={nombreRdvMois} />
            </p>
          </div>

          <div
            className="animate-fade-in-up rounded-2xl bg-surface p-4 shadow-legere"
            style={{ animationDelay: "90ms" }}
          >
            <p className="text-xs font-medium text-encre-douce">Gains du mois</p>
            <p className="mt-2 text-2xl font-semibold">
              <CompteurAnime valeur={gainsDuMois} suffixe=" €" />
            </p>
          </div>
        </div>

        <div
          className="animate-fade-in-up rounded-2xl bg-surface p-4 shadow-legere"
          style={{ animationDelay: "130ms" }}
        >
          <p className="text-xs font-medium text-encre-douce">Estimation du mois</p>
          <p
            className={`mt-2 text-2xl font-semibold ${
              estimationMois < 0 ? "text-rouge" : ""
            }`}
          >
            <CompteurAnime valeur={estimationMois} suffixe=" €" />
          </p>
        </div>
      </div>

      <BoutonNouveauRdv />

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
