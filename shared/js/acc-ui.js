var BIM = BIM || {};

BIM.UI = {
    /* ── Corporate top bar (shared across all pages) ──
       Usage:
         BIM.UI.installTopBar({
             crumbs: [
                 { label: 'BIM Tools', href: '../../index.html' },
                 { label: 'Sitzungsprotokolle', here: true }
             ],
             user: currentUser,           // may be omitted; falls back to no chip
             onLogout: function(){ ... }, // optional; default = '../../login.html'
             showLogout: true
         })
    */
    installTopBar: function(opts) {
        opts = opts || {};
        document.body.classList.add('corp');

        // Hide any legacy topbar already in markup
        var legacy = document.querySelector('.bim-topbar');
        if (legacy && legacy.parentNode) legacy.parentNode.removeChild(legacy);

        // Skip if a topbar from this helper is already present
        if (document.querySelector('.app-top[data-installed]')) return;

        var bar = document.createElement('header');
        bar.className = 'app-top';
        bar.setAttribute('data-installed', '1');

        var crumbsHtml = '';
        if (opts.crumbs && opts.crumbs.length) {
            crumbsHtml = '<nav class="app-crumbs" aria-label="Navigation">' +
                opts.crumbs.map(function(c, i) {
                    var sep = i > 0 ? '<span class="sep">›</span>' : '';
                    if (c.here || !c.href) {
                        return sep + '<span class="here">' + BIM.Utils.escapeHtml(c.label) + '</span>';
                    }
                    return sep + '<a href="' + c.href + '">' + BIM.Utils.escapeHtml(c.label) + '</a>';
                }).join('') +
            '</nav>';
        }

        var rightHtml = '';
        if (opts.actions) rightHtml += opts.actions;
        if (opts.user) {
            var u = opts.user;
            var initials = (u.name || u.username || '?').split(' ').map(function(w){return w[0];}).join('').toUpperCase().slice(0,2);
            var role = (u.role || 'viewer').toLowerCase();
            rightHtml +=
                '<button class="user-chip" onclick="BIM.UI.showPasswordChangeModal()" title="Profil & Passwort">' +
                    '<span class="avatar">' + initials + '</span>' +
                    '<span>' + BIM.Utils.escapeHtml(u.name || u.username) + '</span>' +
                    '<span class="role-dot ' + role + '" title="' + BIM.Auth.getRoleLabel(u.role) + '"></span>' +
                '</button>';
        }
        if (opts.showLogout !== false) {
            rightHtml +=
                '<button class="icon-btn danger" data-action="topbar-logout" title="Abmelden" aria-label="Abmelden">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>' +
                    '</svg>' +
                '</button>';
        }

        bar.innerHTML =
            '<div class="app-top-inner">' +
                '<a href="' + (opts.brandHref || '../../index.html') + '" class="app-top-brand">' +
                    '<img src="' + (opts.logoBase || '../../') + 'shared/assets/emch-berger-logo.gif" alt="Emch+Berger" class="app-top-mark">' +
                    '<div>' +
                        '<div class="app-top-name">BIM Tools</div>' +
                        '<div class="app-top-sub">' + BIM.Utils.escapeHtml(opts.subtitle || 'Bauprojekt-Koordination') + '</div>' +
                    '</div>' +
                '</a>' +
                crumbsHtml +
                '<div class="app-top-right">' + rightHtml + '</div>' +
            '</div>';

        document.body.insertBefore(bar, document.body.firstChild);

        // Apply saved hub tweaks (icon radius → logo + icons)
        try {
            var saved = localStorage.getItem('bim_hub_tweaks');
            if (saved) {
                var tw = JSON.parse(saved);
                var icon = tw.iconRadiusPx;
                if (icon !== undefined) {
                    bar.querySelectorAll('.app-top-mark').forEach(function(el) { el.style.borderRadius = icon + 'px'; });
                    bar.querySelectorAll('.user-chip').forEach(function(el) { el.style.borderRadius = icon + 'px'; });
                    bar.querySelectorAll('.icon-btn').forEach(function(el) { el.style.borderRadius = Math.max(0, icon - 1) + 'px'; });
                }
            }
        } catch (_) {}

        // Wire logout
        var logoutBtn = bar.querySelector('[data-action="topbar-logout"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (opts.onLogout) return opts.onLogout();
                BIM.Auth.logout().then(function() {
                    window.location.href = opts.loginHref || '../../login.html';
                });
            });
        }
    },

    /* ── Admin sub-nav (shared across admin pages) ──
       Injected just below the top bar; takes 'active' page key:
       'dashboard' | 'users' | 'activity' | 'access'
    */
    installAdminSubnav: function(activeKey) {
        var existing = document.querySelector('.admin-subnav');
        if (existing) return;
        var items = [
            { k: 'dashboard', label: 'Dashboard',    href: 'index.html',    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>' },
            { k: 'users',     label: 'Benutzer',     href: 'users.html',    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>' },
            { k: 'activity',  label: 'Aktivitäten',  href: 'activity.html', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
            { k: 'access',    label: 'Zugriff',      href: 'access.html',   icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>' }
        ];
        var nav = document.createElement('nav');
        nav.className = 'admin-subnav';
        nav.innerHTML = '<div class="admin-subnav-inner">' +
            items.map(function(it) {
                return '<a href="' + it.href + '"' + (it.k === activeKey ? ' class="active"' : '') + '>' + it.icon + it.label + '</a>';
            }).join('') +
        '</div>';
        var topbar = document.querySelector('.app-top');
        if (topbar && topbar.nextSibling) {
            topbar.parentNode.insertBefore(nav, topbar.nextSibling);
        } else {
            document.body.insertBefore(nav, document.body.firstChild);
        }
    },

    _toastContainer: null,

    _ensureToastContainer: function() {
        if (!this._toastContainer) {
            this._toastContainer = document.createElement('div');
            this._toastContainer.className = 'bim-toast-container';
            document.body.appendChild(this._toastContainer);
        }
        return this._toastContainer;
    },

    toast: function(message, type) {
        type = type || 'info';
        var container = this._ensureToastContainer();
        var el = document.createElement('div');
        el.className = 'bim-toast bim-toast-' + type;

        var icons = {
            success: '&#10003;',
            error: '&#10007;',
            warning: '&#9888;',
            info: '&#8505;'
        };
        el.innerHTML = '<span>' + (icons[type] || '') + '</span><span>' + BIM.Utils.escapeHtml(message) + '</span>';
        container.appendChild(el);

        setTimeout(function() {
            el.style.animation = 'bim-toast-out 0.3s ease forwards';
            setTimeout(function() { el.remove(); }, 300);
        }, 3500);
    },

    success: function(msg) { this.toast(msg, 'success'); },
    error: function(msg) { this.toast(msg, 'error'); },
    warning: function(msg) { this.toast(msg, 'warning'); },
    info: function(msg) { this.toast(msg, 'info'); },

    modal: function(options) {
        var overlay = document.createElement('div');
        overlay.className = 'bim-modal-overlay';

        var modal = document.createElement('div');
        modal.className = 'bim-modal';
        if (options.wide) modal.style.maxWidth = '700px';

        var header = '';
        if (options.title) {
            header = '<div class="bim-modal-header"><h3>' + BIM.Utils.escapeHtml(options.title) + '</h3>' +
                     '<button class="bim-btn-icon" data-action="close">&times;</button></div>';
        }

        var body = '<div class="bim-modal-body">' + (options.body || '') + '</div>';

        var footerBtns = '';
        if (options.buttons) {
            footerBtns = '<div class="bim-modal-footer">';
            options.buttons.forEach(function(btn) {
                footerBtns += '<button class="bim-btn ' + (btn.cls || 'bim-btn-secondary') + '" data-action="' + btn.action + '">' +
                              BIM.Utils.escapeHtml(btn.label) + '</button>';
            });
            footerBtns += '</div>';
        }

        modal.innerHTML = header + body + footerBtns;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        requestAnimationFrame(function() { overlay.classList.add('active'); });

        return new Promise(function(resolve) {
            function close(action) {
                overlay.classList.remove('active');
                setTimeout(function() { overlay.remove(); }, 200);
                resolve(action);
            }

            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) close('cancel');
                var action = e.target.getAttribute('data-action') || (e.target.closest('[data-action]') || {}).getAttribute && e.target.closest('[data-action]').getAttribute('data-action');
                if (action === 'close') close('cancel');
                else if (action) close(action);
            });
        });
    },

    confirm: function(title, message) {
        return this.modal({
            title: title,
            body: '<p>' + BIM.Utils.escapeHtml(message) + '</p>',
            buttons: [
                { label: 'Abbrechen', action: 'cancel', cls: 'bim-btn-secondary' },
                { label: 'Bestätigen', action: 'confirm', cls: 'bim-btn-primary' }
            ]
        }).then(function(action) { return action === 'confirm'; });
    },

    confirmDelete: function(message) {
        return this.modal({
            title: 'Löschen bestätigen',
            body: '<p>' + BIM.Utils.escapeHtml(message || 'Möchten Sie diesen Eintrag wirklich löschen?') + '</p>',
            buttons: [
                { label: 'Abbrechen', action: 'cancel', cls: 'bim-btn-secondary' },
                { label: 'Löschen', action: 'confirm', cls: 'bim-btn-danger' }
            ]
        }).then(function(action) { return action === 'confirm'; });
    },

    setBadge: function(el, value, map) {
        el.className = 'bim-badge bim-badge-' + value;
        el.textContent = map[value] || value;
    },

    renderStatusBadge: function(status) {
        var label = BIM.Utils.MEETING_STATUSES[status] || status;
        return '<span class="bim-badge bim-badge-' + BIM.Utils.escapeHtml(status) + '">' + BIM.Utils.escapeHtml(label) + '</span>';
    },

    renderActionStatusBadge: function(status) {
        var label = BIM.Utils.ACTION_STATUSES[status] || status;
        return '<span class="bim-badge bim-badge-' + BIM.Utils.escapeHtml(status) + '">' + BIM.Utils.escapeHtml(label) + '</span>';
    },

    renderPriorityBadge: function(priority) {
        var label = BIM.Utils.PRIORITIES[priority] || priority;
        return '<span class="bim-badge bim-badge-' + BIM.Utils.escapeHtml(priority) + '">' + BIM.Utils.escapeHtml(label) + '</span>';
    },

    renderTypeBadge: function(type) {
        var label = BIM.Utils.MEETING_TYPES[type] || type;
        return '<span class="bim-badge bim-badge-type">' + BIM.Utils.escapeHtml(label) + '</span>';
    },

    renderDiscussionStatusBadge: function(status, customLabel) {
        var label = customLabel || BIM.Utils.DISCUSSION_STATUSES[status] || status;
        return '<span class="bim-badge bim-badge-discussion-' + BIM.Utils.escapeHtml(status) + '">' + BIM.Utils.escapeHtml(label) + '</span>';
    },

    renderInstanceStatusBadge: function(status) {
        var label = BIM.Utils.INSTANCE_STATUSES[status] || status;
        return '<span class="bim-badge bim-badge-' + BIM.Utils.escapeHtml(status) + '">' + BIM.Utils.escapeHtml(label) + '</span>';
    },

    renderEmptyState: function(title, description, buttonLabel, buttonOnclick) {
        var html = '<div class="bim-empty-state">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>' +
            '<h3>' + BIM.Utils.escapeHtml(title) + '</h3>' +
            '<p>' + BIM.Utils.escapeHtml(description) + '</p>';
        if (buttonLabel) {
            html += '<button class="bim-btn bim-btn-primary bim-mt-4" onclick="' + buttonOnclick + '">' + BIM.Utils.escapeHtml(buttonLabel) + '</button>';
        }
        html += '</div>';
        return html;
    },

    // ── Self-Service Password Change Modal ────────────────────

    showPasswordChangeModal: function() {
        var self = this;

        var body =
            '<div style="margin-bottom:14px;">' +
                '<label style="display:block;font-size:11px;font-weight:600;color:var(--bim-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Aktuelles Passwort</label>' +
                '<input type="password" id="_pwcCurrent" class="bim-input" placeholder="Aktuelles Passwort" autocomplete="current-password">' +
            '</div>' +
            '<div style="margin-bottom:14px;">' +
                '<label style="display:block;font-size:11px;font-weight:600;color:var(--bim-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Neues Passwort</label>' +
                '<input type="password" id="_pwcNew" class="bim-input" placeholder="Neues Passwort" autocomplete="new-password">' +
            '</div>' +
            '<div style="margin-bottom:14px;">' +
                '<label style="display:block;font-size:11px;font-weight:600;color:var(--bim-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Neues Passwort best&auml;tigen</label>' +
                '<input type="password" id="_pwcConfirm" class="bim-input" placeholder="Passwort wiederholen" autocomplete="new-password">' +
            '</div>' +
            '<div style="font-size:11px;color:var(--bim-text-muted);line-height:1.5;">' +
                '<strong>Anforderungen:</strong> Mind. 8 Zeichen, Gross- und Kleinbuchstaben, Ziffer und Sonderzeichen.' +
            '</div>' +
            '<div id="_pwcError" style="display:none;margin-top:10px;padding:8px 12px;background:var(--bim-danger-light);color:var(--bim-danger);border-radius:var(--bim-radius-md);font-size:12px;font-weight:500;text-align:center;"></div>';

        var overlay = document.createElement('div');
        overlay.className = 'bim-modal-overlay';

        var modal = document.createElement('div');
        modal.className = 'bim-modal';
        modal.style.maxWidth = '420px';

        modal.innerHTML =
            '<div class="bim-modal-header"><h3>Passwort ändern</h3>' +
            '<button class="bim-btn-icon" data-action="close">&times;</button></div>' +
            '<div class="bim-modal-body">' + body + '</div>' +
            '<div class="bim-modal-footer">' +
                '<button class="bim-btn bim-btn-secondary" data-action="cancel">Abbrechen</button>' +
                '<button class="bim-btn bim-btn-primary" id="_pwcSubmit">Passwort ändern</button>' +
            '</div>';

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        requestAnimationFrame(function() { overlay.classList.add('active'); });

        // Focus first field
        setTimeout(function() {
            var el = document.getElementById('_pwcCurrent');
            if (el) el.focus();
        }, 200);

        function closeOverlay() {
            overlay.classList.remove('active');
            setTimeout(function() { overlay.remove(); }, 200);
        }

        function showPwcError(msg) {
            var el = document.getElementById('_pwcError');
            el.textContent = msg;
            el.style.display = 'block';
        }

        // Close on overlay click or cancel
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeOverlay();
            var action = e.target.getAttribute('data-action') || (e.target.closest && e.target.closest('[data-action]') && e.target.closest('[data-action]').getAttribute('data-action'));
            if (action === 'close' || action === 'cancel') closeOverlay();
        });

        // Submit handler
        document.getElementById('_pwcSubmit').addEventListener('click', function() {
            var current = document.getElementById('_pwcCurrent').value;
            var newPw = document.getElementById('_pwcNew').value;
            var confirm = document.getElementById('_pwcConfirm').value;

            if (!current) { showPwcError('Bitte aktuelles Passwort eingeben.'); return; }
            if (!newPw) { showPwcError('Bitte neues Passwort eingeben.'); return; }
            if (newPw !== confirm) { showPwcError('Die Passwörter stimmen nicht überein.'); return; }

            var validation = BIM.Auth.validatePassword(newPw);
            if (!validation.valid) { showPwcError(validation.errors[0]); return; }

            var btn = document.getElementById('_pwcSubmit');
            btn.disabled = true;
            btn.textContent = 'Wird gespeichert...';

            BIM.Auth.getCurrentUser().then(function(user) {
                if (!user) { showPwcError('Sitzung abgelaufen.'); return; }
                return BIM.Auth.changePasswordSelf(user.id, current, newPw);
            }).then(function() {
                closeOverlay();
                self.success('Passwort erfolgreich geändert');
            }).catch(function(err) {
                showPwcError(err.message || 'Fehler beim Ändern des Passworts.');
                btn.disabled = false;
                btn.textContent = 'Passwort ändern';
            });
        });

        // Enter key on confirm field
        setTimeout(function() {
            var confirmEl = document.getElementById('_pwcConfirm');
            if (confirmEl) {
                confirmEl.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') document.getElementById('_pwcSubmit').click();
                });
            }
        }, 100);
    }
};
