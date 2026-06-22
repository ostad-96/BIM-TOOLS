/* FeatureStrip — the brand-gradient greeting block on the hub.
   Eyebrow + headline + four right-aligned stats. */

const FeatureStrip = ({ eyebrow = 'Willkommen', headline, stats = [] }) => (
    <div className="hub-feature-strip">
        <div className="hub-feature-l">
            <div className="ey">{eyebrow}</div>
            <div className="ti">{headline}</div>
        </div>
        {stats.map((s, i) => (
            <div className="hub-feature-stat" key={i}>
                <div className="v">{s.value}</div>
                <div className="k">{s.label}</div>
            </div>
        ))}
    </div>
);

/* Stat card — for non-hero pages (admin overview etc).
   Uses .stat / .stat-icon / .stat-value / .stat-label from acc-corporate.css. */
const StatCard = ({ icon, label, value, sub }) => (
    <div className="stat">
        {icon && <div className="stat-icon">{icon}</div>}
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
    </div>
);

window.FeatureStrip = FeatureStrip;
window.StatCard = StatCard;
