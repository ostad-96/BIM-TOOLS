var BIM = BIM || {};

BIM.Utils = {
    uuid: function() {
        if (crypto.randomUUID) return crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    },

    now: function() {
        return new Date().toISOString();
    },

    today: function() {
        return new Date().toISOString().slice(0, 10);
    },

    currentTime: function() {
        return new Date().toTimeString().slice(0, 5);
    },

    formatDate: function(isoDate) {
        if (!isoDate) return '';
        var d = new Date(isoDate + 'T00:00:00');
        return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    formatDateTime: function(isoDateTime) {
        if (!isoDateTime) return '';
        var d = new Date(isoDateTime);
        return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
               ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    },

    formatDateLong: function(isoDate) {
        if (!isoDate) return '';
        var d = new Date(isoDate + 'T00:00:00');
        return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    },

    formatTimeRange: function(start, end) {
        var parts = [];
        if (start) parts.push(start + ' Uhr');
        if (end) parts.push(end + ' Uhr');
        return parts.join(' – ');
    },

    daysUntil: function(isoDate) {
        if (!isoDate) return null;
        var now = new Date(); now.setHours(0,0,0,0);
        var target = new Date(isoDate + 'T00:00:00');
        return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    },

    escapeHtml: function(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function(c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    },

    slugify: function(str) {
        return String(str).toLowerCase()
            .replace(/[äÄ]/g, 'ae').replace(/[öÖ]/g, 'oe').replace(/[üÜ]/g, 'ue').replace(/ß/g, 'ss')
            .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    },

    debounce: function(fn, ms) {
        var timer;
        return function() {
            var ctx = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function() { fn.apply(ctx, args); }, ms);
        };
    },

    getUrlParam: function(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    navigateTo: function(url) {
        document.body.classList.remove('entering');
        document.body.classList.add('exiting');
        setTimeout(function() { window.location.href = url; }, 500);
    },

    MEETING_TYPES: {
        bim_koordination: 'BIM-Koordination',
        planungsbesprechung: 'Planungsbesprechung',
        baustellenbesprechung: 'Baustellenbesprechung',
        abnahme: 'Abnahmebesprechung',
        custom: 'Sonstige'
    },

    MEETING_TYPE_PREFIXES: {
        bim_koordination: 'BIM-KO',
        planungsbesprechung: 'PB',
        baustellenbesprechung: 'BB',
        abnahme: 'ABN',
        custom: 'SONST'
    },

    MEETING_STATUSES: {
        entwurf: 'Entwurf',
        aktiv: 'Aktiv',
        abgeschlossen: 'Abgeschlossen',
        archiviert: 'Archiviert'
    },

    ACTION_STATUSES: {
        offen: 'Offen',
        in_bearbeitung: 'In Bearbeitung',
        erledigt: 'Erledigt',
        storniert: 'Storniert'
    },

    PRIORITIES: {
        hoch: 'Hoch',
        mittel: 'Mittel',
        niedrig: 'Niedrig'
    },

    AGENDA_STATUSES: {
        offen: 'Offen',
        besprochen: 'Besprochen',
        vertagt: 'Vertagt'
    },

    ATTENDEE_ROLES: [
        'Projektleiter', 'BIM-Manager', 'BIM-Koordinator', 'Fachplaner Architektur',
        'Fachplaner Tragwerk', 'Fachplaner HLKS', 'Fachplaner Elektro',
        'Fachplaner GA', 'Bauherr', 'Bauherrenvertreter', 'Generalplaner',
        'Gesamtleiter', 'Bauleiter', 'Sonstige'
    ],

    IMPACT_LEVELS: {
        hoch: 'Hoch',
        mittel: 'Mittel',
        niedrig: 'Niedrig'
    },

    DISCUSSION_STATUSES: {
        offen: 'Offen',
        laufend: 'Laufend',
        informationen: 'Informationen',
        erledigt: 'Erledigt'
    },

    PARTICIPANT_TYPES: {
        organisator: 'Organisator',
        eingeladene: 'Eingeladene'
    },

    INSTANCE_STATUSES: {
        entwurf: 'Entwurf',
        aktiv: 'Aktiv',
        abgeschlossen: 'Abgeschlossen'
    },

    formatAuthor: function(name, company) {
        if (!name) return '';
        if (company) return name + ' (' + company + ')';
        return name;
    },

    formatDateShort: function(isoDate) {
        if (!isoDate) return '';
        var d = new Date(isoDate + 'T00:00:00');
        return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    formatDateTimeLong: function(isoDateTime) {
        if (!isoDateTime) return '';
        var d = new Date(isoDateTime);
        return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) +
               ' um ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
    }
};
