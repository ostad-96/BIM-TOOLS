/**
 * BIM Tools — Lightweight Dev Server
 * Serves static files + JSON database API for portable data storage.
 *
 * Usage:  node server.js
 * Opens:  http://localhost:3000
 *
 * DB is cached in memory; writes are debounced and async for performance.
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

// ── Write queue for serializing mutations ─────────────
var _writeQueue = Promise.resolve();

// ── In-memory DB cache ────────────────────────────────
var _db = {};
try {
    if (fs.existsSync(DB_FILE)) _db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
} catch(e) {
    console.error('  Warning: could not parse db.json, starting with empty DB');
    _db = {};
}

var _dbDirty = false;
var _dbWriteTimer = null;
var _dbWriting = false;

function schedulePersist() {
    _dbDirty = true;
    if (_dbWriteTimer) return; // already scheduled
    _dbWriteTimer = setTimeout(persistDb, 500);
}

function persistDb() {
    _dbWriteTimer = null;
    if (!_dbDirty || _dbWriting) return;
    _dbWriting = true;
    _dbDirty = false;
    var data = JSON.stringify(_db);
    var tmpFile = DB_FILE + '.tmp';
    fs.writeFile(tmpFile, data, 'utf8', function(err) {
        if (err) {
            console.error('  DB write error:', err.message);
            _dbDirty = true; // retry next cycle
            _dbWriting = false;
            return;
        }
        fs.rename(tmpFile, DB_FILE, function(err2) {
            if (err2) {
                console.error('  DB rename error:', err2.message);
                _dbDirty = true;
            }
            _dbWriting = false;
            // If more changes arrived while writing, schedule again
            if (_dbDirty) schedulePersist();
        });
    });
}

// Flush on shutdown
function flushAndExit() {
    if (_dbDirty) {
        try { fs.writeFileSync(DB_FILE, JSON.stringify(_db), 'utf8'); }
        catch(e) { console.error('  Flush failed:', e.message); }
    }
    process.exit(0);
}
process.on('SIGTERM', flushAndExit);
process.on('SIGINT', flushAndExit);

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
        return sendJSON(res, 200, _db);
    }

    if (url === '/api/db' && method === 'PUT') {
        var body = await readBody(req);
        try {
            _db = JSON.parse(body.toString('utf8'));
            schedulePersist();
            sendJSON(res, 200, { ok: true });
        } catch(e) {
            sendJSON(res, 400, { error: 'Invalid JSON' });
        }
        return;
    }

    // ── API: Atomic increment (race-safe) ───────────────
    // POST /api/db/:store/:id/increment/:field — atomically increment a numeric field
    var incrMatch = url.match(/^\/api\/db\/([a-zA-Z]+)\/([a-zA-Z0-9_-]+)\/increment\/([a-zA-Z]+)$/);
    if (incrMatch && method === 'POST') {
        var iStore = incrMatch[1], iRecId = incrMatch[2], iField = incrMatch[3];
        return _writeQueue = _writeQueue.then(async function() {
            if (!Array.isArray(_db[iStore])) return sendJSON(res, 404, { error: 'Store not found' });
            var rec = _db[iStore].find(function(r) { return r.id === iRecId; });
            if (!rec) return sendJSON(res, 404, { error: 'Record not found' });
            rec[iField] = (rec[iField] || 0) + 1;
            schedulePersist();
            sendJSON(res, 200, rec);
        }).catch(function(e) { sendJSON(res, 500, { error: e.message }); });
    }

    // ── API: Granular CRUD (serialized via write queue) ──
    // POST /api/db/:store          — create (body = entity)
    // PUT  /api/db/:store/:id      — update (body = entity)
    // DELETE /api/db/:store/:id    — remove
    var storeMatch = url.match(/^\/api\/db\/([a-zA-Z]+)(?:\/([a-zA-Z0-9_-]+))?$/);
    if (storeMatch) {
        var store = storeMatch[1];
        var recId = storeMatch[2] || null;
        if (!Array.isArray(_db[store])) _db[store] = [];

        if (method === 'POST' && !recId) {
            return _writeQueue = _writeQueue.then(async function() {
                var body = JSON.parse((await readBody(req)).toString('utf8'));
                _db[store].push(body);
                schedulePersist();
                sendJSON(res, 201, body);
            }).catch(function(e) { sendJSON(res, 500, { error: e.message }); });
        }

        if (method === 'PUT' && recId) {
            return _writeQueue = _writeQueue.then(async function() {
                var body = JSON.parse((await readBody(req)).toString('utf8'));
                var idx = _db[store].findIndex(function(r) { return r.id === recId; });
                if (idx === -1) _db[store].push(body);
                else _db[store][idx] = body;
                schedulePersist();
                sendJSON(res, 200, body);
            }).catch(function(e) { sendJSON(res, 500, { error: e.message }); });
        }

        if (method === 'DELETE' && recId) {
            return _writeQueue = _writeQueue.then(async function() {
                _db[store] = _db[store].filter(function(r) { return r.id !== recId; });
                schedulePersist();
                sendJSON(res, 200, { ok: true });
            }).catch(function(e) { sendJSON(res, 500, { error: e.message }); });
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
