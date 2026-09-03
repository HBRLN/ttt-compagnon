"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/server";

export type ChampsProfil = {
  nom_artiste?: string;
  nom_salon?: string;
  email_reponse?: string;
  tel?: string;
  instagram?: string;
  adresse?: string;
  signature?: string;
  rappel_delai_h: number;
};

export async function enregistrerProfil(champs: ChampsProfil) {
  const supabase = await creerClientServeur();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { error } = await supabase
    .from("profil")
    .update({
      nom_artiste: champs.nom_artiste?.trim() || null,
      nom_salon: champs.nom_salon?.trim() || null,
      email_reponse: champs.email_reponse?.trim() || null,
      tel: champs.tel?.trim() || null,
      instagram: champs.instagram?.trim() || null,
      adresse: champs.adresse?.trim() || null,
      signature: champs.signature?.trim() || null,
      rappel_delai_h: champs.rappel_delai_h,
    })
    .eq("id", userData.user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/reglages");
}

export async function regenererLienIcs() {
  const supabase = await creerClientServeur();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data, error } = await supabase
    .from("profil")
    .update({ ics_token: crypto.randomUUID() })
    .eq("id", userData.user.id)
    .select("ics_token")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/reglages");
  return data.ics_token;
}

export async function seDeconnecter() {
  const supabase = await creerClientServeur();
  await supabase.auth.signOut();
  redirect("/login");
}
