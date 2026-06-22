---
name: emch-berger-bim-tools-design
description: Use this skill to generate well-branded interfaces and assets for Emch+Berger BIM Tools (Bauprojekt-Koordination — Sitzungsprotokolle, Issuemanagement, BIM-Koordination, VDC Manager), either for production or throwaway prototypes / mocks / decks. Contains essential design guidelines, colors, type, fonts, assets, and a working UI kit of small JSX components.
user-invocable: true
---

# Emch+Berger BIM Tools — Design Skill

Read `README.md` first — it covers the brand voice (German, Swiss conventions, polite "Sie"), the visual foundations (warm paper palette, one teal anchor `#003B4D`, one warm amber accent `#b45309`, Inter Tight + Inter + JetBrains Mono), the iconography (hand-tuned stroked SVG, no library — Lucide is the substitute), and the file index.

## Key files

- `colors_and_type.css` — the **single source of design tokens**. Import this at the top of every artifact you build.
- `shared/css/acc-*.css` — the live product stylesheet, imported from the GitHub repo. Loading these gives you the buttons, cards, module tiles, topbar, sidebar, table, tabs, modals and form styles for free.
- `ui_kits/bim-tools/` — small JSX components + a click-thru `index.html`. Read `ui_kits/bim-tools/README.md` for the component inventory.
- `preview/*.html` — small visual reference cards (colors, type scale, status pills, module tile, page hero, login shell, etc.).
- `assets/emch-berger-logo.gif` — the company mark. Always render with **zero border-radius**.

## When the user asks for something

**HTML artifacts (mocks, throwaway prototypes, slides):**
1. Start a new HTML file.
2. `<link rel="stylesheet" href="<path>/shared/css/acc-variables.css">` plus `acc-base.css`, `acc-components.css`, `acc-corporate.css`, `colors_and_type.css`.
3. Wrap your body in `<body class="corp">` — this activates the corporate refresh.
4. Compose using the patterns from the UI kit. Re-use class names (`module-tile`, `page-hero`, `app-top`, `pill pill-brand`, `btn btn-primary`, `tbl tbl-hover`, `stat-grid`, …) — they're already styled.
5. Copy assets (the logo, anything from `assets/`) into the artifact's folder if it's going to live offline.

**Production code:** read the tokens and rules here to become an expert in the brand, then write whatever the production stack needs (vanilla HTML/JS for this product). Always reference tokens by name, never inline values.

**Slides / decks:** the deck needs the teal anchor + warm paper foundation. Use the brand color only on a single prominent surface per slide (cover, section dividers) — most slides are white-on-paper with the teal used sparingly for emphasis. The Inter Tight + Inter pairing carries the editorial weight. No emoji.

## If the user just invokes the skill with no guidance

Ask:
1. What are they building? (a mock screen, a deck, a marketing page, a new module within the product, a print artifact)
2. Is this for the **product** (German UI, dense, enterprise) or for **external** use (slightly more breathing room, still no marketing tropes)?
3. Do they have specific copy / data / a screenshot of what they want?
4. Production code or throwaway prototype?

Then act as an expert designer who outputs HTML artifacts (`<body class="corp">` + the imported stylesheets above) or production-ready snippets that use the tokens, never hex codes directly.

## Hard rules

- **No emoji** in UI copy. Status meaning is carried by colored pills and SVG icons.
- **German throughout** for product surfaces. Swiss conventions (`Schliessen` / `gross`, not the ß forms). Polite **Sie**.
- **One brand color** (`#003B4D`) and **one warm accent** (`#b45309`). Do not introduce a third brand color.
- **Warm neutrals** (`#fafaf7 / #f4f3ee / #e6e3dc`). Never cool slate grays.
- **Logo is always square** (zero border-radius, even when the rest of the surface is rounded).
- **No purple/blue gradients.** Gradients are always brand-teal → darker brand-teal (160° on the auth aside, 135° on the hub strip).
- **Icons are hand-drawn SVG, never a library import.** If you need a new one, substitute Lucide at `stroke-width: 1.8` and flag the substitution.

## Caveats to flag if relevant

- **Fonts are CDN-only.** `Inter`, `Inter Tight` and `JetBrains Mono` are loaded from Google Fonts. If the artifact needs offline use, ask the user for self-hosted font files.
- **No icon library** is shipped in the product — every page hand-draws its SVGs. For consistency this skill ships a small library at `ui_kits/bim-tools/Icons.jsx`, but it is not exhaustive.
