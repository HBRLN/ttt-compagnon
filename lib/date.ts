// Toutes les dates sont stockées en timestamptz (UTC).
// L'affichage se fait toujours en Europe/Paris, jamais en heure locale du serveur.

const FUSEAU = "Europe/Paris";

export function formaterHeure(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSEAU,
  }).format(new Date(iso));
}

export function formaterDateCourte(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: FUSEAU,
  }).format(new Date(iso));
}

export function formaterDateLongue(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: FUSEAU,
  }).format(new Date(iso));
}

export function formaterJour(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    timeZone: FUSEAU,
  }).format(new Date(iso));
}

function cleJourParis(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSEAU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// « Aujourd'hui », « Demain », ou « Jeudi 12 mars »
export function etiquetteJour(iso: string): string {
  const date = new Date(iso);
  const maintenant = new Date();
  const demain = new Date(maintenant);
  demain.setDate(demain.getDate() + 1);

  const cleDate = cleJourParis(date);
  if (cleDate === cleJourParis(maintenant)) return "Aujourd'hui";
  if (cleDate === cleJourParis(demain)) return "Demain";

  const jour = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    timeZone: FUSEAU,
  }).format(date);
  const quantieme = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: FUSEAU,
  }).format(date);

  const jourCapitalise = jour.charAt(0).toUpperCase() + jour.slice(1);
  return `${jourCapitalise} ${quantieme}`;
}

// Clé stable pour grouper des RDV par jour civil (Europe/Paris)
export function cleJour(iso: string): string {
  return cleJourParis(new Date(iso));
}

export function formaterDuree(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m}`;
}

// Format YYYYMMDDTHHMMSSZ requis par le flux .ics
export function formaterIcsUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}
