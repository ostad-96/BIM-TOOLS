# Emch+Berger BIM Tools — Design System

A design system for **BIM Tools**, the online Weboberfläche by **Emch+Berger GmbH** that brings BIM coordination, sitzungsprotokolle (meeting minutes), issuemanagement and VDC model-tools together into one platform for construction project teams.

> The product runs in **German** and lives on a single hosted workspace; the design system here is the source of truth for any new pages, modules, slides, or marketing assets that should feel like part of BIM Tools.

---

## What this system covers

| Surface | Status in production | Covered here |
|---|---|---|
| **BIM Tools Hub** (`/`) — module launcher, stats, greeting | ✅ Active | ✅ UI kit |
| **Login / Erstanmeldung** (`/login.html`) | ✅ Active | ✅ UI kit |
| **Sitzungsprotokolle / Besprechungsserien** (Meeting Minutes module) | ✅ Active | ✅ UI kit |
| **Administration** (Users · Activity · Access) | ✅ Active | ✅ UI kit |
| **VDC Manager** (Kollisionsmatrix · VDC Agent · Lichtraumprofil) | ✅ Active | partial — gate + tile |
| **Issuemanagement** / **Dokumentenmanagement** / **BIM-Koordination** | 🕐 Planned (stub tiles) | — |

The product is **vanilla HTML/JS, no framework, no build step**; the design system here mirrors that reality — components are recreations expressed as small, copyable JSX, but production consumes the same tokens via CSS custom properties.

---

## Sources used to build this system

- **GitHub:** [`ostad-96/BIM-TOOLS`](https://github.com/ostad-96/BIM-TOOLS) — full source of the product. Explore further for:
  - `shared/css/acc-corporate.css` — the corporate refresh layer, **the canonical source for tokens, components and motion** in this system.
  - `shared/css/acc-variables.css` — older `--bim-*` token set still used by legacy classes.
  - `shared/css/acc-components.css` — buttons, cards, badges, modals, toolbar.
  - `modules/*/index.html` — production examples of how the tokens compose.

If you have access, read these files directly before extending the system — they capture intent that no design doc can fully encode (e.g. the bridge layer that re-skins `.bim-*` legacy classes under `body.corp`).

---

## Index of files in this folder

| Path | What it is |
|---|---|
| `README.md` | This file. |
| `colors_and_type.css` | All design tokens (colors, type, spacing, radii, elevation, motion) as CSS custom properties + a small set of semantic type classes (`.ds-h1`, `.ds-eyebrow`, …). |
| `SKILL.md` | Skill manifest — read this if invoking the design system as a Claude skill. |
| `assets/` | Logos and brand imagery copied out of the product. |
| `shared/` | Snapshot of the product's CSS + JS imported from the repo for reference. |
| `index.html`, `login.html`, `modules/…` | Imported product pages — read-only, used as visual ground truth. |
| `preview/*.html` | Small design-system cards rendered into the Design System tab. |
| `ui_kits/bim-tools/` | High-fidelity recreation of the product as JSX components + a click-thru `index.html`. |

---

## Content fundamentals

**Language.** German throughout. Swiss German conventions where they apply (`Schliessen`, not `Schließen`; `gross`, not `groß`). Numbers and dates German-locale (`13. Mai 2026`, `09:30`).

**Voice & tone.** Calm, professional, factual — this is enterprise software for AECO professionals (architects, engineers, planners, BIM coordinators). It is **not** breezy, not playful, never marketingy inside the app. Headlines are statements of capability, not slogans:

- ✅ *"Ein zentraler Ort für jedes Bauprojekt"*
- ✅ *"Wiederkehrende Besprechungen mit chronologischen Aktualisierungen pro Diskussionspunkt — alles an einem Ort."*
- ✅ *"Sitzungsprotokolle, Issuemanagement und BIM-Werkzeuge — koordiniert in einer Oberfläche, geteilt mit dem ganzen Team."*

**Address.** The user is addressed politely with **Sie** (`Bitte Benutzername eingeben.`, `Melden Sie sich mit Ihrem Konto an, um fortzufahren.`). Never `Du`.

**Casing.** Sentence case for headlines, titles and labels — **never** Title Case in German. ALL-CAPS only for short eyebrows, table headers and section sublabels, paired with wide letter-spacing (`0.08–0.12em`).

**Microcopy patterns.**
- *Greeting* on the hub adapts to time of day: `Guten Morgen, Andrea.` / `Guten Tag,` / `Guten Abend,`.
- *Status* on tiles is one or two words in a pill: `Aktiv`, `Bald`, `Admin`.
- *Eyebrows* are domain labels in caps: `WILLKOMMEN`, `ANMELDEN`, `ERSTANMELDUNG`, `SITZUNGSPROTOKOLLE`.
- *Empty states & errors* are full sentences with a period: *"Bitte ein Passwort eingeben."*, *"Die Passwörter stimmen nicht überein."*
- *Hints* under inputs use middle-dot separators: *"Mindestens 8 Zeichen · Gross- und Kleinbuchstaben · 1 Ziffer · 1 Sonderzeichen"*.
- *Buttons* are imperative verbs, no trailing punctuation: `Anmelden`, `Neue Serie`, `Passwort festlegen`.

**Em / en-dashes & punctuation.** Em-dashes (`—`) are used freely in descriptive copy to set off appositive clauses. Soft hyphens (`&shy;`) and `&nbsp;` are used to avoid awkward breaks in long German compounds (`Modell&shy;koordination`, `Aufgaben&shy;zuweisung`).

**No emoji.** The product does not use emoji anywhere in UI copy. Status and category meaning is carried by colored pills and icons, never by `✅` / `🔴` / `📅`.

---

## Visual foundations

### Mood

Refined enterprise UI — quiet, warm, slightly editorial. The product file describes the lineage as *"Inspired by Linear · Mercury · Attio · Stripe Dashboard."* That direction holds: dense German UI, warm off-white canvas, a single dark-teal brand anchor, one warm amber accent for eyebrows and "today" markers, and very soft elevation.

### Color

- **One brand anchor: `#003B4D`** Emch+Berger dark teal. Used for primary buttons, active nav, sidebar selected state, focus ring (10 % alpha), the auth screen gradient and the page-hero stat strip on the hub. It is **never** combined with another saturated brand color — there is no secondary blue.
- **Warm neutrals, not cool grays.** Canvas is `#fafaf7`, deep paper is `#f4f3ee`, hairline is `#e6e3dc` (a warm beige-gray, not slate). This is the single most identity-defining choice in the system — using cool `#f1f5f9` / `#e5e7eb` instead will immediately look "off-brand".
- **Single warm accent: `#b45309`.** Used for eyebrows above titles, "warn" pills, and the small horizontal rule that precedes eyebrow text (`::before { width: 16px; height: 1px; background: var(--c-accent); }`).
- **Muted semantic colors.** Success `#14694a`, danger `#9b1c1c`. No neon greens or pure reds in chrome. The colorful blue/green/orange/red pills inherited from `--bim-status-*` are reserved for **content semantics inside data rows** (status of a meeting, priority of an action item).
- **Pure white reserved for elevated surfaces.** Cards, modals, inputs and the topbar (88 % alpha + backdrop blur) are `#ffffff` on top of paper — this is what gives the system its calm, layered feel.

### Typography

- **Display:** `Inter Tight` 600 for page heroes, card titles, h-headers. Tight tracking (`-0.018em`).
- **Body:** `Inter` 400/500 for everything else.
- **Mono:** `JetBrains Mono` 400 for IDs, codes, table-numeric data, the "code" column in tables.
- Default body size is **13 px** (German UI density). Page titles step up to 30 px on desktop, 22 px on mobile.
- `font-feature-settings: 'ss01', 'cv11'` is enabled in body — gives Inter its slightly more characterful disambiguated forms.
- `font-variant-numeric: tabular-nums` is mandatory on stats, table numbers and any aligning column.
- `text-wrap: balance` on headlines, `text-wrap: pretty` on body descriptions.

### Spacing

4-px base. The system reaches for `12 / 14 / 16 / 18` more than `20 / 24` — surfaces are dense by intent. The page container is `max-width: 1280px; padding: 28px 24px 80px`. Card body padding is 18 px. Form field gaps are 14–16 px.

### Backgrounds

- **Hub page canvas:** flat warm paper (`#fafaf7`). No gradient, no pattern.
- **Hub feature strip / auth aside:** subtle 160°–135° linear gradient from `--c-brand-dark` to `--c-brand` with a soft radial highlight (`radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)` positioned bottom-right or top-right). The gradient is the **only** place the brand color fills a large surface.
- **Login background:** flat brand `#003B4D` with a live JS canvas of slowly-floating particles connecting by white lines under 130 px distance — quiet, technical, not flashy.
- **No hand-drawn illustrations. No photography in chrome.** The product is iconographic.

### Borders, hairlines & dividers

- One default border: `1px solid var(--c-line)` (`#e6e3dc`). Warm, never blue-tinged.
- Strong border (`#d0cec6`) is used on hover only.
- Section dividers in page-hero are single hairlines under content.
- A 2-px solid `var(--c-brand)` underline marks active tabs and active sidenav items. The brand-teal is the only "highlight" color in the chrome.
- Cards have **border + tiny soft shadow** (`--el-1`) — never just shadow, never just border.

### Shadows / elevation

Three-tier soft shadow system, always combined with a 1px inset ring:
- `--el-1` for cards at rest.
- `--el-2` for hover on interactive cards, table containers, the sticky topbar.
- `--el-3` for modals, popovers, the auth shell.
- `--el-glow` is a 4-px brand-tinted ring used for `:focus-visible` on buttons and inputs.

### Corner radii

- 6 / 9 / 14 / 20 px. Cards and module tiles default to **14 px**. Icon containers to 9 px. Pills are fully rounded (`999px`).
- The hub exposes a **Tweaks panel** that lets users adjust the radius live with presets `Kantig / Subtil / Soft / Weich` (0 / 6 / 14 / 24 px). **The company logo is forcibly square** even when the rounding slider is at maximum — see `.cover-logo, .company-logo { border-radius: 0 !important; }` in `acc-corporate.css`.

### Hover, focus & press

- **Hover** = swap background to `--c-brand-tint` (the lightest warm tint) and bump border to `--c-line-strong`. Color never just darkens by an opacity step.
- **Primary button hover** = swap fill to `--c-brand-dark`.
- **Press** = `transform: translateY(1px)`. Never scale, never elevate.
- **Focus-visible** = `box-shadow: var(--el-glow)` (the 4-px teal ring). Outline removed.
- **Module tile hover** has an extra layer: a soft radial-gradient sheen reveals at top-right (`radial-gradient(120% 80% at 100% 0%, rgba(0,59,77,0.05), transparent 60%)`) and the arrow circle slides in from the bottom-right corner.

### Transparency & blur

The topbar uses `background: rgba(255,255,255,0.88); backdrop-filter: saturate(140%) blur(14px)`. This is the only place blur is used. Modal overlays are flat `rgba(0,0,0,0.4)` — no blur.

### Animation

- One easing curve: `cubic-bezier(0.2, 0.7, 0.2, 1)`. Variable `--ease`.
- Three durations: `.12s` (state changes — hover, active), `.2s` (most transitions), `.35s` (entrances).
- Page-enter and page-exit slides exist (`.page-transition`) for legacy `body:not(.corp)` pages — they slide a `--bim-gray-200` panel + a `--bim-primary-30` accent panel across the page horizontally. The corporate refresh **disables** these (`body.corp .page-transition { display: none }`) in favour of a quiet `fadeIn` keyframe (4 px translate-y up over 400 ms).
- The login background canvas runs a slow particle field — the only continuous animation in the system.

### Layout

- Centered max-width container: `max-width: 1280px; padding: 28px 24px 80px`. Hard cap, not fluid past that.
- Module grids: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` with 12 px gap.
- Admin uses a left sidebar (240 px) + content shell, collapsing to a hamburger drawer under 900 px.
- The footer is fixed-bottom in legacy modules; in corporate pages, it sits inline at the bottom of the page padding.

### Cards

`background: #fff; border: 1px solid var(--c-line); border-radius: 14px; box-shadow: var(--el-1)`. Headers carry a `1px solid var(--c-line)` bottom (corporate) or a heavier `2px solid var(--c-brand)` bottom (legacy `.bim-card-header`). Footers always sit on `--c-surface-2` (the slightly-deeper paper) to feel sunken.

### What the brand does NOT do

- ❌ No purple/blue gradients — gradients are always brand teal → darker brand teal, never multi-hue.
- ❌ No emoji in UI copy.
- ❌ No left-border accent cards (the colored stripe + rounded-corner + body trope from generic Tailwind UIs).
- ❌ No cool-gray neutrals — neutrals must be the warm `--c-line / --c-paper-deep` family.
- ❌ No raised "floating" cards with `0 20px 40px` style shadows. Elevation is always paired with a hairline.
- ❌ No drop-caps, no display serifs.

---

## The VDC Tools sub-system

The product has **two parallel visual systems**, and which one you use depends on *where* the surface lives:

| Surface | System | Where it runs |
|---|---|---|
| Hub, Login, Sitzungsprotokolle, Admin, Issuemanagement, Dokumenten­management, BIM-Koordination | **Corporate refresh** (`body.corp`) | Browser — desktop & mobile |
| Kollisionsmatrix, VDC Agent, Lichtraumprofil | **VDC Tools sub-system** | Inside the **desite BIM VDC Manager** (a Qt-based 3D-modelling app) as embedded WebForms |

The VDC tools deliberately look different because they need to feel native to the engineering tool they sit inside. They share **only the `#003B4D` brand color** with the corporate side.

### Key VDC-side decisions

- **White canvas** (`#ffffff`), not warm paper. Pure off-white feels at home next to a 3D viewport.
- **Cool slate neutrals**: `#e5e7eb` (lines), `#f8f9fb` (sunken rows), `#6b7280` (labels), `#94a3b8` (muted), `#4a5d6b` (panel-header accent / slate primary text). Do **not** use the `--c-line` warm beige here.
- **Header bar**: solid `#003B4D` strip with white text + sticky positioning, back-button as a translucent rounded square `rgba(255,255,255,0.10)`, `model-count` pill on the right (`rgba(255,255,255,0.12)` background, white text).
- **Panels**: square white boxes with a 1 px `#e5e7eb` border, very soft shadow `0 1px 3px rgba(0,0,0,0.04)`, panel header with a **2 px slate underline** (`border-bottom: 2px solid #4a5d6b`) and the title in uppercase slate.
- **Buttons** invert the corporate hierarchy: primary action is muted blue-gray `#c8d5de` with **dark text**; the **deep teal `#003B4D` is reserved for "pick" actions** (engaging the 3D selection tool) and for the large "Berechnung starten" CTA. Secondary buttons use very light slate `#e8edf1`.
- **Status colors**: new = slate (`#e8edf1 / #4a5d6b`), open = amber (`#fef3c7 / #92400e`), assigned = indigo (`#e0e7ff / #3730a3`), critical = red (`#fee2e2 / #991b1b`), resolved/accepted = emerald (`#d1fae5 / #065f46`), ignored = gray.
- **Matrix cell palette** (Kollisionsmatrix-specific): F-cells (self-collision diagonals) are gray-blue `#dce5eb`; K-cells (model ↔ model) are warm gray `#e4ddd6`; **checked** = slate `#4a5d6b` / `#7a909e`; **from-history** = deep indigo `#1e40af / #4338ca`; **new addition** = emerald `#059669 / #047857`.
- **Pick groups**: dashed `#e5e7eb` border in waiting state → solid `#003B4D` + tint `#f0f7fa` while picking → solid `#4a5d6b` + `#f0f5f7` when done. Inline pill on the right shows the state in uppercase (`Warten` / `Auswählen…` / `Fertig`).
- **Log / protokoll**: dark-slate console at the bottom of every tool (`#1a1a2e` or `#1e293b`), `Consolas` monospace, color-coded by level (`ok` emerald `#4ade80`, `info` blue `#60a5fa`, `warn` amber `#fbbf24`, `err` rose `#f87171`). Always visible — engineers need the audit log.
- **VDC Agent specifics**: chat bubbles use slate `#4a6a7a` (user) on the right and very light gray `#f0f2f5` (assistant) on the left; thinking blocks have an indigo `#6366f1` left border on a pale-violet `#f8f7ff` background; tool-call cards collapse open/closed with a `▶` glyph and badges (`done` / `calling` / `error`) in the top-right.
- **Banner gating**: the three VDC tools route through `vdc-tools/gate.html` which polls for the `vdcApp` global; if not loaded after 1 s it shows a friendly "VDC Manager erforderlich" card with the same particle background as the login.

### Static recreations

You can preview all three VDC tools at:

- `vdc_tools/kollisionsmatrix.html` — full 9×9 matrix, kürzel-index picker, history table, protokoll
- `vdc_tools/agent.html` — chat with thinking block, tool-call card, MCP status indicator
- `vdc_tools/lichtraumprofil.html` — face-picking groups, progress, big-number result strip, danger callout

They are also reachable from the hub tiles in `ui_kits/bim-tools/index.html` under "VDC Manager".

### What the VDC sub-system does NOT do

- ❌ No purple/blue gradients — gradients are always brand teal → darker brand teal, never multi-hue.
- ❌ No emoji in UI copy.
- ❌ No left-border accent cards (the colored stripe + rounded-corner + body trope from generic Tailwind UIs).
- ❌ No cool-gray neutrals — neutrals must be the warm `--c-line / --c-paper-deep` family.
- ❌ No raised "floating" cards with `0 20px 40px` style shadows. Elevation is always paired with a hairline.
- ❌ No drop-caps, no display serifs.

### What the VDC sub-system does NOT do

- ❌ No warm paper `#fafaf7`. It's always pure `#ffffff` against the slate UI.
- ❌ No Inter Tight in headlines — only `Inter` 600 at 14–15 px. The VDC side stays compact and "tool-like".
- ❌ No `border-radius: 14 px` on panels — VDC panels are 8 px (`r-md`-ish), reflecting the more clinical engineering tone.
- ❌ No `body.corp` corporate stylesheets — the VDC pages each ship their own `<style>` block (because they're served standalone inside Qt WebEngine, no shared bundle).

---

## Iconography

**System: hand-tuned inline SVG icons, drawn locally in each HTML file.** No icon font. No icon library is imported (no Lucide, no Heroicons, no FontAwesome). The visual rules are:

- `viewBox="0 0 24 24"`
- `fill="none"` + `stroke="currentColor"`
- `stroke-width: 1.8` for **decorative** icons (module tiles, sidebar nav, hero icons)
- `stroke-width: 2` for **functional** icons (buttons, inputs, close, dropdown carets)
- `stroke-width: 2.2` for the **arrow** icons specifically (module tile arrow, navigation chevrons) — slightly bolder for affordance
- `stroke-linecap: round` and `stroke-linejoin: round` everywhere
- Rendered size: **16 px** inside buttons and chips, **18 px** inside module-tile icon squares, **15 px** for back-link / search affixes
- Icons inherit color from `currentColor`. Module-tile icons sit inside a 38×38 `--c-brand-soft` rounded-square; the icon itself is `--c-brand`. Admin module overrides to `#7c3aed` on `#ede9fe`.

**The shape grammar is "Lucide-like":** stroked circles, rounded rectangles, polylines. Specific examples in the codebase:

- Calendar icon → `<rect rx="2">` body + two short top legs + a horizontal divider + 2-3 short interior lines
- Settings cog → outer 12-toothed `<path>` + central `<circle r="3">`
- Folder → `<path d="M22 19a2 2 0 01-2 2H4...">` with a small "tab" notch
- Stack/layers → three offset diamonds
- Logout → door + arrow
- Chevron → 3-point polyline

Because there is **no shared icon file** in the codebase, when extending the system you should **either** (a) copy an existing SVG from a page that already has the same concept, **or** (b) drop in the matching [Lucide icon](https://lucide.dev) at stroke-width `1.8` — it is the closest visual match. **Flag any substitution to the user.**

**Unicode chars used as icons.** A small set is used inline in copy: `•` (bullets in stats meta), `·` (middle dot in inline meta rows), `—` (em-dash separators). No checkmarks, no arrows in text — those are always SVGs.

**Logo.** The Emch+Berger company logo is a black square with the white Helvetica-like wordmark "Emch+Berger" stacked over two lines. It lives at `assets/emch-berger-logo.gif`. **Always render it square (zero border-radius)** even on pages where rounded corners are applied globally — there is an explicit `!important` rule in the corporate CSS for this.

---

## Open caveats & substitutions

- **Fonts** — `Inter`, `Inter Tight` and `JetBrains Mono` are loaded from Google Fonts in production. No local `.woff2` files are checked in. If the project needs offline-safe builds, please provide font files.
- **Iconography** — no icon library is used in production; each page reinvents the SVGs it needs. The UI kit here uses faithful copies of the SVGs that exist in `shared/` and module pages. For new icons not yet drawn in the product, prefer Lucide as the substitute and flag the choice.
- **Photography / illustration** — none in production. If a marketing surface is needed, brand direction needs to be established with the user before adding any.

---

## How to extend

1. **Read `colors_and_type.css` first** — every visible value in the system flows from those custom properties.
2. **Use `body.corp` as your default** — the corporate refresh is the canonical look. Legacy `.bim-*` utility classes work too but always require the `corp` body class to inherit the new tokens.
3. **Prefer the JSX components in `ui_kits/bim-tools/`** when prototyping screens — they encode the right composition (eyebrow + title + description, page-hero patterns, stat strip vs stat grid, module tile shape).
4. **One brand color, one accent color.** If a design needs a third color, push back — the system gets its identity from restraint.
