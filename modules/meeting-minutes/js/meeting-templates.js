var ACC = ACC || {};

ACC.MeetingTemplates = [
    {
        id: 'tpl-bim-koordination',
        name: 'BIM-Koordinationssitzung',
        type: 'bim_koordination',
        isBuiltIn: true,
        defaultLocation: '',
        defaultDurationMinutes: 90,
        defaultParticipantRoles: [
            { role: 'BIM-Manager', participantType: 'organisator' },
            { role: 'BIM-Koordinator', participantType: 'organisator' },
            { role: 'Projektleiter', participantType: 'eingeladene' },
            { role: 'Fachplaner Architektur', participantType: 'eingeladene' },
            { role: 'Fachplaner Tragwerk', participantType: 'eingeladene' },
            { role: 'Fachplaner HLKS', participantType: 'eingeladene' },
            { role: 'Fachplaner Elektro', participantType: 'eingeladene' }
        ],
        defaultTopicCategories: [
            { code: '01', label: 'Organisatorisches', sortOrder: 1 },
            { code: '02', label: 'Modelllieferungen', sortOrder: 2 },
            { code: '03', label: 'Kollisionsprüfung', sortOrder: 3 },
            { code: '04', label: 'Modellqualität', sortOrder: 4 },
            { code: '05', label: 'BIM-Prozesse', sortOrder: 5 },
            { code: '06', label: 'Koordinationsprobleme', sortOrder: 6 },
            { code: '07', label: 'Nächste Schritte', sortOrder: 7 }
        ],
        defaultCustomFieldDefs: [
            { label: 'Disziplin', type: 'text' },
            { label: 'Modellbereich', type: 'text' }
        ],
        defaultStatusOptions: [
            { key: 'offen', label: 'Offen' },
            { key: 'laufend', label: 'Laufend' },
            { key: 'informationen', label: 'Informationen' },
            { key: 'erledigt', label: 'Erledigt' }
        ]
    },
    {
        id: 'tpl-planungsbesprechung',
        name: 'Planungsbesprechung',
        type: 'planungsbesprechung',
        isBuiltIn: true,
        defaultLocation: '',
        defaultDurationMinutes: 120,
        defaultParticipantRoles: [
            { role: 'Projektleiter', participantType: 'organisator' },
            { role: 'Gesamtleiter', participantType: 'organisator' },
            { role: 'BIM-Manager', participantType: 'eingeladene' },
            { role: 'Fachplaner Architektur', participantType: 'eingeladene' },
            { role: 'Fachplaner Tragwerk', participantType: 'eingeladene' },
            { role: 'Fachplaner HLKS', participantType: 'eingeladene' },
            { role: 'Fachplaner Elektro', participantType: 'eingeladene' },
            { role: 'Bauherrenvertreter', participantType: 'eingeladene' }
        ],
        defaultTopicCategories: [
            { code: '01', label: 'Organisatorisches', sortOrder: 1 },
            { code: '02', label: 'Planungsgrundlagen', sortOrder: 2 },
            { code: '03', label: 'BIM', sortOrder: 3 },
            { code: '04', label: 'Vermessung', sortOrder: 4 },
            { code: '05', label: 'Statik / Tragwerk', sortOrder: 5 },
            { code: '06', label: 'Unterbauten', sortOrder: 6 },
            { code: '07', label: 'Überbau', sortOrder: 7 },
            { code: '08', label: 'Ausstattung', sortOrder: 8 },
            { code: '09', label: 'Terminplanung', sortOrder: 9 },
            { code: '10', label: 'Verschiedenes', sortOrder: 10 }
        ],
        defaultCustomFieldDefs: [
            { label: 'Nr. im Excel-Protokoll', type: 'text' },
            { label: 'Datum', type: 'date' },
            { label: 'Nr. P-Besprechung', type: 'text' },
            { label: 'von', type: 'text' },
            { label: 'LE', type: 'text' }
        ],
        defaultStatusOptions: [
            { key: 'offen', label: 'Offen' },
            { key: 'laufend', label: 'Laufend' },
            { key: 'informationen', label: 'Informationen' },
            { key: 'erledigt', label: 'Erledigt' }
        ]
    },
    {
        id: 'tpl-baustellenbesprechung',
        name: 'Baustellenbesprechung',
        type: 'baustellenbesprechung',
        isBuiltIn: true,
        defaultLocation: 'Baustelle',
        defaultDurationMinutes: 60,
        defaultParticipantRoles: [
            { role: 'Bauleiter', participantType: 'organisator' },
            { role: 'Projektleiter', participantType: 'eingeladene' },
            { role: 'Bauherrenvertreter', participantType: 'eingeladene' }
        ],
        defaultTopicCategories: [
            { code: '01', label: 'Organisatorisches', sortOrder: 1 },
            { code: '02', label: 'Baufortschritt', sortOrder: 2 },
            { code: '03', label: 'Qualitätssicherung', sortOrder: 3 },
            { code: '04', label: 'Sicherheit / SiGe', sortOrder: 4 },
            { code: '05', label: 'Terminplanung', sortOrder: 5 },
            { code: '06', label: 'Verschiedenes', sortOrder: 6 }
        ],
        defaultCustomFieldDefs: [
            { label: 'Gewerk', type: 'text' },
            { label: 'Bauabschnitt', type: 'text' }
        ],
        defaultStatusOptions: [
            { key: 'offen', label: 'Offen' },
            { key: 'laufend', label: 'Laufend' },
            { key: 'informationen', label: 'Informationen' },
            { key: 'erledigt', label: 'Erledigt' }
        ]
    },
    {
        id: 'tpl-abnahme',
        name: 'Abnahmebesprechung',
        type: 'abnahme',
        isBuiltIn: true,
        defaultLocation: '',
        defaultDurationMinutes: 120,
        defaultParticipantRoles: [
            { role: 'Projektleiter', participantType: 'organisator' },
            { role: 'Bauleiter', participantType: 'organisator' },
            { role: 'Bauherr', participantType: 'eingeladene' },
            { role: 'Fachplaner Architektur', participantType: 'eingeladene' },
            { role: 'Generalplaner', participantType: 'eingeladene' }
        ],
        defaultTopicCategories: [
            { code: '01', label: 'Organisatorisches', sortOrder: 1 },
            { code: '02', label: 'Abnahmeobjekte', sortOrder: 2 },
            { code: '03', label: 'Mängelliste', sortOrder: 3 },
            { code: '04', label: 'Nachbesserungen', sortOrder: 4 },
            { code: '05', label: 'Verschiedenes', sortOrder: 5 }
        ],
        defaultCustomFieldDefs: [
            { label: 'Gewerk', type: 'text' },
            { label: 'Mangel-Nr.', type: 'text' },
            { label: 'Priorität', type: 'select', options: ['Hoch', 'Mittel', 'Niedrig'] }
        ],
        defaultStatusOptions: [
            { key: 'offen', label: 'Offen' },
            { key: 'laufend', label: 'Laufend' },
            { key: 'informationen', label: 'Informationen' },
            { key: 'erledigt', label: 'Erledigt' }
        ]
    }
];

ACC.MeetingTemplates.getById = function(id) {
    return this.find(function(t) { return t.id === id; }) || null;
};

ACC.MeetingTemplates.getByType = function(type) {
    return this.filter(function(t) { return t.type === type; });
};
