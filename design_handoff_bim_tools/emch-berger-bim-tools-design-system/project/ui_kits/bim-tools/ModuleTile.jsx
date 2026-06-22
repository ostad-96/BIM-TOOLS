/* ModuleTile — the big launcher tile on the hub.
   Variants: active (anchor) | disabled (stub "Bald") | admin (purple accent). */

const ModuleTile = ({ icon, label, desc, tag = 'active', disabled, onClick, accentColor }) => {
    if (disabled) {
        return (
            <div className="module-tile disabled">
                <span className="module-tile-tag soon">Bald</span>
                <div className="module-tile-icon">{icon}</div>
                <div>
                    <div className="module-tile-label">{label}</div>
                    <div className="module-tile-desc">{desc}</div>
                </div>
            </div>
        );
    }

    const tagCls = 'module-tile-tag ' + (tag === 'admin' ? 'admin' : 'active');
    const iconStyle = accentColor
        ? { background: accentColor.bg, color: accentColor.fg }
        : undefined;

    return (
        <a className="module-tile" href="#" onClick={(e) => { e.preventDefault(); onClick && onClick(); }}>
            <span className={tagCls}>{tag === 'admin' ? 'Admin' : 'Aktiv'}</span>
            <div className="module-tile-icon" style={iconStyle}>{icon}</div>
            <div>
                <div className="module-tile-label">{label}</div>
                <div className="module-tile-desc">{desc}</div>
            </div>
            <div className="module-tile-arrow"><Icons.Chevron size={14}/></div>
        </a>
    );
};

const ModuleGrid = ({ children }) => <div className="module-grid">{children}</div>;

/* Section header — the title + caps sublabel pattern used to break up the hub. */
const SectionHeader = ({ title, sub, style }) => (
    <div className="section-h" style={style}>
        <h2 className="section-h-title">{title}</h2>
        {sub && <span className="section-h-sub">{sub}</span>}
    </div>
);

window.ModuleTile = ModuleTile;
window.ModuleGrid = ModuleGrid;
window.SectionHeader = SectionHeader;
