# DESIGN.md — Compagnon

> Langage visuel de l'app. `AGENTS.md` dit **comment construire** le projet ;
> ce fichier dit **à quoi il doit ressembler**.
>
> Source de vérité des décisions et de leur histoire : `.tastemaker/style-lock.md`
> et `.tastemaker/decisions.log`. Ce fichier en est la version lisible par un
> agent de design (format DESIGN.md / Google Stitch).

## Overview

Compagnon est l'outil de travail quotidien d'une tatoueuse indépendante : une
PWA mobile-first qu'elle ouvre entre deux clientes pour vérifier son prochain
RDV, encaisser, noter une dépense. Ce n'est **pas** une vitrine — il n'y a
aucune page marketing, aucun hero de conversion, aucune photo produit.

Le registre visé est celui d'un **carnet d'atelier haut de gamme** : chaleureux,
posé, artisanal, tenu. Pas un back-office. Concrètement, ça veut dire un fond
crème plutôt que blanc, un marron chaud comme unique accent, des titres et des
chiffres en sérif éditorial, et des cartes qui se détachent par une ombre très
douce plutôt que par un contour.

La densité est celle d'un outil, pas d'une page vitrine : plus serrée qu'un
site, jamais cockpit. Un écran = une chose à consulter, mise en avant, et le
reste en dessous.

## Colors

Palette figée, issue de ~6 itérations avec l'utilisatrice. **Ne pas la
régénérer.** Chaque paire ci-dessous a été mesurée avec un vérificateur de
contraste — voir le contrat complet dans `.tastemaker/style-lock.md`.

### Brand & Accent
- **Marron chaud** (`--accent`, `#8c6a4f`) : actions primaires, onglet actif,
  carte hero du dashboard, anneau de l'onglet de navigation. Unique accent de
  l'app — il n'y a pas de couleur secondaire.
- **Sur-accent** (`--sur-accent`, `#fffdfa`) : texte posé sur le marron.
  Contraste 4.82:1.

### Surface
- **Fond** (`--fond`, `#faf8f5`) : fond de page, blanc cassé chaud. C'est la
  surface la plus calme, là où vit le contenu.
- **Surface** (`--surface`, `#fffdfa`) : cartes, champs de saisie, barre de
  navigation basse.
- **Surface douce** (`--surface-douce`, `#f2ede6`) : surfaces en creux — champ
  à l'intérieur d'une carte, état pressé, piste des onglets, zone de dépôt de
  photos.

### Text
- **Encre** (`--encre`, `#2a2521`) : titres et corps de texte. 14.30:1 sur le fond.
- **Encre douce** (`--encre-douce`, `#6b6259`) : texte secondaire, libellés,
  heures, métadonnées. 5.88:1 sur surface.

### Semantic
- **Vert** (`--vert`, `#1a7d36`) : montants positifs, gains, net positif.
- **Rouge** (`--rouge`, `#d93025`) : montants négatifs, dépenses, erreurs,
  acompte non payé, action destructrice.
- **Vert doux / Rouge doux** (`#e6f4ea` / `#fce8e6`) : fonds de bandeau d'état.

Rien d'autre. Pas de bleu, pas de violet, pas de dégradé — un dégradé de type
« SaaS » serait le contresens exact de ce produit.

## Typography

### Font Family
- **Instrument Serif** — sérif transitionnel, poids **400 uniquement**,
  italique disponible. Porte les titres de page et tous les chiffres
  importants.
- **Instrument Sans** — sans variable, famille sœur dessinée pour s'accorder.
  Porte l'interface, le corps, les données, les libellés.

> ⚠️ **Instrument Serif n'existe qu'en 400.** Ne jamais poser `font-bold` ni
> `font-semibold` sur un élément `font-serif` : le navigateur fabriquerait un
> faux gras. **La hiérarchie se fait à la taille, jamais au gras.**

> Roboto, Inter, Arial et `system-ui` sont proscrits comme police
> d'affichage : c'est ce dont l'app sortait, et c'est ce qui la faisait lire
> comme une page de démo.

### Hierarchy

| Rôle | Police | Taille |
|---|---|---|
| Chiffre hero (net Compta) | Serif 400 | `text-5xl` |
| Chiffre de carte (dashboard), prénom du prochain RDV | Serif 400 | `text-4xl` |
| Titre d'onglet principal (Dashboard, RDV, Compta) | Serif 400 | `text-3xl` |
| Titre de sous-page (fiche, formulaire, réglages) | Serif 400 | `text-2xl` |
| Nom de cliente en liste, date de séance | Serif 400 | `text-lg` |
| Corps, données, boutons | Sans 400/500 | `text-base` / `text-sm` |
| Libellé de section ou de chiffre | Sans 500, capitales | 11px |

### Labels
Tout libellé qui coiffe un chiffre ou une section utilise la classe `.libelle` :
capitales, 11px, poids 500, `letter-spacing: 0.12em`. Elle **ne fixe pas la
couleur** — mettre `text-encre-douce` sur fond clair, `opacity-75` sur la carte
marron.

C'est le geste le plus reconnaissable du système : « RDV CE MOIS » en petites
capitales espacées, puis le chiffre en sérif juste en dessous.

### Principles
- L'italique du sérif est réservé aux **états vides** (« Rien de prévu. »).
  C'est son seul usage ; ne pas l'étendre en décoration.
- `tabular-nums` sur tout chiffre animé, sinon sa largeur saute pendant le
  décompte.
- Pas de `text-transform` ailleurs que dans `.libelle`.

## Layout

- Base 4px. Padding de page `px-5`. Cartes `p-4` (compacte) / `p-5` (hero).
  Gaps `gap-2` à `gap-4`.
- Colonne unique. Le seul passage en grille est la paire de tuiles de
  statistiques du dashboard (`grid-cols-2`).
- Toutes les pages à onglet réservent `pb-36` en bas : la barre de navigation
  et le bouton `+` sont fixes et flottent au-dessus du contenu.
- Cibles tactiles à 44px minimum.

## Elevation & Depth

Deux niveaux d'ombre seulement, tous deux volontairement très doux :

- `--ombre-legere` : toute carte secondaire — tuiles de stats, lignes de liste,
  formulaires, champs.
- `--ombre-flottante` : **une seule carte hero par écran** (« Prochain RDV » au
  dashboard, « Net » en Compta), plus la barre de navigation et le bouton `+`
  qui flottent réellement.

**L'ombre porte la hiérarchie.** Ne pas promouvoir une carte secondaire en
`shadow-flottante` : ça écraserait le contraste qui fait exister la carte
principale.

## Shapes

- Rayons : `rounded-lg` (champs, boutons), `rounded-xl` / `rounded-2xl`
  (cartes), `rounded-full` (bouton `+`, pastilles d'onglet, anneau de nav).
- **Aucune bordure nulle part.** La séparation se fait par l'ombre et
  l'espacement, jamais par un trait. C'est une décision explicite et tenue —
  ne pas réintroduire de `border`.
- Icônes : SVG dessinés à la main, `stroke="currentColor"`, `strokeWidth="2"`,
  bouts arrondis. Pas de bibliothèque d'icônes, pas d'emoji en guise d'icône.

## Components

- **Carte hero** — fond marron, texte sur-accent, libellé en petites capitales,
  puis l'information en sérif large. Cliquable : `active:scale-[0.97]`.
- **Tuile de statistique** — fond surface, libellé en petites capitales, chiffre
  en sérif `text-4xl`, animé au montage.
- **Ligne de liste RDV** — heure à gauche en chiffres tabulaires, prénom en
  sérif, projet en dessous en `encre-douce`, pastille rouge à droite si
  l'acompte n'est pas payé.
- **Onglets** — pastille marron qui coulisse en `translateX` sur une piste
  `surface-douce`.
- **Barre de navigation basse** — 3 onglets ; l'onglet actif porte un anneau
  marron autour de son icône, et **ce même anneau devient le spinner** pendant
  la navigation. Un seul traitement, partout.
- **Bouton `+`** — flottant en bas à droite, marron, `scale-90` au clic,
  navigation retardée de 160ms pour laisser voir l'appui.
- **État vide** — une seule phrase, en sérif italique. Pas d'illustration, pas
  de bouton d'appel à l'action.

## Motion

- Entrée : `fade-in-up` 0.35s, cascade de 40ms entre blocs (tuiles du
  dashboard, champs du formulaire de RDV un par un).
- Chiffres : décompte animé sur 700ms, easing cubique sortante.
- Graphique Compta : les barres poussent en `transform: scaleY()` —
  **jamais** `height`.
- Onglets : `transform: translateX()` — **jamais** `left` ou `width`.
- Aucune animation de propriété de layout, nulle part. C'est la règle qui
  explique les deux points précédents.
- Pas d'écran de chargement : l'écran précédent reste affiché jusqu'à ce que le
  suivant soit prêt. Pas de `loading.tsx`.
- `prefers-reduced-motion` respecté globalement (surcharge CSS dans
  `globals.css`) **et** en JS dans le compteur animé — une surcharge CSS ne
  peut pas arrêter une boucle `requestAnimationFrame`.

## Accessibility

- Toute paire de couleurs utilisée pour du texte tient 4.5:1 minimum. Avant
  d'introduire une couleur ou un usage nouveau, relancer la matrice de
  contraste et mettre à jour `.tastemaker/style-lock.md`.
- Contour de focus des champs : trait marron de 1.5px avec 1px d'offset — pas
  le contour bleu par défaut du navigateur, et surtout pas `outline: none`.
- Interface en français : dates et nombres via `Intl`, jamais formatés à la main.

## Out of scope

Ce produit n'a ni page d'accueil marketing, ni photographie produit, ni
illustration, ni mode sombre, ni tableau de bord multi-utilisateurs. Un agent
qui propose l'un de ces éléments se trompe de brief.
