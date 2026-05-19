var ACC = ACC || {};

ACC.StorageProvider = function() {};
ACC.StorageProvider.prototype.getById = function(store, id) { throw new Error('Not implemented'); };
ACC.StorageProvider.prototype.getAll = function(store) { throw new Error('Not implemented'); };
ACC.StorageProvider.prototype.query = function(store, filter) { throw new Error('Not implemented'); };
ACC.StorageProvider.prototype.create = function(store, entity) { throw new Error('Not implemented'); };
ACC.StorageProvider.prototype.update = function(store, entity) { throw new Error('Not implemented'); };
ACC.StorageProvider.prototype.remove = function(store, id) { throw new Error('Not implemented'); };
ACC.StorageProvider.prototype.count = function(store, filter) { throw new Error('Not implemented'); };
ACC.StorageProvider.prototype.clear = function(store) { throw new Error('Not implemented'); };

ACC.StorageManager = {
    _provider: null,

    init: function(provider) {
        this._provider = provider;
        return provider.open ? provider.open() : Promise.resolve();
    },

    provider: function() {
        if (!this._provider) throw new Error('StorageManager not initialized. Call StorageManager.init() first.');
        return this._provider;
    },

    getById: function(store, id) { return this.provider().getById(store, id); },
    getAll: function(store) { return this.provider().getAll(store); },
    query: function(store, filter) { return this.provider().query(store, filter); },
    create: function(store, entity) { return this.provider().create(store, entity); },
    update: function(store, entity) { return this.provider().update(store, entity); },
    remove: function(store, id) { return this.provider().remove(store, id); },
    count: function(store, filter) { return this.provider().count(store, filter); },
    clear: function(store) { return this.provider().clear(store); }
};
