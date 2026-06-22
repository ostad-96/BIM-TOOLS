# 03 · Hub greeting strip — quiet rework

**Risk:** 🟢 Low — replaces one block on the Hub page.

## What this does

Replaces the dramatic gradient greeting block at the top of the Hub (currently shows a teal-gradient panel with white "Guten Tag, …" text and bright stats) with a **calm, "you've been here a thousand times" greeting**:

- Single-line greeting: `Guten Tag, Andrea.` followed by a muted date in `· Mittwoch, 13. Mai · KW 20` style.
- Below it: a horizontal stats row (`Serien · Sitzungen · Offene Themen · Heute fällig`) separated by hairline dividers, on the warm paper canvas.
- One stat — the one that needs attention, e.g. **Offene Themen** — uses the warm-amber accent color `var(--c-accent)` (`#b45309`) to draw the eye.

This is the **only** large branded surface change on the Hub. The module-tile grid below it stays as-is.

## Target file

`index.html` (at the repo root)

## Reference

Open `_reference.html` in this folder.

## What to change in `index.html`

1. **Find** the existing `.hub-feature-strip` block in the markup — it currently wraps the greeting + the four stats. Its CSS lives in an inline `<style>` block in `index.html` (NOT in `acc-corporate.css` — this is a per-page style).
2. **Replace the markup** with the structure from `_reference.html`:
   ```html
   <div class="hub-hello-strip">
     <div class="hello-row">
       <div class="greet">Guten Tag, <strong>{{firstName}}</strong>.</div>
       <div class="when">{{weekday}}, {{day}}. {{monthShort}} · KW {{isoWeek}}</div>
     </div>
     <div class="stats">
       <div class="st"><div class="v">{{seriesCount}}</div>     <div class="k">Serien</div></div>
       <div class="st"><div class="v">{{instancesCount}}</div>  <div class="k">Sitzungen</div></div>
       <div class="st"><div class="v accent">{{openCount}}</div><div class="k">Offene Themen</div></div>
       <div class="st"><div class="v">{{dueToday}}</div>        <div class="k">Heute fällig</div></div>
     </div>
   </div>
   ```
3. **Replace the inline CSS** for `.hub-feature-strip` (and `.hub-feature-l`, `.hub-feature-stat`, `::after`, etc.) with the new `.hub-hello-strip` / `.hello-row` / `.stats` / `.st` rules from `_reference.html`. Substitute hex values with the CSS variables already defined: `var(--c-ink)`, `var(--c-ink-4)`, `var(--c-line)`, `var(--c-accent)`, `var(--f-display)`.

## Where the values come from

The existing data-loading code in `index.html` already computes:
- `firstName` from `currentUser.name`
- The greeting word from `new Date().getHours()` (`< 11` → "Guten Morgen", `< 18` → "Guten Tag", else "Guten Abend")
- `seriesCount`, `instancesCount`, `openCount` from `BIM.MeetingStore`

Keep all that logic. Just update the template strings to emit the new HTML structure, and add `weekday`, `day`, `monthShort`, `isoWeek`, `dueToday`. For `isoWeek`:

```js
function isoWeek(d) {
    var t = new Date(d.valueOf());
    var dayNr = (d.getDay() + 6) % 7;
    t.setDate(t.getDate() - dayNr + 3);
    var firstThursday = t.valueOf();
    t.setMonth(0, 1);
    if (t.getDay() !== 4) t.setMonth(0, 1 + ((4 - t.getDay()) + 7) % 7);
    return 1 + Math.ceil((firstThursday - t) / 604800000);
}
```

For `dueToday`: count of open Themen with deadline ≤ today across all series the user can access.

## Verification

1. Refresh the Hub. The gradient block is gone. In its place: a quiet greeting row + four stats separated by warm hairlines.
2. The "Offene Themen" number is the only stat in amber (`#b45309`). All others are ink-black.
3. Resize the browser narrow — the stats row should wrap gracefully, not become unreadable. Add a breakpoint at ~640 px if needed (grid `repeat(auto-fit, minmax(140px, 1fr))`).
4. Visit as a Viewer user (no edit rights) — stats still show; nothing breaks.

## What does NOT change

- The module-tile grid below
- The topbar
- Any tile content or icons
- The Projektmanagement / VDC Manager section headers
- Any token in `acc-variables.css` or `acc-corporate.css`
