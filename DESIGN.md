# DESIGN.md — Compagnon

> `AGENTS.md` dit **comment construire** le projet ; ce fichier dit **à quoi il
> doit ressembler**. Historique des décisions et contrat de contraste complet :
> `.tastemaker/style-lock.md` et `.tastemaker/decisions.log`.

## Overview

Compagnon est l'outil de travail quotidien d'une tatoueuse indépendante : une
PWA mobile-first qu'elle ouvre entre deux clientes pour vérifier son prochain
RDV, encaisser, noter une dépense. Aucune page marketing, aucune photo produit.

La direction s'appelle **Atelier suisse**. Elle vient de l'école Architecture
de l'information (ancrage : Vignelli / Swiss International), croisée avec une
intention **motion first** : le premium vient de la rigueur — grille visible,
alignements au cordeau, hiérarchie par la taille — et la modernité vient du
mouvement.

Ce croisement n'est pas un compromis, c'est ce qui fait tenir l'ensemble. La
fiche Vignelli prévient que le style suisse « se lit aujourd'hui comme
classique, archivistique » : le mouvement est exactement ce qui corrige ça.
Et elle donne elle-même le langage à suivre — *« si quelque chose bouge, ça
pivote comme un panneau de signalétique »*. D'où le volet basculant.

**Gardé de la recette** : grille rendue visible, hiérarchie par la TAILLE et
non par la graisse, un seul accent, angles droits, aucune ombre, chiffres
tabulaires, ton factuel, disposition tabulaire des données.

**Écarté volontairement** : Helvetica (remplacée par Space Grotesk, qui lit
moderne plutôt qu'archivistique) et l'immobilité prescrite par la recette,
puisque le mouvement fait partie du brief.

## Colors

Trois couleurs, plus deux gris de structure. Palette générée puis validée par
matrice de contraste complète.

### Ground & Ink
- **Gris papier** (`--fond`, `#f2f2f0`) : le fond de page.
- **Blanc** (`--surface`, `#ffffff`) : les blocs de contenu. C'est le contraste
  fond/bloc qui donne la profondeur — il n'y a aucune ombre.
- **Gris pressé** (`--surface-douce`, `#e8e8e5`) : état actif au toucher.
- **Encre** (`--encre`, `#111111`) : texte et boutons primaires.
- **Gris** (`--encre-douce`, `#6e6e6a`) : texte secondaire, libellés.
  4.57:1 sur le fond, 5.12:1 sur blanc. La recette Vignelli donne `#8a8a8a`,
  mesuré à 3.08:1 — sous le plancher AA. Assombri dans la même teinte.

### Accent
- **Laiton** (`--accent`, `#7a5c1e`) : un seul accent, comme l'exige la
  recette. Numéros de section, filet de l'onglet actif, montants négatifs,
  contour de focus, filet d'alerte. Registre métal/laiton plutôt que le
  rouge ou le bleu de Vignelli : c'est ce qui le fait lire premium et non
  signalétique de transport.
- **Sur-accent** (`--sur-accent`, `#ffffff`).

### Structure
- **Filet** (`--ligne`, `#cfcfca`) : la grille rendue visible. **Décoratif**
  (1.31:1) — il ne doit jamais être le seul élément qui porte un état ; pour
  ça, c'est l'accent.

### Sémantique argent
Il n'y a **pas de vert**. Le positif est à l'encre, le négatif au laiton, et
c'est le **signe explicite (`+` / `−`) qui porte le sens**. Deux raisons : la
recette n'autorise qu'un seul accent (« encre + fond + une couleur, jamais
deux »), et une distinction rouge/vert seule est illisible pour un daltonien.

## Typography

### Font Family
**Space Grotesk**, variable, en famille unique — comme le veut la recette
(« six caractères suffisent »). Elle garde la neutralité de la grille, mais ses
détails la font lire moderne plutôt qu'archivistique.

**Graisses plafonnées à 500.** C'est le garde-fou central de cette direction :
un grotesque en 700+ tout en capitales, c'est une marque de sport. La
hiérarchie se fait **par la taille**, jamais par la graisse ni par la couleur —
c'est la règle explicite de la recette suisse.

Proscrits comme police d'affichage : Inter, Roboto, Arial, `system-ui`.

### Hierarchy
Trois classes portent l'identité — les utiliser plutôt que d'empiler des
utilitaires au cas par cas :

| Classe | Rôle | Réglage |
|---|---|---|
| `.titre` | Titres | poids **500**, `letter-spacing -0.02em`, bas-de-casse |
| `.libelle` | Libellés de grille, boutons, métadonnées | 11px, poids 500, `letter-spacing 0.1em`, capitales |
| `.numero` | Numéro de section (`01`, `02`) | 11px, poids 500, en laiton, tabulaire |
| `.chiffre` | Montants et compteurs | poids **400**, tabulaire, `-0.03em` |

Échelle : `text-4xl` (prénom du prochain RDV, chiffres du mois) · `text-3xl`
(titres d'onglet, date de la fiche) · `text-2xl` (titres de sous-page) ·
`text-lg` (nom en liste).

## Gimmicks graphiques

Ce sont eux qui font la direction. Les réutiliser plutôt qu'en inventer d'autres.

1. **Le rail numéroté** — chaque section porte son numéro (`01`, `02`) dans
   une colonne étroite à gauche, séparée du contenu par un filet vertical.
   C'est la grille rendue visible, signature de la recette. Composant
   `SectionGrille` dans `app/page.tsx`.
2. **Le volet** — le bloc principal bascule en place (`rotateX`) comme un
   panneau de signalétique qui pivote. Geste signature, **réservé au bloc
   principal d'un écran** : appliqué à chaque ligne, il deviendrait pénible.
3. **Le filet qui se trace** — les indicateurs (onglet actif, chargement)
   sont des filets de laiton qui se dessinent le long de leur axe.
4. **Les blocs blancs sur fond gris** — la profondeur vient de là, jamais
   d'une ombre.
5. **Les libellés espacés** en capitales, discrets, jamais criards.

## Shapes

- **Angles droits partout.** `globals.css` force `border-radius: 0` en
  `!important` (« Radius : 0, toujours » dit la recette).
- **Aucune ombre.** Les tokens `--ombre-*` valent `none`.
- **Filets de 1px uniquement.** Le 2px appartenait à la direction précédente ;
  ici la finesse fait partie du premium.
- Icônes : SVG dessinés à la main, `strokeWidth="2"`. Pas de bibliothèque,
  pas d'emoji.

## Motion

**Le mouvement suit les axes de la grille.** Il ne rebondit jamais.

- `.animate-volet` — 260ms, `cubic-bezier(0.32,0.72,0,1)`. Le bloc pivote
  depuis son bord haut. **Un seul par écran.**
- `.animate-glisse` — 200ms, glissement de 10px. L'entrée ordinaire, en
  cascade de 60 à 80ms entre sections.
- `.animate-trace` — 360ms, le filet se dessine via `clip-path`.
- Compteurs — 320ms. Onglets — `translateX` en 240ms.
- Graphique — les barres montent en `transform: scaleY()` sur 500ms.
- **Aucune animation de propriété de layout, nulle part** : uniquement
  `transform`, `opacity` et `clip-path`.
- Pas d'écran de chargement : l'écran précédent reste affiché. Pas de
  `loading.tsx` — donc pas de squelette non plus, tant qu'il n'y a pas de
  surface de chargement à habiller.
- Le garde-fou : le volet est rare, le glissement est court. Une animation vue
  trente fois par jour doit rester sous 300ms.
- `prefers-reduced-motion` : surcharge globale en CSS, annulation explicite du
  `rotateX` du volet, **et** court-circuit JS dans `CompteurAnime` (une
  surcharge CSS n'arrête pas une boucle `rAF`).

## Accessibility

- Toute paire portant du texte tient 4.5:1. Avant d'introduire une couleur ou
  un usage nouveau, relancer la matrice et mettre à jour le style lock.
- Contour de focus : 2px de laiton. Le filet gris est décoratif et ne peut pas
  porter cet état.
- Aucune information portée par la couleur seule : les montants ont un signe,
  l'acompte impayé est une étiquette « ACOMPTE DÛ » et non une pastille colorée.
- Cibles tactiles à 44px minimum ; les champs sont à 48px.

## Out of scope

Ni page marketing, ni photographie, ni illustration, ni mode sombre, ni
multi-utilisateur. Un agent qui propose l'un de ces éléments se trompe de brief.
