# Reference board

Created: 2026-09-04
Mode: Operate
Design read: App shell mobile-first (PWA) pour une tatoueuse indépendante, usage quotidien solo sur téléphone, avec une lane visuelle Material Design 3 chaude déjà verrouillée, dials variance 3/motion 4/densité 6/direction artistique 5.
Dials: variance 3, motion 4, densité 6, direction artistique 5

_Board construit par la skill (étape 1.25), sans référence visuelle fournie
par l'utilisateur. Sources nommées via recherche web (titres/URLs réels) —
pas d'extraction de pixels sur captures d'écran dans cette passe, donc les
lignes ci-dessous sont **inférées à partir du texte des sources, pas
vues** au sens strict (pas de captures analysées)._

## Quality bar
- [GlossGenius](https://glossgenius.com/blog/apps-for-tattoo-artists) — le
  concurrent direct le plus proche de l'esprit déjà choisi pour Compagnon
  (chaleureux, éditorial, peu chargé) ; sert de barre de qualité pour ne
  pas retomber sur un look "back-office SaaS".
- [Fresha](https://pabau.com/blog/fresha-vs-vagaro/) — dashboard "clean,
  modern, easy to navigate" selon les comparatifs 2026.

## Borrow
- Palette/matière : GlossGenius -> chaleur assumée (pas de gris froid
  corporate) ; déjà acquis dans Compagnon (crème/marron), rien à changer.
- Type/hiérarchie : Linear / Notion -> hiérarchie typographique forte
  (gros chiffres, titres affirmés) plutôt que décoration pour signaler la
  modernité.
- Layout/composition : Apple Santé / Wallet (iOS) -> cartes bento avec
  chiffres mis en avant, déjà le patron du Dashboard actuel — à pousser
  plus loin (profondeur de carte, respiration).
- Motion/interaction : déjà en place (cascade fade-in-up, compteurs
  animés, graphique qui pousse en `scaleY`) -> garder cette grammaire,
  ne pas en ajouter une nouvelle.
- Asset language : aucune photo/illustration dans le produit (hors photos
  clients) -> non applicable, s'appuyer sur typographie + forme + ombre
  uniquement.

## Avoid
- Dashboards SaaS génériques (tableaux denses, gris froid, bleu
  corporate) — type Vagaro à son pire ([Pabau](https://pabau.com/blog/vagaro-vs-booksy/)
  note un dashboard "chargé, courbe d'apprentissage plus raide").
- Thèmes admin template Bootstrap-style.
- Apps fintech sur-animées (motion décorative sans fonction) — hors
  budget motion déjà fixé (dial motion 4/10).
- Réintroduire des bordures ou un nouvel effet de profondeur (glass,
  translucidité) qui contredirait la règle verrouillée "aucune bordure
  nulle part, séparation par l'ombre uniquement".

## Direction contract
- Thèse : Compagnon doit se sentir comme un carnet d'atelier haut de
  gamme, pas un back-office — renforcer la chaleur déjà choisie via une
  hiérarchie typographique plus marquée et une profondeur de carte plus
  travaillée, sans changer la palette ni réintroduire de bordures.
- Premier écran : Dashboard (`/`) — le plus vu au quotidien, sert de test
  de la direction avant extension aux autres écrans.
- Système : extension des tokens Material Design 3 déjà verrouillés dans
  `.tastemaker/style-lock.md` — pas de régénération de palette (dial
  variance bas, 3/10, volontairement : projet en extension, pas
  greenfield).
- Risque : tout ajout de motion/effet doit rester compatible avec
  `prefers-reduced-motion`, avec l'absence de `loading.tsx` (pas
  d'interstitiel plein écran) et avec la règle "aucune bordure nulle
  part" déjà en place — un effet qui les contredit doit être écarté ou
  discuté avec l'utilisateur avant d'être implémenté.
