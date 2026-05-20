/* ─────────────────────────────────────────────────────────────
   Sample meeting data — based on the user-provided ACC export
   (B3|SSW-VE02-AP Planungsbesprechung 23, 28.04.2026)
   Used by the print-preview page when no instanceId is supplied.
   ───────────────────────────────────────────────────────────── */
window.BIM = window.BIM || {};
BIM.PrintSampleData = {
    company: {
        name: 'Firma AG',
        tagline: 'Engineering & Planung',
        address: 'Musterstrasse 12 · 8004 Zürich · firma.ag',
        logo: '../../shared/assets/emch-berger-logo.gif'
    },
    project: {
        code: 'B3-SSW-VE02',
        title: 'Leinebrücke + Leineflutmuldenbrücke — Ausführungsplanung',
        number: '2024-A-0817'
    },
    series: {
        code: 'B3|SSW-VE02-AP',
        title: 'Planungsbesprechung',
        type: 'planungsbesprechung',
        description: 'B3|SSW-VE02-AP: Planungsbesprechung VE02 — 14-tägig.'
    },
    instance: {
        number: 23,
        date: '2026-04-28',
        timeStart: '09:00',
        timeEnd: '11:00',
        location: 'MS-Teams',
        createdBy: 'Sven Kimmeskamp',
        createdAt: '2026-04-28T09:49:00',
        author: 'Sven Kimmeskamp (STRABAG ZUEBLIN)',
        verteiler: 'Alle Eingeladenen · Projektablage SharePoint'
    },
    participants: {
        organisatoren: [
            { name: 'Arnim Marx',        company: 'STRABAG ZUEBLIN', present: true  },
            { name: 'Lena Heise',        company: 'NLStBV',          present: true  },
            { name: 'Sven Kimmeskamp',   company: 'STRABAG ZUEBLIN', present: true  }
        ],
        eingeladene: [
            { name: 'Ahmed Majdoub',       company: 'NLStBV',                  present: true  },
            { name: 'Alexander Pieta',     company: 'Firma AG',                present: false },
            { name: 'Bartek Jaroszewski',  company: 'Firma AG Holding GmbH',   present: true  },
            { name: 'Bernd Lesemann',      company: 'NLStBV',                  present: true  },
            { name: 'Dominic Schenkemeyer',company: 'NLStBV',                  present: false },
            { name: 'Kai Dietrich',        company: 'NLStBV',                  present: true  },
            { name: 'Kai Uwe Spahn',       company: 'STRABAG ZUEBLIN',         present: true  },
            { name: 'Ulf Schwanemann',     company: 'INGE B3 BÜ SSW',          present: true  },
            { name: 'Walter Stoffel',      company: 'Firma AG',                present: false }
        ]
    },
    categories: [
        { code: '01', label: 'Organisatorisches' },
        { code: '02', label: 'Planungsgrundlagen' },
        { code: '03', label: 'BIM' },
        { code: '04', label: 'Vermessung' },
        { code: '05', label: 'Mittellängsverbauten' },
        { code: '06', label: 'Spundwände' },
        { code: '07', label: 'Bohrpfähle' },
        { code: '08', label: 'Unterbauten' },
        { code: '09', label: 'Überbau' },
        { code: '10', label: 'Ausstattung' },
        { code: '11', label: 'Abbruch Bestandsbauwerk' }
    ],
    items: [
        // ── 01 Organisatorisches ──
        { cat:'01', n:1, title:'Besprechungsniederschriften',
          desc:'Protokolle werden als PDF bis zum Folgetag 12 Uhr auf dem SharePoint unter dem Link 01_Besprechungsniederschriften hochgeladen.',
          fields:[['Nr. im Excel-Protokoll','59'],['Datum','13.08.24'],['Nr. P-Besprechung','PB06'],['von','LR'],['LE','—']],
          status:'informationen',
          createdAt:'01.07.2025', createdBy:'Arnim Marx (STRABAG ZUEBLIN)',
          updatedAt:'01.07.2025', updatedBy:'Arnim Marx (STRABAG ZUEBLIN)',
          updates:[] },

        { cat:'01', n:2, title:'Planformalia',
          desc:'Pläne sollen die Höhe eines A0-Planes maximal aufweisen. Die Pläne können in Ausnahmefällen länger als A0 sein.',
          fields:[['Nr. im Excel-Protokoll','63'],['Datum','24.09.24'],['von','LR']],
          status:'informationen',
          createdAt:'01.07.2025', createdBy:'Arnim Marx (STRABAG ZUEBLIN)',
          updatedAt:'26.08.2025', updatedBy:'Arnim Marx (STRABAG ZUEBLIN)',
          updates:[] },

        { cat:'01', n:3, title:'Verkehrseinschränkungen Bestandsbauwerke',
          desc:'Es gibt folgende Verkehrseinschränkungen:\n• Abstandsregelung mind. 80 m für LKW\n• Gewichtsbeschränkung 40 t',
          fields:[['Nr. im Excel-Protokoll','72'],['Datum','12.11.24'],['LE','LE1 / LE2']],
          status:'informationen',
          createdAt:'01.07.2025', createdBy:'Arnim Marx (STRABAG ZUEBLIN)',
          updatedAt:'26.08.2025', updatedBy:'Arnim Marx (STRABAG ZUEBLIN)',
          updates:[
            { date:'26.08.25', text:'Fahrzeuge über 40 t dürfen nicht ohne Rücksprache und Zustimmung mit dem AG und der Einreichung einer statischen Berechnung auf den Bestandsbauwerken abgestellt werden.' }
          ] },

        { cat:'01', n:4, title:'Planlaufliste',
          desc:'Die Planlaufliste dient als Besprechungsgrundlage für die Prüfung der Freigabe von dringenden Unterlagen.',
          fields:[],
          status:'offen',
          due:'28.04.2026', assignees:['Sven Kimmeskamp (STRABAG ZUEBLIN)','Lena Heise (NLStBV)'],
          attachments:['Planliste_Auszug_LFMB_2025-11-10.pdf'],
          createdAt:'11.11.2025', createdBy:'Arnim Marx (STRABAG ZUEBLIN)',
          updatedAt:'28.04.2026', updatedBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updates:[
            { date:'11.11.25', text:'AN bittet nach Bereitstellung um Freigabe in folgender Priorisierung: 1) Widerlagerwand Süd Achse B, 2) Aufgehender Pfeiler Achse 4, 3) Pfahlkopfplatte Achse 5.' },
            { date:'25.11.25', text:'Freigabe für Widerlagerwand Süd, Achse B wurde erteilt. Bitte um zeitnahe Prüfung der Pläne zum aufgehenden Pfeiler Achse 4.' },
            { date:'09.12.25', text:'Aktueller Stand der Planlaufliste von Anfang Dezember wird im Laufe der Woche vom AN verteilt.' },
            { date:'13.01.26', text:'Aktueller Stand der Liste wurde gestern vom AN verteilt.' },
            { date:'03.02.26', text:'Letzter Stand wurde am 29.01.26 vom AN verteilt. AN bittet um Freigabe der Bewehrungspläne Pfeilerachse 5.' },
            { date:'31.03.26', text:'Parallel zur LFMB soll eine separate Planliste mit Einreich- und Freigabeterminen erstellt und verteilt werden.' },
            { date:'14.04.26', text:'Auszug Planliste zur LB mit erforderlichen Freigabeterminen für die Terminsicherung wurde verteilt.' },
            { date:'28.04.26', text:'Aktueller Auszug aus Planliste zur Leinebrücke wurde am 27.04.26 verteilt. Als nächstes benötigt: Bohrpfähle + Absteckung Achse A, Fundament Achse B, Bohrpfähle Achse 1, Fundament Achse 2.' }
          ] },

        { cat:'01', n:5, title:'Nutzung der "Baumodifikation" in EPLASS',
          desc:'AG bittet um sensible Verwendung des Workflows der Baumodifikation, die eigentlich nur für kleinere Anpassungen vorgesehen ist. Vorabstimmung zwischen AN und Grünprüfer sowie Kenntlichmachung der Änderungen vor Wiedereinstellung.',
          fields:[],
          status:'laufend',
          createdAt:'14.04.2026', createdBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updatedAt:'14.04.2026', updatedBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updates:[] },

        // ── 02 Planungsgrundlagen ──
        { cat:'02', n:1, title:'Trassierung / Straßenplanung',
          desc:'Wir bitten um kurzfristige Bereitstellung der Straßentrassierung (End- und Seitenlage) auch als PDF-Pläne (Höhen-, Lage- und Grundrisspläne).',
          fields:[['Nr. im Excel-Protokoll','30'],['Nr. P-Besprechung','PB01, PB05'],['von','SK'],['LE','LE2']],
          status:'offen',
          due:'30.06.2026', assignees:['Lena Heise (NLStBV)'],
          createdAt:'30.06.2025', createdBy:'Arnim Marx (STRABAG ZUEBLIN)',
          updatedAt:'24.03.2026', updatedBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updates:[
            { date:'05.11.24', text:'Geschätzte Übergabe der AP ist Mitte 2025. Der AN weist auf mögliche Gefahren (Freigabe Ingenieurbauplanung, Planungshaftung) hin.' },
            { date:'25.03.25', text:'Aus den bisher übergebenen Daten aus der Straßenplanung sind keine Änderungen mehr zu erwarten. Übergabe der freigegebenen Ausführungsplanung kann derzeit nicht terminiert werden.' },
            { date:'17.02.26', text:'Seitens AG kann derzeit kein Datum für die Übergabe AP Straßenplanung genannt werden.' },
            { date:'24.03.26', text:'Kein neuer Sachstand. AG kommt auf den AN zu, wenn Unterlagen vorliegen.' }
          ] },

        { cat:'02', n:2, title:'LB — Angepasste Bauvertragspläne',
          desc:'Bauvertragspläne wurden zur Sichtung und Unterzeichnung an den AG übergeben. AG bittet um kurze Auflistung der vorgenommenen Änderungen für das Dez. 32.',
          fields:[],
          status:'offen',
          due:'28.04.2026', assignees:['Lena Heise (NLStBV)'],
          createdAt:'24.03.2026', createdBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updatedAt:'28.04.2026', updatedBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updates:[
            { date:'31.03.26', text:'Auflistung mit vorgenommenen Anpassungen wurde aufgestellt und per E-Mail verteilt. Rückmeldung wird ca. in den nächsten 2 Wochen erwartet.' },
            { date:'14.04.26', text:'AG geht davon aus, dass zeitnah eine Rückmeldung / Bestätigung zu den angepassten Bauvertragsplänen erfolgen wird.' },
            { date:'28.04.26', text:'Rückfrage von Hr. Maretzki zur lichten Höhe zwischen OK Pfeiler und UK Mittelquerträger wurde beantwortet (zw. 80 und 90 cm). Rückmeldung bzw. Bestätigung wird zeitnah erwartet.' }
          ] },

        // ── 03 BIM ──
        { cat:'03', n:1, title:'BIM-basierte Planungsbesprechung',
          desc:'Der AG bittet die Planungsbesprechung auch weiterhin BIM-basiert stattfinden zu lassen. Gemäß AIA soll regelmäßig der aktuelle Planungsstand mit dem Gesamtmodell zur Verfügung gestellt werden.',
          fields:[['Nr. im Excel-Protokoll','95'],['Datum','25.03.25'],['LE','LE1 / LE2']],
          status:'laufend',
          assignees:['Arnim Marx (STRABAG ZUEBLIN)'],
          createdAt:'30.06.2025', createdBy:'Arnim Marx (STRABAG ZUEBLIN)',
          updatedAt:'26.08.2025', updatedBy:'Arnim Marx (STRABAG ZUEBLIN)',
          updates:[
            { date:'01.07.25', text:'Der Termin hat am 10.06.25 stattgefunden. Dieses wird fortlaufend umgesetzt.' },
            { date:'26.08.25', text:'Das Protokoll der Planungsbesprechung wurde gemäß dem Vorschlag des AN neu strukturiert.' }
          ] },

        { cat:'03', n:2, title:'BAP — BIM-Abwicklungsplan',
          desc:'Die aktuelle Version V2 wurde gesichtet und am 17.06.25 auf dem SharePoint abgelegt. Zur Überarbeitung des BAP soll die schriftliche Stellungnahme des AG abgewartet werden.',
          fields:[],
          status:'offen',
          due:'03.03.2026', assignees:['Arnim Marx (STRABAG ZUEBLIN)'],
          attachments:['Strukturierung Planungsbesprechung ACC_Vorschlag.pdf'],
          createdAt:'30.06.2025', createdBy:'Arnim Marx (STRABAG ZUEBLIN)',
          updatedAt:'17.02.2026', updatedBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updates:[
            { date:'09.09.25', text:'Abstimmungstermin zwischen Hr. Marx, Frau Krumm, Hr. Jaroszewski & Hr. Lesemann hat stattgefunden. Die abgestimmten Punkte werden in den BAP eingearbeitet.' },
            { date:'04.11.25', text:'Anmerkungen zum BAP werden vom AG bis zur nächsten Planungsbesprechung verteilt.' },
            { date:'25.11.25', text:'BAP wurde kommentiert am 20.11.25 an AN übergeben.' },
            { date:'17.02.26', text:'Rückmeldung zum BAP ist erfolgt. Antwort durch Hr. Marx noch ausstehend.' }
          ] },

        // ── 05 Mittellängsverbauten ──
        { cat:'05', n:1, title:'LFMB — MLV: Verbreiterung Baustraßenbreite',
          desc:'Auf Grund der aufgestellten KSW ergibt sich derzeit nur eine Breite der Baustraße von ca. 2,60 m. AG bittet um Überprüfung, ob eine Reduzierung des lastfreien Streifens eine Verbreiterung auf min. 3,0 m ermöglicht.',
          fields:[],
          status:'laufend',
          createdAt:'29.07.2025', createdBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updatedAt:'20.01.2026', updatedBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updates:[
            { date:'09.12.25', text:'Die Nachweisführung wurde erbracht. Die Statik soll in EPLASS zur Prüfung eingereicht werden. Plananpassung soll über die Baumodifikation erst nach Freigabe der Statik erfolgen.' },
            { date:'13.01.26', text:'Die Statik wurde eingereicht und ist in der Prüfung.' },
            { date:'20.01.26', text:'Die Prüfung sollte im Rahmen der zur Verfügung stehenden Prüffrist erfolgen.' }
          ] },

        // ── 06 Spundwände ──
        { cat:'06', n:1, title:'LB Verbau Achse 1 — Lockerungsbohrungen',
          desc:'Ausführung der Lockerungsbohrungen für erschütterungsfreies Einbringen von Spundwänden.',
          fields:[],
          status:'offen',
          due:'30.04.2026', assignees:['Sven Kimmeskamp (STRABAG ZUEBLIN)'],
          createdAt:'24.03.2026', createdBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updatedAt:'28.04.2026', updatedBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updates:[
            { date:'31.03.26', text:'Gegenüber der vorgeschlagenen Lösung müssen aus statischen Gründen noch Anpassungen vorgenommen werden.' },
            { date:'28.04.26', text:'Fertige Ausführungsunterlage wird Ende April erwartet und soll dann neben der Grünprüfung an die übrigen Beteiligten verteilt werden.' }
          ] },

        // ── 08 Unterbauten ──
        { cat:'08', n:1, title:'LB: Verbreiterung Endquerträger Achse B',
          desc:'Aus statischen Gründen ist der Endquerträger 5 cm breiter auszubilden, um randnahe Pressungen und Betonabplatzungen zu vermeiden. AN weist auf Reduzierung der Wartungsgangbreite um 5 cm (100 → 95 cm) hin.',
          fields:[],
          status:'offen',
          due:'28.04.2026', assignees:['Sven Kimmeskamp (STRABAG ZUEBLIN)'],
          createdAt:'03.03.2026', createdBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updatedAt:'28.04.2026', updatedBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updates:[
            { date:'24.03.26', text:'Die Wartungsbreite soll gem. RE-ING mit 1 m Breite beibehalten werden. AG bittet AN um Mitteilung der zeitlichen Konsequenzen.' },
            { date:'28.04.26', text:'Anzupassende Pläne können wie folgt in den Prüflauf gegeben werden: Achse B Schalpläne KW 19, Bewehrungspläne KW 21 · Achse A Schalpläne KW 21, Bewehrungspläne KW 24.' }
          ] },

        // ── 10 Ausstattung ──
        { cat:'10', n:1, title:'LFMB LSW-Pfosten: Schnittstelle Planung & Ausführung',
          desc:'AG klärt die Schnittstellen zur LSW auf der LFMB hinsichtlich Planung und Ausführung.',
          fields:[],
          status:'offen',
          due:'12.05.2026', assignees:['Sven Kimmeskamp (STRABAG ZUEBLIN)'],
          createdAt:'17.02.2026', createdBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updatedAt:'28.04.2026', updatedBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updates:[
            { date:'24.03.26', text:'AG wird den nicht genehmigten Entwurf zur LSW an den AN zunächst zur Information übergeben. Anschließend Sichtung durch AN und ggf. Rücksprache mit AG.' },
            { date:'31.03.26', text:'AN wird den S.- und B-Plan zu den Kappen mit Annahmen zur Lage der LSW-Verankerung zur Prüfung einreichen.' },
            { date:'28.04.26', text:'In der Zusendung der Entwurfsunterlagen vom 21.04.26 ist nun der Entwurf zur LSW enthalten. Bereits fertiggestellte Pläne werden dennoch in den Prüflauf eingereicht.' }
          ] },

        // ── 11 Abbruch Bestandsbauwerk ──
        { cat:'11', n:1, title:'Abbruchkonzept Leine',
          desc:'AN möchte das Abbruchkonzept zur Leinebrücke vorstellen und bittet um Terminvorschlag und Teilnehmerklärung.',
          fields:[],
          status:'offen',
          due:'05.05.2026', assignees:['Lena Heise (NLStBV)'],
          createdAt:'28.04.2026', createdBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updatedAt:'28.04.2026', updatedBy:'Sven Kimmeskamp (STRABAG ZUEBLIN)',
          updates:[] }
    ]
};
