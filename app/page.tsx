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
    <div className="perspective flex min-h-dvh flex-col pb-36">
      <header className="animate-glisse flex items-start justify-between px-5 pt-6 pb-5">
        <div>
          <p className="libelle text-encre-douce">Compagnon</p>
          <p className="titre mt-1 text-xl">{profil?.nom_artiste || ""}</p>
        </div>
        <Link
          href="/reglages"
          className="-mt-1 -mr-2 flex h-11 w-11 items-center justify-center text-encre-douce active:bg-surface-douce"
          aria-label="Réglages"
        >
          <IconeReglages />
        </Link>
      </header>

      <div className="flex flex-col gap-5 px-5">
        <SectionGrille numero="01" titre="Prochain">
          {prochain ? (
            <Link
              href={`/rdv/${prochain.id}`}
              className="animate-volet block bg-surface p-5 active:bg-surface-douce"
            >
              <p className="titre text-4xl">{prochain.client_prenom}</p>
              <p className="mt-3 text-sm text-encre-douce">
                {formaterDateCourte(prochain.debut)} · {formaterHeure(prochain.debut)}
                {prochain.projet ? ` · ${prochain.projet}` : ""}
              </p>
            </Link>
          ) : (
            <div className="animate-volet bg-surface p-5">
              <p className="titre text-2xl text-encre-douce">Rien de prévu</p>
            </div>
          )}
        </SectionGrille>

        <SectionGrille numero="02" titre="Ce mois" delai={80}>
          <div className="grid grid-cols-2 bg-surface">
            <div className="p-5">
              <p className="chiffre text-4xl">
                <CompteurAnime valeur={nombreRdvMois} />
              </p>
              <p className="libelle mt-2 text-encre-douce">Rendez-vous</p>
            </div>
            <div className="border-l border-ligne p-5">
              <p className="chiffre text-4xl">
                <CompteurAnime valeur={gainsDuMois} suffixe=" €" />
              </p>
              <p className="libelle mt-2 text-encre-douce">Encaissé</p>
            </div>
          </div>
        </SectionGrille>

        <SectionGrille numero="03" titre="Estimation du mois" delai={160}>
          {/* Le signe porte l'information, pas seulement la couleur : un
              daltonien lit « − » aussi bien qu'une teinte. */}
          <div className="bg-surface p-5">
            <p
              className={`chiffre text-4xl ${
                estimationMois < 0 ? "text-accent" : ""
              }`}
            >
              <CompteurAnime
                valeur={Math.abs(estimationMois)}
                prefixe={estimationMois < 0 ? "− " : "+ "}
                suffixe=" €"
              />
            </p>
          </div>
        </SectionGrille>
      </div>

      <BoutonNouveauRdv />

      <NavBar />
    </div>
  );
}

/* Le rail numéroté à gauche, avec son filet vertical : c'est la grille
   rendue visible, signature de la recette suisse. */
function SectionGrille({
  numero,
  titre,
  delai = 0,
  children,
}: {
  numero: string;
  titre: string;
  delai?: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="animate-glisse flex gap-4"
      style={delai ? { animationDelay: `${delai}ms` } : undefined}
    >
      <span className="numero w-6 shrink-0 pt-1">{numero}</span>
      <div className="min-w-0 flex-1 border-l border-ligne pl-4">
        <h2 className="libelle text-encre-douce">{titre}</h2>
        <div className="mt-3">{children}</div>
      </div>
    </section>
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
