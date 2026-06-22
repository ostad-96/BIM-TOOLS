# CLAUDE.md — BIM Tools (Emch+Berger)

This file is auto-loaded by Claude Code on every prompt in this repo. The full design system documentation lives at `docs/design_system/README.md` — read it for any UI work.

---

## Product

**BIM Tools** = a modular BIM coordination platform by Emch+Berger GmbH. Vanilla HTML/JS, no framework, no build step. German UI. Two visual systems coexist:

1. **Corporate refresh** (`body.corp`) — browser surfaces (Hub, Login, Sitzungsprotokolle, Admin, future modules). Tokens & components in `shared/css/acc-corporate.css`. Warm paper canvas, Inter Tight + Inter.
2. **VDC Tools sub-system** — embedded WebForms inside desite BIM (Qt-based 3D modeller): `modules/vdc-tools/kollisionsmatrix.html`, `modules/vdc-tools/agent.html`, `modules/vdc-tools/lichtraumprofil.html`. Each ships its own `<style>` block. Pure white canvas, cool slate neutrals.

Both share **only** the brand color `#003B4D`.

---

## Tokens

### Corporate refresh (use the CSS variables from `acc-corporate.css`)

| Token | Value | Use |
|---|---|---|
| `--c-brand` | `#003B4D` | Primary buttons, active nav, focus ring (10 % alpha), the one colored chrome surface per page |
| `--c-brand-dark` | `#002834` | Hover, gradient endpoint |
| `--c-accent` | `#b45309` | Eyebrows above titles, "warn" pills. **Used sparingly.** |
| `--c-paper` | `#fafaf7` | Page canvas. **Never use pure `#ffffff` for the canvas.** |
| `--c-paper-deep` | `#f4f3ee` | Sunken tracks |
| `--c-surface` | `#ffffff` | Cards, modals, inputs only |
| `--c-line` | `#e6e3dc` | Default hairline border. **Warm beige-gray, never cool slate.** |
| `--c-ink` | `#0e1719` | Primary text |
| `--c-ink-3` | `#5d676e` | Descriptions |
| `--c-ink-4` | `#8a939a` | Muted / placeholder |

### VDC Tools (each tool repeats these values inline — no shared variables)

| Value | Use |
|---|---|
| `#003B4D` | Header bar, "pick" buttons, large CTAs |
| `#c8d5de` | Primary action buttons (dark text on muted blue-gray) |
| `#e8edf1` | Secondary buttons, header-row backgrounds |
| `#4a5d6b` | Panel-header underline (2 px), uppercase title, slate primary text |
| `#e5e7eb` | Hairline borders (cool slate, NOT the corporate `#e6e3dc`) |
| `#f8f9fb` | Sunken rows, table headers |
| `#1a1a2e` / `#1e293b` | Log / protokoll console backgrounds (dark slate, with Consolas text) |

### Type

- Display (corporate): **Inter Tight** 600, tracking `-0.018em`.
- Body (corporate + VDC): **Inter**, 13 px default on corporate, 13 px default on VDC.
- Mono: **JetBrains Mono** (or `Consolas` in VDC tools), for IDs / codes / table numerics.
- **Do NOT use Inter Tight inside VDC tool surfaces** — they're compact Inter at 14–15 px.
- All numerics: `font-variant-numeric: tabular-nums`. Headlines: `text-wrap: balance`. Body descriptions: `text-wrap: pretty`.

### Radii

`6 / 9 / 14 / 20 / pill`. Cards & module tiles default to **14 px**. Icon containers `9 px`. VDC panels `8 px`. **Logo is always `0`** even when surrounding chrome is rounded — the corporate CSS enforces this with `!important`; keep that rule.

### Motion

One easing: `cubic-bezier(0.2, 0.7, 0.2, 1)` → variable `--ease`. Three durations: `.12s` (state), `.2s` (most), `.35s` (entrances). No bounce, no overshoot.

---

## Content rules

- **German** throughout. Swiss conventions (`Schliessen` not `Schließen`, `gross` not `groß`). Polite `Sie`, never `Du`.
- **Sentence case** for headlines, labels, buttons. ALL-CAPS only for short eyebrows / table headers / section sublabels with `0.08–0.12em` tracking.
- **No emoji.** Status is carried by colored pills + SVG icons.
- Em-dashes (`—`) in descriptive copy. Middle-dots (`·`) in inline meta rows. Soft hyphens (`&shy;`) in long compounds (`Modell&shy;koordination`).
- Greeting on hub adapts to time: `Guten Morgen, …` / `Guten Tag, …` / `Guten Abend, …`.
- Buttons are imperative verbs, no trailing punctuation: `Anmelden`, `Neue Serie`, `Passwort festlegen`.

---

## Iconography

- **Hand-drawn inline SVG.** No icon font, no library.
- `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`.
- Stroke widths: **1.8** for decorative (module tiles, sidebar nav), **2.0** for functional (buttons, inputs, close, dropdown carets), **2.2** for arrows.
- `stroke-linecap: round`, `stroke-linejoin: round`.
- Inside a module tile: 38 × 38 `--c-brand-soft` rounded-square container at 9 px radius, icon at 18 px in `--c-brand`.
- When adding a new icon: copy an existing SVG from a page that already has the same concept, or substitute a Lucide icon at stroke-width 1.8 — and flag the substitution in a code comment.

---

## Hard rules

- ❌ **No third brand color.** One teal anchor + one warm amber accent.
- ❌ **No cool-gray neutrals on the corporate side.** Warm `#e6e3dc / #f4f3ee` family only. (VDC side is the exception.)
- ❌ **No Inter Tight inside VDC tool surfaces.**
- ❌ **No round logo.** Always square.
- ❌ **No floating-card shadows** (`0 20 40 …`). Elevation = hairline + soft shadow, always paired.
- ❌ **No emoji in UI copy.**
- ❌ **No multi-hue gradients.** Brand teal → darker brand teal, or no gradient.

---

## When working on a new feature

1. Read `docs/design_system/README.md` for full context.
2. **Reuse existing classes** from `shared/css/acc-corporate.css` before adding new ones.
3. Match the existing density: 13 px body, `padding: 28px 24px 80px` on `.app-page`, 12 px grid gaps. Don't pad like a marketing site.
4. **Status & priority vocabulary is fixed.** Serie: `Entwurf / Aktiv / Abgeschlossen / Archiviert`. Aktionspunkt: `Offen / In Bearbeitung / Erledigt / Storniert`. Priorität: `Hoch / Mittel / Niedrig`. Rolle: `Admin / Editor / Viewer`.
5. **Do not import React, npm packages, or a build step.** The stack is vanilla HTML/JS — keep it that way.

---

## Reference materials in this repo

- `docs/design_system/README.md` — the big design doc (read this first for any UI work)
- `docs/design_system/colors_and_type.css` — token reference (do NOT replace `acc-variables.css` with this; treat as a second-source-of-truth for design discussions)
- `docs/design_system/assets/emch-berger-logo.gif` — canonical logo file (same as `shared/assets/emch-berger-logo.gif`)
