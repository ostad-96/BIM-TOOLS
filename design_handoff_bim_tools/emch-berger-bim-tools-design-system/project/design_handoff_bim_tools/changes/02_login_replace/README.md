# 02 · Login screen — replace

**Risk:** 🟢 Low — one page, isolated from the rest of the app.

## What this does

Replaces the existing asymmetric "brand aside on the left + form on the right" login screen with a **centered single card on a textured brand canvas**. Floating labels (Facebook / Material pattern). Anmelden button starts disabled and transitions to active when the Benutzername field has any value. "Passwort vergessen?" centered below the button (Google / Stripe pattern).

## Target file

`login.html` (at the repo root)

## Reference

Open `_reference.html` in this folder to see the new design rendered. The reference embeds all CSS inline so it's self-contained; in production, the styles should live in `shared/css/acc-corporate.css`.

## What to change in `login.html`

1. **Keep** the `<head>` block exactly as is (links to `acc-variables.css`, `acc-base.css`, `acc-components.css`, `acc-corporate.css`).
2. **Keep** any existing form-submission JS at the bottom of the file — the new design uses the same form names (`Benutzername`, `Passwort`) and the same submit button. Wire the existing handler to the new `<button>` and `<input>` elements.
3. **Replace** the existing `<body>` markup with the structure shown in `_reference.html`. Use the production CSS variables (`var(--c-brand)`, `var(--c-line)`, `var(--c-ink)`, etc.) instead of the hardcoded hex values in the reference.
4. **Delete** the particle-canvas JS that's currently in `login.html` — the new design uses a CSS-only blueprint grid + two radial-gradient highlights, no canvas.

## What to add to `shared/css/acc-corporate.css`

Append a `/* ── Login (centered card on brand canvas) ── */` section near the end (before the `body.corp .page-transition { display: none }` override). It should contain:

- `.login-stage` — full-viewport flexbox container, centers the `.login-shell`. Background: `linear-gradient(160deg, var(--c-brand-dark) 0%, var(--c-brand) 100%)`. Add `::before` pseudo-element with the blueprint grid + two soft radial highlights (one cool top-left, one warm amber bottom-right).
- `.login-shell` — 360 px wide white card, 14 px radius, padding `30px 34px 26px`, soft shadow `0 24px 60px rgba(0,0,0,0.34), 0 4px 12px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.04)`. Add a `loginIn` keyframe (0.5 s opacity + 8 px translate-Y).
- `.login-brand` — 38 × 38 logo (zero radius) + name + uppercase sublabel, with an 18 px bottom border-line of `#f0eee7`.
- `.login-shell .fl` — the floating-label field. Uses `placeholder=" "` and `:placeholder-shown` to drive the floated state. See `_reference.html` for the exact rule set.
- `.login-shell .login-btn` — disabled-default button with `:has()` selector on the shell that transitions to active when `.usr-input:not(:placeholder-shown)`. See `_reference.html`.
- `.login-forgot` — centered, muted "Passwort vergessen?" link below the button.
- `.login-foot` — mono `EMCH+BERGER · BIM TOOLS · v1.0` footer.
- `.login-err` — error banner shown via JS when login fails.

**Take the CSS rules from `_reference.html` verbatim**, substituting `#003B4D` → `var(--c-brand)`, `#002834` → `var(--c-brand-dark)`, `#e6e3dc` → `var(--c-line)`, etc.

## Key behaviors to preserve

- The existing PBKDF2 / brute-force lockout / sessions logic in `acc-auth.js` stays untouched. The new markup uses the same `<input>` and `<button>` elements with the same IDs, so the existing handlers wire up unchanged.
- "Erstanmeldung" (first-login password set) screen — **not redesigned in this change.** If your `login.html` toggles between Anmeldung and Erstanmeldung markup, keep both, only redesign the Anmeldung half. The Erstanmeldung redesign is a separate (later) handoff.

## Verification

After applying:

1. Open `login.html` in a browser. The card should be perfectly centered on a teal blueprint-grid canvas.
2. The Anmelden button should be muted warm-gray (`#d0cec6`-ish) and `cursor: not-allowed`.
3. Click the Benutzername field — the "Benutzername" label should hook up to the top-left inside the textbox at smaller font.
4. Type any character — the Anmelden button should smoothly fade to brand teal `#003B4D` over ~280 ms, the arrow icon should slide ~2 px right, and the button becomes clickable.
5. Submit a real credential — flow should work exactly as before.
6. Click "Passwort vergessen?" — should trigger whatever flow was wired before (or show your TODO if it wasn't).

## What does NOT change

- `acc-auth.js`, `acc-storage.js`, any of the auth-related JS
- `acc-variables.css`, `acc-base.css`, `acc-components.css`
- Any module page
- The Erstanmeldung markup (if separate)
- Storage / session behaviour
