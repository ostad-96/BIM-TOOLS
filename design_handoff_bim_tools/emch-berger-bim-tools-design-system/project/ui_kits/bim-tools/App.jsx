/* App — top-level router for the BIM Tools click-thru.
   Routes: login → hub → sitzungen → series:CODE → admin. */

const App = () => {
    const [route, setRoute] = React.useState('login');
    const [series, setSeries] = React.useState(null);
    const [user, setUser] = React.useState(null);

    const go = (r) => {
        setRoute(r);
        window.scrollTo({ top: 0 });
    };

    const logout = () => {
        setUser(null);
        setSeries(null);
        go('login');
    };

    return (
        <React.Fragment>
            {route === 'login' && (
                <LoginScreen
                    onAuthenticated={(u) => { setUser(u); go('hub'); }}/>
            )}

            {route === 'hub' && user && (
                <HubScreen user={user} onNavigate={go} onLogout={logout}/>
            )}

            {route === 'sitzungen' && user && (
                <MeetingMinutesScreen
                    user={user}
                    onNavigate={go}
                    onLogout={logout}
                    onOpenSeries={(s) => { setSeries(s); go('series'); }}/>
            )}

            {route === 'series' && series && user && (
                <SeriesDetailScreen
                    series={series}
                    user={user}
                    onNavigate={go}
                    onLogout={logout}
                    onBack={() => go('sitzungen')}/>
            )}

            {route === 'admin' && user && (
                <AdminScreen user={user} onNavigate={go} onLogout={logout}/>
            )}
        </React.Fragment>
    );
};

window.App = App;
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
