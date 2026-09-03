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

  let urlsPhotos: string[] = [];
  if (rdv.photo_urls.length > 0) {
    const { data } = await supabase.storage
      .from("photos")
      .createSignedUrls(rdv.photo_urls, 3600);
    urlsPhotos = (data || [])
      .map((r) => r.signedUrl)
      .filter((url): url is string => !!url);
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
          className="flex h-11 w-11 items-center justify-center rounded-full text-encre-douce active:bg-surface-douce"
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
          <p className="rounded-lg bg-rouge-doux px-3 py-2 text-sm font-medium text-rouge">
            RDV annulé
          </p>
        )}

        <section className="flex flex-col gap-1">
          <p className="text-lg font-medium">
            {formaterDateLongue(rdv.debut)} à {formaterHeure(rdv.debut)}
          </p>
          <p className="text-encre-douce">{formaterDuree(rdv.duree_min)}</p>
        </section>

        {rdv.projet && (
          <section>
            <h2 className="mb-1 text-sm font-medium text-encre-douce">Projet</h2>
            <p className="whitespace-pre-wrap">{rdv.projet}</p>
          </section>
        )}

        {rdv.emplacement && (
          <section>
            <h2 className="mb-1 text-sm font-medium text-encre-douce">Emplacement</h2>
            <p>{rdv.emplacement}</p>
          </section>
        )}

        {urlsPhotos.length > 0 && (
          <section>
            <h2 className="mb-1 text-sm font-medium text-encre-douce">
              Photos d&apos;inspiration
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {urlsPhotos.map((url) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-xl bg-surface-douce"
                >
                  <Image
                    src={url}
                    alt="Inspiration"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-encre-douce">Contact</h2>
          {rdv.client_tel && <p>{rdv.client_tel}</p>}
          {rdv.client_email && <p>{rdv.client_email}</p>}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-encre-douce">Tarif</h2>
          <p>
            {rdv.tarif_estime ? `${rdv.tarif_estime} € estimé` : "Non estimé"}
          </p>
          {rdv.acompte_montant ? (
            <p className={rdv.acompte_paye ? "text-encre-douce" : "text-rouge"}>
              Acompte {rdv.acompte_montant} € — {rdv.acompte_paye ? "payé" : "non payé"}
            </p>
          ) : null}
        </section>

        <NotesEditables id={rdv.id} notesInitiales={rdv.notes || ""} />

        <section className="flex gap-3">
          {rdv.client_tel && (
            <a
              href={`tel:${rdv.client_tel}`}
              className="flex h-11 flex-1 items-center justify-center rounded-lg bg-surface font-medium shadow-legere"
            >
              Appeler
            </a>
          )}
          {rdv.client_tel && (
            <a
              href={`sms:${rdv.client_tel}`}
              className="flex h-11 flex-1 items-center justify-center rounded-lg bg-surface font-medium shadow-legere"
            >
              Écrire
            </a>
          )}
        </section>

        <section className="flex gap-3">
          <Link
            href={`/rdv/${rdv.id}/modifier`}
            className="flex h-11 flex-1 items-center justify-center rounded-lg bg-accent font-medium text-sur-accent shadow-legere"
          >
            Modifier
          </Link>
          {!rdv.annule && <BoutonAnnuler id={rdv.id} />}
        </section>

        {precedents.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-medium text-encre-douce">
              Séances précédentes
            </h2>
            <ul className="flex flex-col divide-y divide-ligne overflow-hidden rounded-xl bg-surface shadow-legere">
              {precedents.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/rdv/${p.id}`}
                    className="flex min-h-[56px] flex-col justify-center px-4 py-2 active:bg-surface-douce"
                  >
                    <span className="font-medium">
                      {formaterDateLongue(p.debut)}
                    </span>
                    {p.projet && (
                      <span className="truncate text-sm text-encre-douce">
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
