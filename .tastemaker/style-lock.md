# Style lock — Compagnon

Established: 2026-09-04 (direction « Atelier suisse »).
Ancrage : `vignelli-swiss-helvetica` (école Architecture de l'information),
croisé avec une intention **motion first**, choisi par l'utilisateur.

> **Historique.** Deux directions ont été rejetées avant celle-ci, et les
> raisons comptent plus que les palettes :
> 1. **Apothicaire éditorial** (crème/marron, Instrument Serif) — « trop sage ».
> 2. **Flash sheet brutaliste** (noir, Archivo 900 capitales, rouge-orangé
>    `#ff3b1f`) — « trop nike / sport, pas assez premium ».
>
> Diagnostic du second échec, à ne pas reproduire : **grotesque très gras +
> capitales + accent saturé chaud = formule sportswear.** Le premium va dans
> l'autre sens sur presque tous les curseurs — graisses plus légères,
> bas-de-casse, plus d'air, accent plus discret, détails plus fins.

## Palette

- Background (`--fond`) : `#f2f2f0` — gris papier
- Surface (`--surface`) : `#ffffff` — blocs de contenu. Le contraste fond/bloc
  remplace l'ombre.
- Surface douce (`--surface-douce`) : `#e8e8e5` — état pressé
- Text primary (`--encre`) : `#111111` — texte et boutons primaires
- Text muted (`--encre-douce`) : `#6e6e6a` — **4.57:1** sur fond, **5.12:1**
  sur blanc
- Accent (`--accent`) : `#7a5c1e` — laiton, accent unique
- Sur-accent (`--sur-accent`) : `#ffffff`
- Filet (`--ligne`) : `#cfcfca` — **décoratif uniquement** (1.31:1)
- Dark mode : non. Fond clair demandé explicitement par l'utilisateur.

**Ajustement enregistré** : la recette Vignelli donne `#8a8a8a` pour le gris
secondaire. Mesuré à **3.08:1** sur le fond et 3.45:1 sur blanc — sous le
plancher AA de 4.5. Assombri dans la même teinte jusqu'à `#6e6e6a`. La valeur
actuelle intègre donc déjà une correction de contraste.

**Substitution assumée** : la recette impose un accent parmi rouge / jaune /
bleu / orange. Le laiton s'en écarte volontairement — les accents saturés de
Vignelli tirent vers la signalétique de transport, et le rouge-orangé est
exactement ce qui a fait échouer la direction précédente.

## Color contract

Matrice complète (`check_contrast.py --matrix`, 7 rôles, 21 paires) :

- **Text-safe (≥4.5)** : text/surface, text/on-primary, surface/primary,
  primary/on-primary, text/bg, bg/primary, text/border, primary/border,
  surface/accent, accent/on-primary, bg/accent
- **UI-safe (≥3.0 et <4.5)** : accent/border, text/accent, primary/accent
- **Decorative (<3.0)** : surface/border, border/on-primary, bg/border,
  bg/surface, bg/on-primary, text/primary, surface/on-primary

Conséquence : `--ligne` est décoratif contre les deux fonds. Le contour de
focus est donc en laiton (2px), jamais en filet gris.

## Typography

- **Space Grotesk** (variable), famille unique — « six caractères suffisent ».
  Choisie plutôt qu'une Helvetica : elle garde la neutralité de la grille mais
  lit moderne, ce qui corrige le principal reproche fait au style suisse
  aujourd'hui (« classique, archivistique »).
- **Graisses plafonnées à 500.** Garde-fou central : c'est ce qui sépare cette
  direction du registre sportswear.
- **Hiérarchie par la TAILLE**, jamais par la graisse ni la couleur (règle
  explicite de la recette).
- Classes dans `globals.css` : `.titre` (500), `.libelle` (11px, 0.1em, caps),
  `.numero` (laiton, tabulaire), `.chiffre` (400, tabulaire).

## Shape language

- **Angles droits partout** — `border-radius: 0 !important` global.
- **Aucune ombre** — tokens `--ombre-*` à `none`.
- **Filets de 1px uniquement.** Le 2px appartenait à la direction brutaliste ;
  ici la finesse fait partie du premium.
- La profondeur vient du contraste blanc-sur-gris, pas d'une élévation.

## Density & spacing

- Base 4px, padding de page `px-5`, blocs `p-5`, gouttière de section `gap-5`.
- Rail de grille : colonne `w-6` + filet vertical + `pl-4`.
- Champs 48px, boutons primaires 52–56px, cibles tactiles ≥44px.

## Reference intelligence

- Reference board : `.tastemaker/reference-board.md` — **périmé** (il décrit la
  première direction). À refaire s'il redevient utile.
- Design read : app shell mobile-first pour une tatoueuse indépendante, mode
  **Operate**, lane suisse / architecture de l'information.
- Dials : variance 4, motion 6, densité 6, direction artistique 7.
- Foundation : stack existante (Next.js + Tailwind v4). **Aucune dépendance
  ajoutée** — pas de GSAP, pas de Motion, pas de bibliothèque d'icônes. Le
  mouvement tient entièrement en CSS.
- Direction contract — Thèse : la rigueur donne le premium, le mouvement donne
  la modernité. Premier écran : Dashboard. Risque : la recette suisse seule lit
  « archivistique », et sans le mouvement l'app y retomberait.
- Anti-références : sportswear (grotesque gras + capitales + accent saturé),
  SaaS générique, arrondis mous, dégradés.

## Taste memory

- Profile priors : aucun (`~/.tastemaker/profile.md` absent).
- Decision log : `.tastemaker/decisions.log`.
- Deux rejets successifs documentés plus haut. Le second a produit
  l'apprentissage le plus réutilisable du projet : la formule qui fait lire
  « sport ».
- Précédence : la demande courante a écrasé le lock à chaque itération.

## Navigation chrome

Shell mobile à barre d'onglets basse, filet 1px, fond blanc.

- Onglet actif : texte à l'encre + **filet de laiton** pleine largeur en haut
  de l'onglet, tracé à l'apparition. Pas d'aplat coloré.
- Onglet inactif : texte gris.
- Chargement : un filet de laiton se trace sous l'icône — jamais un anneau qui
  tourne, le mouvement suit les axes.
- Bouton nouveau RDV : aplat encre, libellé « Rendez-vous » en toutes lettres.
- Navigation par glissement latéral conservée (`NavigationGeste`).

## Mood descriptors

Précis, calme, tenu, moderne.

## Assets

- Icônes : SVG dessinés à la main, `strokeWidth="2"`. Pas de bibliothèque,
  pas d'emoji.
- Aucune photo ni illustration produit.

## Motion

- Feel : le mouvement suit les axes de la grille, il ne rebondit jamais.
- Courbes : `--sortie: cubic-bezier(0.23,1,0.32,1)`,
  `--panneau: cubic-bezier(0.32,0.72,0,1)`.
- `.animate-volet` 260ms (le bloc pivote comme un panneau de signalétique —
  **un seul par écran**), `.animate-glisse` 200ms (entrée ordinaire, cascade
  60–80ms), `.animate-trace` 360ms (le filet se dessine).
- Compteurs 320ms · onglets `translateX` 240ms · graphique `scaleY` 500ms.
- **Uniquement `transform`, `opacity` et `clip-path`.** Aucune propriété de
  layout animée.
- Pas de `loading.tsx`, donc pas de squelette tant qu'il n'y a pas de surface
  de chargement à habiller.
- Reduced motion : surcharge CSS globale + annulation explicite du `rotateX`
  du volet + court-circuit JS dans `CompteurAnime`.
- Vérifié par : `audit_motion.py app components` → **0 HIGH** ;
  `anti_slop_scan.py` → passe, 28 fichiers.

## Do not

- Ne pas dépasser la graisse 500 sur un titre, et ne pas mettre un titre en
  capitales : c'est la combinaison qui a fait lire « sport ».
- Ne pas ajouter un second accent. Un seul, le laiton.
- Ne pas réintroduire d'arrondi, d'ombre, de dégradé, ni de filet de 2px.
- Ne pas ajouter de vert : le signe porte le sens, pas la couleur.
- Ne pas appliquer le volet à plus d'un bloc par écran.
- Ne pas revenir à Roboto, Inter, Arial ou `system-ui`.
