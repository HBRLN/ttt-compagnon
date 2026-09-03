import { creerClientServeur } from "@/lib/supabase/server";
import FormulaireReglages from "./FormulaireReglages";

export default async function PageReglages() {
  const supabase = await creerClientServeur();
  const { data: userData } = await supabase.auth.getUser();

  const { data: profil } = await supabase
    .from("profil")
    .select("*")
    .eq("id", userData.user!.id)
    .single();

  if (!profil) return null;

  return <FormulaireReglages profil={profil} email={userData.user!.email!} />;
}
