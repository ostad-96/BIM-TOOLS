# BIM Tools — Bauprojekt-Koordination

A modular BIM coordination platform built for Emch+Berger GmbH. Vanilla HTML/JS app with a Node.js backend serving a unified JSON database. German UI, no frameworks, no build step.

## Architecture

- `shared/` — Design system (CSS custom properties, component library) and JS infrastructure
- `modules/` — Self-contained feature modules with own HTML views, CSS, and JS
- `server.js` — Node.js HTTP server: serves static files + JSON database API + attachment storage
- `data/db.json` — Single-file JSON database (all stores in one file)
- `data/attachments/` — Uploaded file blobs
- Vanilla JS, no frameworks, no bundler
- German UI language, Emch+Berger brand palette (`#003B4D`)

## Storage Layer

`BIM.StorageManager` singleton wraps a `BIM.StorageProvider` interface. `BIM.AutoStorageProvider` auto-detects the environment:
- **Server running** → `BIM.JsonStorageProvider` — reads entire DB on load, writes individual records via granular REST API (`POST/PUT/DELETE /api/db/:store/:id`)
- **No server (file://)** → `BIM.IndexedDBProvider` — browser-local IndexedDB fallback

Stores: `meetingSeries`, `meetingInstances`, `participants`, `discussionItems`, `discussionUpdates`, `attachments`, `seriesTemplates`, `userProfiles`, `activityLogs`, `sessions`

### Key files
- `shared/js/acc-storage.js` — StorageProvider interface + StorageManager singleton
- `shared/js/acc-storage-json.js` — Server-backed JSON provider with granular CRUD
- `shared/js/acc-storage-indexeddb.js` — Browser-local IndexedDB provider
- `shared/js/acc-auth.js` — Authentication (PBKDF2-SHA256, sessions, RBAC, brute-force protection)
- `shared/js/crypto-polyfill.js` — Pure JS SHA-256/PBKDF2 polyfill for non-HTTPS contexts

## Auth & Security

- PBKDF2-SHA256 with 310,000 iterations + random salt (OWASP 2025)
- First-login flow: admin creates user without password, user sets own on first login
- Roles: `admin` (full access), `editor` (edit content), `viewer` (read-only)
- Brute-force protection: 5 failed attempts → 15-minute lockout
- `crypto-polyfill.js` provides fallback when `crypto.subtle` is unavailable (HTTP, non-localhost)

## Modules

### Besprechungsserien (Meeting Minutes) — `modules/meeting-minutes/`
Forma-style meeting series where discussion items persist across sessions and accumulate chronological updates:
- Series → Instances → Discussion Items → Updates (chronological log)
- Participants split into Organisatoren and Eingeladene with presence tracking
- Configurable topic categories, custom fields, status options per series
- File attachments (25MB per-file limit, stored on server in `data/attachments/`)
- 4 built-in templates: BIM-Koordination, Planungsbesprechung, Baustellenbesprechung, Abnahme
- Print view matching Autodesk Forma PDF export layout

### Admin Portal — `modules/admin/`
- User management: create, edit, deactivate, permanently delete users
- Password reset (forces user to set new password on next login)
- Activity log viewer
- Series access control per user

### Planned modules (stubs in hub)
- Issuemanagement
- Dokumentenmanagement
- BIM-Koordination

## Running

### Local development
```
node server.js
```
Opens at http://localhost:3000. Default login: admin (set password on first login).

### Production (Hetzner server)
Deployed at `http://116.203.251.83` (port 80) via systemd service (`bim-tools.service`). SSH key at `~/.ssh/bim-tools-server`.

```
ssh -i ~/.ssh/bim-tools-server root@116.203.251.83
systemctl restart bim-tools    # restart server
journalctl -u bim-tools -f     # view logs
```

Database: `/root/bim-tools/data/db.json` — copy this file to back up everything.

## Server API

```
GET    /api/db                  — load entire database
PUT    /api/db                  — overwrite entire database (legacy, slow)
POST   /api/db/:store           — create record in store
PUT    /api/db/:store/:id       — update record by id
DELETE /api/db/:store/:id       — delete record by id
GET    /api/attachments/:id     — download attachment blob
POST   /api/attachments/:id     — upload attachment blob
DELETE /api/attachments/:id     — delete attachment blob
```

---

## Design System

The full design system documentation lives at `docs/design_system/README.md` — read it for any UI work.

Two visual systems coexist:

1. **Corporate refresh** (`body.corp`) — browser surfaces (Hub, Login, Sitzungsprotokolle, Admin, future modules). Tokens & components in `shared/css/acc-corporate.css`. Warm paper canvas, Inter Tight + Inter.
2. **VDC Tools sub-system** — embedded WebForms inside desite BIM (Qt-based 3D modeller): `modules/vdc-tools/kollisionsmatrix.html`, `modules/vdc-tools/agent.html`, `modules/vdc-tools/lichtraumprofil.html`. Each ships its own `<style>` block. Pure white canvas, cool slate neutrals.

Both share **only** the brand color `#003B4D`.

### Tokens — Corporate refresh (use CSS variables from `acc-corporate.css`)

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

### Tokens — VDC Tools (each tool repeats these values inline — no shared variables)

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
- **Do NOT use Inter Tight inside VDC tool surfaces** — they're compact Inter at 14-15 px.
- All numerics: `font-variant-numeric: tabular-nums`. Headlines: `text-wrap: balance`. Body descriptions: `text-wrap: pretty`.

### Radii

`6 / 9 / 14 / 20 / pill`. Cards & module tiles default to **14 px**. Icon containers `9 px`. VDC panels `8 px`. **Logo is always `0`** even when surrounding chrome is rounded — the corporate CSS enforces this with `!important`; keep that rule.

### Motion

One easing: `cubic-bezier(0.2, 0.7, 0.2, 1)` → variable `--ease`. Three durations: `.12s` (state), `.2s` (most), `.35s` (entrances). No bounce, no overshoot.

### Content rules

- **German** throughout. Swiss conventions (`Schliessen` not `Schliessen`; `gross` not `gross`). Polite `Sie`, never `Du`.
- **Sentence case** for headlines, labels, buttons. ALL-CAPS only for short eyebrows / table headers / section sublabels with `0.08-0.12em` tracking.
- **No emoji.** Status is carried by colored pills + SVG icons.
- Em-dashes in descriptive copy. Middle-dots in inline meta rows. Soft hyphens (`&shy;`) in long compounds.
- Greeting on hub adapts to time: `Guten Morgen, ...` / `Guten Tag, ...` / `Guten Abend, ...`.
- Buttons are imperative verbs, no trailing punctuation: `Anmelden`, `Neue Serie`, `Passwort festlegen`.

### Iconography

- **Hand-drawn inline SVG.** No icon font, no library.
- `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`.
- Stroke widths: **1.8** for decorative (module tiles, sidebar nav), **2.0** for functional (buttons, inputs, close, dropdown carets), **2.2** for arrows.
- `stroke-linecap: round`, `stroke-linejoin: round`.
- Inside a module tile: 38 x 38 `--c-brand-soft` rounded-square container at 9 px radius, icon at 18 px in `--c-brand`.
- When adding a new icon: copy an existing SVG from a page that already has the same concept, or substitute a Lucide icon at stroke-width 1.8 — and flag the substitution in a code comment.

### Hard rules

- No third brand color. One teal anchor + one warm amber accent.
- No cool-gray neutrals on the corporate side. Warm `#e6e3dc / #f4f3ee` family only. (VDC side is the exception.)
- No Inter Tight inside VDC tool surfaces.
- No round logo. Always square.
- No floating-card shadows (`0 20 40 ...`). Elevation = hairline + soft shadow, always paired.
- No emoji in UI copy.
- No multi-hue gradients. Brand teal to darker brand teal, or no gradient.

### When working on a new feature

1. Read `docs/design_system/README.md` for full context.
2. **Reuse existing classes** from `shared/css/acc-corporate.css` before adding new ones.
3. Match the existing density: 13 px body, `padding: 28px 24px 80px` on `.app-page`, 12 px grid gaps. Don't pad like a marketing site.
4. **Status & priority vocabulary is fixed.** Serie: `Entwurf / Aktiv / Abgeschlossen / Archiviert`. Aktionspunkt: `Offen / In Bearbeitung / Erledigt / Storniert`. Prioritat: `Hoch / Mittel / Niedrig`. Rolle: `Admin / Editor / Viewer`.
5. **Do not import React, npm packages, or a build step.** The stack is vanilla HTML/JS — keep it that way.

### Reference materials

- `docs/design_system/README.md` — the big design doc (read this first for any UI work)
- `docs/design_system/colors_and_type.css` — token reference (do NOT replace `acc-variables.css` with this; treat as a second-source-of-truth for design discussions)
- `docs/design_system/assets/emch-berger-logo.gif` — canonical logo file (same as `shared/assets/emch-berger-logo.gif`)
