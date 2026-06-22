# 01 · Install design-system docs

**Risk:** ✅ Zero — pure documentation, no production code changes.

## What this does

Drops the design-system documentation and a `CLAUDE.md` rules file into the repo so future Claude Code sessions have full design context. Lets you reference the design system from prompts like:

```
> @docs/design_system/README.md redesign the Erstanmeldung password screen.
```

## Target files (all new — nothing is overwritten)

| Path | Source | What it is |
|---|---|---|
| `CLAUDE.md` (repo root) | `design_handoff_bim_tools/CLAUDE.md` | Auto-loaded by Claude Code on every prompt. Short rules cheat-sheet. |
| `docs/design_system/README.md` | `design_handoff_bim_tools/design_system/README.md` | The big design system doc (~16 KB). |
| `docs/design_system/colors_and_type.css` | `design_handoff_bim_tools/design_system/colors_and_type.css` | Token reference. **Do NOT replace `shared/css/acc-variables.css` with this** — treat as a second-source-of-truth for design discussions only. |
| `docs/design_system/assets/emch-berger-logo.gif` | `design_handoff_bim_tools/design_system/assets/emch-berger-logo.gif` | Canonical logo. Same file as `shared/assets/emch-berger-logo.gif` already in the repo. |

## Steps

```bash
# From the repo root:
mkdir -p docs/design_system/assets

cp design_handoff_bim_tools/CLAUDE.md ./CLAUDE.md
cp design_handoff_bim_tools/design_system/README.md docs/design_system/README.md
cp design_handoff_bim_tools/design_system/colors_and_type.css docs/design_system/colors_and_type.css
cp design_handoff_bim_tools/design_system/assets/emch-berger-logo.gif docs/design_system/assets/emch-berger-logo.gif

git add CLAUDE.md docs/design_system
git commit -m "Design: install design system docs + CLAUDE.md rules"
```

## What does NOT change

- No HTML files
- No production CSS or JS
- No existing token files (`acc-variables.css`, `acc-corporate.css`)
- No `shared/assets/`

## Verification

```bash
# After commit, Claude Code should automatically load CLAUDE.md.
# To verify, ask it:
# > Without reading any files, what are the two visual systems in this repo?

# Expected answer: "Corporate refresh (body.corp) for browser surfaces and
# VDC Tools sub-system for desite-BIM-embedded WebForms."
```

If Claude Code can't answer that without reading files, the `CLAUDE.md` isn't at the repo root — check the path.
