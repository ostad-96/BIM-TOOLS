/**
 * BIM.JsonStorageProvider — server-backed JSON file storage.
 * BIM.AutoStorageProvider — probes server, falls back to IndexedDB.
 *
 * Usage: new BIM.AutoStorageProvider()
 *   → tries GET /api/db
 *   → if server responds: uses JsonStorageProvider (data in data/db.json)
 *   → if server unreachable: uses IndexedDBProvider (data in browser)
 */

var BIM = BIM || {};

BIM.JsonStorageProvider = function() {
    this._data = {};
    this._saveTimer = null;
    this._saving = false;
    this._dirty = false;

    // All known store names (mirrors IndexedDB schema)
    this._stores = [
        'meetingSeries', 'meetingInstances', 'participants',
        'discussionItems', 'discussionUpdates', 'attachments',
        'seriesTemplates', 'userProfiles', 'activityLogs', 'sessions'
    ];
};

BIM.JsonStorageProvider.prototype = Object.create(BIM.StorageProvider.prototype);

// ── Lifecycle ──────────────────────────────────────────

BIM.JsonStorageProvider.prototype.open = function() {
    var self = this;
    return fetch('/api/db')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            self._data = data || {};
            // Ensure every store exists as an array
            self._stores.forEach(function(name) {
                if (!Array.isArray(self._data[name])) {
                    self._data[name] = [];
                }
            });
        })
        .catch(function(err) {
            console.warn('JsonStorageProvider: could not load db, starting fresh.', err);
            self._stores.forEach(function(name) {
                self._data[name] = [];
            });
        });
};

// ── Reads (all from memory) ────────────────────────────

BIM.JsonStorageProvider.prototype.getById = function(store, id) {
    var arr = this._data[store] || [];
    var found = null;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === id) { found = arr[i]; break; }
    }
    return Promise.resolve(found);
};

BIM.JsonStorageProvider.prototype.getAll = function(store) {
    return Promise.resolve((this._data[store] || []).slice());
};

BIM.JsonStorageProvider.prototype.query = function(store, filter) {
    var arr = this._data[store] || [];
    var keys = Object.keys(filter || {});
    if (keys.length === 0) return Promise.resolve(arr.slice());

    var results = arr.filter(function(item) {
        return keys.every(function(k) { return item[k] === filter[k]; });
    });
    return Promise.resolve(results);
};

BIM.JsonStorageProvider.prototype.count = function(store, filter) {
    if (!filter || Object.keys(filter).length === 0) {
        return Promise.resolve((this._data[store] || []).length);
    }
    return this.query(store, filter).then(function(r) { return r.length; });
};

// ── Writes (memory + debounced persist) ────────────────

BIM.JsonStorageProvider.prototype.create = function(store, entity) {
    var self = this;
    if (!this._data[store]) this._data[store] = [];

    // Handle attachment blobs — upload file separately
    if (store === 'attachments' && entity.blob) {
        var blob = entity.blob;
        var meta = Object.assign({}, entity);
        delete meta.blob; // Don't store blob in JSON
        meta._hasFile = true;

        this._data[store].push(meta);

        // Upload blob to server, then persist metadata
        return this._uploadAttachment(entity.id, blob).then(function() {
            return self._saveRecord('POST', store, meta);
        }).then(function() {
            return meta;
        });
    }

    this._data[store].push(entity);
    return this._saveRecord('POST', store, entity).then(function() { return entity; });
};

BIM.JsonStorageProvider.prototype.update = function(store, entity) {
    var arr = this._data[store] || [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === entity.id) {
            if (store === 'attachments' && arr[i]._hasFile) {
                entity._hasFile = true;
                delete entity.blob;
            }
            arr[i] = entity;
            break;
        }
    }
    return this._saveRecord('PUT', store, entity).then(function() { return entity; });
};

BIM.JsonStorageProvider.prototype.remove = function(store, id) {
    var self = this;
    var arr = this._data[store] || [];
    var removed = null;
    this._data[store] = arr.filter(function(item) {
        if (item.id === id) { removed = item; return false; }
        return true;
    });

    var savePromise = this._deleteRecord(store, id);

    if (store === 'attachments' && removed && removed._hasFile) {
        return savePromise.then(function() { return self._deleteAttachment(id); });
    }
    return savePromise;
};

BIM.JsonStorageProvider.prototype.clear = function(store) {
    var self = this;
    var arr = this._data[store] || [];
    this._data[store] = [];
    return Promise.all(arr.map(function(item) {
        return self._deleteRecord(store, item.id);
    }));
};

// ── Persistence (granular — one record at a time) ────

BIM.JsonStorageProvider.prototype._saveRecord = function(method, store, entity) {
    var url = '/api/db/' + store;
    if (method === 'PUT') url += '/' + entity.id;

    return fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entity)
    }).then(function(res) {
        if (!res.ok) console.error('JsonStorageProvider: save failed', res.status);
    }).catch(function(err) {
        console.error('JsonStorageProvider: save error', err);
    });
};

BIM.JsonStorageProvider.prototype._deleteRecord = function(store, id) {
    return fetch('/api/db/' + store + '/' + id, {
        method: 'DELETE'
    }).then(function(res) {
        if (!res.ok) console.error('JsonStorageProvider: delete failed', res.status);
    }).catch(function(err) {
        console.error('JsonStorageProvider: delete error', err);
    });
};

// ── Attachment file operations ─────────────────────────

BIM.JsonStorageProvider.prototype._uploadAttachment = function(id, blob) {
    return fetch('/api/attachments/' + id, {
        method: 'POST',
        body: blob
    }).then(function(res) {
        if (!res.ok) throw new Error('Attachment upload failed: ' + res.status);
    });
};

BIM.JsonStorageProvider.prototype._deleteAttachment = function(id) {
    return fetch('/api/attachments/' + id, {
        method: 'DELETE'
    }).then(function(res) {
        if (!res.ok) console.warn('Attachment delete failed: ' + res.status);
    });
};

/**
 * Retrieve the blob for an attachment.
 * Called by meeting-store's downloadAttachment when att.blob is missing.
 */
BIM.JsonStorageProvider.prototype.getAttachmentBlob = function(id) {
    return fetch('/api/attachments/' + id)
        .then(function(res) {
            if (!res.ok) return null;
            return res.blob();
        });
};

// ════════════════════════════════════════════════════════
// BIM.AutoStorageProvider
// Probes the server on open(). Uses JSON provider if reachable,
// falls back to IndexedDB if not (e.g. opening HTML via file://).
// ════════════════════════════════════════════════════════

BIM.AutoStorageProvider = function() {
    this._inner = null; // set during open()
};

BIM.AutoStorageProvider.prototype = Object.create(BIM.StorageProvider.prototype);

BIM.AutoStorageProvider.prototype.open = function() {
    var self = this;

    return fetch('/api/db', { method: 'GET' })
        .then(function(res) {
            if (!res.ok) throw new Error('Server returned ' + res.status);
            return res.json();
        })
        .then(function(data) {
            // Server is available — use JsonStorageProvider
            console.info('%c[Storage] Server erkannt — verwende JSON-Datei (data/db.json)', 'color:#22c55e; font-weight:bold;');
            var provider = new BIM.JsonStorageProvider();
            provider._data = data || {};
            provider._stores.forEach(function(name) {
                if (!Array.isArray(provider._data[name])) {
                    provider._data[name] = [];
                }
            });
            self._inner = provider;
        })
        .catch(function() {
            // Server unreachable — fall back to IndexedDB
            console.info('%c[Storage] Kein Server — verwende Browser-Datenbank (IndexedDB)', 'color:#f59e0b; font-weight:bold;');
            var provider = new BIM.IndexedDBProvider('bim-platform');
            self._inner = provider;
            return provider.open();
        });
};

// Delegate all 8 methods to whichever provider was selected
['getById', 'getAll', 'query', 'create', 'update', 'remove', 'count', 'clear'].forEach(function(method) {
    BIM.AutoStorageProvider.prototype[method] = function() {
        return this._inner[method].apply(this._inner, arguments);
    };
});

// Forward getAttachmentBlob if the inner provider supports it
BIM.AutoStorageProvider.prototype.getAttachmentBlob = function(id) {
    if (this._inner && this._inner.getAttachmentBlob) {
        return this._inner.getAttachmentBlob(id);
    }
    return Promise.resolve(null);
};
