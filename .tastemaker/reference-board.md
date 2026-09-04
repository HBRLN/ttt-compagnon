# Reference board — Compagnon

_Étape 1.25 tastemaker — demande "rendre l'app plus moderne", sans référence
visuelle fournie par l'utilisateur. Board construit par la skill, pas par
l'utilisateur — sources nommées via recherche web (titres/URLs réels), pas
d'extraction de pixels sur captures d'écran (aucune capture récupérée dans
cette passe). À traiter comme **inféré**, pas comme un audit visuel vérifié._

## Design read (une ligne)

App shell mobile-first (PWA), usage quotidien par une seule utilisatrice
experte (Josy), écrans transactionnels/data-view (pas de marketing) ;
lane visuelle Material Design 3 chaud déjà verrouillée ; dials : variance
palette basse (rien à regénérer), motion mesurée et déjà présente
(cascade fade-in, compteurs animés, graphique qui pousse), densité mobile
confortable, direction artisanale/chaleureuse plutôt que SaaS corporate.

## Concurrents directs (logiciels de réservation utilisés par des
tatoueurs indépendants)

- [GlossGenius](https://glossgenius.com/blog/apps-for-tattoo-artists) —
  souvent cité comme le plus "designé" du secteur (éditorial, chaleureux,
  peu chargé) — la référence la plus proche de l'esprit déjà choisi pour
  Compagnon (crème/marron, pas de bordures).
- Fresha — dashboard "clean, modern, easy to navigate" selon les
  comparatifs 2026 ([Pabau](https://pabau.com/blog/fresha-vs-vagaro/)).
- Booksy — app mobile-first très aboutie côté client (UX de prise de RDV,
  rappels SMS fiables).
- Vagaro — plus complet mais dashboard jugé chargé/dense, à éviter comme
  modèle (voir anti-références).

## Produits adjacents (patterns à emprunter, pas le secteur)

- Cal.com / Calendly — patterns de prise de RDV et de formulaires courts.
- Linear / Notion — app shells modernes avec motion restreinte et
  hiérarchie typographique forte plutôt que décoration.
- Apple Santé / Wallet (iOS) — cartes bento, chiffres mis en avant,
  minimalisme chaleureux plutôt que froid.

## Sources culturelles

- Identité d'atelier de tatouage indépendant : chaleureux, artisanal,
  esthétique "carnet/encre" plutôt que clinique ou "spa corporate".

## Systèmes d'interface

- Base actuelle : Material Design 3 (déjà en place, à garder).
- Tendance 2026 à considérer avec prudence : profondeur via translucidité
  douce ("liquid glass" iOS) — seulement si compatible avec "aucune
  bordure, séparation par l'ombre uniquement" déjà verrouillé ; sinon
  privilégier une hiérarchie typographique plus marquée et des ombres
  légèrement plus travaillées plutôt que d'ajouter un nouvel effet.

## Anti-références

- Dashboards SaaS génériques (tableaux denses, gris froid, bleu
  corporate) — type Vagaro à son pire.
- Thèmes admin template Bootstrap-style.
- Apps fintech sur-animées (motion décorative sans fonction).

## Direction contract (proposition, à valider avant tout code)

- **Thèse** : Compagnon doit se sentir comme un carnet d'atelier haut de
  gamme, pas un back-office — renforcer la chaleur et le côté artisanal
  déjà choisis via la hiérarchie typographique et une profondeur de carte
  plus travaillée, sans changer la palette ni réintroduire de bordures.
- **Premier écran** : Dashboard (`/`) — le plus vu au quotidien, sert de
  test de la direction avant extension aux autres écrans.
- **Système** : extension des tokens Material Design 3 déjà verrouillés
  dans `.tastemaker/style-lock.md` — pas de régénération de palette.
- **Risque** : tout ajout de motion/effet doit rester compatible avec
  `prefers-reduced-motion`, avec l'absence de `loading.tsx` (pas
  d'interstitiel plein écran) et avec la règle "aucune bordure nulle
  part" déjà en place — un effet qui les contredit doit être écarté ou
  discuté avec l'utilisateur avant d'être implémenté.
