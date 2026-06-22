# BIM Tools — Design Handoff

> **READ THIS FIRST.** This bundle is a TODO list, not a folder to copy into your repo.

This handoff contains **4 specific, scoped changes** to land in [`ostad-96/BIM-TOOLS`](https://github.com/ostad-96/BIM-TOOLS). Each one is in its own folder under `changes/`, with its own README that tells you **exactly which file in your repo to edit, what to change, and what the end state should look like.**

You (or Claude Code) implement **one folder at a time**. Each folder is self-contained — open the README, follow the steps, verify, commit, move on.

---

## ⚠️ How to give this to Claude Code

The previous time you handed this to Claude Code, it copied the reference files into your repo wholesale. Don't let that happen again.

**Use this prompt verbatim:**

```
I have a design handoff at ./design_handoff_bim_tools/.

Read design_handoff_bim_tools/README.md first, then implement change folder 01
ONLY. The reference HTML files in each change folder are DESIGNS — recreate the
look in the existing files of this repo (vanilla HTML/JS, no React, no new
build step). Do NOT copy the reference files into the repo.

After finishing change 01, stop. I'll review, then tell you to do 02.
```

Then for each next change, just say: *"Now do change folder 02."* etc.

---

## What's in this bundle

| Folder | What it does | Production file(s) touched | Risk |
|---|---|---|---|
| `01_install_design_system_docs/` | Drop the design-system docs + tokens reference into `docs/design_system/` so future Claude Code sessions have context. Adds `CLAUDE.md` at repo root. **Pure documentation, no production code changes.** | `CLAUDE.md` (new), `docs/design_system/` (new folder) | ✅ Zero risk |
| `02_login_replace/` | Replace the asymmetric login screen with a centered card on a textured brand canvas, floating labels, disabled-until-typed primary button. | `login.html` (rewrite body), `shared/css/acc-corporate.css` (append a `.login-*` block) | 🟢 Low risk — one page |
| `03_hub_greeting_strip/` | Replace the dramatic gradient greeting block on the Hub with a quiet single-line greeting + horizontal stats row separated by hairlines. | `index.html` (replace one `<div class="hub-feature-strip">…</div>` block + its inline `<style>` rules) | 🟢 Low risk — one page |
| `04_auswertung_detail_view/` | **Major UX change.** Replaces the current inline "Auswertung" panel in the Kollisionsmatrix tool with a dedicated detail page that opens when a user clicks a row in the Prüfungshistorie table. Donut chart, summary stats, full-size auswertungs-matrix matching the planning-matrix dimensions, clash list per cell. | `modules/vdc-tools/kollisionsmatrix-auswertung.html` (NEW), `modules/vdc-tools/kollisionsmatrix.html` (modify `populateHistory()` and `loadHistoryRun()` to navigate to the new page) | 🟡 Medium risk — touches working VDC tool |
| `05_vdc_agent_back_button/` | Add the standard translucent back-arrow button to the left of the logo in the VDC Agent header, matching the Kollisionsmatrix and Lichtraumprofil headers. | `modules/vdc-tools/agent.html` (add ~10 lines of markup + CSS) | ✅ Tiny, isolated |

The numbering is the recommended **order to land them in**. Start with 01 (zero risk, makes future work safer), then move down. Skip any you don't want.

---

## Folder structure

```
design_handoff_bim_tools/
├── README.md                              ← you are here
├── design_system/                         ← REFERENCE ONLY, do not copy whole
│   ├── README.md                          ← the big design doc — read for context
│   ├── colors_and_type.css                ← token reference
│   └── assets/emch-berger-logo.gif        ← canonical square logo
└── changes/
    ├── 01_install_design_system_docs/
    │   └── README.md
    ├── 02_login_replace/
    │   ├── README.md                      ← what to do
    │   ├── _reference.html                ← the design, open in browser to see
    │   └── assets/                        ← logo (so _reference.html renders)
    ├── 03_hub_greeting_strip/
    │   ├── README.md
    │   ├── _reference.html
    │   └── assets/
    ├── 04_auswertung_detail_view/
    │   ├── README.md
    │   ├── _reference.html                ← drop this in as modules/vdc-tools/kollisionsmatrix-auswertung.html
    │   └── assets/
    └── 05_vdc_agent_back_button/
        ├── README.md
        ├── _reference.html
        └── assets/
```

The `_reference.html` file in each change folder is a **standalone, runnable preview** of the new design — open it in a browser to see what the result should look like. It's not always identical to what should end up in production (it embeds its CSS to be self-contained); the README for each change explains exactly how to land the styles in the right file.

---

## Design rules (the short version)

The full version lives in `design_system/README.md`. The non-negotiables:

- **Two visual systems coexist.** Corporate refresh (warm paper, Inter Tight, dense German UI) for browser surfaces; VDC Tools sub-system (white canvas, cool slate, square panels) for the three desite-BIM-embedded WebForms. They share only `#003B4D` brand teal.
- **One brand color** (`#003B4D`) + **one warm accent** (`#b45309`). Don't invent a third.
- **Warm neutrals** `#fafaf7 / #f4f3ee / #e6e3dc` on the corporate side. Cool slate `#e5e7eb / #f8f9fb` on the VDC side. Never mix.
- **Logo is always square**, zero radius. Corporate CSS already enforces this with `!important`.
- **Hand-drawn stroked SVG icons**, no library. 1.8 / 2 / 2.2 stroke widths by purpose.
- **No emoji in UI copy.**
- **German throughout**, Swiss conventions (`Schliessen`, not `Schließen`; polite `Sie`).

---

## If something goes wrong

Before applying any change, make sure you're on a clean branch:

```bash
git checkout -b design-handoff
git status                                  # should show no changes
```

After each change folder, commit:

```bash
git add .
git commit -m "Design: <change number> <short title>"
```

If a change goes sideways, `git reset --hard HEAD~1` undoes the last commit.

If multiple changes go sideways: `git reset --hard origin/main` (assuming `main` is your default branch).

Land the changes as separate commits — that way you can revert individual ones independently.
