var ACC = ACC || {};

/**
 * ACC.Auth — Authentication, session management, RBAC, and activity logging.
 *
 * Roles:
 *   admin  — Full access: manage users, series settings, all content
 *   editor — Edit within assigned series (no series settings, no user mgmt)
 *   viewer — Read-only access to assigned series
 *
 * Session: token stored in localStorage, session record in IndexedDB.
 * Password: SHA-256 hashed client-side via Web Crypto API.
 */
ACC.Auth = {
    SESSION_KEY: 'acc_session_token',
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours

    // ── Hashing ────────────────────────────────────────────────

    hashPassword: function(password) {
        var encoder = new TextEncoder();
        var data = encoder.encode(password);
        return crypto.subtle.digest('SHA-256', data).then(function(buf) {
            var arr = Array.from(new Uint8Array(buf));
            return arr.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
        });
    },

    // ── Seed default admin ─────────────────────────────────────

    seedDefaultAdmin: function() {
        var self = this;
        return ACC.StorageManager.query('userProfiles', { username: 'admin' }).then(function(users) {
            if (users.length > 0) return Promise.resolve();
            return self.hashPassword('admin').then(function(hash) {
                return ACC.StorageManager.create('userProfiles', {
                    id: ACC.Utils.uuid(),
                    name: 'Administrator',
                    company: 'Emch+Berger GmbH',
                    email: 'admin@emchberger.ch',
                    username: 'admin',
                    passwordHash: hash,
                    role: 'admin',
                    status: 'active',
                    isDefault: false,
                    seriesAccess: [],
                    lastActivity: ACC.Utils.now(),
                    createdAt: ACC.Utils.now(),
                    updatedAt: ACC.Utils.now()
                });
            });
        });
    },

    // ── Login / Logout ─────────────────────────────────────────

    login: function(username, password) {
        var self = this;
        return ACC.StorageManager.query('userProfiles', { username: username }).then(function(users) {
            if (users.length === 0) return Promise.reject(new Error('Benutzername oder Passwort falsch.'));
            var user = users[0];
            if (user.status !== 'active') return Promise.reject(new Error('Dieses Konto ist deaktiviert.'));
            return self.hashPassword(password).then(function(hash) {
                if (hash !== user.passwordHash) return Promise.reject(new Error('Benutzername oder Passwort falsch.'));

                // Create session
                var token = ACC.Utils.uuid();
                var session = {
                    id: token,
                    userId: user.id,
                    createdAt: ACC.Utils.now(),
                    expiresAt: new Date(Date.now() + self.SESSION_DURATION).toISOString()
                };
                return ACC.StorageManager.create('sessions', session).then(function() {
                    localStorage.setItem(self.SESSION_KEY, token);
                    // Update last activity
                    user.lastActivity = ACC.Utils.now();
                    return ACC.StorageManager.update('userProfiles', user);
                }).then(function() {
                    self.logActivity(user.id, user.name, 'login', 'system', null, 'Anmeldung', '');
                    return user;
                });
            });
        });
    },

    logout: function() {
        var self = this;
        var token = localStorage.getItem(this.SESSION_KEY);
        if (!token) return Promise.resolve();
        return this.getCurrentUser().then(function(user) {
            if (user) {
                self.logActivity(user.id, user.name, 'logout', 'system', null, 'Abmeldung', '');
            }
            return ACC.StorageManager.remove('sessions', token).catch(function() {});
        }).then(function() {
            localStorage.removeItem(self.SESSION_KEY);
        });
    },

    // ── Session validation ─────────────────────────────────────

    getCurrentSession: function() {
        var token = localStorage.getItem(this.SESSION_KEY);
        if (!token) return Promise.resolve(null);
        return ACC.StorageManager.getById('sessions', token).then(function(session) {
            if (!session) return null;
            if (new Date(session.expiresAt) < new Date()) {
                // Expired — clean up
                localStorage.removeItem('acc_session_token');
                return ACC.StorageManager.remove('sessions', token).then(function() { return null; });
            }
            return session;
        });
    },

    getCurrentUser: function() {
        return this.getCurrentSession().then(function(session) {
            if (!session) return null;
            return ACC.StorageManager.getById('userProfiles', session.userId);
        });
    },

    /**
     * Require login — redirects to login page if not authenticated.
     * Returns user object if authenticated.
     */
    requireAuth: function(loginUrl) {
        loginUrl = loginUrl || '../../login.html';
        return this.getCurrentUser().then(function(user) {
            if (!user || user.status !== 'active') {
                window.location.href = loginUrl;
                return null;
            }
            return user;
        });
    },

    /**
     * Check if user is already logged in (for login page — skip login if so).
     */
    checkAlreadyLoggedIn: function(redirectUrl) {
        redirectUrl = redirectUrl || 'index.html';
        return this.getCurrentUser().then(function(user) {
            if (user && user.status === 'active') {
                window.location.href = redirectUrl;
                return true;
            }
            return false;
        });
    },

    // ── RBAC ───────────────────────────────────────────────────

    /** Can this user access the admin portal? */
    canAccessAdmin: function(user) {
        return user && user.role === 'admin';
    },

    /** Can this user view a given series? Admins see all; editors/viewers check seriesAccess. */
    canAccessSeries: function(user, seriesId) {
        if (!user) return false;
        if (user.role === 'admin') return true;
        if (!user.seriesAccess || user.seriesAccess.length === 0) return true; // empty = all
        return user.seriesAccess.indexOf(seriesId) !== -1;
    },

    /** Can this user edit discussion items / updates? (admin or editor) */
    canEdit: function(user) {
        return user && (user.role === 'admin' || user.role === 'editor');
    },

    /** Can this user modify series settings (categories, custom fields, etc.)? Admin only. */
    canEditSeriesSettings: function(user) {
        return user && user.role === 'admin';
    },

    /** Role display labels (German) */
    ROLE_LABELS: {
        admin: 'Administrator',
        editor: 'Bearbeiter',
        viewer: 'Betrachter'
    },

    getRoleLabel: function(role) {
        return this.ROLE_LABELS[role] || role;
    },

    // ── User CRUD ──────────────────────────────────────────────

    createUser: function(data) {
        var self = this;
        return this.hashPassword(data.password).then(function(hash) {
            var user = {
                id: ACC.Utils.uuid(),
                name: data.name || '',
                company: data.company || '',
                email: data.email || '',
                username: data.username,
                passwordHash: hash,
                role: data.role || 'viewer',
                status: 'active',
                isDefault: false,
                seriesAccess: data.seriesAccess || [],
                lastActivity: null,
                createdAt: ACC.Utils.now(),
                updatedAt: ACC.Utils.now()
            };
            return ACC.StorageManager.create('userProfiles', user).then(function() {
                return user;
            });
        });
    },

    updateUser: function(user) {
        user.updatedAt = ACC.Utils.now();
        return ACC.StorageManager.update('userProfiles', user);
    },

    changePassword: function(userId, newPassword) {
        var self = this;
        return ACC.StorageManager.getById('userProfiles', userId).then(function(user) {
            if (!user) return Promise.reject(new Error('Benutzer nicht gefunden.'));
            return self.hashPassword(newPassword).then(function(hash) {
                user.passwordHash = hash;
                user.updatedAt = ACC.Utils.now();
                return ACC.StorageManager.update('userProfiles', user);
            });
        });
    },

    deactivateUser: function(userId) {
        return ACC.StorageManager.getById('userProfiles', userId).then(function(user) {
            if (!user) return Promise.reject(new Error('Benutzer nicht gefunden.'));
            user.status = 'inactive';
            user.updatedAt = ACC.Utils.now();
            return ACC.StorageManager.update('userProfiles', user);
        });
    },

    activateUser: function(userId) {
        return ACC.StorageManager.getById('userProfiles', userId).then(function(user) {
            if (!user) return Promise.reject(new Error('Benutzer nicht gefunden.'));
            user.status = 'active';
            user.updatedAt = ACC.Utils.now();
            return ACC.StorageManager.update('userProfiles', user);
        });
    },

    getAllUsers: function() {
        return ACC.StorageManager.getAll('userProfiles');
    },

    getActiveUsers: function() {
        return ACC.StorageManager.query('userProfiles', { status: 'active' });
    },

    // ── Activity Logging ───────────────────────────────────────

    /**
     * Log an activity.
     * @param {string} userId
     * @param {string} userName
     * @param {string} action - e.g. 'login', 'create', 'update', 'delete', 'view'
     * @param {string} resourceType - e.g. 'series', 'instance', 'discussionItem', 'system'
     * @param {string|null} resourceId
     * @param {string} resourceName - human-readable name of the resource
     * @param {string} details - optional extra info
     */
    logActivity: function(userId, userName, action, resourceType, resourceId, resourceName, details) {
        var log = {
            id: ACC.Utils.uuid(),
            userId: userId,
            userName: userName || '',
            action: action,
            resourceType: resourceType || '',
            resourceId: resourceId || '',
            resourceName: resourceName || '',
            details: details || '',
            timestamp: ACC.Utils.now()
        };
        // Fire-and-forget — don't block the caller
        ACC.StorageManager.create('activityLogs', log).catch(function(err) {
            console.warn('Activity log failed:', err);
        });
    },

    getActivityLogs: function(filter) {
        if (filter) {
            return ACC.StorageManager.query('activityLogs', filter);
        }
        return ACC.StorageManager.getAll('activityLogs');
    },

    getRecentActivity: function(limit) {
        limit = limit || 50;
        return ACC.StorageManager.getAll('activityLogs').then(function(logs) {
            logs.sort(function(a, b) {
                return a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0;
            });
            return logs.slice(0, limit);
        });
    },

    getUserActivity: function(userId, limit) {
        limit = limit || 50;
        return ACC.StorageManager.query('activityLogs', { userId: userId }).then(function(logs) {
            logs.sort(function(a, b) {
                return a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0;
            });
            return logs.slice(0, limit);
        });
    },

    // ── Session cleanup ────────────────────────────────────────

    cleanExpiredSessions: function() {
        return ACC.StorageManager.getAll('sessions').then(function(sessions) {
            var now = new Date();
            var expired = sessions.filter(function(s) { return new Date(s.expiresAt) < now; });
            return Promise.all(expired.map(function(s) {
                return ACC.StorageManager.remove('sessions', s.id);
            }));
        });
    },

    // ── Initialization helper ──────────────────────────────────

    /**
     * Initialize auth system — seed admin, clean sessions.
     * Call after StorageManager.init().
     */
    init: function() {
        var self = this;
        return this.seedDefaultAdmin().then(function() {
            return self.cleanExpiredSessions();
        });
    }
};
