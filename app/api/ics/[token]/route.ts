import { NextResponse, type NextRequest } from "next/server";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { genererIcs } from "@/lib/ics";
import type { Rdv } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = creerClientAdmin();

  const { data: profil } = await supabase
    .from("profil")
    .select("id")
    .eq("ics_token", token)
    .single();

  if (!profil) {
    return new NextResponse("Introuvable", { status: 404 });
  }

  const ilYA90Jours = new Date();
  ilYA90Jours.setDate(ilYA90Jours.getDate() - 90);

  const { data: rdvs } = await supabase
    .from("rdv")
    .select("*")
    .eq("tatoueur_id", profil.id)
    .eq("annule", false)
    .gte("debut", ilYA90Jours.toISOString())
    .order("debut", { ascending: true });

  const ics = genererIcs((rdvs as Rdv[]) || []);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
