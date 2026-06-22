/* PageHero — eyebrow + title + description + right-side actions.
   Used inside .app-page on every non-hub authenticated page. */

const PageHero = ({ eyebrow, title, desc, actions }) => (
    <div className="page-hero">
        <div className="page-hero-l">
            {eyebrow && <div className="page-hero-eyebrow">{eyebrow}</div>}
            <h1 className="page-hero-title">{title}</h1>
            {desc && <p className="page-hero-desc">{desc}</p>}
        </div>
        {actions && <div className="page-hero-r">{actions}</div>}
    </div>
);

/* Toolbar — filter bar that sits under PageHero on list pages.
   Hosts a search box, selects, and a right-aligned count. */
const Toolbar = ({ children, count }) => (
    <div className="toolbar">
        {children}
        {count !== undefined && <span className="count">{count}</span>}
    </div>
);

const SearchInput = ({ placeholder, value, onChange, width = 280 }) => (
    <div className="search-wrap" style={{ width }}>
        <Icons.Search size={15} sw={2}/>
        <input
            className="input"
            type="text"
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
        />
    </div>
);

window.PageHero = PageHero;
window.Toolbar = Toolbar;
window.SearchInput = SearchInput;
