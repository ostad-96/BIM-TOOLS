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
