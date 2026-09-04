# DESIGN.md — Compagnon

> `AGENTS.md` dit **comment construire** le projet ; ce fichier dit **à quoi il
> doit ressembler**. Historique des décisions et contrat de contraste complet :
> `.tastemaker/style-lock.md` et `.tastemaker/decisions.log`.

## Overview

Compagnon est l'outil de travail quotidien d'une tatoueuse indépendante : une
PWA mobile-first qu'elle ouvre entre deux clientes pour vérifier son prochain
RDV, encaisser, noter une dépense. Aucune page marketing, aucune photo produit.

La direction s'appelle **Flash sheet**. Elle vient de l'école brutaliste
(ancrages : Are.na, Bloomberg Businessweek ère Turley) et cherche le registre
d'une planche de flash punaisée au mur de l'atelier : noir franc, typo massive
en capitales, un rouge posé comme un tampon, structure apparente, angles droits.

**Ce qui a été gardé de l'école** : contraste maximal, aucun arrondi, aucune
ombre, typographie à l'échelle du poster, trois couleurs maximum, structure
visible (filets pleins), mouvement qui claque au lieu de glisser.

**Ce qui a été écarté volontairement** : la grille délibérément brisée et le
corps de texte à 12px de Turley (sa fiche dit elle-même « recette éditoriale,
pas pour du contenu utilitaire »), et l'interdiction totale de police custom et
de mouvement d'Are.na. Un outil utilisé trente fois par jour ne peut pas être
illisible ou immobile. La violence typographique est mise au service de la
lecture rapide, pas contre elle.

## Colors

Trois couleurs, plus deux gris de structure. Palette générée puis validée par
matrice de contraste complète.

### Ground & Ink
- **Noir** (`--fond`, `#0a0a0a`) : le fond, partout.
- **Carbone** (`--surface`, `#141414`) : surface levée, usage rare.
- **Carbone clair** (`--surface-douce`, `#1e1e1e`) : état pressé.
- **Encre** (`--encre`, `#f5f4f2`) : tout le texte. 18:1 sur le noir. Blanc
  légèrement cassé volontairement : le blanc pur sur noir pur bave sur OLED.
- **Gris** (`--encre-douce`, `#9a9a95`) : texte secondaire, libellés. 7:1.

### Accent
- **Rouge** (`--accent`, `#ff3b1f`) : LE geste de la direction. Tampons, blocs
  pleins, onglet actif, bouton primaire, montants négatifs, numéros d'index,
  contour de focus. 5.56:1 en texte sur le noir, et le noir passe en texte sur
  le rouge (5.56:1 aussi) — donc un bouton rouge à texte noir est lisible.
- **Sur-accent** (`--sur-accent`, `#0a0a0a`) : le texte posé sur le rouge.

### Structure
- **Filet** (`--ligne`, `#2a2a2a`) : hairline **purement décoratif** (1.36:1).
  Il ne doit **jamais** être le seul élément qui porte un état — pour ça,
  c'est l'accent ou l'encre.

### Sémantique argent
Il n'y a **pas de vert**. Le positif est à l'encre, le négatif à l'accent, et
c'est le **signe explicite (`+` / `−`) qui porte le sens**. Deux raisons : la
règle « trois couleurs maximum » de Turley, et le fait qu'une distinction
rouge/vert est illisible pour un daltonien.

## Typography

### Font Family
**Archivo**, variable, en famille unique — de 400 à 900. Le contraste vient du
poids et de l'échelle, pas d'un deuxième caractère. Une seule famille, c'est
plus brutaliste et ça évite l'effet patchwork.

Proscrits comme police d'affichage : Inter, Roboto, Arial, `system-ui`.

### Hierarchy
Trois classes portent l'identité — les utiliser plutôt que d'empiler des
utilitaires au cas par cas :

| Classe | Rôle | Réglage |
|---|---|---|
| `.massif` | Titres et chiffres | poids 900, capitales, `letter-spacing -0.03em`, `line-height 0.92` |
| `.libelle` | Micro-libellés, boutons, métadonnées | 11px, poids 700, `letter-spacing 0.18em`, capitales |
| `.numero` | Numéro d'index de section (`01`, `02`) | 11px, poids 700, en accent, chiffres tabulaires |

Échelle de `.massif` : `text-6xl` (prénom du prochain RDV, net Compta) ·
`text-5xl` (chiffres du mois) · `text-4xl` (titres d'onglet) · `text-3xl`
(titres de sous-page) · `text-2xl` (nom en liste).

`tabular-nums` sur tout chiffre animé, sinon la largeur saute au décompte.

## Gimmicks graphiques

Ce sont eux qui font la direction. Les réutiliser plutôt qu'en inventer d'autres.

1. **Le tampon** — bloc d'accent plein qui balaie de gauche à droite
   (`.tampon`, en `clip-path`). Il annonce l'information principale d'un écran.
2. **La numérotation d'index** — `01 / 02 / 03` en rouge devant chaque section,
   comme un sommaire de magazine.
3. **Les filets** — `.filet` (2px encre) sépare les sections, `.filet-fin`
   (1px gris) sépare les lignes d'une liste. **Ils remplacent les ombres.**
4. **Les libellés espacés** en capitales, partout où il y a une étiquette.
5. **Les pavés pleins** — l'onglet actif, le bouton primaire et les états
   d'alerte sont des rectangles d'accent pleins, jamais des contours teintés.

## Shapes

- **Angles droits partout.** `globals.css` force `border-radius: 0` en
  `!important` sur tout : dans cette direction, un arrondi isolé fait lire
  l'ensemble comme un bug plutôt que comme un choix.
- **Aucune ombre.** Les tokens `--ombre-*` valent `none` — une classe
  `shadow-*` oubliée est donc inoffensive, mais ne pas en ajouter.
- Bordures de 2px quand elles portent une structure, 1px quand elles
  séparent des lignes.
- Icônes : SVG dessinés à la main, `strokeWidth="2"`. Pas de bibliothèque,
  pas d'emoji.

## Motion

**Ça claque, ça ne glisse pas.** C'est la signature, directement tirée de
Turley (« si quelque chose bouge, ça s'écrase en place »).

- `.animate-claque` — entrée en 180ms sur `cubic-bezier(0.2,0,0,1)`, avec un
  dépassement de 2px puis arrêt net. Cascade de 60ms entre sections.
- `.tampon` — balayage en 220ms via `clip-path`.
- Compteurs — 320ms (et non 700), ils arrivent vite.
- Graphique — les barres montent en `transform: scaleY()`, **jamais** `height`.
- Onglets — `transform: translateX()` en 150ms, **jamais** `left`/`width`.
- **Aucune animation de propriété de layout, nulle part.**
- Pas d'écran de chargement : l'écran précédent reste affiché. Pas de
  `loading.tsx`.
- 180ms tient sous le budget de 300ms — c'est ce qui rend l'effet supportable
  vu trente fois par jour. Ne pas rallonger.
- `prefers-reduced-motion` : surcharge globale en CSS **et** court-circuit JS
  dans `CompteurAnime` (une surcharge CSS n'arrête pas une boucle `rAF`).

## Accessibility

- Toute paire portant du texte tient 4.5:1. Avant d'introduire une couleur ou
  un usage nouveau, relancer la matrice et mettre à jour le style lock.
- Contour de focus : 3px d'accent. Le filet gris est décoratif et ne peut pas
  porter cet état.
- Aucune information portée par la couleur seule : les montants ont un signe,
  l'acompte impayé est une étiquette « ACOMPTE DÛ » et non une pastille rouge.
- Cibles tactiles à 44px minimum ; les champs sont à 48px.

## Out of scope

Ni page marketing, ni photographie, ni illustration, ni mode clair, ni
multi-utilisateur. Un agent qui propose l'un de ces éléments se trompe de brief.
