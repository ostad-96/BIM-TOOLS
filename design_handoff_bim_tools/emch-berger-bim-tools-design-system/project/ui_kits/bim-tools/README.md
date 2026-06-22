# BIM Tools — UI Kit

A high-fidelity recreation of **Emch+Berger BIM Tools** as small React JSX components, mounted into a working click-thru in [`index.html`](./index.html).

This is **not production code** — it is a faithful-looking shell that lets you drop screens into mocks, decks, prototypes and pitch artifacts and have them feel like the real product. All visuals load the live product CSS from `../../shared/css/acc-*.css`, so as the product evolves the kit follows.

## Run

Open `index.html`. The flow:

1. **Login** — type any username + any password, press *Anmelden* (or hit Enter). Use a username containing `admin` to land as an admin.
2. **Hub** — module launcher with greeting + stats. Click *Sitzungsprotokolle* (the only enabled production module besides the active VDC tiles).
3. **Sitzungsprotokolle** — list of Besprechungsserien. Search, filter by type, click a row.
4. **Series detail** — tabs: Übersicht / Sitzungen / Themen / Teilnehmer / Anhänge. *Themen* shows the chronological-updates pattern that defines the product.
5. **Administration** — sidebar with Benutzer / Aktivitäten / Zugriffsrechte (admin tile shows only for admin users).

The bottom-right floating banner is part of the kit, not the product.

## Components

| File | What it gives you |
|---|---|
| `Icons.jsx` | The full local icon set as React components (`<Icons.Calendar/>`, `<Icons.Folder/>`, …). Hand-drawn stroked SVGs at 24×24, currentColor. |
| `Buttons.jsx` | `<Button>`, `<IconButton>`, `<BackLink>`. Wraps `.btn / .btn-primary / .btn-ghost / .btn-danger` from `acc-corporate.css`. |
| `Pills.jsx` | `<Pill>` and `<StatusPill>` with the full German status palette (`entwurf / aktiv / erledigt / hoch / …`). |
| `TopBar.jsx` | Sticky topbar with logo, breadcrumbs, user chip + logout. |
| `FeatureStrip.jsx` | `<FeatureStrip>` (the brand-gradient hub greeting) and `<StatCard>`. |
| `ModuleTile.jsx` | `<ModuleTile>`, `<ModuleGrid>`, `<SectionHeader>` — the hub's identity. |
| `PageHero.jsx` | `<PageHero>`, `<Toolbar>`, `<SearchInput>` — what sits below the topbar on list pages. |
| `Sidebar.jsx` | The admin left rail (240 px, brand mark, active = brand fill). |
| `App.jsx` | Tiny router (no library) that wires the screens together. |
| `screens/LoginScreen.jsx` | Particles canvas + brand aside + form. |
| `screens/HubScreen.jsx` | The authenticated landing page. |
| `screens/MeetingMinutesScreen.jsx` | Series list with sample data. |
| `screens/SeriesDetailScreen.jsx` | Tabs, item cards with chronological updates, sittings table. |
| `screens/AdminScreen.jsx` | Sidebar + Benutzer / Aktivitäten views. |

## What's faithful, what's elided

**Faithful** — visual tokens, layout (max-width 1280, page padding 28/24/80), typography (Inter Tight / Inter / JetBrains Mono), the warm paper palette, hover/focus states, the gradient + radial-highlight motif on the hub strip and auth aside, the particles background on login, breadcrumbs with `/` separators, German vocabulary, the topbar backdrop blur.

**Elided** — auth & RBAC (PBKDF2 / brute-force lockout / sessions), real storage (IndexedDB vs JSON server), the meeting series editor and instance editor (very large in the real product), the VDC tools (Kollisionsmatrix, VDC Agent, Lichtraumprofil), print preview, attachments. These are flagged inline with "Nicht im UI-Kit abgebildet" empty states.

## Extending

Add a new screen:

```jsx
// screens/IssuesScreen.jsx
const IssuesScreen = ({ user, onNavigate, onLogout }) => (
    <React.Fragment>
        <TopBar user={user} onNavigate={onNavigate} onLogout={onLogout}
                crumbs={[{ label: 'Startseite', to: 'hub' }, { label: 'Issuemanagement' }]}/>
        <main className="app-page">
            <PageHero eyebrow="Issuemanagement" title="Pendenzen" desc="…"/>
            {/* …your composition… */}
        </main>
    </React.Fragment>
);
window.IssuesScreen = IssuesScreen;
```

Then add a `<script type="text/babel" src="screens/IssuesScreen.jsx"></script>` tag in `index.html` (before `App.jsx`) and a new route in `App.jsx`.

The cardinal rule when extending: **use the existing tokens and classes.** If a design needs a new color, add it to `colors_and_type.css` and reference it via `var(--…)` — never inline hexes.
