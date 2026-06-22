/* MeetingMinutesScreen — list of Besprechungsserien.
   PageHero + Toolbar (search + filter) + Table. Click row → SeriesDetail. */

const SAMPLE_SERIES = [
    { code: 'SR-2026-014', title: 'BIM-Koordination Brücke Nord',         type: 'BIM-Koordination',     last: '13. Mai 2026', status: 'aktiv',         open: 12, total: 17 },
    { code: 'SR-2026-009', title: 'Planungsbesprechung A14',              type: 'Planungsbesprechung',  last: '06. Mai 2026', status: 'aktiv',         open: 8,  total: 23 },
    { code: 'SR-2026-007', title: 'BIM-Koordination Hochbau Etappe 3',    type: 'BIM-Koordination',     last: '02. Mai 2026', status: 'aktiv',         open: 4,  total: 11 },
    { code: 'SR-2026-003', title: 'Baustellenbesprechung Tunnel Süd',     type: 'Baustellenbesprechung', last: '02. Mai 2026', status: 'entwurf',       open: 3,  total: 5  },
    { code: 'SR-2025-211', title: 'Abnahme Etappe 2',                     type: 'Abnahme',              last: '18. Apr 2026', status: 'abgeschlossen', open: 0,  total: 18 },
    { code: 'SR-2025-198', title: 'Planungsbesprechung Werkleitungen',    type: 'Planungsbesprechung',  last: '12. Apr 2026', status: 'aktiv',         open: 6,  total: 14 },
    { code: 'SR-2025-180', title: 'Baustellenbesprechung Brücke Nord',    type: 'Baustellenbesprechung', last: '02. Apr 2026', status: 'archiviert',    open: 0,  total: 29 },
];

const MeetingMinutesScreen = ({ user, onNavigate, onLogout, onOpenSeries }) => {
    const [query, setQuery] = React.useState('');
    const [filter, setFilter] = React.useState('');

    const rows = SAMPLE_SERIES.filter(r => {
        if (filter && r.type !== filter) return false;
        if (!query) return true;
        const q = query.toLowerCase();
        return r.code.toLowerCase().includes(q) || r.title.toLowerCase().includes(q);
    });

    const types = ['BIM-Koordination', 'Planungsbesprechung', 'Baustellenbesprechung', 'Abnahme'];

    return (
        <React.Fragment>
            <TopBar
                user={user}
                onLogout={onLogout}
                onNavigate={onNavigate}
                crumbs={[
                    { label: 'Startseite', to: 'hub' },
                    { label: 'Sitzungsprotokolle' },
                ]}
            />
            <main className="app-page">
                <PageHero
                    eyebrow="Sitzungsprotokolle"
                    title="Besprechungsserien"
                    desc="Wiederkehrende Besprechungen mit chronologischen Aktualisierungen pro Diskussionspunkt — alles an einem Ort."
                    actions={
                        <React.Fragment>
                            <select className="select" style={{ width: 220 }}>
                                <option value="">Aus Vorlage erstellen …</option>
                                {types.map(t => <option key={t}>{t}</option>)}
                            </select>
                            <Button kind="primary" icon={<Icons.Plus size={15} sw={2.2}/>}
                                    onClick={() => alert('Neue Serie — Editor nicht im UI-Kit abgebildet')}>
                                Neue Serie
                            </Button>
                        </React.Fragment>
                    }
                />

                <Toolbar count={`${rows.length} Serien`}>
                    <SearchInput
                        placeholder="Suchen nach Code oder Titel …"
                        value={query} onChange={setQuery}/>
                    <select className="select" style={{ width: 200 }}
                            value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="">Alle Typen</option>
                        {types.map(t => <option key={t}>{t}</option>)}
                    </select>
                </Toolbar>

                <table className="tbl tbl-hover">
                    <thead><tr>
                        <th style={{ width: 130 }}>Code</th>
                        <th>Titel</th>
                        <th style={{ width: 180 }}>Typ</th>
                        <th style={{ width: 140 }}>Letzte Sitzung</th>
                        <th style={{ width: 140 }}>Status</th>
                        <th style={{ width: 90, textAlign: 'right' }}>Offen</th>
                    </tr></thead>
                    <tbody>
                        {rows.map(r => (
                            <tr key={r.code} onClick={() => onOpenSeries && onOpenSeries(r)}>
                                <td className="tbl-code">{r.code}</td>
                                <td>{r.title}</td>
                                <td><Pill kind="brand">{r.type}</Pill></td>
                                <td className="tbl-num">{r.last}</td>
                                <td><StatusPill status={r.status}/></td>
                                <td className="tbl-num" style={{ textAlign: 'right' }}>
                                    <span style={{ color: r.open > 0 ? '#0e1719' : '#8a939a' }}>{r.open}</span>
                                    <span style={{ color: '#8a939a' }}> / {r.total}</span>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#8a939a' }}>
                                Keine Treffer für „{query}".
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </main>
        </React.Fragment>
    );
};

window.MeetingMinutesScreen = MeetingMinutesScreen;
window.SAMPLE_SERIES = SAMPLE_SERIES;
