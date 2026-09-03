import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/server";
import type { Rdv } from "@/lib/types";
import FormulaireRdvModifiable from "./FormulaireRdvModifiable";

export default async function PageModifierRdv({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await creerClientServeur();
  const { data: rdv } = await supabase.from("rdv").select("*").eq("id", id).single();

  if (!rdv) notFound();

  return <FormulaireRdvModifiable rdv={rdv as Rdv} />;
}
