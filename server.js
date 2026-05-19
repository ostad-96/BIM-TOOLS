/**
 * BIM Tools — Lightweight Dev Server
 * Serves static files + JSON database API for portable data storage.
 *
 * Usage:  node server.js
 * Opens:  http://localhost:3000
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT     = process.env.PORT || 3000;
const ROOT     = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE  = path.join(DATA_DIR, 'db.json');
const ATT_DIR  = path.join(DATA_DIR, 'attachments');

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(ATT_DIR))  fs.mkdirSync(ATT_DIR);

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.gif':  'image/gif',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
    '.pdf':  'application/pdf'
};

function readBody(req) {
    return new Promise(function(resolve, reject) {
        var chunks = [];
        req.on('data', function(c) { chunks.push(c); });
        req.on('end',  function()  { resolve(Buffer.concat(chunks)); });
        req.on('error', reject);
    });
}

function sendJSON(res, code, obj) {
    var body = JSON.stringify(obj);
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(body);
}

function serveStatic(res, filePath) {
    var ext  = path.extname(filePath).toLowerCase();
    var mime = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, function(err, data) {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
    });
}

var server = http.createServer(async function(req, res) {
    var method = req.method;
    var url    = req.url.split('?')[0]; // strip query string

    // ── API: Database (bulk) ─────────────────────────────
    if (url === '/api/db' && method === 'GET') {
        if (!fs.existsSync(DB_FILE)) return sendJSON(res, 200, {});
        fs.readFile(DB_FILE, 'utf8', function(err, raw) {
            if (err) return sendJSON(res, 500, { error: err.message });
            try { sendJSON(res, 200, JSON.parse(raw)); }
            catch(e) { sendJSON(res, 200, {}); }
        });
        return;
    }

    if (url === '/api/db' && method === 'PUT') {
        var body = await readBody(req);
        fs.writeFile(DB_FILE, body, 'utf8', function(err) {
            if (err) return sendJSON(res, 500, { error: err.message });
            sendJSON(res, 200, { ok: true });
        });
        return;
    }

    // ── API: Granular CRUD ─────────────────────────────
    // POST /api/db/:store          — create (body = entity)
    // PUT  /api/db/:store/:id      — update (body = entity)
    // DELETE /api/db/:store/:id    — remove
    var storeMatch = url.match(/^\/api\/db\/([a-zA-Z]+)(?:\/([a-zA-Z0-9_-]+))?$/);
    if (storeMatch) {
        var store = storeMatch[1];
        var recId = storeMatch[2] || null;
        var db = {};
        try {
            if (fs.existsSync(DB_FILE)) db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        } catch(e) {}
        if (!Array.isArray(db[store])) db[store] = [];

        if (method === 'POST' && !recId) {
            var body = JSON.parse((await readBody(req)).toString('utf8'));
            db[store].push(body);
            fs.writeFileSync(DB_FILE, JSON.stringify(db), 'utf8');
            return sendJSON(res, 201, body);
        }

        if (method === 'PUT' && recId) {
            var body = JSON.parse((await readBody(req)).toString('utf8'));
            var idx = db[store].findIndex(function(r) { return r.id === recId; });
            if (idx === -1) db[store].push(body);
            else db[store][idx] = body;
            fs.writeFileSync(DB_FILE, JSON.stringify(db), 'utf8');
            return sendJSON(res, 200, body);
        }

        if (method === 'DELETE' && recId) {
            db[store] = db[store].filter(function(r) { return r.id !== recId; });
            fs.writeFileSync(DB_FILE, JSON.stringify(db), 'utf8');
            return sendJSON(res, 200, { ok: true });
        }

        return sendJSON(res, 400, { error: 'Bad request' });
    }

    // ── API: Attachments ───────────────────────────────
    var attMatch = url.match(/^\/api\/attachments\/([a-zA-Z0-9_-]+)$/);
    if (attMatch) {
        var attId   = attMatch[1];
        var attPath = path.join(ATT_DIR, attId);

        if (method === 'GET') {
            if (!fs.existsSync(attPath)) { res.writeHead(404); res.end('Not found'); return; }
            fs.readFile(attPath, function(err, data) {
                if (err) { res.writeHead(500); res.end(err.message); return; }
                res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
                res.end(data);
            });
            return;
        }

        if (method === 'POST' || method === 'PUT') {
            var body = await readBody(req);
            fs.writeFile(attPath, body, function(err) {
                if (err) return sendJSON(res, 500, { error: err.message });
                sendJSON(res, 200, { ok: true });
            });
            return;
        }

        if (method === 'DELETE') {
            if (fs.existsSync(attPath)) fs.unlinkSync(attPath);
            sendJSON(res, 200, { ok: true });
            return;
        }
    }

    // ── Static files ───────────────────────────────────
    var filePath = path.join(ROOT, decodeURIComponent(url));
    if (filePath.endsWith(path.sep) || filePath === ROOT) {
        filePath = path.join(filePath, 'login.html');
    }

    // Security: prevent directory traversal
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403); res.end('Forbidden'); return;
    }

    // If path is a directory, serve index.html inside it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    serveStatic(res, filePath);
});

server.listen(PORT, function() {
    console.log('');
    console.log('  BIM Tools Server running at:');
    console.log('  http://localhost:' + PORT);
    console.log('  Database: ' + DB_FILE);
    console.log('');
});
