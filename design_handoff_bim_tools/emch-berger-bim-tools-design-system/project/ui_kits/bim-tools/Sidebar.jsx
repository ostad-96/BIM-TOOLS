/* Sidebar — the admin left rail.
   Brand mark + nav links + collapsible footer. */

const Sidebar = ({ active, items, onNavigate, onLogout, user }) => (
    <aside className="app-side">
        <div className="app-side-brand">
            <div className="mark">BT</div>
            <div>
                <div className="nm">BIM Tools</div>
                <div className="sub">Administration</div>
            </div>
        </div>

        <nav className="app-side-nav">
            {items.map((it) => (
                <a key={it.id}
                   href={'#' + it.id}
                   className={'app-side-link' + (active === it.id ? ' active' : '')}
                   onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(it.id); }}>
                    {it.icon}
                    {it.label}
                </a>
            ))}
        </nav>

        <div className="app-side-foot">
            <a className="app-side-link" href="#hub" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('hub'); }}>
                <Icons.Home/>
                Zurück zum Hub
            </a>
            {onLogout && (
                <a className="app-side-link" href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}>
                    <Icons.Logout/>
                    Abmelden
                </a>
            )}
        </div>
    </aside>
);

window.Sidebar = Sidebar;
