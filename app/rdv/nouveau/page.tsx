"use client";

import FormulaireRdv from "@/components/FormulaireRdv";
import { creerRdv } from "@/lib/actions/rdv";

export default function PageNouveauRdv() {
  return <FormulaireRdv titre="Nouveau RDV" onValider={creerRdv} />;
}
