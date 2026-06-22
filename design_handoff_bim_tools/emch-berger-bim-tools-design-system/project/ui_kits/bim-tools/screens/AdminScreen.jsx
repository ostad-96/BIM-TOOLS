/* AdminScreen — admin portal with left sidebar + active view.
   Default view: Benutzerverwaltung (user list). */

const SAMPLE_USERS = [
    { name: 'Andrea Huber',     username: 'andrea.huber',     role: 'admin',  status: 'aktiv',     last: '13. Mai 2026, 08:42' },
    { name: 'Lukas Born',       username: 'lukas.born',       role: 'editor', status: 'aktiv',     last: '13. Mai 2026, 09:21' },
    { name: 'Mirjam Frei',      username: 'mirjam.frei',      role: 'editor', status: 'aktiv',     last: '12. Mai 2026, 17:08' },
    { name: 'Rolf Tschan',      username: 'rolf.tschan',      role: 'editor', status: 'aktiv',     last: '12. Mai 2026, 14:32' },
    { name: 'Beatrice Vogel',   username: 'b.vogel',          role: 'viewer', status: 'aktiv',     last: '10. Mai 2026, 11:14' },
    { name: 'Sandro Keller',    username: 's.keller',         role: 'viewer', status: 'archiviert', last: '04. Apr 2026, 16:55' },
];

const SAMPLE_ACTIVITY = [
    { ts: '13.05.2026 09:42', who: 'andrea.huber', action: 'update', target: 'series',   ref: 'SR-2026-014', detail: 'Themen aktualisiert' },
    { ts: '13.05.2026 09:21', who: 'lukas.born',   action: 'login',  target: 'system',   ref: '—',           detail: 'Erfolgreich angemeldet' },
    { ts: '13.05.2026 08:42', who: 'andrea.huber', action: 'login',  target: 'system',   ref: '—',           detail: 'Erfolgreich angemeldet' },
    { ts: '12.05.2026 17:08', who: 'mirjam.frei',  action: 'create', target: 'instance', ref: '014.07',     detail: 'Neue Sitzung erstellt' },
    { ts: '12.05.2026 14:32', who: 'rolf.tschan',  action: 'update', target: 'item',     ref: '3.02',       detail: 'Status → erledigt' },
];

const UsersView = () => (
    <React.Fragment>
        <PageHero
            eyebrow="Administration"
            title="Benutzerverwaltung"
            desc="Erstellen, bearbeiten und deaktivieren Sie Benutzerkonten. Rollen steuern den Zugriff auf einzelne Module."
            actions={
                <Button kind="primary" icon={<Icons.Plus size={15} sw={2.2}/>}>Neuer Benutzer</Button>
            }
        />

        <Toolbar count={`${SAMPLE_USERS.length} Konten`}>
            <SearchInput placeholder="Suchen nach Name oder Benutzernamen …"/>
            <select className="select" style={{ width: 160 }}>
                <option value="">Alle Rollen</option>
                <option>Admin</option><option>Editor</option><option>Viewer</option>
            </select>
        </Toolbar>

        <table className="tbl tbl-hover">
            <thead><tr>
                <th>Name</th><th>Benutzername</th><th style={{ width: 110 }}>Rolle</th>
                <th style={{ width: 110 }}>Status</th><th>Letzte Aktivität</th>
                <th style={{ width: 110, textAlign: 'right' }}>Aktionen</th>
            </tr></thead>
            <tbody>
                {SAMPLE_USERS.map(u => (
                    <tr key={u.username}>
                        <td><strong style={{ fontWeight: 600 }}>{u.name}</strong></td>
                        <td className="tbl-code">{u.username}</td>
                        <td><StatusPill status={u.role}/></td>
                        <td><StatusPill status={u.status === 'aktiv' ? 'aktiv' : 'archiviert'}/></td>
                        <td className="tbl-num tbl-muted">{u.last}</td>
                        <td style={{ textAlign: 'right' }}>
                            <IconButton icon={<Icons.Edit size={14}/>} label="Bearbeiten"/>
                            {' '}
                            <IconButton icon={<Icons.Trash size={14}/>} label="Deaktivieren" danger/>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </React.Fragment>
);

const ActivityView = () => (
    <React.Fragment>
        <PageHero
            eyebrow="Administration"
            title="Aktivitätsprotokoll"
            desc="Vollständiges Audit-Log aller Aktionen im System."
        />
        <table className="tbl">
            <thead><tr>
                <th>Zeitstempel</th><th>Benutzer</th><th>Aktion</th>
                <th>Objekt</th><th>Referenz</th><th>Details</th>
            </tr></thead>
            <tbody>
                {SAMPLE_ACTIVITY.map((a, i) => (
                    <tr key={i}>
                        <td className="tbl-code">{a.ts}</td>
                        <td>{a.who}</td>
                        <td><Pill kind={a.action === 'login' ? 'brand' : a.action === 'create' ? 'accent' : 'muted'}>{a.action}</Pill></td>
                        <td>{a.target}</td>
                        <td className="tbl-code">{a.ref}</td>
                        <td className="tbl-muted" style={{ fontSize: 12.5 }}>{a.detail}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </React.Fragment>
);

const AccessView = () => (
    <React.Fragment>
        <PageHero
            eyebrow="Administration"
            title="Zugriffsrechte"
            desc="Welche Benutzer dürfen welche Serien sehen und bearbeiten."
        />
        <div className="bim-empty-state">
            <h3>Nicht im UI-Kit abgebildet</h3>
            <p>Die Zugriffsmatrix ist Teil des produktiven Admin-Moduls. Diese Recreation beschränkt sich auf Benutzer und Aktivitäten.</p>
        </div>
    </React.Fragment>
);

const AdminScreen = ({ user, onNavigate, onLogout }) => {
    const [view, setView] = React.useState('users');

    return (
        <React.Fragment>
            <TopBar
                user={user}
                onLogout={onLogout}
                onNavigate={onNavigate}
                crumbs={[
                    { label: 'Startseite', to: 'hub' },
                    { label: 'Administration' },
                ]}
            />
            <div className="app-shell" style={{ minHeight: 'calc(100vh - 60px)' }}>
                <Sidebar
                    active={view}
                    onNavigate={(id) => id === 'hub' ? onNavigate('hub') : setView(id)}
                    onLogout={onLogout}
                    items={[
                        { id: 'users',    label: 'Benutzer',       icon: <Icons.User/> },
                        { id: 'activity', label: 'Aktivitäten',    icon: <Icons.Clock/> },
                        { id: 'access',   label: 'Zugriffsrechte', icon: <Icons.Shield/> },
                    ]}
                />
                <main className="app-page" style={{ paddingTop: 20 }}>
                    {view === 'users'    && <UsersView/>}
                    {view === 'activity' && <ActivityView/>}
                    {view === 'access'   && <AccessView/>}
                </main>
            </div>
        </React.Fragment>
    );
};

window.AdminScreen = AdminScreen;
