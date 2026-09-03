import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/server";
import {
  formaterDateLongue,
  formaterDuree,
  formaterHeure,
} from "@/lib/date";
import type { Rdv } from "@/lib/types";
import NotesEditables from "./NotesEditables";
import BoutonAnnuler from "./BoutonAnnuler";

export default async function PageFicheRdv({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await creerClientServeur();

  const { data: rdv } = await supabase.from("rdv").select("*").eq("id", id).single();
  if (!rdv) notFound();

  let urlPhoto: string | null = null;
  if (rdv.photo_url) {
    const { data } = await supabase.storage
      .from("photos")
      .createSignedUrl(rdv.photo_url, 3600);
    urlPhoto = data?.signedUrl || null;
  }

  let precedents: Rdv[] = [];
  if (rdv.client_tel) {
    const { data } = await supabase
      .from("rdv")
      .select("*")
      .eq("tatoueur_id", rdv.tatoueur_id)
      .eq("client_tel", rdv.client_tel)
      .neq("id", rdv.id)
      .order("debut", { ascending: false });
    precedents = (data as Rdv[]) || [];
  }

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <header className="flex items-center gap-2 px-4 pt-6 pb-2">
        <Link
          href="/"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 active:bg-neutral-100"
          aria-label="Retour"
        >
          ←
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">
          {rdv.client_prenom} {rdv.client_nom || ""}
        </h1>
      </header>

      <div className="flex flex-col gap-5 px-5 pt-2">
        {rdv.annule && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            RDV annulé
          </p>
        )}

        <section className="flex flex-col gap-1">
          <p className="text-lg font-medium">
            {formaterDateLongue(rdv.debut)} à {formaterHeure(rdv.debut)}
          </p>
          <p className="text-neutral-500">{formaterDuree(rdv.duree_min)}</p>
        </section>

        {rdv.projet && (
          <section>
            <h2 className="mb-1 text-sm font-medium text-neutral-500">Projet</h2>
            <p className="whitespace-pre-wrap">{rdv.projet}</p>
          </section>
        )}

        {rdv.emplacement && (
          <section>
            <h2 className="mb-1 text-sm font-medium text-neutral-500">Emplacement</h2>
            <p>{rdv.emplacement}</p>
          </section>
        )}

        {urlPhoto && (
          <section>
            <h2 className="mb-1 text-sm font-medium text-neutral-500">
              Photo de référence
            </h2>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src={urlPhoto}
                alt="Référence"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-neutral-500">Contact</h2>
          {rdv.client_tel && <p>{rdv.client_tel}</p>}
          {rdv.client_email && <p>{rdv.client_email}</p>}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-neutral-500">Tarif</h2>
          <p>
            {rdv.tarif_estime ? `${rdv.tarif_estime} € estimé` : "Non estimé"}
          </p>
          {rdv.acompte_montant ? (
            <p className={rdv.acompte_paye ? "text-neutral-600" : "text-red-600"}>
              Acompte {rdv.acompte_montant} € — {rdv.acompte_paye ? "payé" : "non payé"}
            </p>
          ) : null}
        </section>

        <NotesEditables id={rdv.id} notesInitiales={rdv.notes || ""} />

        <section className="flex gap-3">
          {rdv.client_tel && (
            <a
              href={`tel:${rdv.client_tel}`}
              className="flex h-11 flex-1 items-center justify-center rounded-lg border border-neutral-300 font-medium"
            >
              Appeler
            </a>
          )}
          {rdv.client_tel && (
            <a
              href={`sms:${rdv.client_tel}`}
              className="flex h-11 flex-1 items-center justify-center rounded-lg border border-neutral-300 font-medium"
            >
              Écrire
            </a>
          )}
        </section>

        <section className="flex gap-3">
          <Link
            href={`/rdv/${rdv.id}/modifier`}
            className="flex h-11 flex-1 items-center justify-center rounded-lg bg-neutral-900 font-medium text-white"
          >
            Modifier
          </Link>
          {!rdv.annule && <BoutonAnnuler id={rdv.id} />}
        </section>

        {precedents.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-medium text-neutral-500">
              Séances précédentes
            </h2>
            <ul className="flex flex-col divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-100">
              {precedents.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/rdv/${p.id}`}
                    className="flex min-h-[56px] flex-col justify-center px-4 py-2 active:bg-neutral-50"
                  >
                    <span className="font-medium">
                      {formaterDateLongue(p.debut)}
                    </span>
                    {p.projet && (
                      <span className="truncate text-sm text-neutral-500">
                        {p.projet}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
