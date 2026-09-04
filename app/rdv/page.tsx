import Link from "next/link";
import { creerClientServeur } from "@/lib/supabase/server";
import { cleJour, etiquetteJour, formaterHeure } from "@/lib/date";
import type { Rdv } from "@/lib/types";
import SelecteurMois from "@/components/SelecteurMois";
import OngletsRdv from "@/components/OngletsRdv";
import NavBar from "@/components/NavBar";
import BoutonNouveauRdv from "@/components/BoutonNouveauRdv";

type Vue = "avenir" | "passes" | "annules";

const ONGLETS: { cle: Vue; label: string }[] = [
  { cle: "avenir", label: "À venir" },
  { cle: "passes", label: "Passés" },
  { cle: "annules", label: "Annulés" },
];

function limitesMois(mois: string): { debut: Date; fin: Date } | null {
  const correspondance = mois.match(/^(\d{4})-(\d{2})$/);
  if (!correspondance) return null;
  const annee = Number(correspondance[1]);
  const moisIndex = Number(correspondance[2]) - 1;
  return {
    debut: new Date(annee, moisIndex, 1),
    fin: new Date(annee, moisIndex + 1, 1),
  };
}

export default async function PageRdv({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string; mois?: string }>;
}) {
  const parametres = await searchParams;
  const vue: Vue =
    parametres.vue === "passes" || parametres.vue === "annules"
      ? parametres.vue
      : "avenir";
  const mois = parametres.mois || "";
  const bornesMois = mois ? limitesMois(mois) : null;

  const supabase = await creerClientServeur();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session!.user.id;

  const debutAujourdhui = new Date();
  debutAujourdhui.setHours(0, 0, 0, 0);

  let requete = supabase
    .from("rdv")
    .select("*")
    .eq("tatoueur_id", userId)
    .eq("annule", vue === "annules");

  if (bornesMois) {
    requete = requete
      .gte("debut", bornesMois.debut.toISOString())
      .lt("debut", bornesMois.fin.toISOString());
  } else if (vue === "avenir") {
    requete = requete.gte("debut", debutAujourdhui.toISOString());
  } else if (vue === "passes") {
    requete = requete.lt("debut", debutAujourdhui.toISOString());
  }

  const croissant = vue === "avenir";
  const { data: rdvs } = await requete.order("debut", { ascending: croissant });

  const groupes = grouperParJour((rdvs as Rdv[]) || []);

  return (
    <div className="flex min-h-dvh flex-col pb-36">
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <h1 className="massif text-4xl">Rendez-vous</h1>
        <Link
          href="/reglages"
          className="flex h-11 w-11 items-center justify-center rounded-full text-encre-douce active:bg-surface-douce"
          aria-label="Réglages"
        >
          <IconeReglages />
        </Link>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-2">
        <OngletsRdv
          actif={vue}
          onglets={ONGLETS.map((onglet) => {
            const params = new URLSearchParams();
            if (onglet.cle !== "avenir") params.set("vue", onglet.cle);
            if (mois) params.set("mois", mois);
            const requeteParams = params.toString();
            return {
              cle: onglet.cle,
              label: onglet.label,
              href: requeteParams ? `/rdv?${requeteParams}` : "/rdv",
            };
          })}
        />
        <SelecteurMois moisActuel={mois} />
      </div>

      {groupes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="massif text-3xl text-encre-douce">
            {vue === "avenir" && !mois
              ? "Rien de prévu"
              : "Aucun RDV sur cette période"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col pt-2">
          {groupes.map(([jour, rdvsDuJour], indexJour) => (
            <section key={jour} className="filet px-5 pt-4 pb-5">
              <div className="flex items-baseline gap-3">
                <span className="numero">
                  {String(indexJour + 1).padStart(2, "0")}
                </span>
                <h2 className="libelle text-encre-douce">
                  {etiquetteJour(rdvsDuJour[0].debut)}
                </h2>
              </div>
              <ul className="mt-3 flex flex-col">
                {rdvsDuJour.map((rdv) => (
                  <li key={rdv.id} className="filet-fin first:border-t-0">
                    <Link
                      href={`/rdv/${rdv.id}`}
                      className="flex min-h-16 items-center gap-4 py-3 active:opacity-60"
                    >
                      <span className="libelle w-12 shrink-0 tabular-nums text-encre-douce">
                        {formaterHeure(rdv.debut)}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="massif truncate text-2xl">
                          {rdv.client_prenom}
                        </span>
                        {rdv.projet && (
                          <span className="mt-1 truncate text-sm text-encre-douce">
                            {rdv.projet}
                          </span>
                        )}
                      </span>
                      {rdv.acompte_montant && !rdv.acompte_paye ? (
                        <span className="libelle shrink-0 bg-accent px-2 py-1 text-sur-accent">
                          Acompte dû
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <BoutonNouveauRdv />

      <NavBar />
    </div>
  );
}

function grouperParJour(rdvs: Rdv[]): [string, Rdv[]][] {
  const carte = new Map<string, Rdv[]>();
  for (const rdv of rdvs) {
    const cle = cleJour(rdv.debut);
    if (!carte.has(cle)) carte.set(cle, []);
    carte.get(cle)!.push(rdv);
  }
  return Array.from(carte.entries());
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
