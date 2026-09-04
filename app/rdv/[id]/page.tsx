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
      <header className="animate-apparition flex items-center gap-2 px-4 pt-8 pb-2">
        <Link
          href="/rdv"
          className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-encre-douce transition-colors active:bg-surface"
          aria-label="Retour"
        >
          ←
        </Link>
        <h1 className="titre min-w-0 flex-1 truncate text-2xl">
          {rdv.client_prenom} {rdv.client_nom || ""}
        </h1>
      </header>

      <div className="flex flex-col gap-7 px-6 pt-3">
        {rdv.annule && (
          <p className="rounded-xl bg-surface px-4 py-3 text-sm font-medium text-alerte">
            Rendez-vous annulé
          </p>
        )}

        <section className="animate-pose">
          <p className="titre text-4xl">{formaterDateLongue(rdv.debut)}</p>
          <p className="legende mt-3">
            {formaterHeure(rdv.debut)} · {formaterDuree(rdv.duree_min)}
          </p>
        </section>

        {rdv.projet && (
          <section>
            <h2 className="libelle mb-2">Projet</h2>
            <p className="whitespace-pre-wrap">{rdv.projet}</p>
          </section>
        )}

        {rdv.emplacement && (
          <section>
            <h2 className="libelle mb-2">Emplacement</h2>
            <p>{rdv.emplacement}</p>
          </section>
        )}

        {urlsPhotos.length > 0 && (
          <section>
            <h2 className="libelle mb-2">
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
          <h2 className="libelle">Contact</h2>
          {rdv.client_tel && <p>{rdv.client_tel}</p>}
          {rdv.client_email && <p>{rdv.client_email}</p>}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="libelle">Tarif</h2>
          <p>
            {rdv.tarif_estime ? `${rdv.tarif_estime} € estimé` : "Non estimé"}
          </p>
          {rdv.acompte_montant ? (
            <p className={rdv.acompte_paye ? "text-encre-douce" : "text-alerte"}>
              Acompte {rdv.acompte_montant} € — {rdv.acompte_paye ? "payé" : "non payé"}
            </p>
          ) : null}
        </section>

        <NotesEditables id={rdv.id} notesInitiales={rdv.notes || ""} />

        <section className="flex gap-3">
          {rdv.client_tel && (
            <a
              href={`tel:${rdv.client_tel}`}
              className="flex h-12 flex-1 items-center justify-center rounded-xl bg-surface text-sm font-medium transition-transform duration-200 active:scale-[0.98]"
            >
              Appeler
            </a>
          )}
          {rdv.client_tel && (
            <a
              href={`sms:${rdv.client_tel}`}
              className="flex h-12 flex-1 items-center justify-center rounded-xl bg-surface text-sm font-medium transition-transform duration-200 active:scale-[0.98]"
            >
              Écrire
            </a>
          )}
        </section>

        <section className="flex gap-3">
          <Link
            href={`/rdv/${rdv.id}/modifier`}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-encre text-sm font-medium text-fond transition-transform duration-200 active:scale-[0.98]"
          >
            Modifier
          </Link>
          {!rdv.annule && <BoutonAnnuler id={rdv.id} />}
        </section>

        {precedents.length > 0 && (
          <section>
            <h2 className="libelle mb-3">
              Séances précédentes
            </h2>
            <ul className="flex flex-col overflow-hidden rounded-2xl bg-surface">
              {precedents.map((p) => (
                <li key={p.id} className="border-t border-ligne first:border-t-0">
                  <Link
                    href={`/rdv/${p.id}`}
                    className="flex min-h-14 flex-col justify-center px-4 py-3.5 transition-colors active:bg-surface-douce"
                  >
                    <span className="titre text-lg">
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
