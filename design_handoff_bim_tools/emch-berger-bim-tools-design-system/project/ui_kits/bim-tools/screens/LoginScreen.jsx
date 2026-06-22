/* LoginScreen — centered card on a textured brand canvas.
   Mirrors preview/components-auth.html exactly: floating labels,
   disabled-until-typed primary button (pure CSS via :has()),
   centered "Passwort vergessen?" below the button. */

const LoginScreen = ({ onAuthenticated }) => {
    const [usr, setUsr] = React.useState('');
    const [pw,  setPw]  = React.useState('');
    const [err, setErr] = React.useState('');
    const [pending, setPending] = React.useState(false);

    const armed = usr.trim().length > 0;

    const submit = (e) => {
        if (e) e.preventDefault();
        if (!armed) return;
        if (!pw) { setErr('Bitte Passwort eingeben.'); return; }
        setErr('');
        setPending(true);
        setTimeout(() => {
            onAuthenticated && onAuthenticated({
                name: usr.includes('.')
                    ? usr.split('.').map(s => s[0].toUpperCase() + s.slice(1)).join(' ')
                    : usr[0].toUpperCase() + usr.slice(1),
                username: usr,
                role: usr.toLowerCase().includes('admin') ? 'admin' : 'editor',
            });
        }, 380);
    };

    return (
        <div className="login-stage">
            <div>
                <form className="login-shell" onSubmit={submit}>
                    <div className="login-brand">
                        <div className="mk">
                            <img src="../../assets/emch-berger-logo.gif" alt="Emch+Berger"/>
                        </div>
                        <div className="nm">
                            BIM Tools
                            <span className="sub">Bauprojekt-Koordination</span>
                        </div>
                    </div>

                    {err && <div className="login-err">{err}</div>}

                    <div className="f-row">
                        <div className="fl">
                            <input
                                className="input usr-input"
                                id="login-usr"
                                type="text"
                                value={usr}
                                onChange={(e) => setUsr(e.target.value)}
                                placeholder=" "
                                autoFocus
                                autoComplete="username"/>
                            <label className="lbl" htmlFor="login-usr">Benutzername</label>
                        </div>
                    </div>

                    <div className="f-row">
                        <div className="fl">
                            <input
                                className="input"
                                id="login-pw"
                                type="password"
                                value={pw}
                                onChange={(e) => setPw(e.target.value)}
                                placeholder=" "
                                autoComplete="current-password"/>
                            <label className="lbl" htmlFor="login-pw">Passwort</label>
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={!armed || pending}>
                        {pending ? 'Wird geprüft …' : 'Anmelden'}
                        {!pending && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>
                            </svg>
                        )}
                    </button>

                    <a href="#" className="login-forgot" onClick={(e) => { e.preventDefault(); alert('Passwort-Rücksetzung — nicht im UI-Kit abgebildet.'); }}>
                        Passwort vergessen?
                    </a>
                </form>

                <div className="login-foot">
                    EMCH+BERGER<span className="sep">·</span>BIM TOOLS<span className="sep">·</span>v1.0
                </div>
            </div>
        </div>
    );
};

window.LoginScreen = LoginScreen;
