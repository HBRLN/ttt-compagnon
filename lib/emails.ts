import type { Profil, Rdv } from "@/lib/types";
import { formaterDateCourte, formaterDuree, formaterHeure, formaterJour } from "@/lib/date";

type Email = { objet: string; texte: string };

// L'adresse technique d'envoi reste unique pour toute l'appli (imposé par
// Resend tant qu'un domaine par tatoueur n'est pas vérifié), mais le nom
// affiché est celui du tatoueur — et "Répondre" atterrit dans sa vraie
// boîte grâce à profil.email_reponse.
function adresseExpedition(): string {
  const explicite = process.env.RESEND_FROM_ADDRESS;
  if (explicite) return explicite;
  const brut = process.env.RESEND_FROM || "onboarding@resend.dev";
  const correspondance = brut.match(/<(.+)>/);
  return correspondance ? correspondance[1] : brut;
}

export function construireExpediteur(profil: Profil): string {
  const nom = profil.nom_artiste || "Compagnon";
  return `${nom} <${adresseExpedition()}>`;
}

function pied(profil: Profil): string {
  const nom = profil.nom_artiste || "ton tatoueur";
  return `Tu reçois ce message parce que tu as pris rendez-vous avec ${nom}. Tes coordonnées ne servent qu'à ça et ne sont transmises à personne.`;
}

function signature(profil: Profil): string {
  return profil.signature || profil.nom_artiste || "";
}

// Phrase de lieu construite à partir des Réglages, avec dégradation
// gracieuse si le tatoueur n'a pas (encore) rempli son Instagram ou son
// nom d'artiste.
function ligneLieu(profil: Profil): string | null {
  if (!profil.adresse) return null;
  const insta = profil.instagram
    ? `@${profil.instagram.replace(/^@/, "")}`
    : null;
  if (profil.nom_artiste && insta) {
    return `Le RDV se fera au ${profil.adresse}, au salon ${profil.nom_artiste} (${insta}).`;
  }
  if (profil.nom_artiste) {
    return `Le RDV se fera au ${profil.adresse}, au salon ${profil.nom_artiste}.`;
  }
  return `Le RDV se fera au ${profil.adresse}.`;
}

export function emailConfirmation(rdv: Rdv, profil: Profil): Email {
  const jour = formaterJour(rdv.debut);
  const date = formaterDateCourte(rdv.debut);
  const heure = formaterHeure(rdv.debut);

  const lignes = [
    `Salut ${rdv.client_prenom},`,
    "",
    `Ton rendez-vous tattoo est posé : ${jour} ${date} à ${heure}, pour environ ${formaterDuree(
      rdv.duree_min
    )}.`,
  ];

  const lieu = ligneLieu(profil);
  if (lieu) lignes.push("", lieu);

  lignes.push(
    "",
    "Si tu as un empêchement, préviens-moi le plus tôt possible — ça me permet de proposer le créneau à quelqu'un d'autre.",
    "",
    "Je reprécise que l'acompte est non remboursable (sauf si je décide d'annuler le RDV ou que tu as une raison médicale qui t'empêche de te faire tatouer) et perdu si tu décales le RDV moins d'une semaine avant. N'hésite pas à prévoir de l'espèce pour le jour J !",
    "",
    "Si tu le souhaites, tu pourras voir le dessin seulement la veille du RDV, dans ce cas envoie-moi un petit message pour me le demander !",
    "",
    "Les accompagnants sont autorisés.",
    "",
    "Si tu as des questions avant le RDV, n'hésite pas à me renvoyer un message sur insta.",
    "",
    "MERCI ! J'ai trop hâte, à bientôt !",
    signature(profil),
    "",
    pied(profil)
  );

  return {
    objet: `RDV Tattoo — ${date} à ${heure}`,
    texte: lignes.join("\n"),
  };
}

export function emailRappel(rdv: Rdv, profil: Profil): Email {
  const jour = formaterJour(rdv.debut);
  const date = formaterDateCourte(rdv.debut);
  const heure = formaterHeure(rdv.debut);

  const lignes = [
    `Salut ${rdv.client_prenom},`,
    "",
    `Petit rappel : on se voit ${jour} ${date} à ${heure} pour ${
      rdv.projet || "ton tatouage"
    }.`,
  ];

  const lieu = ligneLieu(profil);
  if (lieu) lignes.push("", lieu);

  lignes.push(
    "",
    "Quelques conseils avant le tattoo : mange avant de venir, arrive reposé, évite l'alcool la veille, et prévois des vêtements noirs qui laissent la zone accessible et dans lesquels tu seras à l'aise.",
    "",
    "À ce stade, l'acompte n'est plus remboursable. N'hésite pas à prévoir de l'espèce pour le jour J !",
    "",
    "Si tu le souhaites, tu pourras voir le dessin demain, dans ce cas envoie-moi un petit message pour me le demander !",
    "",
    "Les accompagnants sont autorisés.",
    "",
    "Si tu as des questions avant le RDV, n'hésite pas à me renvoyer un message sur insta.",
    "",
    `À ${jour} !`,
    signature(profil),
    "",
    pied(profil)
  );

  return {
    objet: `RDV Tattoo — on se voit ${jour} à ${heure}`,
    texte: lignes.join("\n"),
  };
}
