# Style lock — Compagnon

Established: 2026-09-04 (refonte complète, direction « Flash sheet »).
Source : palette générée puis ajustée, ancrages `are-na` +
`bloomberg-businessweek-turley` (école brutaliste), choisis par l'utilisateur
parmi trois directions issues de trois écoles différentes.

> **Note d'historique.** Ce lock remplace intégralement une direction
> précédente (Material Design 3 chaud, puis apothicaire éditorial crème/marron
> + Instrument Serif). Elle a été rejetée par l'utilisateur : trop sage, à
> l'opposé de la culture tatouage. Ne pas y revenir par inadvertance.

## Palette

- Background (`--fond`) : `#0a0a0a` — le fond, partout
- Surface (`--surface`) : `#141414` — surface levée, usage rare
- Surface douce (`--surface-douce`) : `#1e1e1e` — état pressé
- Text primary (`--encre`) : `#f5f4f2` — **18:1** sur le fond. Blanc cassé
  volontaire : le blanc pur sur noir pur bave sur OLED.
- Text muted (`--encre-douce`) : `#9a9a95` — **7.00:1** sur fond, **6.52:1**
  sur surface
- Accent (`--accent`) : `#ff3b1f` — **5.56:1** en texte sur le fond
- Sur-accent (`--sur-accent`) : `#0a0a0a` — texte sur le rouge, **5.56:1**
- Filet (`--ligne`) : `#2a2a2a` — **décoratif uniquement** (1.36:1)
- Dark mode : le produit **est** sombre. Pas de mode clair, pas de bascule.

Sémantique argent : `--rouge` = l'accent, `--vert` = l'encre. Il n'y a pas de
vert. Le signe (`+` / `−`) porte le sens ; la couleur ne fait que renforcer.

## Color contract

Matrice complète (`check_contrast.py --matrix`, 7 rôles, 21 paires) :

- **Text-safe (≥4.5)** : text/bg, text/on-primary, text/surface, text/border,
  bg/primary, bg/accent, primary/on-primary, accent/on-primary,
  surface/primary, surface/accent
- **UI-safe (≥3.0 et <4.5)** : primary/border, accent/border, text/primary,
  text/accent
- **Decorative (<3.0)** : bg/border, border/on-primary, surface/border,
  bg/surface, surface/on-primary, bg/on-primary, primary/accent

Conséquence à retenir : `--ligne` est en décoratif contre le fond **et** contre
la surface. Il ne peut donc jamais porter un état à lui seul — le contour de
focus est en accent (3px), pas en filet gris.

Relancer la matrice dès qu'une couleur s'ajoute.

## Typography

- **Archivo** (variable, 400→900), famille unique. Le contraste vient du poids
  et de l'échelle, pas d'un second caractère.
- Trois classes portent l'identité, définies dans `globals.css` :
  `.massif` (900, capitales, `-0.03em`, `line-height .92`),
  `.libelle` (11px, 700, `0.18em`, capitales),
  `.numero` (11px, 700, accent, tabulaire).
- Échelle `.massif` : `text-6xl` → `text-2xl` (détail dans `DESIGN.md`).
- `tabular-nums` obligatoire sur tout chiffre animé.

## Shape language

- **Angles droits partout** — `border-radius: 0 !important` global. Un arrondi
  isolé fait lire l'ensemble comme un bug.
- **Aucune ombre** — `--ombre-legere` et `--ombre-flottante` valent `none`,
  pour qu'une classe `shadow-*` oubliée reste inoffensive.
- Séparation par **filets pleins** : 2px encre entre sections (`.filet`),
  1px gris entre lignes (`.filet-fin`).
- Bordures de 2px sur les contrôles (boutons contour, champs, onglets).

## Density & spacing

- Base 4px. Padding de page `px-5`. Sections `pt-4 pb-5/6`.
- Pas de cartes : des blocs pleine largeur séparés par des filets. Ça donne
  plus de densité utile qu'une grille de cartes à gouttières.
- Champs à 48px, boutons primaires à 56px, cibles tactiles ≥44px.

## Reference intelligence

- Reference board : `.tastemaker/reference-board.md` — **périmé**, il décrit la
  direction chaleureuse abandonnée. À refaire s'il redevient utile.
- Design read : app shell mobile-first pour une tatoueuse indépendante, mode
  **Operate**, lane brutaliste / flash sheet.
- Dials : variance 7, motion 5, densité 6, direction artistique 9.
- Foundation : stack existante (Next.js + Tailwind v4). Aucune dépendance
  ajoutée — pas de GSAP, pas de bibliothèque d'icônes.
- Direction contract — Thèse : une planche de flash punaisée au mur de
  l'atelier, pas une app de gestion. Premier écran : Dashboard. Risque : la
  recette brutaliste tolère mal les demi-mesures (`are-na` : « commit fully or
  pick another recipe »), donc tout nouvel écran doit reprendre les gimmicks,
  pas les adoucir.
- Anti-références : SaaS générique, Material Design, arrondis mous, dégradés.

## Taste memory

- Profile priors : aucun (`~/.tastemaker/profile.md` absent).
- Decision log : `.tastemaker/decisions.log`.
- Décision structurante : l'utilisateur a rejeté la direction chaleureuse
  éditoriale et choisi « Flash sheet » parmi trois écoles proposées.
- Précédence : la demande courante a écrasé l'intégralité du lock précédent —
  palette, typo et langage de forme compris.

## Navigation chrome

Shell mobile à barre d'onglets basse, bordée d'un filet 2px encre.

- Onglet actif : **pavé plein d'accent**, texte en sur-accent. Traitement
  unique, partout.
- Onglet inactif : texte gris, aucun fond.
- Chargement : une barre d'accent balaie sous l'icône (`.tampon`), au lieu
  d'un anneau qui tourne — cohérent avec « ça claque, ça ne glisse pas ».
- Bouton nouveau RDV : pavé rouge `+ RDV` en bas à droite (plus une pastille
  ronde : les angles droits sont la règle).
- Navigation par glissement latéral conservée (`NavigationGeste`).

## Mood descriptors

Franc, graphique, sans concession, rapide.

## Assets

- Icônes : SVG dessinés à la main, `stroke="currentColor"`, `strokeWidth="2"`.
  Pas de bibliothèque, pas d'emoji.
- Aucune photo ni illustration produit. La typo et les aplats portent tout.

## Motion

- Feel : ça claque. `--claque: cubic-bezier(0.2, 0, 0, 1)`.
- Entrée `.animate-claque` : 180ms, dépassement de 2px, arrêt net. Cascade 60ms.
- Tampon : 220ms en `clip-path` (et non une mise à l'échelle depuis zéro, que
  l'audit motion signale à juste titre).
- Compteurs : 320ms.
- Graphique : `transform: scaleY()`. Onglets : `transform: translateX()`.
  **Aucune animation de propriété de layout.**
- Reduced motion : surcharge CSS globale + court-circuit JS dans
  `CompteurAnime`.
- Vérifié par : `audit_motion.py app components` → **0 HIGH**. Les MEDIUM
  restants sont : le spinner du `Loader` à 0.7s (une rotation continue doit
  être lisible, 300ms serait un flou) et des « missing-reduced-motion » par
  fichier, faux positifs — le scanner ne voit pas la surcharge globale.
- `anti_slop_scan.py app components` → **passe**, 28 fichiers.

## Do not

- Ne pas réintroduire d'arrondi, d'ombre, ni de dégradé.
- Ne pas ajouter de vert : le signe porte le sens, pas la couleur.
- Ne pas dépasser trois couleurs (noir, encre, accent) hors gris de structure.
- Ne pas rallonger les durées de motion : 180ms est ce qui rend l'effet
  supportable trente fois par jour.
- Ne pas adoucir la direction écran par écran — la recette brutaliste appliquée
  à moitié se lit comme un bug, pas comme un style.
- Ne pas revenir à Roboto, Inter, Arial ou `system-ui`.
