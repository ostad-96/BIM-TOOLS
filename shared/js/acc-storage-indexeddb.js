var BIM = BIM || {};

BIM.IndexedDBProvider = function(dbName) {
    this.dbName = dbName;
    this.db = null;
    this.version = 3;
};

BIM.IndexedDBProvider.prototype = Object.create(BIM.StorageProvider.prototype);

BIM.IndexedDBProvider.prototype.open = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = indexedDB.open(self.dbName, self.version);

        request.onblocked = function() {
            // Another tab has the old version open — force close it
            console.warn('IndexedDB upgrade blocked. Close other BIM tabs and reload.');
            // Try to proceed anyway after a brief wait
            setTimeout(function() {
                if (!self.db) {
                    // Delete and recreate as last resort
                    var delReq = indexedDB.deleteDatabase(self.dbName);
                    delReq.onsuccess = function() { window.location.reload(); };
                }
            }, 1500);
        };

        request.onupgradeneeded = function(event) {
            var db = event.target.result;

            // Close old connections that block the upgrade
            db.onversionchange = function() { db.close(); };

            // Delete v1 stores if upgrading
            var oldStores = ['meetings', 'attendees', 'agendaItems', 'actionItems', 'decisions', 'meetingTemplates'];
            oldStores.forEach(function(name) {
                if (db.objectStoreNames.contains(name)) db.deleteObjectStore(name);
            });

            // meetingSeries
            if (!db.objectStoreNames.contains('meetingSeries')) {
                var series = db.createObjectStore('meetingSeries', { keyPath: 'id' });
                series.createIndex('type', 'type', { unique: false });
            }

            // meetingInstances
            if (!db.objectStoreNames.contains('meetingInstances')) {
                var instances = db.createObjectStore('meetingInstances', { keyPath: 'id' });
                instances.createIndex('seriesId', 'seriesId', { unique: false });
                instances.createIndex('date', 'date', { unique: false });
            }

            // participants
            if (!db.objectStoreNames.contains('participants')) {
                var participants = db.createObjectStore('participants', { keyPath: 'id' });
                participants.createIndex('instanceId', 'instanceId', { unique: false });
                participants.createIndex('seriesId', 'seriesId', { unique: false });
            }

            // discussionItems
            if (!db.objectStoreNames.contains('discussionItems')) {
                var items = db.createObjectStore('discussionItems', { keyPath: 'id' });
                items.createIndex('seriesId', 'seriesId', { unique: false });
                items.createIndex('categoryId', 'categoryId', { unique: false });
                items.createIndex('status', 'status', { unique: false });
            }

            // discussionUpdates
            if (!db.objectStoreNames.contains('discussionUpdates')) {
                var updates = db.createObjectStore('discussionUpdates', { keyPath: 'id' });
                updates.createIndex('discussionItemId', 'discussionItemId', { unique: false });
                updates.createIndex('instanceId', 'instanceId', { unique: false });
            }

            // attachments
            if (!db.objectStoreNames.contains('attachments')) {
                var attachments = db.createObjectStore('attachments', { keyPath: 'id' });
                attachments.createIndex('discussionItemId', 'discussionItemId', { unique: false });
            }

            // seriesTemplates
            if (!db.objectStoreNames.contains('seriesTemplates')) {
                db.createObjectStore('seriesTemplates', { keyPath: 'id' });
            }

            // userProfiles — v3: add username, role, status indexes
            if (!db.objectStoreNames.contains('userProfiles')) {
                var profiles = db.createObjectStore('userProfiles', { keyPath: 'id' });
                profiles.createIndex('isDefault', 'isDefault', { unique: false });
                profiles.createIndex('username', 'username', { unique: true });
                profiles.createIndex('role', 'role', { unique: false });
                profiles.createIndex('status', 'status', { unique: false });
            } else {
                // Upgrade existing store with new indexes
                var profileStore = event.target.transaction.objectStore('userProfiles');
                if (!profileStore.indexNames.contains('username')) {
                    profileStore.createIndex('username', 'username', { unique: true });
                }
                if (!profileStore.indexNames.contains('role')) {
                    profileStore.createIndex('role', 'role', { unique: false });
                }
                if (!profileStore.indexNames.contains('status')) {
                    profileStore.createIndex('status', 'status', { unique: false });
                }
            }

            // activityLogs (v3)
            if (!db.objectStoreNames.contains('activityLogs')) {
                var logs = db.createObjectStore('activityLogs', { keyPath: 'id' });
                logs.createIndex('userId', 'userId', { unique: false });
                logs.createIndex('action', 'action', { unique: false });
                logs.createIndex('resourceType', 'resourceType', { unique: false });
                logs.createIndex('timestamp', 'timestamp', { unique: false });
            }

            // sessions (v3)
            if (!db.objectStoreNames.contains('sessions')) {
                var sessions = db.createObjectStore('sessions', { keyPath: 'id' });
                sessions.createIndex('userId', 'userId', { unique: false });
            }
        };

        request.onsuccess = function(event) {
            self.db = event.target.result;
            // If another tab opens a newer version, close this connection
            self.db.onversionchange = function() {
                self.db.close();
                self.db = null;
                window.location.reload();
            };
            resolve();
        };

        request.onerror = function(event) {
            reject(new Error('IndexedDB open failed: ' + event.target.error));
        };
    });
};

BIM.IndexedDBProvider.prototype._tx = function(store, mode) {
    var tx = this.db.transaction(store, mode || 'readonly');
    return tx.objectStore(store);
};

BIM.IndexedDBProvider.prototype.getById = function(store, id) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = self._tx(store).get(id);
        request.onsuccess = function() { resolve(request.result || null); };
        request.onerror = function() { reject(request.error); };
    });
};

BIM.IndexedDBProvider.prototype.getAll = function(store) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = self._tx(store).getAll();
        request.onsuccess = function() { resolve(request.result || []); };
        request.onerror = function() { reject(request.error); };
    });
};

BIM.IndexedDBProvider.prototype.query = function(store, filter) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var keys = Object.keys(filter || {});
        if (keys.length === 0) return self.getAll(store).then(resolve, reject);

        var objectStore = self._tx(store);
        var indexKey = keys.find(function(k) {
            return objectStore.indexNames.contains(k) && typeof filter[k] !== 'boolean';
        });

        var request;
        if (indexKey) {
            request = objectStore.index(indexKey).getAll(filter[indexKey]);
        } else {
            request = objectStore.getAll();
        }

        request.onsuccess = function() {
            var results = request.result || [];
            if (keys.length > 1 || !indexKey) {
                results = results.filter(function(item) {
                    return keys.every(function(k) { return item[k] === filter[k]; });
                });
            }
            resolve(results);
        };
        request.onerror = function() { reject(request.error); };
    });
};

BIM.IndexedDBProvider.prototype.create = function(store, entity) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = self._tx(store, 'readwrite').add(entity);
        request.onsuccess = function() { resolve(entity); };
        request.onerror = function() { reject(request.error); };
    });
};

BIM.IndexedDBProvider.prototype.update = function(store, entity) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = self._tx(store, 'readwrite').put(entity);
        request.onsuccess = function() { resolve(entity); };
        request.onerror = function() { reject(request.error); };
    });
};

BIM.IndexedDBProvider.prototype.remove = function(store, id) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = self._tx(store, 'readwrite').delete(id);
        request.onsuccess = function() { resolve(); };
        request.onerror = function() { reject(request.error); };
    });
};

BIM.IndexedDBProvider.prototype.count = function(store, filter) {
    var self = this;
    if (!filter || Object.keys(filter).length === 0) {
        return new Promise(function(resolve, reject) {
            var request = self._tx(store).count();
            request.onsuccess = function() { resolve(request.result); };
            request.onerror = function() { reject(request.error); };
        });
    }
    return self.query(store, filter).then(function(results) { return results.length; });
};

BIM.IndexedDBProvider.prototype.clear = function(store) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = self._tx(store, 'readwrite').clear();
        request.onsuccess = function() { resolve(); };
        request.onerror = function() { reject(request.error); };
    });
};
