# Passation — Compagnon (app de réservation pour tatoueur indépendant)

_Généré le 2026-09-04_

## Tâche en cours

Rien de bloquant. La refonte visuelle demandée ("rendre l'app plus moderne")
a été faite : voir la section Design system ci-dessous.

Deux décisions attendent une validation de l'utilisatrice une fois qu'elle
aura vu le résultat en vrai — elles sont en `pending-review` dans
`.tastemaker/decisions.log` :
1. les états vides passés en sérif italique ;
2. le refus des angles droits façon Aesop (rayons et ombres conservés).

Avant tout nouveau changement visuel : lire `DESIGN.md` à la racine, puis
`.tastemaker/style-lock.md` pour l'historique et le contrat de contraste.

## Objectif du projet

App mobile-first (PWA) pour Josy, tatoueuse indépendante au salon "La Belle
Hirondelle", pour gérer seule :
- ses rendez-vous (prise, modification, annulation, historique client)
- les emails automatiques (confirmation à la prise de RDV, rappel avant le
  RDV) envoyés au client
- sa compta (gains liés aux RDV + gains/dépenses manuels, vue mensuelle et
  annuelle)
- un tableau de bord au quotidien (prochain RDV, chiffres du mois)

Un seul utilisateur réel pour l'instant (Josy). Pas de vocation multi-tenant
pour le moment — on en a discuté (usage payant / autres tatoueurs), pas
commencé, jugé prématuré tant que l'usage réel par Josy n'a pas validé
l'outil.

## Stack / architecture

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Supabase : Postgres, Auth (email + mot de passe, plus de lien magique),
  Row Level Security partout, Storage (photos clients, bucket privé),
  Edge Function (rappels), pg_cron
- Resend pour l'envoi d'emails (texte + HTML)
- Déploiement Vercel automatique à chaque push sur la branche
  `claude/tattoo-booking-app-u92jez`
- **ATTENTION** : les Supabase Edge Functions (`supabase/functions/relances`)
  NE SE DÉPLOIENT PAS automatiquement avec Vercel. Chaque fois que sa
  logique change, il faut redéployer à la main (copier-coller le code dans
  le dashboard Supabase). À vérifier que la dernière version est bien en
  ligne.

Structure des pages (App Router) :

| Route | Contenu |
|---|---|
| `/` | Dashboard (bento : "Coucou {nom} !", prochain RDV, RDV du mois, gains du mois, estimation du mois) |
| `/rdv` | Liste des RDV (onglets À venir / Passés / Annulés, filtre mensuel) |
| `/rdv/[id]` | Fiche d'un RDV |
| `/rdv/nouveau` | Formulaire nouveau RDV |
| `/rdv/[id]/modifier` | Formulaire modification |
| `/compta` | Graphique net (rouge/vert) mois ou année, gains et dépenses manuels, liste des mouvements |
| `/reglages` | Profil du tatoueur (nom, salon, contact, etc.) |
| `/login`, `/auth/*` | Authentification (PKCE), reset mot de passe |

Navigation : barre du bas (Dashboard / RDV / Compta) avec un anneau autour
de l'icône active qui sert AUSSI de loader pendant la navigation
(`useLinkStatus` de Next.js) ; navigation possible aussi en glissant à
gauche/droite (`components/NavigationGeste.tsx`).

## Design system actuel (verrouillé)

Documenté dans **`DESIGN.md`** (langage visuel, format lisible par un agent)
et **`.tastemaker/style-lock.md`** (historique des décisions + contrat de
contraste complet). À lire/mettre à jour avant tout changement de design.

- Palette claire et chaude (fond crème `#faf8f5`, cartes `#fffdfa`)
- Accent : marron chaud `#8c6a4f` (après plusieurs itérations : crème →
  anthracite sombre → Material bleu clair → noir/blanc → corail → marron
  final, choisi explicitement par l'utilisateur)
- **Typographie : Instrument Serif (400 seulement) pour les titres et les
  chiffres, Instrument Sans pour l'interface.** Remplace Roboto, qui venait
  de l'ancienne référence "Material Design 3" — abandonnée, c'est elle qui
  faisait lire l'app comme un back-office. ⚠️ Le sérif n'existe qu'en 400 :
  un `font-bold` dessus produit un faux gras.
- Libellés en petites capitales espacées (classe `.libelle`, 11px, 0.12em)
- **Aucune bordure nulle part** dans l'app — séparation uniquement par
  l'ombre (très légère) et l'espacement. Ne pas réintroduire de border
  sans demande explicite.
- Icônes : SVG dessinés à la main (`stroke="currentColor"`), pas de
  bibliothèque d'icônes
- Animations : cartes en cascade fade-in-up (dashboard, formulaire nouveau
  RDV champ par champ, décalage 40ms), chiffres qui comptent
  (`CompteurAnime`), graphique Compta qui pousse en `transform: scaleY()`
  (jamais animer `height` directement, ça déclenche du reflow),
  `prefers-reduced-motion` respecté globalement (CSS + JS)
- Contour de focus des champs texte : marron fin (1.5px), pas le contour
  noir/bleu par défaut du navigateur

## Complications rencontrées (pour éviter de refaire les mêmes erreurs)

1. **Auth PKCE cassée** : le `code_verifier` stocké en localStorage ne
   survivait pas au passage app mail → navigateur. Corrigé en gérant
   `/auth/confirm` comme une route serveur (`route.ts`) qui lit le cookie
   plutôt qu'un composant client qui lit le localStorage.

2. **Migration pg_cron** : l'extension devait être créée AVANT le premier
   `cron.schedule` dans la même migration (`0003_purge_rgpd.sql`).

3. **Perf navigation lente** (~1,2s ressentie par l'utilisateur) : chaque
   page rappelait `auth.getUser()` (aller-retour réseau vers Supabase Auth)
   EN PLUS du middleware qui le fait déjà pour autoriser la requête.
   Corrigé en passant à `auth.getSession()` (lecture locale du cookie déjà
   validé) dans toutes les pages. Le middleware garde `getUser()` car
   c'est lui le vrai verrou de sécurité.

4. **Requêtes Supabase en série** au lieu d'être parallélisées (Dashboard
   faisait jusqu'à 5 requêtes l'une après l'autre, Compta 3) — corrigé
   avec `Promise.all`.

5. **Transition "cercle" sur le bouton +** : plusieurs itérations ratées
   (cercle marron puis blanc qui révèle la page, masque clip-path sur le
   contenu réel, cercles qui rétrécissent visiblement vers leur origine,
   texte caché derrière des cercles opaques...). Après de nombreux
   allers-retours, la fonctionnalité a été **abandonnée** et remplacée
   par une navigation Link standard avec juste un effet d'échelle au clic
   (navigation retardée de 160ms pour laisser le temps de voir
   l'animation avant que la page change). Si on retente un jour une
   transition élaborée sur ce bouton, prévoir que ça demande plusieurs
   itérations de calage fin — mieux vaut cadrer précisément l'effet voulu
   AVANT de coder (état par état, ce qui doit être visible et quand).

6. **Cascade d'animation par champ vs bloc entier** : reparti plusieurs
   fois avant de se stabiliser sur "chaque champ individuellement, comme
   les tuiles du dashboard" (`animate-fade-in-up`, décalage 40ms) plutôt
   qu'un seul bloc qui bouge, ou un mouvement du haut vers le bas.

## Fichiers importants

- `app/layout.tsx` — layout racine (police, `NavigationGeste`)
- `app/globals.css` — tous les tokens de design (couleurs, ombres,
  animations, focus)
- `app/page.tsx` — Dashboard
- `app/rdv/page.tsx` — liste des RDV
- `app/rdv/[id]/page.tsx` — fiche RDV
- `app/rdv/nouveau/page.tsx` — nouveau RDV
- `app/rdv/[id]/modifier/` — modifier RDV
- `app/compta/page.tsx` — page Compta (fetch données)
- `app/compta/TableauCompta.tsx` — Compta (graphique, CRUD gains/dépenses,
  tout le client-side)
- `app/reglages/` — profil du tatoueur
- `components/FormulaireRdv.tsx` — formulaire RDV partagé (nouveau +
  modifier)
- `components/NavBar.tsx` — barre de navigation bas (anneau + loader)
- `components/NavigationGeste.tsx` — navigation par glissement
- `components/CompteurAnime.tsx` — chiffres animés
- `components/BoutonNouveauRdv.tsx` — bouton + (FAB)
- `lib/supabase/server.ts`, `middleware.ts`, `client.ts` — clients
  Supabase
- `lib/emails.ts`, `lib/resend.ts` — templates + envoi email (texte +
  HTML)
- `supabase/functions/relances/index.ts` — Edge Function rappels
  (déploiement MANUEL requis à chaque changement)
- `supabase/migrations/0001` → `0009` — historique des migrations SQL
  (profil, rdv, purge RGPD, storage, photos multiples, retrait soins,
  nom_salon, dépenses, gains)
- `.tastemaker/style-lock.md` — documentation du design system verrouillé

## À vérifier / état des actions manuelles

- Migrations 0007 (nom_salon), 0008 (dépenses), 0009 (gains) : confirmées
  exécutées par l'utilisateur au fil de la conversation.
- Edge Function `relances` : a été modifiée plusieurs fois (nom_salon,
  emails HTML) — vérifier que la version actuellement déployée sur
  Supabase correspond bien au code du repo, sinon les rappels envoyés aux
  clients seront en décalage avec les emails de confirmation.

## Suite cohérente / prochaines étapes possibles

1. **Immédiat** : ajustements visuels pour moderniser l'app (demande
   active — voir "Tâche en cours" en haut de ce document).
2. Laisser Josy utiliser l'app en conditions réelles quelques semaines,
   recueillir ses retours d'usage plutôt que de continuer à itérer sur
   des micro-détails visuels sans validation terrain.
3. Vérifier le déploiement de l'Edge Function relances (point ci-dessus)
   pour être sûr que les rappels envoyés aux clients sont à jour.
4. Si Josy valide l'usage et qu'il y a une volonté d'ouvrir l'outil à
   d'autres tatoueurs : ça demande un vrai chantier à part (facturation,
   multi-compte, etc.) — pas à improviser en même temps que les
   ajustements du quotidien.
5. Le design est stable et documenté (`.tastemaker/style-lock.md`) —
   tout nouveau changement visuel devrait s'appuyer dessus plutôt que
   repartir de zéro, et le fichier devrait être mis à jour si la palette
   ou les conventions changent encore.
6. Aucune dette technique connue bloquante à date. Le projet build et
   lint sans erreur après chaque changement (vérifié systématiquement
   avant chaque push).
