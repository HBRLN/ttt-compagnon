# Style lock — Compagnon

Established: 2026-09-04 (refonte typographique). Source : palette choisie
explicitement par l'utilisateur au fil de ~6 itérations ; typographie
dérivée de l'ancrage `aesop` (web-design-engineer), adaptée au numérique.

## Palette

Inchangée depuis les itérations utilisateur — **ne pas régénérer**.

- Background (`--fond`) : `#faf8f5` — fond de page, blanc cassé chaud
- Surface (`--surface`) : `#fffdfa` — cartes, champs
- Surface douce (`--surface-douce`) : `#f2ede6` — surfaces en creux, survol
- Primary / Accent (`--accent`) : `#8c6a4f` — actions primaires, onglet
  actif, carte hero (marron chaud, choisi explicitement par l'utilisateur)
- Text primary (`--encre`) : `#2a2521` — contraste vs fond : **14.30** (AA ✓)
- Text muted (`--encre-douce`) : `#6b6259` — vs surface : **5.88** (AA ✓)
- Button label (`--sur-accent`) : `#fffdfa` — vs accent : **4.82** (AA ✓)
- Rouge (`--rouge`) : `#d93025` — vs surface : **4.70** (AA ✓)
- Vert (`--vert`) : `#1a7d36` — vs surface : **5.13** (AA ✓)
- Dark mode : non nécessaire — mode clair unique, produit utilisé de jour
  en cabine.

## Color contract

Matrice complète produite par
`scripts/check_contrast.py --matrix` (7 rôles, 21 paires) :

- **Text-safe (≥4.5)** : text/surface, text/on-primary, text/bg,
  text/border, surface/primary, surface/accent, primary/on-primary,
  accent/on-primary, bg/primary, bg/accent
- **UI-safe (≥3.0 et <4.5)** : primary/border, accent/border,
  text/primary, text/accent
- **Decorative (<3.0)** : surface/border, border/on-primary, bg/border,
  bg/surface, bg/on-primary, surface/on-primary

**Ajustement enregistré** : `--vert` est passé de `#1e8e3e` à `#1a7d36`.
L'ancienne valeur tombait à 4.14:1 sur `--surface`, sous le plancher AA de
4.5 — corrigée par une baisse de luminosité dans la même teinte (5.13:1),
pas par un changement de teinte. La valeur actuelle intègre donc déjà une
correction de contraste ; ce n'est pas un choix arbitraire.

Relancer la matrice dès qu'une couleur sémantique s'ajoute.

## Typography

- **Display** : **Instrument Serif** 400 (+ italique) — sérif transitionnel,
  registre éditorial/apothicaire. Remplace Roboto, qui figurait sur la liste
  des clichés de `web-design-engineer` (« trop commun, se lit comme une page
  de démo ») et n'était là que par héritage de Material Design 3.
- **UI / corps / données** : **Instrument Sans** (variable) — famille sœur,
  dessinée pour s'accorder au serif.
- **⚠️ Instrument Serif n'existe qu'en 400.** Ne jamais poser `font-bold`
  ni `font-semibold` sur un élément `font-serif` : le navigateur
  synthétiserait un faux gras. La hiérarchie se fait **à la taille**.
- Échelle serif : `text-5xl` (chiffre hero Compta) · `text-4xl` (chiffres
  dashboard, prénom du prochain RDV) · `text-3xl` (titres d'onglet
  principal) · `text-2xl` (titres de sous-page) · `text-lg` (nom de client
  en liste).
- **Libellés** : classe `.libelle` dans `globals.css` — 11px, poids 500,
  `letter-spacing 0.12em`, capitales. Elle ne fixe pas la couleur : mettre
  `text-encre-douce` sur fond clair, `opacity-75` sur la carte accent.
- **Italique serif = les états vides uniquement** (« Rien de prévu. »).
  C'est la seule utilisation de l'italique ; ne pas l'étendre en décoration.
- `tabular-nums` sur tout chiffre animé par `CompteurAnime`, sinon la
  largeur saute pendant le décompte.

## Shape language

- Rayons : `rounded-lg` (champs/boutons), `rounded-xl`/`rounded-2xl` (cartes).
- Ombres : `--ombre-legere` / `--ombre-flottante`, volontairement très
  douces.
- **Aucune bordure nulle part** — séparation par l'ombre et l'espacement
  seulement. Décision utilisateur maintenue lors de la refonte : la variante
  Aesop « filets fins + angles droits » a été écartée sciemment (elle
  contredirait ce choix, et `aesop.md` déconseille lui-même sa recette pour
  du logiciel).
- **L'ombre porte la hiérarchie** : une seule carte hero par écran
  (Dashboard « Prochain RDV », Compta « Net ») en `shadow-flottante` ; toute
  carte secondaire reste en `shadow-legere`. Ne pas promouvoir une carte
  secondaire.

## Density & spacing

- Base 4px. Padding de page `px-5` ; cartes `p-4`/`p-5` ; gaps `gap-2`–`gap-4`.
- Densité : outil mobile — plus dense qu'une page vitrine, volontairement.
- Pas de section marketing : les tiers de padding de section ne s'appliquent pas.

## Reference intelligence

- Reference board : `.tastemaker/reference-board.md` — *inféré, non vu*
  (sources nommées via recherche web, pas d'extraction de pixels).
- Design read : app shell mobile-first pour une tatoueuse indépendante,
  mode **Operate**, lane apothicaire éditorial chaud.
- Dials : variance 4, motion 3, densité 6, direction artistique 5.
- Foundation : stack existante du repo (Next.js + Tailwind v4), aucune
  dépendance ajoutée. **Material Design 3 n'est plus la référence** — c'est
  ce qui imposait Roboto et tirait vers le « back-office ».
- Quality bar : GlossGenius (concurrent le plus designé du secteur),
  `aesop` (registre éditorial chaud).
- Direction contract — Thèse : carnet d'atelier haut de gamme, pas un
  back-office. Premier écran : Dashboard. Système : tokens existants +
  nouvelle typographie. Risque : tout effet ajouté doit rester compatible
  avec `prefers-reduced-motion`, l'absence de `loading.tsx` et la règle
  « aucune bordure ».
- Anti-références : dashboards SaaS froids et denses, templates admin
  Bootstrap, fintech sur-animée.

## Taste memory

- Profile priors : aucun (`~/.tastemaker/profile.md` absent).
- Decision log : `.tastemaker/decisions.log`.
- Dernières décisions : palette marron **conservée** malgré l'autorisation
  de tout changer ; typographie **remplacée** ; langage de forme
  **conservé**.
- Précédence : la demande courante (« tu peux tout modifier ») l'emporte sur
  le lock pour la typo, mais palette et formes ont été maintenues par
  jugement — elles servent le projet et résultent d'itérations utilisateur.

## Navigation chrome

Pas de sidebar : shell mobile à **barre d'onglets basse** (3 onglets).

- Fond de barre : `Surface` + `shadow-flottante` ; zone de contenu : `Background`.
- Onglet actif : anneau `accent` autour de l'icône, qui sert **aussi** de
  spinner pendant la navigation (`useLinkStatus`). Un seul traitement, partout.
- Onglet inactif : `--encre-douce`, aucun fond.
- Navigation aussi possible par glissement latéral (`NavigationGeste`).

## Mood descriptors

Chaleureux, posé, artisanal, tenu.

## Assets

- Icônes : SVG dessinés à la main, `stroke="currentColor"`, `strokeWidth="2"`.
  Convention maintenue — ne pas introduire Iconify/Lucide.
- Aucune photo ni illustration produit (seulement les photos d'inspiration
  téléversées par les clientes). Le pipeline Openverse/ideagram de tastemaker
  ne s'applique pas ici : `asset-dependence` = 2, la typo et la forme portent
  tout.

## Motion

- Feel : bref et retenu.
- Entrée : `fade-in-up` 0.35s, cascade de 40ms entre blocs.
- Graphique Compta : `transform: scaleY()`, **jamais** `height`.
- Onglets RDV : `transform: translateX()`, **jamais** `left`/`width`
  (corrigé — c'était un HIGH à l'audit motion).
- Pas de `loading.tsx` : l'écran précédent reste monté jusqu'à ce que le
  suivant soit prêt (préférence utilisateur explicite).
- Reduced motion : surcharge globale dans `globals.css` + court-circuit JS
  dans `CompteurAnime` (une surcharge CSS ne peut pas arrêter une boucle rAF).
- Vérifié par : `scripts/audit_motion.py app components` — 0 HIGH.
  Les « missing-reduced-motion » restants sont des faux positifs : le
  scanner travaille fichier par fichier et ne voit pas la surcharge globale.

## Do not

- Ne pas remettre Roboto, Inter, Arial ou system-ui en police d'affichage.
- Ne pas poser de gras sur un élément `font-serif` (faux gras).
- Ne pas réintroduire de bordure ni d'angles droits.
- Ne pas régénérer la palette : elle est le résultat de 6 itérations
  utilisateur et passe désormais la matrice complète.
- Ne pas rétablir la transition en double cercle du bouton `+` (essayée,
  abandonnée — voir `passation.md`) sans spécification état par état.
