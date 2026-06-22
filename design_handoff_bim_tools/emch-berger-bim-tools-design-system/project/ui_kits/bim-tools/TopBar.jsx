/* TopBar — sticky header used on every authenticated page in the corp shell.
   Brand (logo + name + sublabel) · breadcrumbs · user chip + logout. */

const TopBar = ({ crumbs = [], user, onLogout, onNavigate }) => {
    const initials = (user?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const role = (user?.role || 'viewer').toLowerCase();

    return (
        <header className="app-top">
            <div className="app-top-inner">
                <a className="app-top-brand" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('hub'); }} href="#hub">
                    <img className="app-top-mark" src="../../assets/emch-berger-logo.gif" alt="Emch+Berger"/>
                    <div>
                        <div className="app-top-name">BIM Tools</div>
                        <div className="app-top-sub">Bauprojekt-Koordination</div>
                    </div>
                </a>

                <nav className="app-crumbs" aria-label="Navigation">
                    {crumbs.map((c, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <span className="sep">/</span>}
                            {c.to
                                ? <a href={'#' + c.to} onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(c.to); }}>{c.label}</a>
                                : <span className="here">{c.label}</span>}
                        </React.Fragment>
                    ))}
                </nav>

                <div className="app-top-right">
                    {user && (
                        <button className="user-chip" title="Profil & Passwort">
                            <span className="avatar">{initials}</span>
                            <span>{user.name}</span>
                            <span className={'role-dot ' + role} title={role}></span>
                        </button>
                    )}
                    {onLogout && (
                        <IconButton icon={<Icons.Logout size={16} sw={2}/>} label="Abmelden" onClick={onLogout} danger/>
                    )}
                </div>
            </div>
        </header>
    );
};

window.TopBar = TopBar;
