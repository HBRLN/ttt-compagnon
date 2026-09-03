import { creerClientServeur } from "@/lib/supabase/server";
import FormulaireReglages from "./FormulaireReglages";

export default async function PageReglages() {
  const supabase = await creerClientServeur();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profil } = await supabase
    .from("profil")
    .select("*")
    .eq("id", session!.user.id)
    .single();

  if (!profil) return null;

  return <FormulaireReglages profil={profil} email={session!.user.email!} />;
}
