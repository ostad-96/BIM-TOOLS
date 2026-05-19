var ACC = ACC || {};

ACC.UI = {
    _toastContainer: null,

    _ensureToastContainer: function() {
        if (!this._toastContainer) {
            this._toastContainer = document.createElement('div');
            this._toastContainer.className = 'acc-toast-container';
            document.body.appendChild(this._toastContainer);
        }
        return this._toastContainer;
    },

    toast: function(message, type) {
        type = type || 'info';
        var container = this._ensureToastContainer();
        var el = document.createElement('div');
        el.className = 'acc-toast acc-toast-' + type;

        var icons = {
            success: '&#10003;',
            error: '&#10007;',
            warning: '&#9888;',
            info: '&#8505;'
        };
        el.innerHTML = '<span>' + (icons[type] || '') + '</span><span>' + ACC.Utils.escapeHtml(message) + '</span>';
        container.appendChild(el);

        setTimeout(function() {
            el.style.animation = 'acc-toast-out 0.3s ease forwards';
            setTimeout(function() { el.remove(); }, 300);
        }, 3500);
    },

    success: function(msg) { this.toast(msg, 'success'); },
    error: function(msg) { this.toast(msg, 'error'); },
    warning: function(msg) { this.toast(msg, 'warning'); },
    info: function(msg) { this.toast(msg, 'info'); },

    modal: function(options) {
        var overlay = document.createElement('div');
        overlay.className = 'acc-modal-overlay';

        var modal = document.createElement('div');
        modal.className = 'acc-modal';
        if (options.wide) modal.style.maxWidth = '700px';

        var header = '';
        if (options.title) {
            header = '<div class="acc-modal-header"><h3>' + ACC.Utils.escapeHtml(options.title) + '</h3>' +
                     '<button class="acc-btn-icon" data-action="close">&times;</button></div>';
        }

        var body = '<div class="acc-modal-body">' + (options.body || '') + '</div>';

        var footerBtns = '';
        if (options.buttons) {
            footerBtns = '<div class="acc-modal-footer">';
            options.buttons.forEach(function(btn) {
                footerBtns += '<button class="acc-btn ' + (btn.cls || 'acc-btn-secondary') + '" data-action="' + btn.action + '">' +
                              ACC.Utils.escapeHtml(btn.label) + '</button>';
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
            body: '<p>' + ACC.Utils.escapeHtml(message) + '</p>',
            buttons: [
                { label: 'Abbrechen', action: 'cancel', cls: 'acc-btn-secondary' },
                { label: 'Bestätigen', action: 'confirm', cls: 'acc-btn-primary' }
            ]
        }).then(function(action) { return action === 'confirm'; });
    },

    confirmDelete: function(message) {
        return this.modal({
            title: 'Löschen bestätigen',
            body: '<p>' + ACC.Utils.escapeHtml(message || 'Möchten Sie diesen Eintrag wirklich löschen?') + '</p>',
            buttons: [
                { label: 'Abbrechen', action: 'cancel', cls: 'acc-btn-secondary' },
                { label: 'Löschen', action: 'confirm', cls: 'acc-btn-danger' }
            ]
        }).then(function(action) { return action === 'confirm'; });
    },

    setBadge: function(el, value, map) {
        el.className = 'acc-badge acc-badge-' + value;
        el.textContent = map[value] || value;
    },

    renderStatusBadge: function(status) {
        var label = ACC.Utils.MEETING_STATUSES[status] || status;
        return '<span class="acc-badge acc-badge-' + ACC.Utils.escapeHtml(status) + '">' + ACC.Utils.escapeHtml(label) + '</span>';
    },

    renderActionStatusBadge: function(status) {
        var label = ACC.Utils.ACTION_STATUSES[status] || status;
        return '<span class="acc-badge acc-badge-' + ACC.Utils.escapeHtml(status) + '">' + ACC.Utils.escapeHtml(label) + '</span>';
    },

    renderPriorityBadge: function(priority) {
        var label = ACC.Utils.PRIORITIES[priority] || priority;
        return '<span class="acc-badge acc-badge-' + ACC.Utils.escapeHtml(priority) + '">' + ACC.Utils.escapeHtml(label) + '</span>';
    },

    renderTypeBadge: function(type) {
        var label = ACC.Utils.MEETING_TYPES[type] || type;
        return '<span class="acc-badge acc-badge-type">' + ACC.Utils.escapeHtml(label) + '</span>';
    },

    renderDiscussionStatusBadge: function(status, customLabel) {
        var label = customLabel || ACC.Utils.DISCUSSION_STATUSES[status] || status;
        return '<span class="acc-badge acc-badge-discussion-' + ACC.Utils.escapeHtml(status) + '">' + ACC.Utils.escapeHtml(label) + '</span>';
    },

    renderInstanceStatusBadge: function(status) {
        var label = ACC.Utils.INSTANCE_STATUSES[status] || status;
        return '<span class="acc-badge acc-badge-' + ACC.Utils.escapeHtml(status) + '">' + ACC.Utils.escapeHtml(label) + '</span>';
    },

    renderEmptyState: function(title, description, buttonLabel, buttonOnclick) {
        var html = '<div class="acc-empty-state">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>' +
            '<h3>' + ACC.Utils.escapeHtml(title) + '</h3>' +
            '<p>' + ACC.Utils.escapeHtml(description) + '</p>';
        if (buttonLabel) {
            html += '<button class="acc-btn acc-btn-primary acc-mt-4" onclick="' + buttonOnclick + '">' + ACC.Utils.escapeHtml(buttonLabel) + '</button>';
        }
        html += '</div>';
        return html;
    }
};
