# Compagnon tatoueur — spécification V1

Application web mobile-first pour tatoueur indépendant. Un seul objectif : que ses RDV à venir soient au propre et que ses clients soient prévenus tout seuls.

**Nom de code du projet :** `compagnon` (à remplacer)

---

## 1. Périmètre

### Ce que l'app fait

- Le tatoueur saisit ses RDV à la main, après sa DM Instagram
- Elle affiche la liste des RDV à venir, groupés par jour
- Elle envoie un email de confirmation à la prise du RDV
- Elle envoie un email de rappel automatique à J-2
- Elle envoie un email de soins automatique à J+1
- Elle publie un flux `.ics` privé auquel le tatoueur s'abonne depuis son agenda

### Ce que l'app ne fait pas — et ne fera pas en V1

- Pas de compte client. Le client ne se connecte jamais, il reçoit des emails.
- Pas de page de réservation en ligne. La prise de RDV reste sur Instagram.
- Pas de paiement, pas d'encaissement d'acompte. On note juste s'il est payé.
- Pas de multi-utilisateur, pas de studio, pas de cabines, pas de rôles.
- Pas de SMS (voir §9).
- Pas de synchronisation bidirectionnelle avec Google/Apple Calendar.
- Pas de statistiques, pas de CA, pas de factures.

**Règle de tri pour toute idée de fonctionnalité :** est-ce que ça sert le tatoueur solo le matin quand il ouvre son téléphone ? Sinon, hors périmètre.

---

## 2. Stack

| Brique | Choix | Pourquoi |
|---|---|---|
| Front | Next.js (App Router) + Tailwind | PWA installable, un seul déploiement |
| Base + auth | Supabase | Postgres, magic link, cron, tout au même endroit |
| Emails | Resend | 3 000 emails/mois gratuits, plafond 100/jour |
| Hébergement | Vercel | Palier gratuit suffisant |
| Coût mensuel | **0 €** | À cette échelle, tout tient dans les paliers gratuits |

**PWA, pas d'app native.** Manifest + icônes + `display: standalone`. Le tatoueur fait « Ajouter à l'écran d'accueil ». Pas de compte développeur Apple à 99 €/an, pas de review, pas de build mobile.

**Connexion par lien magique.** Supabase Auth, OTP par email. Aucun mot de passe à gérer ni à réinitialiser.

---

## 3. Schéma de données

Deux tables. C'est tout.

```sql
-- Réglages du tatoueur
create table profil (
  id             uuid primary key references auth.users(id) on delete cascade,
  nom_artiste    text,
  email_reponse  text,          -- email affiché en "répondre à"
  tel            text,
  instagram      text,
  adresse        text,          -- affichée dans les emails de rappel
  ics_token      uuid not null default gen_random_uuid(),
  rappel_delai_h int  not null default 48,
  soin_actif     boolean not null default true,
  signature      text
);

-- Les rendez-vous
create table rdv (
  id              uuid primary key default gen_random_uuid(),
  tatoueur_id     uuid not null references auth.users(id) on delete cascade,
  client_prenom   text not null,
  client_nom      text,
  client_tel      text,
  client_email    text,
  debut           timestamptz not null,
  duree_min       int  not null default 120,
  projet          text,          -- la courte description
  emplacement     text,          -- avant-bras gauche, dos, ...
  tarif_estime    numeric(10,2),
  acompte_montant numeric(10,2),
  acompte_paye    boolean not null default false,
  photo_url       text,          -- référence, Supabase Storage
  notes           text,
  annule          boolean not null default false,
  confirm_envoye_at timestamptz,
  rappel_envoye_at  timestamptz,
  soin_envoye_at    timestamptz,
  cree_le         timestamptz not null default now()
);

create index rdv_tatoueur_debut_idx on rdv (tatoueur_id, debut);
create index rdv_relances_idx on rdv (debut) where annule = false;
```

### RLS — à activer dès le départ

```sql
alter table profil enable row level security;
alter table rdv    enable row level security;

create policy "profil perso" on profil
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "rdv perso" on rdv
  for all using (auth.uid() = tatoueur_id) with check (auth.uid() = tatoueur_id);
```

Le flux `.ics` et le cron passent par la clé `service_role` côté serveur, donc ils ne sont pas bloqués par RLS. **Cette clé ne doit jamais toucher le client.**

### Pas de table clients

L'historique d'un client s'obtient en groupant les RDV sur `client_tel`. Un client qui revient pour la 3e séance, on le retrouve par son numéro. Pas de fiches à créer ni à maintenir à jour.

---

## 4. Les quatre écrans

### 4.1 — À venir (`/`)

Écran d'accueil. Liste des RDV `debut >= aujourd'hui`, triés croissant, groupés par jour avec un en-tête de date (« Aujourd'hui », « Demain », « Jeudi 12 mars »).

Chaque ligne : heure, prénom, projet tronqué, et une pastille rouge discrète si l'acompte n'est pas payé.

Bouton flottant « + » en bas à droite.

Si la liste est vide : « Rien de prévu. » et le bouton. Pas d'illustration, pas de message d'encouragement.

### 4.2 — Nouveau RDV (`/rdv/nouveau`)

Six champs visibles, le reste replié sous « Plus de détails » :

**Visible :** prénom · téléphone · email · date et heure · durée · projet (textarea 3 lignes)

**Replié :** nom · emplacement · tarif estimé · acompte (montant + payé O/N) · photo de référence · notes

Astuce de saisie : si le numéro saisi existe déjà, afficher sous le champ « Déjà venu·e — 2 séances » avec un lien vers l'historique, et pré-remplir prénom/email.

Un seul bouton : **Enregistrer**. Si un email est renseigné, l'email de confirmation part immédiatement.

### 4.3 — Fiche RDV (`/rdv/[id]`)

Tout le détail, la photo de référence en grand, les notes éditables en place.

En bas : **Séances précédentes** — les autres RDV du même numéro, du plus récent au plus ancien, cliquables.

Actions : Modifier · Annuler (bascule `annule`, ne supprime rien) · Appeler · Écrire.

### 4.4 — Réglages (`/reglages`)

Nom d'artiste, email de réponse, téléphone, adresse du studio, Instagram, signature.

Délai de rappel (24 h / 48 h / 72 h). Message de soins activé ou non.

Lien d'abonnement à l'agenda, avec un bouton « Copier » et deux lignes d'explication :
> Colle ce lien dans Réglages → Calendrier → Comptes → Ajouter un abonnement (iPhone), ou dans Google Agenda → Autres agendas → À partir de l'URL.

---

## 5. Les rappels automatiques

Une fonction Edge Supabase `relances`, déclenchée toutes les heures par pg_cron.

```sql
select cron.schedule(
  'relances-horaires',
  '5 * * * *',
  $$ select net.http_post(
       url     := 'https://<projet>.supabase.co/functions/v1/relances',
       headers := '{"Authorization": "Bearer <service_role>"}'::jsonb
     ) $$
);
```

La fonction fait trois passes :

**Rappel J-2** — RDV non annulés, avec email, `rappel_envoye_at is null`, dont `debut` tombe entre maintenant et maintenant + `rappel_delai_h`. Envoi, puis on horodate `rappel_envoye_at`.

**Soins J+1** — RDV non annulés, avec email, `soin_envoye_at is null`, `soin_actif = true`, dont la fin (`debut + duree_min`) est passée depuis plus de 18 h et moins de 72 h. Le plafond haut évite d'arroser tout l'historique au premier lancement.

**Rien d'autre.** Pas de relance d'acompte, pas de « ça fait longtemps ». On ne spamme pas les clients d'un tatoueur.

### Trois pièges à ne pas rater

1. **Fuseau horaire.** On stocke en `timestamptz`, on affiche en `Europe/Paris` avec `Intl.DateTimeFormat`. Jamais de date locale en base.
2. **RDV créé la veille pour le lendemain.** Le rappel J-2 ne partira jamais — c'est normal, la confirmation immédiate fait le travail. Ne pas essayer de rattraper.
3. **Idempotence.** L'horodatage `*_envoye_at` est écrit *après* le retour OK de Resend, dans la même passe. Deux exécutions du cron ne doivent jamais produire deux emails.

---

## 6. Le flux .ics

Route publique `GET /api/ics/[token]`, où le token est `profil.ics_token`. Renvoie `Content-Type: text/calendar; charset=utf-8`.

Les RDV des 90 derniers jours et de tout le futur, non annulés.

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//compagnon//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Mes rendez-vous
X-PUBLISHED-TTL:PT1H
REFRESH-INTERVAL;VALUE=DURATION:PT1H
BEGIN:VEVENT
UID:<rdv.id>@compagnon
DTSTAMP:<maintenant en UTC>
DTSTART:<debut en UTC>
DTEND:<debut + duree_min en UTC>
SUMMARY:<prénom> — <projet tronqué à 40 car.>
DESCRIPTION:<projet>\n<emplacement>\n<tel>
END:VEVENT
END:VCALENDAR
```

Le `UID` stable permet à l'agenda de mettre à jour un RDV modifié au lieu d'en créer un doublon. Format des dates : `YYYYMMDDTHHMMSSZ`.

À savoir : Apple respecte mal le `REFRESH-INTERVAL` et peut mettre plusieurs heures à rafraîchir. C'est acceptable, l'agenda n'est qu'un miroir de confort — la source de vérité reste l'app.

Le token dans l'URL fait office de secret. Prévoir un bouton « Régénérer le lien » dans les réglages.

---

## 7. Les trois emails

Texte brut, pas de bannière, pas de logo, pas de HTML sophistiqué. Ça doit ressembler à un message écrit par le tatoueur, pas à une newsletter — c'est aussi ce qui passe le mieux en boîte de réception. Tous éditables depuis les réglages.

### 7.1 — Confirmation (immédiate)

> **Objet :** C'est noté — {date} à {heure}
>
> Salut {prénom},
>
> Ton rendez-vous est calé : **{jour} {date} à {heure}**, pour environ {durée}.
>
> Le projet : {projet}
>
> {si acompte non payé} Pour bloquer le créneau, pense à l'acompte de {montant} €.
>
> Adresse : {adresse}
>
> Si tu as un empêchement, préviens-moi le plus tôt possible — ça me permet de proposer le créneau à quelqu'un d'autre.
>
> À bientôt,
> {signature}

### 7.2 — Rappel (J-2)

> **Objet :** Rappel — on se voit {jour} à {heure}
>
> Salut {prénom},
>
> Petit rappel : on se voit **{jour} {date} à {heure}** pour {projet}.
>
> Adresse : {adresse}
>
> Quelques trucs qui aident : mange avant de venir, arrive reposé, évite l'alcool la veille, et prévois des vêtements qui laissent la zone accessible.
>
> {si acompte non payé} L'acompte de {montant} € n'est pas encore réglé, pense à le prévoir.
>
> À {jour},
> {signature}

### 7.3 — Soins (J+1)

> **Objet :** Ton tatouage — les premiers jours
>
> Salut {prénom},
>
> J'espère que ça se passe bien. Un petit récap des consignes qu'on a vues hier :
>
> — Lave doucement à l'eau tiède et au savon neutre, deux fois par jour, et sèche en tamponnant.
> — Une couche fine de crème, pas plus. Trop de crème étouffe la peau.
> — Ça va peler et démanger : c'est normal. Ne gratte pas, ne tire pas les peaux.
> — Pas de piscine, pas de bain, pas de sauna pendant deux à trois semaines.
> — Pas de soleil direct sur la zone, et de la crème solaire indice élevé une fois cicatrisé.
>
> En cas de doute — rougeur qui s'étend, chaleur, écoulement — écris-moi, envoie une photo.
>
> {signature}

**Mention obligatoire en pied des trois emails :**

> Tu reçois ce message parce que tu as pris rendez-vous avec {nom_artiste}. Tes coordonnées ne servent qu'à ça et ne sont transmises à personne.

---

## 8. Ordre de construction

Chaque étape est finie quand elle marche, avant de passer à la suivante.

1. **Projet Supabase + tables + RLS** — 30 min
2. **Auth magic link + page vide protégée** — 1 h
3. **Écran À venir + Nouveau RDV, en local** — 3 h. À ce stade l'outil est déjà utilisable.
4. **Fiche RDV + historique par téléphone** — 2 h
5. **Réglages + profil** — 1 h
6. **Resend + email de confirmation** — 1 h. Se tester soi-même en premier.
7. **Flux .ics + abonnement testé sur ton iPhone** — 2 h
8. **Edge function relances + cron** — 2 h. Tester avec un RDV créé exprès à J-2.
9. **Manifest PWA + icônes + installation sur mobile** — 1 h
10. **Déploiement Vercel + domaine** — 30 min

**Environ 14 h.** Un week-end sans se presser. Les étapes 1 à 5 seules, soit une soirée et demie, donnent déjà quelque chose que tu peux mettre entre les mains d'un tatoueur.

---

## 9. Le SMS, plus tard

Volontairement hors V1. Deux frictions, aucune technique :

- **Coût** : ~0,045 €/SMS vers la France en petit volume, ~0,033 € à gros volume.
- **Réglementation** : la charte af2m en vigueur depuis le 1er mars 2026 impose de déclarer l'émetteur alphanumérique auprès des opérateurs. 11 caractères max, lettres et chiffres uniquement, pas d'espace ni de caractère spécial, et pas de terme générique — « Rappel » sera refusé. Moratoire de mise en conformité jusqu'au 30/09/2026.

Un rappel de RDV est un SMS **transactionnel**, pas promotionnel : pas d'opt-in marketing requis, mais l'information du client reste obligatoire (RGPD).

Quand le moment viendra, passer par un agrégateur français (SMSFactor, Octopush, smsmode, Spot-Hit) plutôt que Twilio en direct — ils gèrent la déclaration OADC. L'architecture est déjà prête : c'est une deuxième branche dans la fonction `relances`.

---

## 10. RGPD, le minimum sérieux

Tu traites des données personnelles de clients qui ne sont pas les tiens. Le strict nécessaire :

- La mention en pied d'email (§7) couvre l'information des personnes.
- Une page « Confidentialité » d'un écran : ce qui est collecté, pourquoi, combien de temps, comment demander la suppression.
- **Ne pas stocker de données de santé** dans les notes (allergies, traitements, grossesse). Si le tatoueur en a besoin, ça reste sur sa fiche papier de consentement. C'est ce qui te fait basculer dans une catégorie réglementaire bien plus lourde.
- Purge automatique des RDV de plus de 3 ans, en cron mensuel.
- Si tu ouvres l'outil à d'autres tatoueurs que toi : registre des traitements, et un contrat de sous-traitance type quand ça devient payant.

---

## 11. Prompt de démarrage pour Claude Code

À coller dans un dossier vide, avec ce fichier de spec à côté.

---

> Je construis une application web mobile-first pour tatoueur indépendant. La spec complète est dans `spec-app-compagnon-tatoueur.md` à la racine — lis-la en entier avant d'écrire quoi que ce soit.
>
> Stack imposée : Next.js App Router, TypeScript, Tailwind, Supabase (auth magic link + Postgres + Storage), Resend pour les emails, déploiement Vercel.
>
> Contraintes non négociables :
> - Mobile-first strict. Je teste sur iPhone, pas sur desktop. Cibles tactiles 44px minimum.
> - Deux tables, celles de la spec. N'en ajoute aucune, ne dénormalise pas, ne crée pas de table clients.
> - RLS activée dès la première migration.
> - La clé service_role ne doit jamais apparaître dans du code client.
> - Pas de librairie de composants, pas de state manager, pas d'ORM. Le client Supabase suffit.
> - Toutes les dates en `timestamptz`, affichage en Europe/Paris.
>
> Commence par l'étape 1 uniquement : le projet Next.js, la connexion Supabase, les migrations SQL des deux tables avec leurs politiques RLS. Montre-moi le SQL avant de l'appliquer. On avancera étape par étape dans l'ordre du §8 — ne prends pas d'avance.

---

## 12. Ce qu'il ne faut pas ajouter en V2

La liste des choses qui vont te démanger et qui tueraient la simplicité :

- Une page de réservation publique → tu deviens Planity, tu perds ton angle
- Un tableau de bord de CA → il a un comptable
- Des notifications push → l'email suffit, le push demande du natif ou du service worker fragile
- Des statuts de RDV (confirmé / en attente / reporté) → la date et `annule` suffisent
- Un mode multi-artiste → c'est exactement le studio que tu voulais éviter

La seule V2 qui vaut le coup : le SMS, si et seulement si un tatoueur qui l'utilise vraiment te le demande.
