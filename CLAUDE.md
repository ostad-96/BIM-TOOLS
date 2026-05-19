# ACC — Bauprojekt-Koordination

A modular BIM coordination platform inspired by Autodesk Construction Cloud (ACC), built for Emch+Berger GmbH. Standalone HTML/JS app — no server, no build step. Data persists in IndexedDB via an abstraction layer designed for future REST API swap.

## Architecture

- `shared/` — Design system (CSS custom properties, component library) and JS infrastructure (storage abstraction, IndexedDB provider, UI helpers, utilities)
- `modules/` — Each feature is a self-contained module with its own HTML views, CSS, and JS
- All files use vanilla JS, no frameworks, no bundler
- German UI language, Emch+Berger brand palette (`#003B4D`)

## Modules

### Besprechungsserien (Meeting Minutes) — `modules/meeting-minutes/`
Forma-style meeting series where discussion items persist across sessions and accumulate chronological updates:
- **Series model**: Recurring meeting concept with configurable topic categories, custom fields, and status options
- **Instances**: Individual sessions within a series, auto-numbered, with participant tracking
- **Discussion items**: Persistent across instances, organized by numbered topic categories (e.g., 01 Organisatorisches)
- **Update timeline**: Chronological dated log entries on each item — the core Forma feature
- **Participants**: Split into Organisatoren and Eingeladene, with presence tracking
- **Custom fields**: Configurable per series (text, date, number, select types), stored as key-value on items
- **File attachments**: Stored as blobs in IndexedDB (25MB per-file limit)
- **User identity**: Dropdown of participants, future-proofed for auth integration
- **4 built-in templates**: BIM-Koordination, Planungsbesprechung, Baustellenbesprechung, Abnahme
- **Print view**: Matches Autodesk Forma PDF export layout

Views:
- `index.html` — Series list with search/filter
- `series-editor.html` — Series configuration (categories, custom fields, status options, default participants, instances)
- `instance-editor.html` — Main editing surface with tabs: Kopfdaten & Teilnehmer, Besprechungsdiskussion, Übersicht
- `meeting-view.html` — Forma-style print/PDF view

### Planned modules (stubs in hub)
- Issuemanagement
- Dokumentenmanagement
- BIM-Koordination

## Data Layer

`ACC.StorageManager` singleton wraps an `ACC.StorageProvider` interface. Currently backed by `ACC.IndexedDBProvider`. To swap to a server: implement the same interface in `acc-storage-rest.js` and change one init call.

IndexedDB v2 stores: `meetingSeries`, `meetingInstances`, `participants`, `discussionItems`, `discussionUpdates`, `attachments`, `seriesTemplates`, `userProfiles`.

## Running

Open `index.html` in a browser. No server required.
