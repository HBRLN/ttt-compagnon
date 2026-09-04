# Style lock — Compagnon

## Design Read
- artifact: app shell (mobile-first PWA, single-user business tool)
- audience: one independent tattoo artist, daily use on phone
- visual-language: warm Material Design 3 (light), warm brown accent
- mode: extension (established over many iterations, not greenfield)
- screens: Dashboard, RDV (list/detail/form), Compta (chart + ledger), Réglages, Login — all app shell / transactional / data view / settings, **no marketing/narrative screens**. Macrostructure/narrative-arc steps (tastemaker Step 2.5) don't apply here.

## Color (locked in `app/globals.css`, do not regenerate)
| Token | Hex | Role |
|---|---|---|
| `--fond` | `#faf8f5` | page background, warm off-white |
| `--surface` | `#fffdfa` | cards, inputs |
| `--surface-douce` | `#f2ede6` | recessed surfaces (inputs inside cards, hover) |
| `--encre` | `#2a2521` | primary text |
| `--encre-douce` | `#6b6259` | secondary text |
| `--accent` | `#8c6a4f` | primary actions, active tab, hero card (warm brown, user-specified) |
| `--sur-accent` | `#fffdfa` | text on accent |
| `--rouge` / `--vert` | `#d93025` / `#1e8e3e` | negative / positive amounts (Compta), errors |

`--sur-accent` on `--accent` ≈ 4.9:1 — clears the WCAG normal-text floor (4.5:1), no open contrast finding.

No categorical/sequential/diverging palette needed — every chart is single-series (net per period) using rouge/vert as a status pair, not a categorical scale.

## Typography
- Roboto (Google Font), via `next/font/google`, single family across the app — matches the Material Design 3 direction, not a two-family pairing (no display/serif role needed at this density).

## Spacing / shape
- Page padding `px-5`; card padding `p-4`/`p-5`; card gap `gap-2`–`gap-4`.
- Radius: `rounded-lg` (inputs/buttons), `rounded-xl`/`rounded-2xl` (cards).
- Shadows: `--ombre-legere` / `--ombre-flottante`, both intentionally very soft (low alpha) — no borders anywhere, cards separate by shadow + spacing only.

## Motion
- App-shell track (not marketing/scroll-storytelling): staggered card fade-in-up on Dashboard, animated count-up numbers (`CompteurAnime`), bar-chart grow-in on Compta, tap-scale feedback on primary buttons, a ring indicator (not a sliding pill) in the bottom nav that doubles as a per-tab loading spinner via `useLinkStatus`.
- No `transition: all`; each transition scopes explicit properties.
- Bar-chart grow uses `transform: scaleY()` (not `height`) to avoid layout-triggering animation.
- Global `prefers-reduced-motion: reduce` override in `globals.css` (near-instant transitions/animations); `CompteurAnime` separately skips its rAF easing under reduced motion since a CSS override can't stop a JS loop.
- No `loading.tsx` — navigations keep the previous screen mounted until the next is ready, no full-screen blank/spinner interstitial (explicit user preference).
- The "+" FAB (`BoutonNouveauRdv`) is a plain `Link` to `/rdv/nouveau` with a tap-scale feedback (`scale-90` on press) and a 160ms delay before navigating, so the tap is visible before the page changes. An earlier two-phase full-screen circle wipe (accent circle then white circle expanding from the FAB) was tried and **abandoned** after several failed iterations (see `passation.md` for the history) — don't reintroduce it without a precise, state-by-state spec agreed first.

## Assets
- All icons are hand-drawn inline SVG (`stroke="currentColor"`, `strokeWidth="2"`), no icon library. Intentional — keep this convention for new icons rather than introducing Iconify/Lucide.
- No stock photography or illustrations in the product (client-uploaded inspiration photos only); tastemaker's Openverse/unDraw asset pipeline does not apply to this project.

## Not applicable here
Hero guidelines, macrostructures/component-catalog, asset-cast/photo curation, Tweaks panel, style-recipes — all scoped to marketing pages or greenfield artifacts. Revisit only if a public-facing marketing page is added later.
