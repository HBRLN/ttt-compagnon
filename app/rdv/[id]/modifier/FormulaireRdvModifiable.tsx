"use client";

import FormulaireRdv from "@/components/FormulaireRdv";
import { modifierRdv, type ChampsRdv } from "@/lib/actions/rdv";
import type { Rdv } from "@/lib/types";

export default function FormulaireRdvModifiable({ rdv }: { rdv: Rdv }) {
  return (
    <FormulaireRdv
      titre="Modifier le RDV"
      rdvInitial={rdv}
      chercherHistorique={false}
      onValider={(champs: ChampsRdv) => modifierRdv(rdv.id, champs)}
    />
  );
}
