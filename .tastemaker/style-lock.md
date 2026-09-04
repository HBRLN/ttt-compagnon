# Style lock — Compagnon

Established: 2026-09-04 (direction « Galerie »).
Ancrage : `apple-hig` (école Éditorial / Minimaliste), croisé avec une
intention **motion first**, choisi par l'utilisateur.

> **Historique.** Trois directions ont été rejetées avant celle-ci, et les
> raisons comptent plus que les palettes :
> 1. **Apothicaire éditorial** (crème/marron, Instrument Serif) — « trop sage ».
> 2. **Flash sheet brutaliste** (noir, Archivo 900 capitales, rouge-orangé
>    `#ff3b1f`) — « trop nike / sport, pas assez premium ».
> 3. **Atelier suisse** (gris papier, Space Grotesk, laiton) — ne convenait pas
>    non plus ; demande explicite de partir sur la référence Apple.
>
> Diagnostic du second échec, à ne pas reproduire : **grotesque très gras +
> capitales + accent saturé chaud = formule sportswear.** Le premium va dans
> l'autre sens sur presque tous les curseurs — graisses plus légères,
> bas-de-casse, plus d'air, accent plus discret, détails plus fins.

## Palette

- Background (`--fond`) : `#ffffff` — blanc papier
- Surface (`--surface`) : `#f5f5f7` — blocs, champs, listes
- Surface douce (`--surface-douce`) : `#ebebed` — état pressé
- Text primary (`--encre`) : `#1d1d1f` — le presque-noir d'Apple
- Text muted (`--encre-douce`) : `#6e6e73` — **5.07:1** sur blanc, **4.66:1**
  sur surface
- Alerte (`--alerte`) : `#b3261e` — **seule couleur chromatique**, réservée aux
  montants négatifs et aux actions destructrices
- Filet (`--ligne`) : `#d2d2d7` — **décoratif uniquement**
- Dark mode : non. Fond clair demandé explicitement par l'utilisateur.

**Ajustement enregistré** : Apple donne `#86868b` pour le gris de légende.
Mesuré à **3.62:1** sur blanc — sous le plancher AA de 4.5. Assombri dans la
même teinte jusqu'à `#6e6e73`. Troisième recette d'affilée dont le gris
secondaire échoue au contraste : toujours mesurer avant de reprendre une
valeur de recette.

## Color contract

Matrice complète (`check_contrast.py --matrix`, 7 rôles, 21 paires) :

- **Text-safe (≥4.5)** : text/bg, text/on-primary, bg/primary,
  primary/on-primary, text/surface, surface/primary, text/border,
  primary/border, bg/accent, accent/on-primary, surface/accent
- **UI-safe (≥3.0 et <4.5)** : accent/border, text/accent, primary/accent
- **Decorative (<3.0)** : bg/border, border/on-primary, surface/border,
  bg/surface, surface/on-primary, text/primary, bg/on-primary

Conséquence : `--ligne` est décoratif contre les deux fonds. Le contour de
focus est donc en encre (2px), jamais en filet gris.

## Typography

- **Geist** (variable), famille unique. La recette s'appuie sur SF Pro, non
  distribuable ; Geist en est l'équivalent le plus proche disponible.
- **Graisses 400 / 500 / 600, jamais au-delà. Bas-de-casse partout.**
  Garde-fou central : c'est l'inverse exact de ce qui a fait lire « sport »
  (graisse 900 en capitales).
- Classes dans `globals.css` : `.titre` (600), `.legende` (13px gris),
  `.libelle` (12px, gris, sans capitales), `.chiffre` (600, tabulaire).

## Shape language

- **Rayons doux** : `rounded-lg`/`xl` (contrôles), `rounded-2xl` (listes),
  `rounded-full` (bouton flottant, pastilles).
- **Ombres à la limite du perceptible** : `0 1px 2px rgba(0,0,0,.04)`.
  L'élévation vient de l'espace et du contraste.
- **Filets de 1px** (`#d2d2d7`) entre sections, rien de plus lourd.

## Density & spacing

- Padding de page `px-6`. **Air vertical `py-7` entre sections** — c'est lui
  qui porte le premium, le resserrer casserait la direction.
- Champs 48px, boutons primaires 48–52px, cibles tactiles ≥44px.
- Le graphique Compta occupe **toute la largeur de page** : c'est ce qui garde
  les douze noms de mois lisibles.

## Reference intelligence

- Reference board : `.tastemaker/reference-board.md` — **périmé** (il décrit la
  première direction). À refaire s'il redevient utile.
- Design read : app shell mobile-first pour une tatoueuse indépendante, mode
  **Operate**, lane éditoriale/minimaliste premium.
- Dials : variance 3, motion 6, densité 4, direction artistique 6.
- Foundation : stack existante (Next.js + Tailwind v4). **Aucune dépendance
  ajoutée** — pas de GSAP, pas de Motion, pas de bibliothèque d'icônes. Le
  mouvement tient entièrement en CSS.
- Direction contract — Thèse : le premium vient de l'espace et de la retenue,
  le mouvement empêche que ça devienne inerte. Premier écran : Dashboard.
  Risque : la recette prévient qu'un produit sans « objet héros » à
  photographier finit sur une scène vide — ici c'est la donnée à grande
  échelle qui occupe la scène.
- Anti-références : sportswear (grotesque gras + capitales + accent saturé),
  SaaS générique, dégradés, cosplay Apple (bleu système partout).

## Taste memory

- Profile priors : aucun (`~/.tastemaker/profile.md` absent).
- Decision log : `.tastemaker/decisions.log`.
- Trois rejets successifs documentés plus haut. Le deuxième a produit
  l'apprentissage le plus réutilisable du projet : la formule qui fait lire
  « sport ».
- Précédence : la demande courante a écrasé le lock à chaque itération.

## Navigation chrome

Shell mobile à barre d'onglets basse **translucide** (`backdrop-filter`),
filet 1px au-dessus. Repli opaque sans flou et sous
`prefers-reduced-transparency`.

- Onglet actif : texte à l'encre. Onglet inactif : gris. Pas d'aplat coloré.
- Chargement : un filet d'encre se trace sous l'icône.
- Bouton nouveau RDV : pilule d'encre, libellé « Rendez-vous » en toutes
  lettres.
- **La barre doit rester visible en permanence.** Ne jamais poser
  `perspective`, `transform`, `filter` ou `backdrop-filter` sur un de ses
  ancêtres : ça en ferait le bloc conteneur des descendants `fixed` et la
  barre se remettrait à défiler. C'est le bug qui a été corrigé ici.

## Mood descriptors

Calme, spacieux, tenu, cher.

## Assets

- Icônes : SVG dessinés à la main, `strokeWidth="2"`. Pas de bibliothèque,
  pas d'emoji.
- Aucune photo ni illustration produit.

## Motion

- Feel : ça monte, ça fond, ça se pose. Rien ne bascule, rien ne rebondit,
  rien ne tourne.
- Courbe unique : `--expo: cubic-bezier(0.16, 1, 0.3, 1)`.
- `.animate-apparition` 300ms (entrée ordinaire, cascade 70–90ms),
  `.animate-pose` 300ms (le bloc principal s'installe — **un seul par écran**),
  `.animate-trace` 280ms (le filet se dessine).
- Compteurs 320ms · onglets `translateX` 280ms · graphique `scaleY` 500ms.
- Appui : `scale(0.98)` en 200ms sur tout élément pressable.
- **Uniquement `transform`, `opacity` et `clip-path`.** Aucune propriété de
  layout animée.
- Pas de `loading.tsx`, donc pas de squelette tant qu'il n'y a pas de surface
  de chargement à habiller.
- Reduced motion : surcharge CSS globale + court-circuit JS dans
  `CompteurAnime`. Reduced transparency : la barre de nav redevient opaque.
- Vérifié par : `audit_motion.py app components` → **0 HIGH** ;
  `anti_slop_scan.py` → passe, 28 fichiers.

## Do not

- Ne pas dépasser la graisse 600, et ne pas mettre un titre en capitales :
  c'est la combinaison qui a fait lire « sport ».
- Ne pas ajouter une seconde couleur chromatique. Une seule, l'alerte.
- Ne pas ajouter de vert : le signe porte le sens, pas la couleur.
- Ne pas resserrer l'air vertical entre sections.
- Ne pas appliquer `.animate-pose` à plus d'un bloc par écran.
- **Ne jamais poser `perspective` / `transform` / `filter` sur un ancêtre de
  `NavBar` ou `BoutonNouveauRdv`** (footer qui décroche).
- **Ne pas remettre de gouttière sur la ligne des noms de mois**, ni replacer
  le graphique dans une colonne indentée : mesuré, ça déborde sous 375px.
- Ne pas revenir à Roboto, Inter, Arial ou `system-ui`.
