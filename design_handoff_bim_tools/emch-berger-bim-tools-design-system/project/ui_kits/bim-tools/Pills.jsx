/* Pills — domain-coded badges for statuses and roles.
   Uses .pill .pill-{kind} from acc-corporate.css plus inline color overrides
   for the German status palette (offen / in_bearbeitung / erledigt etc.). */

const PILL_PALETTE = {
    entwurf:        { bg: '#f3f4f6', fg: '#6b7280' },
    aktiv:          { bg: '#dbeafe', fg: '#2563eb' },
    abgeschlossen:  { bg: '#d1fae5', fg: '#059669' },
    archiviert:     { bg: '#f3f4f6', fg: '#9ca3af' },
    offen:          { bg: '#dbeafe', fg: '#2563eb' },
    in_bearbeitung: { bg: '#fef3c7', fg: '#d97706' },
    erledigt:       { bg: '#d1fae5', fg: '#059669' },
    storniert:      { bg: '#f3f4f6', fg: '#9ca3af' },
    hoch:           { bg: '#fee2e2', fg: '#dc2626' },
    mittel:         { bg: '#fef3c7', fg: '#d97706' },
    niedrig:        { bg: '#d1fae5', fg: '#059669' },
    admin:          { bg: '#ede9fe', fg: '#7c3aed' },
    editor:         { bg: '#dbeafe', fg: '#2563eb' },
    viewer:         { bg: '#f3f4f6', fg: '#6b7280' },
    brand:          { bg: '#e6ecef', fg: '#003B4D' },
    accent:         { bg: '#fdf3e4', fg: '#b45309' },
    muted:          { bg: '#f4f3ee', fg: '#8a939a' },
};

const STATUS_LABEL = {
    entwurf: 'Entwurf', aktiv: 'Aktiv', abgeschlossen: 'Abgeschlossen', archiviert: 'Archiviert',
    offen: 'Offen', in_bearbeitung: 'In Bearbeitung', erledigt: 'Erledigt', storniert: 'Storniert',
    hoch: 'Hoch', mittel: 'Mittel', niedrig: 'Niedrig',
    admin: 'Admin', editor: 'Editor', viewer: 'Viewer',
};

const Pill = ({ kind = 'muted', children, dot, style }) => {
    const p = PILL_PALETTE[kind] || PILL_PALETTE.muted;
    return (
        <span className="pill" style={{ background: p.bg, color: p.fg, ...style }}>
            {dot && <span className="dot" />}
            {children || STATUS_LABEL[kind] || kind}
        </span>
    );
};

const StatusPill = ({ status, dot = true }) => <Pill kind={status} dot={dot} />;

window.Pill = Pill;
window.StatusPill = StatusPill;
window.PILL_PALETTE = PILL_PALETTE;
