/* ═══════════════════════════════════════════════════════════════
   Print template renderers — Klassisch · Technisch · ACC-Stil
   Each renderer returns an array of HTML strings (blocks) which
   the paginator packs onto A4 pages.
   ═══════════════════════════════════════════════════════════════ */
window.BIM = window.BIM || {};
BIM.PrintRenderers = (function() {

    /* ── Helpers ─────────────────────────────────────────────── */
    function esc(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function escMulti(s) {
        return esc(s).replace(/\n/g, '<br>');
    }
    function fmtDate(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        var m = ['Jan.','Feb.','Mär.','Apr.','Mai','Juni','Juli','Aug.','Sep.','Okt.','Nov.','Dez.'];
        return d.getDate() + '. ' + m[d.getMonth()] + ' ' + d.getFullYear();
    }
    function fmtDateTime(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        var m = ['Jan.','Feb.','Mär.','Apr.','Mai','Juni','Juli','Aug.','Sep.','Okt.','Nov.','Dez.'];
        return d.getDate() + '. ' + m[d.getMonth()] + ' ' + d.getFullYear() + ' um '
            + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    }
    function statusLabel(key) {
        return { offen:'Offen', laufend:'Laufend', erledigt:'Erledigt', informationen:'Information' }[key] || key || '';
    }

    /* ── KLASSISCH ─────────────────────────────────────────────── */
    function renderKlassisch(data) {
        var blocks = [];
        var inst = data.instance;
        var p = data.participants;
        var co = data.company;

        // Cover
        blocks.push(
            '<div class="pv-cover-block">' +
                '<div class="pv-eyebrow">Besprechungsprotokoll · Nr. ' + esc(inst.number) + '</div>' +
                '<div class="pv-doc-title">' + esc(data.series.title) + '</div>' +
                '<div class="pv-doc-subtitle">' + esc(data.project.title) + '</div>' +
            '</div>'
        );

        // Meta grid
        blocks.push(
            '<div class="pv-meta-grid">' +
                metaCell('Datum', fmtDate(inst.date)) +
                metaCell('Zeit', inst.timeStart + (inst.timeEnd ? ' – ' + inst.timeEnd + ' Uhr' : '')) +
                metaCell('Ort', inst.location) +
                metaCell('Projekt-Nr.', data.project.number) +
                metaCell('Serie', data.series.code) +
                metaCell('Verfasser', inst.author) +
            '</div>'
        );

        // Participants
        blocks.push('<div class="pv-section-h">Einladungen und Teilnahme</div>');
        blocks.push(
            '<div class="pv-participants">' +
                '<div>' +
                    '<div class="pv-pgroup-title">Organisatoren</div>' +
                    '<div class="pv-plist">' + p.organisatoren.map(klassischPRow).join('') + '</div>' +
                '</div>' +
                '<div>' +
                    '<div class="pv-pgroup-title">Eingeladene</div>' +
                    '<div class="pv-plist">' + p.eingeladene.map(klassischPRow).join('') + '</div>' +
                '</div>' +
            '</div>'
        );

        // Description
        if (data.series.description) {
            blocks.push('<div class="pv-section-h">Beschreibung</div>');
            blocks.push('<div class="pv-desc">' + escMulti(data.series.description) + '</div>');
        }

        blocks.push('<div class="pv-section-h">Besprechungsdiskussion</div>');

        // Categories + items
        data.categories.forEach(function(cat) {
            var items = data.items.filter(function(i) { return i.cat === cat.code; });
            if (items.length === 0) return;
            blocks.push(
                '<div class="pv-cat">' +
                    '<div class="pv-cat-code">' + esc(cat.code) + '</div>' +
                    '<div class="pv-cat-label">' + esc(cat.label) + '</div>' +
                '</div>'
            );
            items.forEach(function(it) {
                blocks.push(klassischItem(it));
            });
        });

        return blocks;
    }

    function klassischPRow(p) {
        return '<div class="pv-prow ' + (p.present ? 'present' : 'absent') + '">' +
            '<span class="dot"></span>' +
            '<span class="nm">' + esc(p.name) + '</span>' +
            '<span class="co">— ' + esc(p.company) + '</span>' +
        '</div>';
    }

    function klassischItem(it) {
        var fields = (it.fields || []).map(function(f) {
            return '<span><strong>' + esc(f[0]) + ':</strong> ' + esc(f[1]) + '</span>';
        }).join('');
        var updates = (it.updates || []).map(function(u) {
            return '<div class="pv-update"><span class="pv-update-date">' + esc(u.date) + '</span>' + escMulti(u.text) + '</div>';
        }).join('');
        var attachments = (it.attachments || []).map(function(a) {
            return '<span class="pv-attachment">' + esc(a) + '</span>';
        }).join('');

        var footerParts = [];
        if (it.due) footerParts.push('<span class="due">Fällig: ' + esc(it.due) + '</span>');
        if (it.assignees && it.assignees.length) footerParts.push('<span class="asg">' + it.assignees.map(esc).join(', ') + '</span>');

        return '<div class="pv-item">' +
            '<div class="pv-item-head">' +
                '<div class="pv-item-num">' + esc(it.cat) + '.' + esc(it.n) + '</div>' +
                '<div class="pv-item-title-wrap">' +
                    '<div class="pv-item-title">' + esc(it.title) + '</div>' +
                    '<div class="pv-item-meta">Erstellt ' + esc(it.createdAt) + ' · zuletzt aktualisiert ' + esc(it.updatedAt) + ' · ' + esc(it.updatedBy) + '</div>' +
                '</div>' +
                '<div class="pv-item-status-wrap"><span class="pt-status ' + (it.status||'') + '">' + esc(statusLabel(it.status)) + '</span></div>' +
            '</div>' +
            '<div class="pv-item-body">' +
                '<div class="pv-item-desc">' + escMulti(it.desc) + '</div>' +
                (fields ? '<div class="pv-fields">' + fields + '</div>' : '') +
                (updates ? '<div class="pv-updates">' + updates + '</div>' : '') +
                (attachments ? '<div class="pv-attachments">' + attachments + '</div>' : '') +
                (footerParts.length ? '<div class="pv-item-footer">' + footerParts.join('') + '</div>' : '') +
            '</div>' +
        '</div>';
    }

    function metaCell(label, value) {
        return '<div><div class="pv-meta-label">' + esc(label) + '</div><div class="pv-meta-value">' + esc(value || '—') + '</div></div>';
    }

    /* ── SIDEBAR (classic executive — refined whitespace, modern minimal) ── */
    function renderSidebar(data, opts) {
        opts = opts || {};
        var blocks = [];
        var inst = data.instance;
        var p = data.participants;

        // Cover block — title (left) + sitzung number (right)
        blocks.push(
            '<div class="pv-cover">' +
                '<div>' +
                    '<div class="pv-eyebrow">Besprechungsprotokoll</div>' +
                    '<div class="pv-doc-title">' + esc(data.series.title) + '</div>' +
                    '<div class="pv-doc-subtitle">' + esc(data.project.code) + ' · ' + esc(data.project.title) + '</div>' +
                '</div>' +
                '<div class="pv-instance-num">' +
                    '<div class="lab">Sitzung Nr.</div>' +
                    '<div class="num">' + esc(inst.number) + '</div>' +
                '</div>' +
            '</div>'
        );

        // Meta strip (horizontal pills)
        blocks.push(
            '<div class="pv-meta-strip">' +
                metaPill('Datum', fmtDate(inst.date)) +
                metaPill('Zeit', inst.timeStart + (inst.timeEnd ? ' – ' + inst.timeEnd : '')) +
                metaPill('Ort', inst.location) +
                metaPill('Projekt-Nr.', data.project.number) +
                metaPill('Serie', data.series.code) +
                metaPill('Verfasser', inst.author) +
            '</div>'
        );

        // Participants — two-column compact
        blocks.push('<div class="pv-section-h">Teilnahme</div>');
        blocks.push(
            '<div class="pv-participants">' +
                '<div class="pv-pgroup">' +
                    '<div class="pv-pgroup-title">Organisatoren · ' + p.organisatoren.length + '</div>' +
                    p.organisatoren.map(sidebarPRow).join('') +
                '</div>' +
                '<div class="pv-pgroup">' +
                    '<div class="pv-pgroup-title">Eingeladene · ' + p.eingeladene.length + '</div>' +
                    p.eingeladene.map(sidebarPRow).join('') +
                '</div>' +
            '</div>'
        );

        if (data.series.description) {
            blocks.push('<div class="pv-section-h">Beschreibung</div>');
            blocks.push('<div class="pv-desc">' + escMulti(data.series.description) + '</div>');
        }

        blocks.push('<div class="pv-section-h">Besprechungsdiskussion</div>');

        data.categories.forEach(function(cat) {
            var items = data.items.filter(function(i) { return i.cat === cat.code; });
            if (items.length === 0) return;
            blocks.push(
                '<div class="pv-cat">' +
                    '<div class="pv-cat-code">' + esc(cat.code) + '</div>' +
                    '<div class="pv-cat-label">' + esc(cat.label) + '</div>' +
                '</div>'
            );
            items.forEach(function(it) { blocks.push(sidebarItem(it)); });
        });

        return blocks;
    }

    function metaPill(k, v) {
        return '<div class="pv-meta-pill"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v || '—') + '</span></div>';
    }

    function sidebarPRow(p) {
        return '<div class="pv-prow ' + (p.present ? 'present' : 'absent') + '">' +
            '<span class="dot"></span>' +
            '<span class="nm">' + esc(p.name) + '</span>' +
            '<span class="co">· ' + esc(p.company) + '</span>' +
        '</div>';
    }

    function sidebarItem(it) {
        var fields = (it.fields || []).map(function(f) {
            return '<span><strong>' + esc(f[0]) + ':</strong> ' + esc(f[1]) + '</span>';
        }).join('');
        var updates = (it.updates || []).map(function(u) {
            return '<div class="pv-update"><span class="pv-update-date">' + esc(u.date) + '</span>' + escMulti(u.text) + '</div>';
        }).join('');
        var attachments = (it.attachments || []).map(function(a) {
            return '<span class="pv-attachment">' + esc(a) + '</span>';
        }).join('');

        var footerParts = [];
        if (it.due) footerParts.push('<span class="due">Fällig ' + esc(it.due) + '</span>');
        if (it.assignees && it.assignees.length) footerParts.push('<span><span class="lab">Zugewiesen</span> ' + esc(it.assignees.join(', ')) + '</span>');
        footerParts.push('<span><span class="lab">Aktualisiert</span> ' + esc(it.updatedAt) + '</span>');

        return '<div class="pv-item">' +
            '<div class="pv-item-head">' +
                '<div class="pv-item-num">' + esc(it.n) + '.</div>' +
                '<div class="pv-item-title">' + esc(it.title) + '</div>' +
                '<div class="pv-item-status-wrap"><span class="pt-status ' + (it.status||'') + '">' + esc(statusLabel(it.status)) + '</span></div>' +
            '</div>' +
            '<div class="pv-item-body">' +
                '<div class="pv-item-desc">' + escMulti(it.desc) + '</div>' +
                (fields ? '<div class="pv-fields">' + fields + '</div>' : '') +
                (updates ? '<div class="pv-updates">' + updates + '</div>' : '') +
                (attachments ? '<div class="pv-attachments">' + attachments + '</div>' : '') +
                '<div class="pv-item-footer">' + footerParts.join('') + '</div>' +
            '</div>' +
        '</div>';
    }

    /* ── TECHNISCH ─────────────────────────────────────────────── */
    function renderTechnisch(data) {
        var blocks = [];
        var inst = data.instance;
        var p = data.participants;

        // Cover row with instance number box
        blocks.push(
            '<div class="pv-cover-block">' +
                '<div class="pv-doc-row">' +
                    '<div>' +
                        '<div class="pv-doc-title">' + esc(data.series.title) + '</div>' +
                        '<div class="pv-doc-sub">' + esc(data.project.code) + ' · ' + esc(data.project.title) + '</div>' +
                    '</div>' +
                    '<div class="pv-instance-box">' +
                        '<div class="lab">Besprechung</div>' +
                        '<div class="num">' + esc(inst.number) + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );

        // Meta table
        blocks.push(
            '<table class="pv-meta-table"><tbody>' +
                '<tr><th>Datum</th><td>' + esc(fmtDate(inst.date)) + '</td>' +
                    '<th>Zeit</th><td>' + esc(inst.timeStart + (inst.timeEnd ? ' – ' + inst.timeEnd + ' Uhr CEST' : '')) + '</td></tr>' +
                '<tr><th>Ort</th><td>' + esc(inst.location) + '</td>' +
                    '<th>Verfasser</th><td>' + esc(inst.author) + '</td></tr>' +
                '<tr><th>Projekt-Nr.</th><td>' + esc(data.project.number) + '</td>' +
                    '<th>Serie</th><td>' + esc(data.series.code) + '</td></tr>' +
                '<tr><th>Verteiler</th><td colspan="3">' + esc(inst.verteiler) + '</td></tr>' +
            '</tbody></table>'
        );

        // Participants as table
        blocks.push('<div class="pv-section-h">Einladungen und Teilnahme</div>');
        var allP = p.organisatoren.map(function(x){return {...x, type:'Org.'};})
                 .concat(p.eingeladene.map(function(x){return {...x, type:'Eingel.'};}));
        var rows = allP.map(function(x) {
            return '<tr>' +
                '<td>' + esc(x.name) + '</td>' +
                '<td>' + esc(x.company) + '</td>' +
                '<td class="tcol-role">' + esc(x.type) + '</td>' +
                '<td class="tcol-prs"><span class="check ' + (x.present ? 'on' : '') + '"></span></td>' +
            '</tr>';
        }).join('');
        blocks.push(
            '<table class="pv-participants-table">' +
                '<thead><tr><th>Name</th><th>Firma</th><th>Rolle</th><th>Anwesend</th></tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>'
        );

        if (data.series.description) {
            blocks.push('<div class="pv-section-h">Beschreibung</div>');
            blocks.push('<div class="pv-desc">' + escMulti(data.series.description) + '</div>');
        }

        blocks.push('<div class="pv-section-h">Besprechungsdiskussion</div>');

        data.categories.forEach(function(cat) {
            var items = data.items.filter(function(i) { return i.cat === cat.code; });
            if (items.length === 0) return;
            blocks.push(
                '<div class="pv-cat">' +
                    '<div class="pv-cat-code">' + esc(cat.code) + '</div>' +
                    '<div class="pv-cat-label">' + esc(cat.label) + '</div>' +
                '</div>'
            );
            items.forEach(function(it) {
                blocks.push(technischItem(it));
            });
        });

        return blocks;
    }

    function technischItem(it) {
        var fields = (it.fields || []).map(function(f) {
            return '<span><strong>' + esc(f[0]) + '</strong> ' + esc(f[1]) + '</span>';
        }).join('');
        var updates = (it.updates || []).map(function(u) {
            return '<div class="pv-update">' +
                '<div class="pv-update-date">' + esc(u.date) + '</div>' +
                '<div>' + escMulti(u.text) + '</div>' +
            '</div>';
        }).join('');
        var attachments = (it.attachments || []).map(function(a) {
            return '<span>📎 ' + esc(a) + '</span>';
        }).join('');

        var footerParts = [];
        footerParts.push('<span><span class="lab">Erstellt</span>' + esc(it.createdAt) + '</span>');
        footerParts.push('<span><span class="lab">Akt.</span>' + esc(it.updatedAt) + '</span>');
        if (it.due) footerParts.push('<span class="due"><span class="lab" style="color:inherit;opacity:.7;">Fällig</span>' + esc(it.due) + '</span>');
        if (it.assignees && it.assignees.length) footerParts.push('<span><span class="lab">Zugw.</span>' + esc(it.assignees.join(', ')) + '</span>');

        return '<div class="pv-item">' +
            '<div class="pv-item-head">' +
                '<div class="pv-item-num">' + esc(it.cat) + '.' + esc(it.n) + '</div>' +
                '<div class="pv-item-title">' + esc(it.title) + '</div>' +
                '<div class="pv-item-status-wrap"><span class="pt-status ' + (it.status||'') + '">' + esc(statusLabel(it.status)) + '</span></div>' +
            '</div>' +
            '<div class="pv-item-body">' +
                '<div class="pv-item-desc">' + escMulti(it.desc) + '</div>' +
                (fields ? '<div class="pv-fields">' + fields + '</div>' : '') +
                (updates ? '<div class="pv-updates">' + updates + '</div>' : '') +
                (attachments ? '<div class="pv-attachments">' + attachments + '</div>' : '') +
                '<div class="pv-item-footer">' + footerParts.join('') + '</div>' +
            '</div>' +
        '</div>';
    }

    /* ── ACC-STIL (Forma imitation) ──────────────────────────── */
    function renderACC(data, opts) {
        opts = opts || {};
        var blocks = [];
        var inst = data.instance;
        var p = data.participants;

        // Cover header — first page only (rendered as a block at top, then paginator
        // also adds normal page headers from page 2 onward).
        blocks.push(
            '<div class="pv-cover-header">' +
                '<div class="cl">' + esc(data.project.code) + '<span class="sep">·</span>' + esc(data.project.title) + '</div>' +
                '<div class="cr"><img src="' + esc(opts.logo || data.company.logo) + '" alt="' + esc(data.company.name) + '"></div>' +
            '</div>'
        );

        blocks.push(
            '<div class="pv-doc-title">Besprechungsprotokoll</div>' +
            '<div class="pv-doc-subtitle">Besprechung ' + esc(inst.number) + ': ' + esc(data.series.code) + ': ' + esc(data.series.title) + '</div>'
        );

        blocks.push(
            '<div class="pv-meta-line">' +
                '<span class="pair"><span class="lab">Datum:</span><span class="val">' + esc(fmtDate(inst.date)) + '</span></span>' +
                '<span class="pair"><span class="lab">Zeit:</span><span class="val">' + esc(inst.timeStart + (inst.timeEnd ? ' – ' + inst.timeEnd + ' Uhr CEST' : '')) + '</span></span>' +
                '<span class="pair"><span class="lab">Besprechungsort:</span><span class="val">' + esc(inst.location) + '</span></span>' +
            '</div>'
        );

        blocks.push('<div class="pv-section-h">Einladungen und Teilnahme</div>');
        blocks.push(
            '<div class="pv-participants">' +
                '<div>' +
                    '<div class="pv-pgroup-title">Organisatoren</div>' +
                    p.organisatoren.map(accPRow).join('') +
                '</div>' +
                '<div>' +
                    '<div class="pv-pgroup-title">Eingeladene</div>' +
                    p.eingeladene.map(accPRow).join('') +
                '</div>' +
            '</div>'
        );

        if (data.series.description) {
            blocks.push('<div class="pv-section-h">Beschreibung</div>');
            blocks.push('<div class="pv-desc">' + escMulti(data.series.description) + '</div>');
        }

        blocks.push('<div class="pv-section-h">Besprechungsdiskussion</div>');

        data.categories.forEach(function(cat) {
            var items = data.items.filter(function(i) { return i.cat === cat.code; });
            if (items.length === 0) return;
            blocks.push('<div class="pv-cat-h">' + esc(cat.code) + ' ' + esc(cat.label) + '</div>');
            items.forEach(function(it) {
                blocks.push(accItem(it));
            });
        });

        return blocks;
    }

    function accPRow(p) {
        return '<div class="pv-prow ' + (p.present ? 'present' : '') + '">' +
            '<span class="dot"></span>' +
            '<span>' + esc(p.name) + '</span>' +
            '<span class="co">(' + esc(p.company) + ')</span>' +
        '</div>';
    }

    function accItem(it) {
        var updates = (it.updates || []).map(function(u) {
            return '<div class="pv-update"><span class="pv-update-date">' + esc(u.date) + ':</span>' + escMulti(u.text) + '</div>';
        }).join('');
        var fields = (it.fields || []).map(function(f) {
            return '<li><span class="l">' + esc(f[0]) + ':</span><span class="v">' + esc(f[1]) + '</span></li>';
        }).join('');
        var attachments = (it.attachments || []).map(function(a) {
            return '<div class="pv-attachment">' + esc(a) + '</div>';
        }).join('');

        var due = it.due
            ? '<div class="pv-due-line"><span><span class="l">Fällig am</span> ' + esc(it.due) + '</span>' +
              (it.assignees && it.assignees.length ? '<span><span class="l">Zugewiesen an</span> ' + esc(it.assignees.join(', ')) + '</span>' : '') +
              '</div>'
            : (it.assignees && it.assignees.length
                ? '<div class="pv-due-line"><span><span class="l">Zugewiesen an</span> ' + esc(it.assignees.join(', ')) + '</span></div>'
                : '');

        return '<div class="pv-item">' +
            '<div class="pv-item-main">' +
                '<div class="pv-item-title"><span class="n">' + esc(it.n) + '.</span>' + esc(it.title) + '</div>' +
                '<div class="pv-item-desc">' + escMulti(it.desc) + '</div>' +
                (updates ? '<div class="pv-updates">' + updates + '</div>' : '') +
                (attachments ? '<div class="pv-attachments"><div class="pv-attachments-title">Elementanhänge</div>' + attachments + '</div>' : '') +
                '<div class="pv-item-status-row ' + (it.status||'') + '">' + esc(statusLabel(it.status)) + '</div>' +
                due +
            '</div>' +
            '<div class="pv-item-aside">' +
                '<div class="pv-aside-title">Informationen</div>' +
                (fields ? '<ul class="pv-aside-fields">' + fields + '</ul>' : '') +
                '<div class="pv-aside-block">' +
                    '<div class="l">Erstellt am ' + esc(it.createdAt) + '</div>' +
                    '<div class="v">von ' + esc(it.createdBy) + '</div>' +
                '</div>' +
                '<div class="pv-aside-block">' +
                    '<div class="l">Zuletzt aktualisiert</div>' +
                    '<div class="l">am ' + esc(it.updatedAt) + '</div>' +
                    '<div class="v">von ' + esc(it.updatedBy) + '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    return {
        klassisch: renderKlassisch,
        sidebar:   renderSidebar,
        technisch: renderTechnisch,
        acc:       renderACC,
        helpers:   { esc: esc, escMulti: escMulti, fmtDate: fmtDate, fmtDateTime: fmtDateTime, statusLabel: statusLabel }
    };
})();
