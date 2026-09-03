// Fonction Edge "relances", déclenchée toutes les heures par pg_cron.
// Une seule passe : rappel J-2. Voir §5 de la spec.
//
// Idempotence : rappel_envoye_at est écrit juste après le retour OK de
// Resend, dans la même passe. Deux exécutions du cron ne doivent jamais
// produire deux emails.

import { createClient } from "jsr:@supabase/supabase-js@2";

const FUSEAU = "Europe/Paris";

type Profil = {
  id: string;
  nom_artiste: string | null;
  nom_salon: string | null;
  email_reponse: string | null;
  adresse: string | null;
  instagram: string | null;
  rappel_delai_h: number;
  signature: string | null;
};

type Rdv = {
  id: string;
  client_prenom: string;
  client_email: string | null;
  debut: string;
  duree_min: number;
  projet: string | null;
  tatoueur_id: string;
};

function formaterHeure(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSEAU,
  }).format(new Date(iso));
}

function formaterDateCourte(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: FUSEAU,
  }).format(new Date(iso));
}

function formaterJour(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    timeZone: FUSEAU,
  }).format(new Date(iso));
}

function pied(profil: Profil) {
  const nom = profil.nom_artiste || "ton tatoueur";
  return `Tu reçois ce message parce que tu as pris rendez-vous avec ${nom}. Tes coordonnées ne servent qu'à ça et ne sont transmises à personne.`;
}

function signature(profil: Profil) {
  return profil.signature || profil.nom_artiste || "";
}

// Phrase de lieu construite à partir des Réglages. Le nom cité est celui
// du salon (ex. "La Belle Hirondelle"), pas celui du tatoueur — avec
// repli sur le nom d'artiste si le nom du salon n'est pas encore rempli.
function ligneLieu(profil: Profil): string | null {
  if (!profil.adresse) return null;
  const nomSalon = profil.nom_salon || profil.nom_artiste;
  const insta = profil.instagram ? `@${profil.instagram.replace(/^@/, "")}` : null;
  if (nomSalon && insta) {
    return `Le RDV se fera au **${profil.adresse}**, au salon **${nomSalon}** (${insta}).`;
  }
  if (nomSalon) {
    return `Le RDV se fera au **${profil.adresse}**, au salon **${nomSalon}**.`;
  }
  return `Le RDV se fera au **${profil.adresse}**.`;
}

// Les lignes du corps utilisent une syntaxe **gras** minimale, convertie
// soit en texte brut (retiré), soit en <strong> pour la version HTML.
function versTexte(lignes: string[]): string {
  return lignes.map((ligne) => ligne.replace(/\*\*(.+?)\*\*/g, "$1")).join("\n");
}

function echapperHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Pas de police imposée : le client mail applique la sienne.
function versHtml(lignes: string[]): string {
  const paragraphes = lignes
    .filter((ligne) => ligne !== "")
    .map((ligne) => {
      const echappee = echapperHtml(ligne).replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
      );
      return `<p style="margin:0 0 16px;">${echappee}</p>`;
    })
    .join("\n");
  return `<div style="font-size:15px;line-height:1.55;">${paragraphes}</div>`;
}

function emailRappel(rdv: Rdv, profil: Profil) {
  const jour = formaterJour(rdv.debut);
  const date = formaterDateCourte(rdv.debut);
  const heure = formaterHeure(rdv.debut);

  const lignes = [
    `Salut ${rdv.client_prenom},`,
    "",
    `Petit rappel : on se voit **${jour} ${date} à ${heure}** pour ${
      rdv.projet || "ton tatouage"
    }.`,
  ];

  const lieu = ligneLieu(profil);
  if (lieu) lignes.push("", lieu);

  lignes.push(
    "",
    "Quelques conseils avant le tattoo : mange avant de venir, arrive reposé, évite l'alcool la veille, et prévois des vêtements noirs qui laissent la zone accessible et dans lesquels tu seras à l'aise.",
    "",
    "À ce stade, **l'acompte n'est plus remboursable**. N'hésite pas à prévoir de l'espèce pour le jour J !",
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
    texte: versTexte(lignes),
    html: versHtml(lignes),
  };
}

// L'adresse technique d'envoi reste unique pour toute l'appli (imposé par
// Resend tant qu'un domaine par tatoueur n'est pas vérifié), mais le nom
// affiché est celui du tatoueur — et "Répondre" atterrit dans sa vraie
// boîte grâce à profil.email_reponse.
function adresseExpedition(): string {
  const explicite = Deno.env.get("RESEND_FROM_ADDRESS");
  if (explicite) return explicite;
  const brut = Deno.env.get("RESEND_FROM") || "onboarding@resend.dev";
  const correspondance = brut.match(/<(.+)>/);
  return correspondance ? correspondance[1] : brut;
}

function construireExpediteur(profil: Profil): string {
  const nom = profil.nom_artiste || "Compagnon";
  return `${nom} <${adresseExpedition()}>`;
}

async function envoyerEmail(cleResend: string, params: {
  a: string;
  de: string;
  repondreA?: string | null;
  objet: string;
  texte: string;
  html: string;
}) {
  const reponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cleResend}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.de,
      to: params.a,
      reply_to: params.repondreA || undefined,
      subject: params.objet,
      text: params.texte,
      html: params.html,
    }),
  });

  if (!reponse.ok) {
    throw new Error(`Resend a répondu ${reponse.status} : ${await reponse.text()}`);
  }
}

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const cleResend = Deno.env.get("RESEND_API_KEY")!;

  const { data: profils } = await supabase.from("profil").select("*");
  const parId = new Map((profils || []).map((p: Profil) => [p.id, p]));

  const maintenant = new Date();
  let rappelsEnvoyes = 0;
  const erreurs: string[] = [];

  // Rappel J-2 (délai configurable par tatoueur)
  const delaiMaxH = Math.max(
    ...(profils || []).map((p: Profil) => p.rappel_delai_h),
    48
  );
  const finFenetreRappel = new Date(
    maintenant.getTime() + delaiMaxH * 3600_000
  );

  const { data: candidatsRappel } = await supabase
    .from("rdv")
    .select("*")
    .eq("annule", false)
    .not("client_email", "is", null)
    .is("rappel_envoye_at", null)
    .gte("debut", maintenant.toISOString())
    .lte("debut", finFenetreRappel.toISOString());

  for (const rdv of (candidatsRappel || []) as Rdv[]) {
    const profil = parId.get(rdv.tatoueur_id);
    if (!profil) continue;

    const seuil = new Date(
      maintenant.getTime() + profil.rappel_delai_h * 3600_000
    );
    if (new Date(rdv.debut) > seuil) continue;

    try {
      const { objet, texte, html } = emailRappel(rdv, profil);
      await envoyerEmail(cleResend, {
        a: rdv.client_email!,
        de: construireExpediteur(profil),
        repondreA: profil.email_reponse,
        objet,
        texte,
        html,
      });
      await supabase
        .from("rdv")
        .update({ rappel_envoye_at: new Date().toISOString() })
        .eq("id", rdv.id);
      rappelsEnvoyes++;
    } catch (e) {
      erreurs.push(`rappel ${rdv.id}: ${e}`);
    }
  }

  return new Response(
    JSON.stringify({ rappelsEnvoyes, erreurs }),
    { headers: { "Content-Type": "application/json" } }
  );
});
