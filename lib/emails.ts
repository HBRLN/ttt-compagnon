import type { Profil, Rdv } from "@/lib/types";
import {
  formaterDateLongue,
  formaterDuree,
  formaterHeure,
  formaterJour,
} from "@/lib/date";

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

export function emailConfirmation(rdv: Rdv, profil: Profil): Email {
  const jour = formaterJour(rdv.debut);
  const date = formaterDateLongue(rdv.debut);
  const heure = formaterHeure(rdv.debut);
  const acompteDu = rdv.acompte_montant && !rdv.acompte_paye;

  const lignes = [
    `Salut ${rdv.client_prenom},`,
    "",
    `Ton rendez-vous est calé : ${jour} ${date} à ${heure}, pour environ ${formaterDuree(
      rdv.duree_min
    )}.`,
    "",
    `Le projet : ${rdv.projet || "à préciser ensemble"}`,
  ];

  if (acompteDu) {
    lignes.push(
      "",
      `Pour bloquer le créneau, pense à l'acompte de ${rdv.acompte_montant} €.`
    );
  }

  if (profil.adresse) {
    lignes.push("", `Adresse : ${profil.adresse}`);
  }

  lignes.push(
    "",
    "Si tu as un empêchement, préviens-moi le plus tôt possible — ça me permet de proposer le créneau à quelqu'un d'autre.",
    "",
    "À bientôt,",
    signature(profil),
    "",
    pied(profil)
  );

  return {
    objet: `C'est noté — ${date} à ${heure}`,
    texte: lignes.join("\n"),
  };
}

export function emailRappel(rdv: Rdv, profil: Profil): Email {
  const jour = formaterJour(rdv.debut);
  const date = formaterDateLongue(rdv.debut);
  const heure = formaterHeure(rdv.debut);
  const acompteDu = rdv.acompte_montant && !rdv.acompte_paye;

  const lignes = [
    `Salut ${rdv.client_prenom},`,
    "",
    `Petit rappel : on se voit ${jour} ${date} à ${heure} pour ${
      rdv.projet || "ton tatouage"
    }.`,
  ];

  if (profil.adresse) {
    lignes.push("", `Adresse : ${profil.adresse}`);
  }

  lignes.push(
    "",
    "Quelques trucs qui aident : mange avant de venir, arrive reposé, évite l'alcool la veille, et prévois des vêtements qui laissent la zone accessible."
  );

  if (acompteDu) {
    lignes.push(
      "",
      `L'acompte de ${rdv.acompte_montant} € n'est pas encore réglé, pense à le prévoir.`
    );
  }

  lignes.push("", `À ${jour},`, signature(profil), "", pied(profil));

  return {
    objet: `Rappel — on se voit ${jour} à ${heure}`,
    texte: lignes.join("\n"),
  };
}

export function emailSoins(rdv: Rdv, profil: Profil): Email {
  const lignes = [
    `Salut ${rdv.client_prenom},`,
    "",
    "J'espère que ça se passe bien. Un petit récap des consignes qu'on a vues hier :",
    "",
    "— Lave doucement à l'eau tiède et au savon neutre, deux fois par jour, et sèche en tamponnant.",
    "— Une couche fine de crème, pas plus. Trop de crème étouffe la peau.",
    "— Ça va peler et démanger : c'est normal. Ne gratte pas, ne tire pas les peaux.",
    "— Pas de piscine, pas de bain, pas de sauna pendant deux à trois semaines.",
    "— Pas de soleil direct sur la zone, et de la crème solaire indice élevé une fois cicatrisé.",
    "",
    "En cas de doute — rougeur qui s'étend, chaleur, écoulement — écris-moi, envoie une photo.",
    "",
    signature(profil),
    "",
    pied(profil),
  ];

  return {
    objet: "Ton tatouage — les premiers jours",
    texte: lignes.join("\n"),
  };
}
