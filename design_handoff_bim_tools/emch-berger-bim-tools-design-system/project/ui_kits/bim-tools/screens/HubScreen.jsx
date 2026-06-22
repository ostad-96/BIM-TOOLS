/* HubScreen — the authenticated landing page.
   FeatureStrip greeting · Projektmanagement modules · VDC Manager modules. */

const HubScreen = ({ user, onNavigate, onLogout }) => {
    const hour = new Date().getHours();
    const greet = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
    const firstName = (user?.name || '').split(' ')[0];
    const today = new Date();
    const months = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
    const weekday = today.toLocaleDateString('de-DE', { weekday: 'long' });

    return (
        <React.Fragment>
            <TopBar
                user={user}
                onLogout={onLogout}
                onNavigate={onNavigate}
                crumbs={[{ label: 'Startseite' }]}
            />
            <main className="app-page">
                <FeatureStrip
                    eyebrow="Willkommen"
                    headline={`${greet}, ${firstName}.`}
                    stats={[
                        { value: 128,    label: 'Serien' },
                        { value: '1 042', label: 'Sitzungen' },
                        { value: 37,     label: 'Offene Themen' },
                        { value: `${today.getDate()}. ${months[today.getMonth()]}`, label: weekday },
                    ]}
                />

                <SectionHeader title="Projektmanagement" sub="Koordination & Dokumentation"/>

                <ModuleGrid>
                    <ModuleTile
                        icon={<Icons.Calendar/>}
                        label="Sitzungsprotokolle"
                        desc="Besprechungsserien, Tagesordnungen und chronologische Nachverfolgung"
                        onClick={() => onNavigate('sitzungen')}/>
                    <ModuleTile
                        icon={<Icons.Alert/>}
                        label="Issuemanagement"
                        desc="Pendenzenverwaltung, Aufgaben­zuweisung und Nachverfolgung"
                        disabled/>
                    <ModuleTile
                        icon={<Icons.Folder/>}
                        label="Dokumentenmanagement"
                        desc="Planlieferungen, Versions­geschichte und Dokumentenablage"
                        disabled/>
                    <ModuleTile
                        icon={<Icons.Layers/>}
                        label="BIM-Koordination"
                        desc="Modell­koordination, Kollisions­prüfungen und Freigabe­läufe"
                        disabled/>
                    {user?.role === 'admin' && (
                        <ModuleTile
                            icon={<Icons.UserPlus/>}
                            tag="admin"
                            label="Administration"
                            desc="Benutzer­verwaltung, Zugriffsrechte und Aktivitäts­protokoll"
                            accentColor={{ bg: '#ede9fe', fg: '#7c3aed' }}
                            onClick={() => onNavigate('admin')}/>
                    )}
                </ModuleGrid>

                <SectionHeader title="VDC Manager" sub="desite BIM · Modellwerkzeuge" style={{ marginTop: 36 }}/>

                <ModuleGrid>
                    <ModuleTile
                        icon={<Icons.Grid/>}
                        label="Kollisionsmatrix"
                        desc="Kollisions­prüfung zwischen BIM-Modellen konfigurieren und durchführen"
                        onClick={() => { window.location.href = '../../vdc_tools/kollisionsmatrix.html'; }}/>
                    <ModuleTile
                        icon={<Icons.Robot/>}
                        label="VDC Agent"
                        desc="KI-gestützter Assistent für Modellabfragen und Element­auswertung"
                        onClick={() => { window.location.href = '../../vdc_tools/agent.html'; }}/>
                    <ModuleTile
                        icon={<Icons.Bridge/>}
                        label="Lichtraumprofil"
                        desc="Minimale vertikale Distanz zwischen Brücken­unterseite und Strassen­oberfläche berechnen"
                        onClick={() => { window.location.href = '../../vdc_tools/lichtraumprofil.html'; }}/>
                </ModuleGrid>
            </main>
        </React.Fragment>
    );
};

window.HubScreen = HubScreen;
