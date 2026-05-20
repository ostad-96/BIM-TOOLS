# Demo-Seed: Vorlage-Serie zur Vorschau

`db.demo-seed.json` enthält eine vollständige Beispiel-Besprechungsserie zum Vorzeigen:

- **Serie:** B3|SSW-VE02-AP — Planungsbesprechung VE02 — Leinebrücke
- **Sitzungen:** 6 (Nr. 18 bis 23, Februar – April 2026)
- **Teilnehmer:** 8 pro Sitzung mit realistischer Anwesenheit
- **Kategorien:** 11 (01 Organisatorisches … 11 Abbruch Bestandsbauwerk)
- **Diskussionspunkte:** 19 mit Status, Fälligkeit, Zuweisungen und benutzerdefinierten Feldern
- **Verläufe:** 34 chronologische Updates über mehrere Sitzungen

## Lokale Vorschau

Die Daten wurden bereits in die lokale `data/db.json` einmischt — die Serie erscheint sofort
in der Sitzungsprotokoll-Übersicht beim nächsten Laden der App.

## Übertragung auf den Produktivserver

```bash
# 1. Aktuelles Backup ziehen
scp -i ~/.ssh/bim-tools-server root@116.203.251.83:/root/bim-tools/data/db.json db.backup.json

# 2. Seed-Datei hochladen
scp -i ~/.ssh/bim-tools-server data/db.demo-seed.json root@116.203.251.83:/tmp/demo-seed.json

# 3. Auf dem Server mergen und Service neu starten
ssh -i ~/.ssh/bim-tools-server root@116.203.251.83
cd /root/bim-tools
node -e "
  const fs = require('fs');
  const db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));
  const seed = JSON.parse(fs.readFileSync('/tmp/demo-seed.json', 'utf8'));
  ['meetingSeries','meetingInstances','participants','discussionItems','discussionUpdates'].forEach(k => {
    db[k] = (db[k] || []).concat(seed[k] || []);
  });
  fs.writeFileSync('data/db.json', JSON.stringify(db));
  console.log('Merged. Series count:', db.meetingSeries.length);
"
systemctl restart bim-tools
```

## Idempotenz

Der lokale Merge prüft auf vorhandene Serien mit dem Code `B3|SSW-VE02-AP` und ersetzt sie sauber
(inkl. aller abhängigen Datensätze). Auf dem Server appendiert der obige Snippet nur — wenn die Demo-Serie
bereits existiert, würde sie dort doppelt erscheinen. Bei Bedarf vor dem Merge entfernen:

```bash
node -e "
  const fs = require('fs'); const db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));
  const drop = db.meetingSeries.filter(s => s.code === 'B3|SSW-VE02-AP').map(s => s.id);
  db.meetingSeries     = db.meetingSeries.filter(s => !drop.includes(s.id));
  db.meetingInstances  = db.meetingInstances.filter(i => !drop.includes(i.seriesId));
  db.participants      = db.participants.filter(p => !drop.includes(p.seriesId));
  const itemDrop = db.discussionItems.filter(i => drop.includes(i.seriesId)).map(i => i.id);
  db.discussionItems   = db.discussionItems.filter(i => !drop.includes(i.seriesId));
  db.discussionUpdates = db.discussionUpdates.filter(u => !itemDrop.includes(u.discussionItemId));
  fs.writeFileSync('data/db.json', JSON.stringify(db));
"
```