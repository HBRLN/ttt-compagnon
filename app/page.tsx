import Link from "next/link";
import { creerClientServeur } from "@/lib/supabase/server";
import { formaterDateCourte, formaterHeure } from "@/lib/date";
import type { Rdv } from "@/lib/types";
import NavBar from "@/components/NavBar";
import CompteurAnime from "@/components/CompteurAnime";
import BoutonNouveauRdv from "@/components/BoutonNouveauRdv";

export default async function PageDashboard() {
  const supabase = await creerClientServeur();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session!.user.id;

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
    supabase.from("profil").select("nom_artiste").eq("id", userId).single(),
    supabase
      .from("rdv")
      .select("tarif_estime, debut")
      .eq("tatoueur_id", userId)
      .eq("annule", false)
      .gte("debut", debutMoisCourant.toISOString())
      .lt("debut", finMoisCourant.toISOString()),
    supabase
      .from("gain")
      .select("montant, date")
      .eq("tatoueur_id", userId)
      .gte("date", debutMoisIso)
      .lt("date", finMoisIso),
    supabase
      .from("depense")
      .select("montant")
      .eq("tatoueur_id", userId)
      .gte("date", debutMoisIso)
      .lt("date", finMoisIso),
    supabase
      .from("rdv")
      .select("*")
      .eq("tatoueur_id", userId)
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

  const prochain = prochainRdv as Rdv | null;

  return (
    <div className="flex min-h-dvh flex-col pb-36">
      <header className="flex items-start justify-between px-5 pt-6 pb-5">
        <div className="animate-claque">
          <p className="libelle text-accent">Compagnon</p>
          <p className="libelle mt-1.5 text-encre-douce">
            {profil?.nom_artiste || ""}
          </p>
        </div>
        <Link
          href="/reglages"
          className="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center text-encre-douce active:bg-surface-douce"
          aria-label="Réglages"
        >
          <IconeReglages />
        </Link>
      </header>

      <div className="flex flex-col">
        <section className="animate-claque filet px-5 pt-4 pb-6">
          <div className="flex items-baseline gap-3">
            <span className="numero">01</span>
            <span className="libelle text-encre-douce">Prochain</span>
          </div>

          {prochain ? (
            <Link href={`/rdv/${prochain.id}`} className="block active:opacity-60">
              <div className="tampon mt-4 h-2 w-full bg-accent" />
              <p className="massif mt-4 text-6xl">{prochain.client_prenom}</p>
              <p className="libelle mt-4 text-encre-douce">
                {formaterDateCourte(prochain.debut)} · {formaterHeure(prochain.debut)}
                {prochain.projet ? ` · ${prochain.projet}` : ""}
              </p>
            </Link>
          ) : (
            <>
              <div className="tampon mt-4 h-2 w-16 bg-encre-douce" />
              <p className="massif mt-4 text-4xl text-encre-douce">Rien de prévu</p>
            </>
          )}
        </section>

        <section
          className="animate-claque filet px-5 pt-4 pb-6"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex items-baseline gap-3">
            <span className="numero">02</span>
            <span className="libelle text-encre-douce">Ce mois</span>
          </div>

          <div className="mt-5 grid grid-cols-2">
            <div>
              <p className="massif text-5xl tabular-nums">
                <CompteurAnime valeur={nombreRdvMois} />
              </p>
              <p className="libelle mt-2 text-encre-douce">RDV</p>
            </div>
            <div className="border-l-2 border-ligne pl-5">
              <p className="massif text-5xl tabular-nums">
                <CompteurAnime valeur={gainsDuMois} suffixe=" €" />
              </p>
              <p className="libelle mt-2 text-encre-douce">Encaissé</p>
            </div>
          </div>
        </section>

        <section
          className="animate-claque filet px-5 pt-4 pb-6"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-baseline gap-3">
            <span className="numero">03</span>
            <span className="libelle text-encre-douce">Estimation du mois</span>
          </div>
          {/* Le signe porte l'information, pas seulement la couleur : un
              daltonien lit « − » aussi bien qu'un rouge. */}
          <p
            className={`massif mt-5 text-6xl tabular-nums ${
              estimationMois < 0 ? "text-accent" : ""
            }`}
          >
            <CompteurAnime
              valeur={Math.abs(estimationMois)}
              prefixe={estimationMois < 0 ? "− " : "+ "}
              suffixe=" €"
            />
          </p>
        </section>
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
