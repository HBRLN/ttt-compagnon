# Compagnon

Application web mobile-first pour tatoueur indépendant : la liste de ses RDV
à venir, et des emails de confirmation / rappel / soins qui partent tout
seuls. Voir `spec-app-compagnon-tatoueur.md` pour la spécification complète.

Stack : Next.js (App Router) + TypeScript + Tailwind, Supabase (auth magic
link + Postgres + Storage), Resend pour les emails, Vercel pour l'hébergement.

## Mise en route

### 1. Projet Supabase

Crée un projet sur [supabase.com](https://supabase.com), puis applique les
migrations dans l'ordre (SQL Editor, ou `supabase db push` avec la CLI) :

```
supabase/migrations/0001_init.sql        # tables profil + rdv, RLS
supabase/migrations/0002_cron.sql        # cron horaire → fonction relances
supabase/migrations/0003_purge_rgpd.sql  # purge mensuelle des RDV > 3 ans
supabase/migrations/0004_storage.sql     # bucket photos + policies
```

Dans `0002_cron.sql`, remplace `<projet>` par la référence de ton projet
Supabase et `<service_role>` par la clé service_role (idéalement stockée
dans Vault plutôt qu'en clair).

Déploie la fonction Edge :

```bash
supabase functions deploy relances
supabase secrets set RESEND_API_KEY=... RESEND_FROM="Ton nom <toi@exemple.com>"
```

### 2. Variables d'environnement

Copie `.env.example` en `.env.local` et renseigne les clés Supabase et
Resend (Réglages du projet Supabase → API ; dashboard Resend → API Keys).
La `SUPABASE_SERVICE_ROLE_KEY` n'est utilisée que côté serveur (flux .ics
public) — elle ne doit jamais être exposée au client.

### 3. Lancer en local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000). Connecte-toi par lien
magique (aucun mot de passe) : un profil est créé automatiquement à la
première connexion.

### 4. Déploiement

Déploie sur Vercel, en renseignant les mêmes variables d'environnement.
Sur iPhone : Safari → Partager → « Sur l'écran d'accueil » pour installer la
PWA.

## Structure

- `app/` — les quatre écrans (`/`, `/rdv/nouveau`, `/rdv/[id]`, `/reglages`)
  plus l'authentification, le flux `.ics` public et la page confidentialité.
- `lib/actions/` — server actions (créer/modifier/annuler un RDV, réglages).
- `lib/emails.ts` / `lib/resend.ts` — les trois emails texte brut.
- `lib/ics.ts` — génération du flux iCalendar.
- `supabase/migrations/` — schéma SQL, RLS, cron.
- `supabase/functions/relances/` — fonction Edge (Deno) pour les rappels
  J-2 et les emails de soins J+1.
