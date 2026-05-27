var BIM = BIM || {};

BIM.MeetingStore = {
    SM: function() { return BIM.StorageManager; },

    // ── USER PROFILES ──

    getCurrentUser: async function() {
        // Use auth session (logged-in user) first, fall back to legacy isDefault selector
        if (BIM.Auth && BIM.Auth.getCurrentUser) {
            var authUser = await BIM.Auth.getCurrentUser();
            if (authUser) return authUser;
        }
        var all = await this.SM().query('userProfiles', { isDefault: true });
        return all.length > 0 ? all[0] : null;
    },

    setCurrentUser: async function(profileId) {
        var all = await this.SM().getAll('userProfiles');
        for (var i = 0; i < all.length; i++) {
            if (all[i].isDefault && all[i].id !== profileId) {
                all[i].isDefault = false;
                await this.SM().update('userProfiles', all[i]);
            }
        }
        var profile = await this.SM().getById('userProfiles', profileId);
        if (profile) {
            profile.isDefault = true;
            await this.SM().update('userProfiles', profile);
        }
        return profile;
    },

    createUserProfile: async function(data) {
        var profile = {
            id: BIM.Utils.uuid(),
            name: data.name || '',
            company: data.company || '',
            email: data.email || '',
            isDefault: data.isDefault || false
        };
        return this.SM().create('userProfiles', profile);
    },

    getAllUserProfiles: function() {
        return this.SM().getAll('userProfiles');
    },

    updateUserProfile: function(profile) {
        return this.SM().update('userProfiles', profile);
    },

    removeUserProfile: function(id) {
        return this.SM().remove('userProfiles', id);
    },

    getCurrentAuthor: async function() {
        var user = await this.getCurrentUser();
        if (!user) return '';
        return BIM.Utils.formatAuthor(user.name, user.company);
    },

    // ── MEETING SERIES ──

    createSeries: async function(data) {
        var id = BIM.Utils.uuid();
        var now = BIM.Utils.now();
        var series = {
            id: id,
            code: data.code || '',
            title: data.title || '',
            type: data.type || 'custom',
            description: data.description || '',
            defaultLocation: data.defaultLocation || '',
            customFieldDefs: data.customFieldDefs || [],
            topicCategoryDefs: data.topicCategoryDefs || [],
            statusOptions: data.statusOptions || [
                { key: 'offen', label: 'Offen' },
                { key: 'laufend', label: 'Laufend' },
                { key: 'informationen', label: 'Informationen' },
                { key: 'erledigt', label: 'Erledigt' }
            ],
            defaultParticipants: data.defaultParticipants || [],
            instanceCount: 0,
            createdAt: now,
            updatedAt: now
        };
        await this.SM().create('meetingSeries', series);
        return series;
    },

    updateSeries: async function(series) {
        series.updatedAt = BIM.Utils.now();
        return this.SM().update('meetingSeries', series);
    },

    deleteSeries: async function(id) {
        var instances = await this.SM().query('meetingInstances', { seriesId: id });
        for (var i = 0; i < instances.length; i++) {
            await this._deleteInstanceData(instances[i].id);
            await this.SM().remove('meetingInstances', instances[i].id);
        }

        var items = await this.SM().query('discussionItems', { seriesId: id });
        for (var j = 0; j < items.length; j++) {
            await this._deleteDiscussionItemData(items[j].id);
            await this.SM().remove('discussionItems', items[j].id);
        }

        return this.SM().remove('meetingSeries', id);
    },

    getAllSeries: async function() {
        var series = await this.SM().getAll('meetingSeries');
        series.sort(function(a, b) { return b.updatedAt < a.updatedAt ? -1 : b.updatedAt > a.updatedAt ? 1 : 0; });
        return series;
    },

    getSeriesById: function(id) {
        return this.SM().getById('meetingSeries', id);
    },

    getSeriesFull: async function(id) {
        var series = await this.SM().getById('meetingSeries', id);
        if (!series) return null;
        var instances = await this.SM().query('meetingInstances', { seriesId: id });
        instances.sort(function(a, b) { return a.instanceNumber - b.instanceNumber; });
        var items = await this.SM().query('discussionItems', { seriesId: id });
        return { series: series, instances: instances, discussionItems: items };
    },

    getSeriesStats: async function(seriesId) {
        var items = await this.SM().query('discussionItems', { seriesId: seriesId });
        var instances = await this.SM().query('meetingInstances', { seriesId: seriesId });
        var openCount = items.filter(function(it) { return it.status === 'offen' || it.status === 'laufend'; }).length;
        var lastInstance = instances.length > 0 ?
            instances.reduce(function(a, b) { return a.instanceNumber > b.instanceNumber ? a : b; }) : null;
        return {
            totalItems: items.length,
            openItems: openCount,
            instanceCount: instances.length,
            lastDate: lastInstance ? lastInstance.date : null
        };
    },

    // ── MEETING INSTANCES ──

    createInstance: async function(seriesId, data) {
        var series = await this.SM().getById('meetingSeries', seriesId);
        if (!series) throw new Error('Series not found: ' + seriesId);

        // Atomic server-side increment to prevent race conditions
        try {
            var resp = await fetch('/api/db/meetingSeries/' + seriesId + '/increment/instanceCount', { method: 'POST' });
            if (resp.ok) {
                series = await resp.json();
            } else {
                // Fallback for file:// or no-server mode
                series.instanceCount = (series.instanceCount || 0) + 1;
                await this.updateSeries(series);
            }
        } catch(_) {
            // Fallback for file:// or no-server mode
            series.instanceCount = (series.instanceCount || 0) + 1;
            await this.updateSeries(series);
        }

        var author = await this.getCurrentAuthor();
        var now = BIM.Utils.now();
        var instance = {
            id: BIM.Utils.uuid(),
            seriesId: seriesId,
            instanceNumber: series.instanceCount,
            date: (data && data.date) || BIM.Utils.today(),
            timeStart: (data && data.timeStart) || '',
            timeEnd: (data && data.timeEnd) || '',
            location: (data && data.location) || series.defaultLocation || '',
            status: 'entwurf',
            summary: '',
            createdBy: author,
            createdAt: now,
            updatedAt: now
        };
        await this.SM().create('meetingInstances', instance);

        // Copy participants from previous instance or from series defaults
        var prevInstances = await this.SM().query('meetingInstances', { seriesId: seriesId });
        var prev = prevInstances
            .filter(function(inst) { return inst.id !== instance.id; })
            .sort(function(a, b) { return b.instanceNumber - a.instanceNumber; });

        if (prev.length > 0) {
            var prevParticipants = await this.SM().query('participants', { instanceId: prev[0].id });
            for (var i = 0; i < prevParticipants.length; i++) {
                await this.createParticipant(instance.id, seriesId, {
                    name: prevParticipants[i].name,
                    company: prevParticipants[i].company,
                    role: prevParticipants[i].role,
                    email: prevParticipants[i].email,
                    participantType: prevParticipants[i].participantType,
                    present: false
                });
            }
        } else if (series.defaultParticipants && series.defaultParticipants.length > 0) {
            for (var j = 0; j < series.defaultParticipants.length; j++) {
                var dp = series.defaultParticipants[j];
                await this.createParticipant(instance.id, seriesId, {
                    name: dp.name || '',
                    company: dp.company || '',
                    role: dp.role || '',
                    email: dp.email || '',
                    participantType: dp.participantType || 'eingeladene',
                    present: false
                });
            }
        }

        return instance;
    },

    updateInstance: async function(instance) {
        instance.updatedAt = BIM.Utils.now();
        return this.SM().update('meetingInstances', instance);
    },

    // Note: instanceCount is NOT decremented on deletion. Instance numbers are stable
    // identifiers (like invoice numbers) and must not be reused to preserve data integrity.
    deleteInstance: async function(id) {
        await this._deleteInstanceData(id);
        return this.SM().remove('meetingInstances', id);
    },

    _deleteInstanceData: async function(instanceId) {
        var participants = await this.SM().query('participants', { instanceId: instanceId });
        for (var i = 0; i < participants.length; i++) {
            await this.SM().remove('participants', participants[i].id);
        }
        // Clean up updates created in this instance
        var allUpdates = await this.SM().getAll('discussionUpdates');
        var instanceUpdates = allUpdates.filter(function(u) { return u.instanceId === instanceId; });
        for (var j = 0; j < instanceUpdates.length; j++) {
            await this.SM().remove('discussionUpdates', instanceUpdates[j].id);
        }
        // Clean up attachments uploaded in this instance
        var allAttachments = await this.SM().getAll('attachments');
        var instanceAttachments = allAttachments.filter(function(a) { return a.instanceId === instanceId; });
        for (var k = 0; k < instanceAttachments.length; k++) {
            await this.SM().remove('attachments', instanceAttachments[k].id);
        }
    },

    getInstanceById: function(id) {
        return this.SM().getById('meetingInstances', id);
    },

    getInstanceFull: async function(instanceId) {
        var instance = await this.SM().getById('meetingInstances', instanceId);
        if (!instance) return null;

        var series = await this.SM().getById('meetingSeries', instance.seriesId);
        var participants = await this.SM().query('participants', { instanceId: instanceId });
        var items = await this.SM().query('discussionItems', { seriesId: instance.seriesId });

        var updates = [];
        var attachments = [];
        for (var i = 0; i < items.length; i++) {
            var itemUpdates = await this.SM().query('discussionUpdates', { discussionItemId: items[i].id });
            itemUpdates.sort(function(a, b) { return a.createdAt < b.createdAt ? -1 : 1; });
            updates = updates.concat(itemUpdates);

            var itemAttachments = await this.SM().query('attachments', { discussionItemId: items[i].id });
            attachments = attachments.concat(itemAttachments);
        }

        return {
            instance: instance,
            series: series,
            participants: participants,
            discussionItems: items,
            updates: updates,
            attachments: attachments
        };
    },

    getInstancesForSeries: async function(seriesId) {
        var instances = await this.SM().query('meetingInstances', { seriesId: seriesId });
        instances.sort(function(a, b) { return b.instanceNumber - a.instanceNumber; });
        return instances;
    },

    // ── PARTICIPANTS ──

    createParticipant: async function(instanceId, seriesId, data) {
        var participant = {
            id: BIM.Utils.uuid(),
            instanceId: instanceId,
            seriesId: seriesId,
            name: data.name || '',
            company: data.company || '',
            role: data.role || '',
            email: data.email || '',
            participantType: data.participantType || 'eingeladene',
            present: data.present !== undefined ? data.present : true
        };
        return this.SM().create('participants', participant);
    },

    updateParticipant: function(participant) {
        return this.SM().update('participants', participant);
    },

    removeParticipant: function(id) {
        return this.SM().remove('participants', id);
    },

    getParticipantsForInstance: async function(instanceId) {
        return this.SM().query('participants', { instanceId: instanceId });
    },

    // ── DISCUSSION ITEMS ──

    createDiscussionItem: async function(seriesId, categoryId, data) {
        var existing = await this.SM().query('discussionItems', { seriesId: seriesId });
        var inCategory = existing.filter(function(it) { return it.categoryId === categoryId; });
        var author = await this.getCurrentAuthor();
        var now = BIM.Utils.now();

        var item = {
            id: BIM.Utils.uuid(),
            seriesId: seriesId,
            categoryId: categoryId,
            itemNumber: inCategory.length + 1,
            title: data.title || '',
            description: data.description || '',
            status: data.status || 'offen',
            assignees: data.assignees || [],
            dueDate: data.dueDate || '',
            customFields: data.customFields || {},
            createdByInstanceId: data.instanceId || null,
            createdBy: author,
            createdAt: now,
            updatedAt: now,
            updatedBy: author
        };
        return this.SM().create('discussionItems', item);
    },

    updateDiscussionItem: async function(item) {
        var author = await this.getCurrentAuthor();
        item.updatedAt = BIM.Utils.now();
        item.updatedBy = author;
        return this.SM().update('discussionItems', item);
    },

    removeDiscussionItem: async function(id) {
        await this._deleteDiscussionItemData(id);
        return this.SM().remove('discussionItems', id);
    },

    _deleteDiscussionItemData: async function(itemId) {
        var updates = await this.SM().query('discussionUpdates', { discussionItemId: itemId });
        for (var i = 0; i < updates.length; i++) {
            await this.SM().remove('discussionUpdates', updates[i].id);
        }
        var attachments = await this.SM().query('attachments', { discussionItemId: itemId });
        for (var j = 0; j < attachments.length; j++) {
            await this.SM().remove('attachments', attachments[j].id);
        }
    },

    getDiscussionItemsForSeries: async function(seriesId) {
        var items = await this.SM().query('discussionItems', { seriesId: seriesId });
        items.sort(function(a, b) { return a.itemNumber - b.itemNumber; });
        return items;
    },

    getDiscussionItemsForCategory: async function(seriesId, categoryId) {
        var items = await this.SM().query('discussionItems', { seriesId: seriesId });
        var filtered = items.filter(function(it) { return it.categoryId === categoryId; });
        filtered.sort(function(a, b) { return a.itemNumber - b.itemNumber; });
        return filtered;
    },

    moveItemToCategory: async function(itemId, newCategoryId, seriesId) {
        var item = await this.SM().getById('discussionItems', itemId);
        if (!item) return;
        var oldCategoryId = item.categoryId;
        var existing = await this.SM().query('discussionItems', { seriesId: seriesId });

        // Assign next number in target category
        var inNew = existing.filter(function(it) { return it.categoryId === newCategoryId && it.id !== itemId; });
        item.categoryId = newCategoryId;
        item.itemNumber = inNew.length + 1;
        await this.updateDiscussionItem(item);

        // Renumber source category to close gaps
        if (oldCategoryId && oldCategoryId !== newCategoryId) {
            var inOld = existing.filter(function(it) { return it.categoryId === oldCategoryId && it.id !== itemId; });
            inOld.sort(function(a, b) { return a.itemNumber - b.itemNumber; });
            for (var i = 0; i < inOld.length; i++) {
                if (inOld[i].itemNumber !== i + 1) {
                    inOld[i].itemNumber = i + 1;
                    await this.updateDiscussionItem(inOld[i]);
                }
            }
        }
    },

    getOpenItemCount: async function(seriesId) {
        var items = await this.SM().query('discussionItems', { seriesId: seriesId });
        return items.filter(function(it) { return it.status === 'offen' || it.status === 'laufend'; }).length;
    },

    // ── DISCUSSION UPDATES ──

    addUpdate: async function(discussionItemId, instanceId, data) {
        var user = await this.getCurrentUser();
        var author = user ? BIM.Utils.formatAuthor(user.name, user.company) : '';
        var update = {
            id: BIM.Utils.uuid(),
            discussionItemId: discussionItemId,
            instanceId: instanceId,
            userId: user ? user.id : null,
            date: data.date || BIM.Utils.today(),
            text: data.text || '',
            author: author,
            instanceNumber: null,
            createdAt: BIM.Utils.now()
        };

        // Store instanceNumber for display even if instance is later deleted
        if (instanceId) {
            var inst = await this.SM().getById('meetingInstances', instanceId);
            if (inst) update.instanceNumber = inst.instanceNumber;
        }

        var item = await this.SM().getById('discussionItems', discussionItemId);
        if (item) {
            item.updatedAt = BIM.Utils.now();
            item.updatedBy = author;
            await this.SM().update('discussionItems', item);
        }

        return this.SM().create('discussionUpdates', update);
    },

    updateUpdate: function(update) {
        return this.SM().update('discussionUpdates', update);
    },

    removeUpdate: function(id) {
        return this.SM().remove('discussionUpdates', id);
    },

    getUpdatesForItem: async function(itemId) {
        var updates = await this.SM().query('discussionUpdates', { discussionItemId: itemId });
        updates.sort(function(a, b) { return a.createdAt < b.createdAt ? -1 : 1; });
        return updates;
    },

    // ── ATTACHMENTS ──

    addAttachment: async function(discussionItemId, instanceId, file) {
        if (file.size > 25 * 1024 * 1024) {
            throw new Error('Datei zu gross (max. 25 MB): ' + file.name);
        }
        var author = await this.getCurrentAuthor();
        var attachment = {
            id: BIM.Utils.uuid(),
            discussionItemId: discussionItemId,
            instanceId: instanceId,
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            blob: file,
            createdBy: author,
            createdAt: BIM.Utils.now()
        };
        return this.SM().create('attachments', attachment);
    },

    getAttachment: function(id) {
        return this.SM().getById('attachments', id);
    },

    removeAttachment: function(id) {
        return this.SM().remove('attachments', id);
    },

    getAttachmentsForItem: async function(itemId) {
        return this.SM().query('attachments', { discussionItemId: itemId });
    },

    downloadAttachment: async function(id) {
        var att = await this.SM().getById('attachments', id);
        if (!att) return;

        var blob = att.blob;
        // If blob is not stored inline (JsonStorageProvider), fetch from server
        if (!blob && att._hasFile) {
            var provider = this.SM().provider();
            if (provider.getAttachmentBlob) {
                blob = await provider.getAttachmentBlob(id);
            }
        }
        if (!blob) return;

        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = att.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
    },

    // ── TEMPLATES ──

    createFromTemplate: async function(templateId) {
        var tpl = BIM.MeetingTemplates.getById(templateId);
        if (!tpl) throw new Error('Template not found: ' + templateId);

        var catDefs = (tpl.defaultTopicCategories || []).map(function(cat, i) {
            return {
                id: BIM.Utils.uuid(),
                code: cat.code,
                label: cat.label,
                sortOrder: cat.sortOrder || (i + 1)
            };
        });

        var fieldDefs = (tpl.defaultCustomFieldDefs || []).map(function(fd) {
            return {
                id: BIM.Utils.uuid(),
                label: fd.label,
                type: fd.type || 'text',
                options: fd.options || null
            };
        });

        var statusOpts = (tpl.defaultStatusOptions || []).map(function(so) {
            return { key: so.key, label: so.label };
        });
        if (statusOpts.length === 0) {
            statusOpts = [
                { key: 'offen', label: 'Offen' },
                { key: 'laufend', label: 'Laufend' },
                { key: 'informationen', label: 'Informationen' },
                { key: 'erledigt', label: 'Erledigt' }
            ];
        }

        var defaultParts = (tpl.defaultParticipantRoles || []).map(function(pr) {
            return {
                name: '', company: '', role: pr.role || '',
                email: '', participantType: pr.participantType || 'eingeladene'
            };
        });

        var series = await this.createSeries({
            title: tpl.name,
            type: tpl.type,
            defaultLocation: tpl.defaultLocation || '',
            customFieldDefs: fieldDefs,
            topicCategoryDefs: catDefs,
            statusOptions: statusOpts,
            defaultParticipants: defaultParts
        });

        return series;
    }
};
