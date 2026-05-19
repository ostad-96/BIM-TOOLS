var ACC = ACC || {};

ACC.IndexedDBProvider = function(dbName) {
    this.dbName = dbName;
    this.db = null;
    this.version = 2;
};

ACC.IndexedDBProvider.prototype = Object.create(ACC.StorageProvider.prototype);

ACC.IndexedDBProvider.prototype.open = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = indexedDB.open(self.dbName, self.version);

        request.onupgradeneeded = function(event) {
            var db = event.target.result;

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

            // userProfiles
            if (!db.objectStoreNames.contains('userProfiles')) {
                var profiles = db.createObjectStore('userProfiles', { keyPath: 'id' });
                profiles.createIndex('isDefault', 'isDefault', { unique: false });
            }
        };

        request.onsuccess = function(event) {
            self.db = event.target.result;
            resolve();
        };

        request.onerror = function(event) {
            reject(new Error('IndexedDB open failed: ' + event.target.error));
        };
    });
};

ACC.IndexedDBProvider.prototype._tx = function(store, mode) {
    var tx = this.db.transaction(store, mode || 'readonly');
    return tx.objectStore(store);
};

ACC.IndexedDBProvider.prototype.getById = function(store, id) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = self._tx(store).get(id);
        request.onsuccess = function() { resolve(request.result || null); };
        request.onerror = function() { reject(request.error); };
    });
};

ACC.IndexedDBProvider.prototype.getAll = function(store) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = self._tx(store).getAll();
        request.onsuccess = function() { resolve(request.result || []); };
        request.onerror = function() { reject(request.error); };
    });
};

ACC.IndexedDBProvider.prototype.query = function(store, filter) {
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

ACC.IndexedDBProvider.prototype.create = function(store, entity) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = self._tx(store, 'readwrite').add(entity);
        request.onsuccess = function() { resolve(entity); };
        request.onerror = function() { reject(request.error); };
    });
};

ACC.IndexedDBProvider.prototype.update = function(store, entity) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = self._tx(store, 'readwrite').put(entity);
        request.onsuccess = function() { resolve(entity); };
        request.onerror = function() { reject(request.error); };
    });
};

ACC.IndexedDBProvider.prototype.remove = function(store, id) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = self._tx(store, 'readwrite').delete(id);
        request.onsuccess = function() { resolve(); };
        request.onerror = function() { reject(request.error); };
    });
};

ACC.IndexedDBProvider.prototype.count = function(store, filter) {
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

ACC.IndexedDBProvider.prototype.clear = function(store) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var request = self._tx(store, 'readwrite').clear();
        request.onsuccess = function() { resolve(); };
        request.onerror = function() { reject(request.error); };
    });
};
