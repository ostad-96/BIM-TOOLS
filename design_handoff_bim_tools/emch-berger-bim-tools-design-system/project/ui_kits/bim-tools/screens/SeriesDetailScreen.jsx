/* SeriesDetailScreen — opens when clicking a row in MeetingMinutesScreen.
   Series header + tabs (Übersicht / Sitzungen / Themen / Teilnehmer) +
   a Themen (discussion items) list with chronological updates. */

const SAMPLE_INSTANCES = [
    { nr: '014.07', date: '13. Mai 2026', time: '09:00–11:30', present: 6, status: 'abgeschlossen' },
    { nr: '014.06', date: '29. Apr 2026', time: '09:00–11:00', present: 7, status: 'abgeschlossen' },
    { nr: '014.05', date: '15. Apr 2026', time: '09:00–10:30', present: 5, status: 'abgeschlossen' },
    { nr: '014.04', date: '02. Apr 2026', time: '09:00–11:15', present: 6, status: 'abgeschlossen' },
];

const SAMPLE_ITEMS = [
    {
        id: '1.04', topic: 'Koordination', priority: 'hoch', status: 'in_bearbeitung',
        title: 'Kollision Lüftungskanal ↔ Statik Achse C/12',
        owner: 'M. Frei',
        updates: [
            { date: '13.05.2026', by: 'M. Frei', text: 'Neue Variante mit Umlenkung; Statiker prüft bis 20.05.' },
            { date: '29.04.2026', by: 'L. Born', text: 'Kollision lokalisiert in Sub-Modell HLK-2.1.' },
        ],
    },
    {
        id: '2.11', topic: 'Planlieferung', priority: 'mittel', status: 'offen',
        title: 'Bewehrungspläne Bodenplatte Phase 2 ausstehend',
        owner: 'A. Huber',
        updates: [
            { date: '13.05.2026', by: 'A. Huber', text: 'Lieferung verschoben auf KW 21. Tragwerk informiert.' },
        ],
    },
    {
        id: '3.02', topic: 'Abnahme', priority: 'niedrig', status: 'erledigt',
        title: 'Begehung Treppenhaus C — Mängelliste',
        owner: 'R. Tschan',
        updates: [
            { date: '06.05.2026', by: 'R. Tschan', text: 'Alle 14 Punkte erledigt und visuell abgenommen.' },
        ],
    },
];

const ItemCard = ({ item }) => (
    <div className="bim-card" style={{ marginBottom: 12 }}>
        <div className="bim-card-body" style={{ padding: 16 }}>
            <div className="hstack" style={{ marginBottom: 6, gap: 8 }}>
                <span className="mono" style={{ color: '#8a939a', fontSize: 11 }}>#{item.id}</span>
                <Pill kind="brand">{item.topic}</Pill>
                <StatusPill status={item.status}/>
                <Pill kind={item.priority}>Priorität: {item.priority}</Pill>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#5d676e' }}>
                    Zuständig: <strong style={{ color: '#0e1719', fontWeight: 600 }}>{item.owner}</strong>
                </span>
            </div>
            <h3 style={{ fontFamily: 'Inter Tight', fontSize: 15, fontWeight: 600, color: '#0e1719', margin: '4px 0 12px' }}>
                {item.title}
            </h3>
            <div style={{ borderLeft: '2px solid #e6e3dc', paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {item.updates.map((u, i) => (
                    <div key={i}>
                        <div style={{ fontSize: 11, color: '#8a939a', fontFamily: 'JetBrains Mono', marginBottom: 2 }}>
                            {u.date} · {u.by}
                        </div>
                        <div style={{ fontSize: 13, color: '#0e1719', lineHeight: 1.55 }}>{u.text}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const SeriesDetailScreen = ({ series, user, onNavigate, onLogout, onBack }) => {
    const [tab, setTab] = React.useState('themen');

    return (
        <React.Fragment>
            <TopBar
                user={user}
                onLogout={onLogout}
                onNavigate={onNavigate}
                crumbs={[
                    { label: 'Startseite', to: 'hub' },
                    { label: 'Sitzungsprotokolle', to: 'sitzungen' },
                    { label: series.code },
                ]}
            />
            <main className="app-page">
                <div style={{ marginBottom: 12 }}>
                    <BackLink onClick={onBack}>Zurück zu Serien</BackLink>
                </div>

                <PageHero
                    eyebrow={series.type}
                    title={series.title}
                    desc={`Code ${series.code} · Letzte Sitzung ${series.last} · ${SAMPLE_INSTANCES.length} Sitzungen erfasst`}
                    actions={
                        <React.Fragment>
                            <Button kind="ghost" icon={<Icons.Eye size={15}/>}>Druckvorschau</Button>
                            <Button kind="primary" icon={<Icons.Plus size={15} sw={2.2}/>}
                                    onClick={() => alert('Neue Sitzung — Editor nicht im UI-Kit abgebildet')}>
                                Neue Sitzung
                            </Button>
                        </React.Fragment>
                    }
                />

                <div className="bim-tabs" style={{ marginBottom: 16, padding: 0, background: 'transparent', position: 'static' }}>
                    {[
                        { id: 'uebersicht', label: 'Übersicht' },
                        { id: 'sitzungen',  label: 'Sitzungen' },
                        { id: 'themen',     label: `Themen · ${SAMPLE_ITEMS.length}` },
                        { id: 'teilnehmer', label: 'Teilnehmer' },
                        { id: 'anhaenge',   label: 'Anhänge' },
                    ].map(t => (
                        <button key={t.id} className={'bim-tab' + (tab === t.id ? ' active' : '')}
                                onClick={() => setTab(t.id)}>{t.label}</button>
                    ))}
                </div>

                {tab === 'themen' && (
                    <div>{SAMPLE_ITEMS.map(it => <ItemCard key={it.id} item={it}/>)}</div>
                )}

                {tab === 'sitzungen' && (
                    <table className="tbl">
                        <thead><tr><th>Nr.</th><th>Datum</th><th>Zeit</th><th>Anwesend</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                            {SAMPLE_INSTANCES.map(s => (
                                <tr key={s.nr}>
                                    <td className="tbl-code">{s.nr}</td>
                                    <td>{s.date}</td>
                                    <td className="tbl-num">{s.time}</td>
                                    <td className="tbl-num">{s.present} Personen</td>
                                    <td><StatusPill status={s.status}/></td>
                                    <td style={{ textAlign: 'right' }}><Button kind="ghost" size="sm">Öffnen</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {tab === 'uebersicht' && (
                    <div className="bim-card"><div className="bim-card-body">
                        <p className="ds-body-secondary" style={{ marginBottom: 12 }}>
                            Diese Serie koordiniert die BIM-Modelle für das Bauvorhaben <strong style={{ color: '#0e1719' }}>{series.title}</strong>.
                            Sie tagt im 14-Tage-Rhythmus und wird vom Planerteam von Emch+Berger geleitet.
                        </p>
                        <div className="stat-grid">
                            <StatCard label="Sitzungen" value={SAMPLE_INSTANCES.length} sub="Erfasst seit 2025"/>
                            <StatCard label="Themen" value={SAMPLE_ITEMS.length} sub="Davon 1 offen, 1 in Bearbeitung"/>
                            <StatCard label="Teilnehmer" value="7" sub="3 Organisatoren · 4 Eingeladene"/>
                            <StatCard label="Anhänge" value="14" sub="124 MB gesamt"/>
                        </div>
                    </div></div>
                )}

                {(tab === 'teilnehmer' || tab === 'anhaenge') && (
                    <div className="bim-empty-state">
                        <h3>Nicht im UI-Kit abgebildet</h3>
                        <p>Dieser Tab ist Teil des produktiven Moduls — diese Recreation deckt nur Übersicht, Sitzungen und Themen ab.</p>
                    </div>
                )}
            </main>
        </React.Fragment>
    );
};

window.SeriesDetailScreen = SeriesDetailScreen;
