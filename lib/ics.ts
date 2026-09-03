import { formaterIcsUtc } from "@/lib/date";
import type { Rdv } from "@/lib/types";

function echapper(texte: string): string {
  return texte
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function plierLigne(ligne: string): string {
  // RFC 5545 : les lignes de plus de 75 octets doivent être pliées.
  const octets = Buffer.byteLength(ligne, "utf-8");
  if (octets <= 75) return ligne;

  let resultat = "";
  let reste = ligne;
  let premiere = true;
  while (Buffer.byteLength(reste, "utf-8") > 0) {
    const limite = premiere ? 75 : 74;
    let coupe = Math.min(reste.length, limite);
    while (Buffer.byteLength(reste.slice(0, coupe), "utf-8") > limite) coupe--;
    resultat += (premiere ? "" : "\r\n ") + reste.slice(0, coupe);
    reste = reste.slice(coupe);
    premiere = false;
  }
  return resultat;
}

export function genererIcs(rdvs: Rdv[]): string {
  const maintenant = formaterIcsUtc(new Date().toISOString());

  const evenements = rdvs.map((rdv) => {
    const fin = new Date(
      new Date(rdv.debut).getTime() + rdv.duree_min * 60000
    ).toISOString();
    const projetTronque = (rdv.projet || "").slice(0, 40);
    const resume = projetTronque
      ? `${rdv.client_prenom} — ${projetTronque}`
      : rdv.client_prenom;
    const description = [rdv.projet, rdv.emplacement, rdv.client_tel]
      .filter(Boolean)
      .join("\\n");

    const lignes = [
      "BEGIN:VEVENT",
      `UID:${rdv.id}@compagnon`,
      `DTSTAMP:${maintenant}`,
      `DTSTART:${formaterIcsUtc(rdv.debut)}`,
      `DTEND:${formaterIcsUtc(fin)}`,
      `SUMMARY:${echapper(resume)}`,
    ];
    if (description) lignes.push(`DESCRIPTION:${echapper(description)}`);
    lignes.push("END:VEVENT");
    return lignes.map(plierLigne).join("\r\n");
  });

  const calendrier = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//compagnon//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Mes rendez-vous",
    "X-PUBLISHED-TTL:PT1H",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    ...evenements,
    "END:VCALENDAR",
  ];

  return calendrier.join("\r\n") + "\r\n";
}
