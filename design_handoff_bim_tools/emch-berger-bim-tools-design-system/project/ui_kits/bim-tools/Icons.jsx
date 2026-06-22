/* ─────────────────────────────────────────────────────────────
   Icons — hand-tuned stroked SVGs, 24×24 viewBox, currentColor.
   stroke-width: 1.8 decorative · 2 functional · 2.2 arrows.
   Exported as <Icon name="…" /> + named React components.
   ───────────────────────────────────────────────────────────── */

const Svg = ({ children, size = 18, sw = 1.8, ...rest }) => (
    <svg viewBox="0 0 24 24" width={size} height={size}
         fill="none" stroke="currentColor" strokeWidth={sw}
         strokeLinecap="round" strokeLinejoin="round" {...rest}>{children}</svg>
);

const Icons = {
    Calendar: (p) => <Svg {...p}><rect x="3" y="4" width="18" height="17" rx="2"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="14" x2="13" y2="14"/><line x1="7" y1="17" x2="11" y2="17"/></Svg>,
    Clock: (p) => <Svg {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></Svg>,
    Alert: (p) => <Svg {...p}><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></Svg>,
    Folder: (p) => <Svg {...p}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></Svg>,
    Layers: (p) => <Svg {...p}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></Svg>,
    Grid: (p) => <Svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><line x1="10" y1="6.5" x2="14" y2="6.5"/><line x1="6.5" y1="10" x2="6.5" y2="14"/></Svg>,
    Robot: (p) => <Svg {...p}><rect x="6" y="3" width="12" height="11" rx="2.5"/><circle cx="10" cy="8.5" r="1" fill="currentColor"/><circle cx="14" cy="8.5" r="1" fill="currentColor"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="12" y1="14" x2="12" y2="17"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="3" y1="9" x2="6" y2="9"/><line x1="18" y1="9" x2="21" y2="9"/></Svg>,
    Bridge: (p) => <Svg {...p}><path d="M3 20h18"/><path d="M5 4c0 0 2 1 7 1s7-1 7-1v3c0 1-2 3-7 3s-7-2-7-3V4z"/><line x1="12" y1="11" x2="12" y2="20"/><line x1="9" y1="14" x2="15" y2="14"/></Svg>,
    User: (p) => <Svg {...p}><circle cx="12" cy="8" r="4"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/></Svg>,
    UserPlus: (p) => <Svg {...p}><path d="M12 15c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z"/><circle cx="12" cy="8" r="4"/><path d="M20 8v4m2-2h-4"/></Svg>,
    Shield: (p) => <Svg {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Svg>,
    Home: (p) => <Svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H10v7H5a2 2 0 0 1-2-2z"/></Svg>,
    Search: (p) => <Svg sw={2} {...p}><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></Svg>,
    Plus: (p) => <Svg sw={2} {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Svg>,
    Chevron: (p) => <Svg sw={2.2} {...p}><polyline points="9 18 15 12 9 6"/></Svg>,
    ChevronDown: (p) => <Svg sw={2.2} {...p}><polyline points="6 9 12 15 18 9"/></Svg>,
    ArrowLeft: (p) => <Svg sw={2.2} {...p}><line x1="20" y1="12" x2="4" y2="12"/><polyline points="10 18 4 12 10 6"/></Svg>,
    Close: (p) => <Svg sw={2} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>,
    Logout: (p) => <Svg sw={2} {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Svg>,
    Settings: (p) => <Svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Svg>,
    Activity: (p) => <Svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Svg>,
    Paperclip: (p) => <Svg sw={2} {...p}><path d="M21.4 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></Svg>,
    Eye: (p) => <Svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Svg>,
    Edit: (p) => <Svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Svg>,
    Trash: (p) => <Svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/><path d="M10 11v6M14 11v6"/></Svg>,
};

window.Icons = Icons;
