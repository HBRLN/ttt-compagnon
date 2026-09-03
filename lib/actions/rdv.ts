"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/server";
import { construireExpediteur, emailConfirmation } from "@/lib/emails";
import { envoyerEmail } from "@/lib/resend";
import type { Rdv } from "@/lib/types";

function normaliserTel(tel: string): string {
  return tel.replace(/[^\d+]/g, "");
}

export async function rechercherClientParTel(telBrut: string) {
  const tel = normaliserTel(telBrut);
  if (tel.length < 6) return null;

  const supabase = await creerClientServeur();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("rdv")
    .select("client_prenom, client_email, client_tel")
    .eq("tatoueur_id", userData.user.id)
    .eq("client_tel", tel)
    .order("debut", { ascending: false });

  if (error || !data || data.length === 0) return null;

  return {
    nbSeances: data.length,
    prenom: data[0].client_prenom,
    email: data[0].client_email,
  };
}

export type ChampsRdv = {
  client_prenom: string;
  client_nom?: string;
  client_tel?: string;
  client_email?: string;
  debut: string;
  duree_min: number;
  projet?: string;
  emplacement?: string;
  tarif_estime?: number;
  acompte_montant?: number;
  acompte_paye: boolean;
  photo_urls?: string[];
  notes?: string;
};

function nettoyer(champs: ChampsRdv) {
  return {
    client_prenom: champs.client_prenom.trim(),
    client_nom: champs.client_nom?.trim() || null,
    client_tel: champs.client_tel ? normaliserTel(champs.client_tel) : null,
    client_email: champs.client_email?.trim() || null,
    debut: champs.debut,
    duree_min: champs.duree_min,
    projet: champs.projet?.trim() || null,
    emplacement: champs.emplacement?.trim() || null,
    tarif_estime: champs.tarif_estime ?? null,
    acompte_montant: champs.acompte_montant ?? null,
    acompte_paye: champs.acompte_paye,
    photo_urls: champs.photo_urls || [],
    notes: champs.notes?.trim() || null,
  };
}

export async function creerRdv(champs: ChampsRdv) {
  const supabase = await creerClientServeur();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: rdv, error } = await supabase
    .from("rdv")
    .insert({ ...nettoyer(champs), tatoueur_id: userData.user.id })
    .select()
    .single();

  if (error || !rdv) {
    throw new Error(error?.message || "Impossible d'enregistrer le RDV.");
  }

  if (rdv.client_email) {
    const { data: profil } = await supabase
      .from("profil")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    if (profil) {
      try {
        const { objet, texte } = emailConfirmation(rdv as Rdv, profil);
        await envoyerEmail({
          a: rdv.client_email,
          de: construireExpediteur(profil),
          repondreA: profil.email_reponse,
          objet,
          texte,
        });
        await supabase
          .from("rdv")
          .update({ confirm_envoye_at: new Date().toISOString() })
          .eq("id", rdv.id);
      } catch (e) {
        // On ne bloque pas la création du RDV si l'email échoue :
        // le RDV est ce qui compte, l'email peut être renvoyé plus tard.
        console.error("Échec envoi email de confirmation", e);
      }
    }
  }

  revalidatePath("/");
  redirect(`/rdv/${rdv.id}`);
}

export async function modifierRdv(id: string, champs: ChampsRdv) {
  const supabase = await creerClientServeur();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { error } = await supabase
    .from("rdv")
    .update(nettoyer(champs))
    .eq("id", id)
    .eq("tatoueur_id", userData.user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/rdv/${id}`);
  redirect(`/rdv/${id}`);
}

export async function annulerRdv(id: string) {
  const supabase = await creerClientServeur();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  await supabase
    .from("rdv")
    .update({ annule: true })
    .eq("id", id)
    .eq("tatoueur_id", userData.user.id);

  revalidatePath("/");
  revalidatePath(`/rdv/${id}`);
}

export async function enregistrerNotes(id: string, notes: string) {
  const supabase = await creerClientServeur();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  await supabase
    .from("rdv")
    .update({ notes: notes.trim() || null })
    .eq("id", id)
    .eq("tatoueur_id", userData.user.id);

  revalidatePath(`/rdv/${id}`);
}
