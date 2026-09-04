# DESIGN.md — Compagnon

> `AGENTS.md` dit **comment construire** le projet ; ce fichier dit **à quoi il
> doit ressembler**. Historique des décisions et contrat de contraste complet :
> `.tastemaker/style-lock.md` et `.tastemaker/decisions.log`.

## Overview

Compagnon est l'outil de travail quotidien d'une tatoueuse indépendante : une
PWA mobile-first qu'elle ouvre entre deux clientes pour vérifier son prochain
RDV, encaisser, noter une dépense. Aucune page marketing, aucune photo produit.

La direction s'appelle **Galerie**. Elle vient de l'école Éditorial /
Minimaliste (ancrage : Apple HIG), croisée avec une intention **motion
first**. Le premium vient de l'espace et de la retenue, pas d'un effet :
blanc, beaucoup d'air vertical, filets capillaires, un seul sujet par écran,
bas-de-casse, ombres à la limite du perceptible.

**Gardé de la recette** : blanc papier, encre presque-noire, gris de légende,
filets `#d2d2d7` et rien de plus lourd, rayons doux (12/18/22), élévation par
le blanc et l'espace plutôt que par l'ombre, anatomie de section « libellé
discret → grand titre → détail », sections verticales longues plutôt que des
grilles de cartes.

**Écarté volontairement** : la photographie produit, sur laquelle repose la
moitié de la recette — l'app n'en a aucune. C'est la donnée, mise à l'échelle
display, qui occupe la scène à sa place. La fiche prévient d'ailleurs que sans
« objet héros » à photographier on se retrouve avec une scène vide : ici le
prochain rendez-vous et le net du mois jouent ce rôle.

## Colors

Trois couleurs, plus deux gris de structure. Palette générée puis validée par
matrice de contraste complète.

### Ground & Ink
- **Blanc papier** (`--fond`, `#ffffff`) : le fond de page.
- **Surface douce** (`--surface`, `#f5f5f7`) : blocs, champs, listes.
- **Pressé** (`--surface-douce`, `#ebebed`) : état actif au toucher.
- **Encre** (`--encre`, `#1d1d1f`) : le presque-noir d'Apple. Texte, boutons
  primaires, états actifs.
- **Gris de légende** (`--encre-douce`, `#6e6e73`) : texte secondaire.
  **5.07:1** sur blanc. Apple donne `#86868b`, mesuré à **3.62:1** — sous le
  plancher AA. Assombri dans la même teinte.

### Une seule couleur chromatique
- **Alerte** (`--alerte`, `#b3261e`) : montants négatifs et actions
  destructrices, **rien d'autre**. Partout ailleurs : encre, gris, blanc.
  C'est la lecture littérale du « accent, sparingly » de la recette.

### Structure
- **Filet** (`--ligne`, `#d2d2d7`) : filets capillaires entre sections, et
  rien de plus lourd. **Décoratif** — jamais seul porteur d'un état ; pour ça,
  c'est l'encre.

### Sémantique argent
Il n'y a **pas de vert**. Le positif est à l'encre, le négatif à l'alerte, et
c'est le **signe explicite (`+` / `−`) qui porte le sens**. Deux raisons : la
recette n'admet qu'un accent employé avec parcimonie, et une distinction
rouge/vert seule est illisible pour un daltonien.

## Typography

### Font Family
**Geist**, variable, en famille unique. La recette s'appuie sur SF Pro, qui
n'est pas distribuable ; Geist en est l'équivalent le plus proche disponible :
même neutralité géométrique, dessinée pour l'écran.

**Graisses 400 / 500 / 600, jamais au-delà**, et **bas-de-casse partout**.
C'est le garde-fou : la version précédente a été rejetée comme « trop
sport », et le coupable était exactement l'inverse — graisse 900 en capitales.

Proscrits comme police d'affichage : Inter, Roboto, Arial, `system-ui`.

### Hierarchy
Trois classes portent l'identité — les utiliser plutôt que d'empiler des
utilitaires au cas par cas :

| Classe | Rôle | Réglage |
|---|---|---|
| `.titre` | Titres et grands nombres | poids 600, `letter-spacing -0.022em` |
| `.legende` | Détail sous un titre | 13px, gris |
| `.libelle` | Libellé de section (l'« eyebrow » Apple) | 12px, poids 500, gris, **pas de capitales** |
| `.chiffre` | Montants et compteurs | poids 600, tabulaire, `-0.03em` |

Échelle : `text-5xl` (prénom du prochain RDV, net Compta) · `text-4xl`
(date de la fiche, chiffres du mois) · `text-3xl` (titres d'onglet) ·
`text-2xl` (titres de sous-page) · `text-lg` (nom en liste).

## Gimmicks graphiques

Ce sont eux qui font la direction. Les réutiliser plutôt qu'en inventer d'autres.

1. **L'anatomie de section** — un libellé gris discret, puis le contenu à
   grande échelle, puis un filet capillaire. Jamais une carte, jamais un
   encadré. Composant `Section` dans `app/page.tsx`.
2. **La pose** — le bloc principal se pose en s'installant légèrement
   (translation + `scale(0.985)`). Geste signature, **réservé à un bloc par
   écran**.
3. **Le filet qui se trace** — les indicateurs (onglet actif, chargement) se
   dessinent latéralement via `clip-path`.
4. **La barre translucide** — la navigation basse est en verre dépoli
   (`backdrop-filter`), signature Apple. Repli opaque si le navigateur ne gère
   pas le flou ou si l'utilisateur réduit la transparence.
5. **L'air vertical** — `py-7` entre sections. C'est lui qui porte le premium ;
   le resserrer casserait la direction.

## Shapes

- **Rayons doux** : `rounded-lg`/`rounded-xl` (contrôles, champs, boutons),
  `rounded-2xl` (listes, groupes), `rounded-full` (bouton flottant, pastilles).
  Jamais anguleux, jamais complètement rond non plus.
- **Ombres à la limite du perceptible** : `0 1px 2px rgba(0,0,0,.04)`.
  L'élévation vient de l'espace et du contraste, pas de l'ombre.
- **Filets de 1px** (`#d2d2d7`) entre sections, et rien de plus lourd.
- Icônes : SVG dessinés à la main, `strokeWidth="2"`. Pas de bibliothèque,
  pas d'emoji.

## Motion

**Ça monte, ça fond, ça se pose.** Rien ne bascule, rien ne rebondit, rien
ne tourne. Courbe unique : `--expo: cubic-bezier(0.16, 1, 0.3, 1)`.

- `.animate-apparition` — 300ms, montée de 14px. L'entrée ordinaire, en
  cascade de 70 à 90ms entre sections.
- `.animate-pose` — 300ms, montée de 10px + `scale(0.985)`. Le bloc principal
  s'installe. **Un seul par écran.**
- `.animate-trace` — 280ms, le filet se dessine via `clip-path`.
- Compteurs 320ms · onglets `translateX` 280ms · barres `scaleY` 500ms.
- Appui : `scale(0.98)` en 200ms sur tout élément pressable.
- **Aucune animation de propriété de layout** : uniquement `transform`,
  `opacity` et `clip-path`.

> ⚠️ **Ne jamais poser `perspective`, `transform`, `filter` ou `backdrop-filter`
> sur un ancêtre de `NavBar` ou de `BoutonNouveauRdv`.** Ces propriétés créent
> un bloc conteneur pour les descendants `position: fixed` : la barre de
> navigation se remettrait à défiler avec le contenu au lieu de rester
> visible. C'est exactement le bug qui a été corrigé ici. Les classes animées
> se posent sur des **frères** de la barre, jamais sur un parent.

- Pas de `loading.tsx` : l'écran précédent reste affiché.
- `prefers-reduced-motion` : surcharge globale en CSS **et** court-circuit JS
  dans `CompteurAnime` (une surcharge CSS n'arrête pas une boucle `rAF`).
  `prefers-reduced-transparency` : la barre de nav redevient opaque.

## Accessibility

- Toute paire portant du texte tient 4.5:1. Avant d'introduire une couleur ou
  un usage nouveau, relancer la matrice et mettre à jour le style lock.
- Contour de focus : 2px d'encre. Le filet gris est décoratif et ne peut pas
  porter cet état.
- Aucune information portée par la couleur seule : les montants ont un signe,
  l'acompte impayé est une étiquette « ACOMPTE DÛ » et non une pastille colorée.
- Cibles tactiles à 44px minimum ; les champs sont à 48px.

## Out of scope

Ni page marketing, ni photographie, ni illustration, ni mode sombre, ni
multi-utilisateur. Un agent qui propose l'un de ces éléments se trompe de brief.

## Contraintes vérifiées au navigateur

Deux points ont été **mesurés**, pas supposés — ils avaient été cassés une
première fois :

1. **Les douze noms de mois tiennent sous le graphique.** Mesuré à 430 / 375 /
   360 / 320px : « Août » est le plus large à 22.6px, la case fait 22.7px à
   320px. Ça ne tient que parce que la ligne de libellés **n'a pas de
   gouttière** et que le graphique occupe toute la largeur de page. Ne pas
   remettre de `gap` sur cette ligne, et ne pas replacer le graphique dans une
   colonne indentée.
2. **La barre de navigation reste visible en permanence** sur tous les écrans
   — voir l'avertissement dans la section Motion.
