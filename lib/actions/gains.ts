"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/server";

export async function ajouterGain(champs: {
  libelle: string;
  montant: number;
  date: string;
}) {
  const supabase = await creerClientServeur();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { error } = await supabase.from("gain").insert({
    tatoueur_id: userData.user.id,
    libelle: champs.libelle,
    montant: champs.montant,
    date: champs.date,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/compta");
}

export async function supprimerGain(id: string) {
  const supabase = await creerClientServeur();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  await supabase.from("gain").delete().eq("id", id).eq("tatoueur_id", userData.user.id);

  revalidatePath("/compta");
}
