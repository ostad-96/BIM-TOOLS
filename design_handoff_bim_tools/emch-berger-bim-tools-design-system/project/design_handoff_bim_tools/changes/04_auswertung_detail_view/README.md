# 04 · Kollisionsmatrix Auswertung — dedicated detail page

**Risk:** 🟡 Medium — touches a working VDC tool. Test inside desite BIM after applying.

## What this does

The Kollisionsmatrix tool currently shows its **Auswertung** (evaluation of a past Prüfung) as an inline panel below the planning matrix, rendered into `#auswertungBody` by an HTML-string template inside `kollisionsmatrix.html`. The detail panel for an individual clash run also shows inside the same page (`#detailPanel`).

This change extracts the entire Auswertung experience into a **dedicated page** that opens when a user clicks a row in the Prüfungshistorie table. The new page contains:

- **Same VDC teal header** with back arrow that returns to the Kollisionsmatrix planning view.
- **Breadcrumbs row** below the header (`Kollisionsmatrix / Prüfungshistorie / KW 19 · Etappe 2`).
- **Gesamtauswertung summary strip** — three equal cells:
  - **SVG donut chart** (no library) — accepted % center value + colored ring (green / red / gray).
  - **Übersicht stats** column with big tabular numbers (Total / Akzeptiert / Offen / Ignoriert).
  - **Eckdaten** column with run metadata (Prüfung / Erstellt / Modelle / Prüfläufe / Dauer).
- **Auswertungsmatrix** — exactly the same 42 × 42 px grid dimensions as the planning matrix on `kollisionsmatrix.html`, but each cell shows `akzeptiert / gesamt` color-coded (`cell-done` emerald `#d1fae5`, `cell-pending` amber `#fef08a`, `cell-zero` emerald). Vertical column headers at 80 px height, same group-label row at the top, same row labels on the left. Click a cell → drill into that cell's clash list.
- **Einzelauswertung clash list** — per-cell collisions with checkbox + ID (mono `CLASH [n]` / `INCLUSION [n]`) + description + position (mono tabular nums) + volume + status pill + comment. All status badges in production colors (`Kritisch · Offen` red, `Offen` amber, `Zugewiesen` indigo, `Akzeptiert` / `Resolved` green, `Ignoriert` gray).

## Target files

| File | What | Action |
|---|---|---|
| `modules/vdc-tools/kollisionsmatrix-auswertung.html` | The new page | **NEW** — drop in as-is, slightly adapted (see below) |
| `modules/vdc-tools/kollisionsmatrix.html` | Existing page | Modify the `loadHistoryRun()` and `populateHistory()` functions to navigate to the new page instead of rendering inline |

## Reference

Open `_reference.html` in this folder. It contains realistic-looking sample data (28 collisions, 18 accepted, 7 open, 3 ignored, 9-model matrix grouped BRG/ARC/STA/HLK). For production, replace the inline sample data with real values from `vdcApp`.

## How to land it

### Step 1: Add the new page

Copy `_reference.html` to `modules/vdc-tools/kollisionsmatrix-auswertung.html`. Then:

1. **Strip the hardcoded sample data.** The block starting `<script>` near the bottom contains the sample matrix and clash list. Replace it with code that reads the run ID from `?runId=…` in the URL, then calls the same VDC Manager APIs the inline panel currently uses (`vdcApp.getContainedElements`, `vdcApp.getPropertyValue` for `cpName / Status / Kollisionsnachbereitung / Comment`, etc.).
2. **Update the back button.** The reference points to `../ui_kits/bim-tools/index.html` — change it to `kollisionsmatrix.html`.
3. **Update the breadcrumbs** — keep `Kollisionsmatrix / Prüfungshistorie / <run name>` but pull the run name from the loaded data.
4. **Logo path** — the reference uses `../assets/emch-berger-logo.gif`. Change to `../../shared/assets/emch-berger-logo.gif`.
5. **Wire the close button** in the Einzelauswertung panel to hide that panel (return to "no cell selected" state).
6. **Wire cell click** in the Auswertungsmatrix to load the corresponding clash run into the Einzelauswertung panel (existing logic in `showClashRun(row, col)` should mostly carry over).
7. **Wire the row click** in the clash list to call `vdcApp.selectElement(clashId)` (already done in the existing `#detailPanel` handler).

### Step 2: Modify `kollisionsmatrix.html`

In `populateHistory()` (around line 2205) — currently each row has three buttons (`Auswertung anzeigen` / `Bearbeiten` / `Löschen`). Make the **whole row clickable** to navigate to the new page:

```js
// Find the line that builds <tr> inside populateHistory():
html += '<tr style="cursor:pointer;" onclick="openAuswertung(' + i + ')">';
```

Add an `openAuswertung(index)` function near `loadHistoryRun()`:

```js
function openAuswertung(index) {
    var entry = runHistory[index];
    if (!entry) return;
    window.location.href = 'kollisionsmatrix-auswertung.html?runId=' + encodeURIComponent(entry.runId);
}
```

You can **keep** the existing `loadHistoryRun()` function as-is for the "Bearbeiten" flow (it does different work — it loads a past run's matrix state into the planning matrix for editing). Just stop the row-onclick from triggering when the user clicks one of the row's inner buttons:

```js
html += '<button class="btn btn-primary" onclick="event.stopPropagation(); editHistoryRun(' + i + ')" …>';
```

Apply `event.stopPropagation()` to all three inner-row buttons.

### Step 3: Decide what to do with `#auswertungPanel` and `#detailPanel`

The existing `#auswertungPanel` and `#detailPanel` blocks in `kollisionsmatrix.html` are now superseded. Two options:

- **Option A (clean)** — Delete the `<div class="panel hidden" id="auswertungPanel">…</div>` and `<div class="panel hidden" id="detailPanel">…</div>` markup, and the `renderAuswertung()` / `showClashRun()` functions that fill them. Their logic now lives in the new page.
- **Option B (safe)** — Leave them in place; they're hidden by default and no longer reachable. Mark the JS functions with `// TODO: remove after Auswertung migration is verified in production`. Remove them later in a separate commit.

Recommended: **Option B for the first deployment, Option A after a week of production validation.**

## VDC Manager gate

The new page is one more file under `modules/vdc-tools/`, so it goes through `gate.html` like the others — the gate JS in `gate.html` already redirects based on the `?tool=` query param, but the new page doesn't have a tool key. To handle direct access:

- **Recommended:** the new page is only ever reached *from* `kollisionsmatrix.html` (via the row click). Since the user is already inside the VDC Manager by then, the new page can skip the gate check entirely — it has no Qt dependency check, it just renders the data passed via `?runId=…`.
- If the page does need the gate, add `?tool=kollisionsmatrix-auswertung` to `toolFiles` map in `gate.html` and link from history rows via the gate.

## Verification

1. Open `kollisionsmatrix.html` inside the VDC Manager. The page renders as before.
2. Run a Prüfung, save it. A row appears in Prüfungshistorie.
3. Click anywhere on that row (not on the action buttons). You should navigate to the new `kollisionsmatrix-auswertung.html` page with the run loaded.
4. The page should show: donut, stats column, eckdaten column, the auswertungs-matrix at the same cell dimensions as the planning matrix, and the einzelauswertung panel (initially showing the first cell with data).
5. Click another cell in the auswertungs-matrix — the einzelauswertung panel updates to show that cell's clashes.
6. Click a clash row — the corresponding element should highlight in the 3D viewer (existing behavior).
7. Click the back arrow in the header — return to `kollisionsmatrix.html`.
8. The "Bearbeiten" and "Löschen" buttons on history rows continue to do what they did before (because of `event.stopPropagation()`).

## What does NOT change

- The planning matrix on `kollisionsmatrix.html`
- The Kürzel-Index picker
- The "Prüfung starten" / Container logic
- The Protokoll (log) console
- `agent.html`, `lichtraumprofil.html`, `gate.html`
- Any `shared/css/*.css` or `shared/js/*.js`
