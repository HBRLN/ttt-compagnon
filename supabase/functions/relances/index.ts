// Fonction Edge "relances", déclenchée toutes les heures par pg_cron.
// Deux passes : rappel J-2 et soins J+1. Voir §5 de la spec.
//
// Idempotence : *_envoye_at est écrit juste après le retour OK de Resend,
// dans la même passe. Si l'écriture échoue, on retentera à la prochaine
// heure plutôt que de risquer un doublon silencieux.

import { createClient } from "jsr:@supabase/supabase-js@2";

const FUSEAU = "Europe/Paris";

type Profil = {
  id: string;
  nom_artiste: string | null;
  email_reponse: string | null;
  adresse: string | null;
  rappel_delai_h: number;
  soin_actif: boolean;
  signature: string | null;
};

type Rdv = {
  id: string;
  client_prenom: string;
  client_email: string | null;
  debut: string;
  duree_min: number;
  projet: string | null;
  acompte_montant: number | null;
  acompte_paye: boolean;
  tatoueur_id: string;
};

function formaterHeure(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSEAU,
  }).format(new Date(iso));
}

function formaterDateLongue(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
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

function emailRappel(rdv: Rdv, profil: Profil) {
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
  if (profil.adresse) lignes.push("", `Adresse : ${profil.adresse}`);
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

  return { objet: `Rappel — on se voit ${jour} à ${heure}`, texte: lignes.join("\n") };
}

function emailSoins(rdv: Rdv, profil: Profil) {
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
  return { objet: "Ton tatouage — les premiers jours", texte: lignes.join("\n") };
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
  let soinsEnvoyes = 0;
  const erreurs: string[] = [];

  // Passe 1 — rappel J-2 (délai configurable par tatoueur)
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
      const { objet, texte } = emailRappel(rdv, profil);
      await envoyerEmail(cleResend, {
        a: rdv.client_email!,
        de: construireExpediteur(profil),
        repondreA: profil.email_reponse,
        objet,
        texte,
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

  // Passe 2 — soins J+1 (fin du RDV entre 18h et 72h dans le passé)
  const il18h = new Date(maintenant.getTime() - 18 * 3600_000);
  const il72h = new Date(maintenant.getTime() - 72 * 3600_000);
  // Fenêtre large côté requête (durée max raisonnable 8h), filtrage précis en JS.
  const debutMin = new Date(il72h.getTime() - 8 * 3600_000);

  const { data: candidatsSoin } = await supabase
    .from("rdv")
    .select("*")
    .eq("annule", false)
    .not("client_email", "is", null)
    .is("soin_envoye_at", null)
    .gte("debut", debutMin.toISOString())
    .lte("debut", il18h.toISOString());

  for (const rdv of (candidatsSoin || []) as Rdv[]) {
    const profil = parId.get(rdv.tatoueur_id);
    if (!profil || !profil.soin_actif) continue;

    const fin = new Date(new Date(rdv.debut).getTime() + rdv.duree_min * 60_000);
    if (fin > il18h || fin < il72h) continue;

    try {
      const { objet, texte } = emailSoins(rdv, profil);
      await envoyerEmail(cleResend, {
        a: rdv.client_email!,
        de: construireExpediteur(profil),
        repondreA: profil.email_reponse,
        objet,
        texte,
      });
      await supabase
        .from("rdv")
        .update({ soin_envoye_at: new Date().toISOString() })
        .eq("id", rdv.id);
      soinsEnvoyes++;
    } catch (e) {
      erreurs.push(`soin ${rdv.id}: ${e}`);
    }
  }

  return new Response(
    JSON.stringify({ rappelsEnvoyes, soinsEnvoyes, erreurs }),
    { headers: { "Content-Type": "application/json" } }
  );
});
