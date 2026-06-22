/* Buttons — uses .btn / .btn-primary / .btn-ghost / .btn-danger from acc-corporate.css */

const Button = ({ kind = 'default', size, icon, children, onClick, type = 'button', style, ...rest }) => {
    const cls = ['btn'];
    if (kind === 'primary') cls.push('btn-primary');
    if (kind === 'ghost')   cls.push('btn-ghost');
    if (kind === 'danger')  cls.push('btn-danger');
    if (size === 'sm')      cls.push('btn-sm');
    if (size === 'lg')      cls.push('btn-lg');
    return (
        <button type={type} className={cls.join(' ')} onClick={onClick} style={style} {...rest}>
            {icon}
            {children}
        </button>
    );
};

const IconButton = ({ icon, label, onClick, danger, style }) => (
    <button
        className={'icon-btn' + (danger ? ' danger' : '')}
        title={label} aria-label={label}
        onClick={onClick} style={style}
    >{icon}</button>
);

const BackLink = ({ onClick, children }) => (
    <button className="back-link" onClick={onClick}>
        <Icons.ArrowLeft size={14} sw={2.2} />
        {children}
    </button>
);

window.Button = Button;
window.IconButton = IconButton;
window.BackLink = BackLink;
