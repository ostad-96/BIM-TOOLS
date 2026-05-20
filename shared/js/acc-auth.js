var BIM = BIM || {};

/**
 * BIM.Auth — Authentication, session management, RBAC, and activity logging.
 *
 * Security features:
 *   - PBKDF2-SHA256 with 310,000 iterations + 16-byte random salt (OWASP 2025)
 *   - Backward-compatible with legacy SHA-256 hashes (auto-upgrades on login)
 *   - Password policy: min 8 chars, upper + lower + digit + special
 *   - Brute force protection: progressive lockout after 5 failed attempts
 *   - Anti-enumeration: constant-time-ish responses for wrong username
 *   - First-login password setup: admin creates user without password
 *   - Session invalidation on password change
 *
 * Roles:
 *   admin  — Full access: manage users, series settings, all content
 *   editor — Edit within assigned series (no series settings, no user mgmt)
 *   viewer — Read-only access to assigned series
 *
 * Session: token stored in localStorage, session record in IndexedDB.
 */
BIM.Auth = {
    SESSION_KEY: 'bim_session_token',
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    MAX_FAILED_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    PBKDF2_ITERATIONS: 310000,

    // ── Password Hashing (PBKDF2) ─────────────────────────────

    /**
     * Generate a cryptographically random 16-byte salt as hex string.
     */
    generateSalt: function() {
        var salt = crypto.getRandomValues(new Uint8Array(16));
        return Array.from(salt).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    },

    /**
     * Convert a hex string to a Uint8Array.
     */
    _hexToBytes: function(hex) {
        var bytes = new Uint8Array(hex.length / 2);
        for (var i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    },

    /**
     * Convert an ArrayBuffer to a hex string.
     */
    _bufToHex: function(buf) {
        return Array.from(new Uint8Array(buf)).map(function(b) {
            return b.toString(16).padStart(2, '0');
        }).join('');
    },

    /**
     * Hash a password using PBKDF2-SHA256 with 310,000 iterations.
     * Returns format: 'pbkdf2:<salt>:<hash>' where salt and hash are hex-encoded.
     */
    hashPasswordPBKDF2: function(password, salt) {
        var self = this;
        var encoder = new TextEncoder();
        var passwordBytes = encoder.encode(password);
        var saltBytes = this._hexToBytes(salt);

        return crypto.subtle.importKey(
            'raw', passwordBytes, 'PBKDF2', false, ['deriveBits']
        ).then(function(key) {
            return crypto.subtle.deriveBits(
                { name: 'PBKDF2', salt: saltBytes, iterations: self.PBKDF2_ITERATIONS, hash: 'SHA-256' },
                key, 256
            );
        }).then(function(derivedBits) {
            return 'pbkdf2:' + salt + ':' + self._bufToHex(derivedBits);
        });
    },

    /**
     * Legacy SHA-256 hash (kept for backward compatibility only).
     */
    _legacyHashSHA256: function(password) {
        var encoder = new TextEncoder();
        var data = encoder.encode(password);
        return crypto.subtle.digest('SHA-256', data).then(function(buf) {
            var arr = Array.from(new Uint8Array(buf));
            return arr.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
        });
    },

    /**
     * Verify a password against a stored hash.
     * Detects PBKDF2 vs legacy SHA-256 format.
     * Returns { valid: boolean, needsUpgrade: boolean }
     */
    verifyPassword: function(password, storedHash) {
        var self = this;
        if (!storedHash) return Promise.resolve({ valid: false, needsUpgrade: false });

        if (storedHash.indexOf('pbkdf2:') === 0) {
            // PBKDF2 format: 'pbkdf2:<salt>:<hash>'
            var parts = storedHash.split(':');
            var salt = parts[1];
            var expectedHash = parts[2];
            return this.hashPasswordPBKDF2(password, salt).then(function(computed) {
                var computedHash = computed.split(':')[2];
                return { valid: self._timingSafeEqual(computedHash, expectedHash), needsUpgrade: false };
            });
        } else {
            // Legacy SHA-256 format
            return this._legacyHashSHA256(password).then(function(hash) {
                return { valid: self._timingSafeEqual(hash, storedHash), needsUpgrade: true };
            });
        }
    },

    /**
     * Constant-time string comparison to prevent timing attacks.
     */
    _timingSafeEqual: function(a, b) {
        if (a.length !== b.length) return false;
        var result = 0;
        for (var i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    },

    // ── Password Policy ───────────────────────────────────────

    PASSWORD_POLICY: {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireDigit: true,
        requireSpecial: true
    },

    /**
     * Validate a password against the policy.
     * Returns { valid: boolean, errors: string[] }
     */
    validatePassword: function(password) {
        var errors = [];
        if (!password || password.length < this.PASSWORD_POLICY.minLength) {
            errors.push('Passwort muss mindestens ' + this.PASSWORD_POLICY.minLength + ' Zeichen lang sein.');
        }
        if (password && password.length > this.PASSWORD_POLICY.maxLength) {
            errors.push('Passwort darf maximal ' + this.PASSWORD_POLICY.maxLength + ' Zeichen lang sein.');
        }
        if (this.PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Passwort muss mindestens einen Grossbuchstaben enthalten.');
        }
        if (this.PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten.');
        }
        if (this.PASSWORD_POLICY.requireDigit && !/[0-9]/.test(password)) {
            errors.push('Passwort muss mindestens eine Ziffer enthalten.');
        }
        if (this.PASSWORD_POLICY.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
            errors.push('Passwort muss mindestens ein Sonderzeichen enthalten.');
        }
        return { valid: errors.length === 0, errors: errors };
    },

    // ── Seed default admin ────────────────────────────────────

    seedDefaultAdmin: function() {
        return BIM.StorageManager.query('userProfiles', { username: 'admin' }).then(function(users) {
            if (users.length > 0) return Promise.resolve();
            return BIM.StorageManager.create('userProfiles', {
                id: BIM.Utils.uuid(),
                name: 'Administrator',
                company: 'Emch+Berger GmbH',
                email: 'admin@emchberger.ch',
                username: 'admin',
                passwordHash: null,
                mustSetPassword: true,
                role: 'admin',
                status: 'active',
                isDefault: false,
                failedAttempts: 0,
                lockedUntil: null,
                lastFailedAttempt: null,
                seriesAccess: [],
                lastActivity: null,
                createdAt: BIM.Utils.now(),
                updatedAt: BIM.Utils.now()
            });
        });
    },

    // ── Login / Logout ────────────────────────────────────────

    login: function(username, password) {
        var self = this;
        username = (username || '').trim().toLowerCase();
        return BIM.StorageManager.query('userProfiles', { username: username }).then(function(users) {
            if (users.length === 0) {
                // Anti-enumeration: perform a dummy PBKDF2 hash to equalize timing
                var dummySalt = self.generateSalt();
                return self.hashPasswordPBKDF2(password || 'dummy', dummySalt).then(function() {
                    return Promise.reject(new Error('Benutzername oder Passwort falsch.'));
                });
            }

            var user = users[0];

            // Check if account is deactivated
            if (user.status !== 'active') {
                return Promise.reject(new Error('Dieses Konto ist deaktiviert.'));
            }

            // Check lockout
            var failedAttempts = user.failedAttempts || 0;
            if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
                var remainMs = new Date(user.lockedUntil) - new Date();
                var remainMin = Math.ceil(remainMs / 60000);
                return Promise.reject(new Error('Konto vorübergehend gesperrt. Versuchen Sie es in ' + remainMin + ' Minuten erneut.'));
            }

            // First-login: user has no password yet → redirect to setup
            if (user.passwordHash === null && (user.mustSetPassword || user.mustSetPassword === undefined)) {
                // For first-login, don't require a password — just show setup
                return Promise.resolve({
                    mustSetPassword: true,
                    userId: user.id,
                    username: user.username,
                    name: user.name
                });
            }

            // Verify password
            return self.verifyPassword(password, user.passwordHash).then(function(result) {
                if (!result.valid) {
                    // Increment failed attempts
                    user.failedAttempts = (user.failedAttempts || 0) + 1;
                    user.lastFailedAttempt = BIM.Utils.now();
                    if (user.failedAttempts >= self.MAX_FAILED_ATTEMPTS) {
                        user.lockedUntil = new Date(Date.now() + self.LOCKOUT_DURATION).toISOString();
                    }
                    return BIM.StorageManager.update('userProfiles', user).then(function() {
                        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
                            return Promise.reject(new Error('Konto vorübergehend gesperrt. Zu viele Fehlversuche. Versuchen Sie es in 15 Minuten erneut.'));
                        }
                        return Promise.reject(new Error('Benutzername oder Passwort falsch.'));
                    });
                }

                // Detect weak default admin password "admin"
                if (user.username === 'admin' && password === 'admin') {
                    user.mustSetPassword = true;
                    user.failedAttempts = 0;
                    user.lockedUntil = null;
                    user.lastFailedAttempt = null;
                    return BIM.StorageManager.update('userProfiles', user).then(function() {
                        return {
                            mustSetPassword: true,
                            userId: user.id,
                            username: user.username,
                            name: user.name
                        };
                    });
                }

                // Check mustSetPassword flag (admin forced a reset)
                if (user.mustSetPassword) {
                    user.failedAttempts = 0;
                    user.lockedUntil = null;
                    user.lastFailedAttempt = null;
                    return BIM.StorageManager.update('userProfiles', user).then(function() {
                        return {
                            mustSetPassword: true,
                            userId: user.id,
                            username: user.username,
                            name: user.name
                        };
                    });
                }

                // ── Success: create session ──

                // Upgrade legacy hash to PBKDF2 silently
                var upgradePromise;
                if (result.needsUpgrade) {
                    var newSalt = self.generateSalt();
                    upgradePromise = self.hashPasswordPBKDF2(password, newSalt).then(function(newHash) {
                        user.passwordHash = newHash;
                        return Promise.resolve();
                    });
                } else {
                    upgradePromise = Promise.resolve();
                }

                return upgradePromise.then(function() {
                    // Reset failed attempts on success
                    user.failedAttempts = 0;
                    user.lockedUntil = null;
                    user.lastFailedAttempt = null;

                    var token = BIM.Utils.uuid();
                    var session = {
                        id: token,
                        userId: user.id,
                        createdAt: BIM.Utils.now(),
                        expiresAt: new Date(Date.now() + self.SESSION_DURATION).toISOString()
                    };
                    return BIM.StorageManager.create('sessions', session).then(function() {
                        localStorage.setItem(self.SESSION_KEY, token);
                        user.lastActivity = BIM.Utils.now();
                        return BIM.StorageManager.update('userProfiles', user);
                    }).then(function() {
                        self.logActivity(user.id, user.name, 'login', 'system', null, 'Anmeldung', '');
                        // Clean stale sessions in background (non-blocking)
                        self.cleanExpiredSessions().catch(function() {});
                        return user;
                    });
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
            return BIM.StorageManager.remove('sessions', token).catch(function() {});
        }).then(function() {
            localStorage.removeItem(self.SESSION_KEY);
        });
    },

    // ── First-Login Password Setup ────────────────────────────

    /**
     * Set the initial password for a user who has mustSetPassword: true.
     * Validates policy, hashes with PBKDF2, creates session, returns user.
     */
    setInitialPassword: function(userId, newPassword) {
        var self = this;
        var validation = this.validatePassword(newPassword);
        if (!validation.valid) {
            return Promise.reject(new Error(validation.errors[0]));
        }

        return BIM.StorageManager.getById('userProfiles', userId).then(function(user) {
            if (!user) return Promise.reject(new Error('Benutzer nicht gefunden.'));
            if (!user.mustSetPassword && user.passwordHash !== null) {
                return Promise.reject(new Error('Passwort ist bereits gesetzt.'));
            }

            var salt = self.generateSalt();
            return self.hashPasswordPBKDF2(newPassword, salt).then(function(hash) {
                user.passwordHash = hash;
                user.mustSetPassword = false;
                user.failedAttempts = 0;
                user.lockedUntil = null;
                user.lastFailedAttempt = null;
                user.updatedAt = BIM.Utils.now();
                user.lastActivity = BIM.Utils.now();

                // Invalidate any stale sessions
                return self.invalidateUserSessions(userId).then(function() {
                    return BIM.StorageManager.update('userProfiles', user);
                }).then(function() {
                    // Create fresh session
                    var token = BIM.Utils.uuid();
                    var session = {
                        id: token,
                        userId: user.id,
                        createdAt: BIM.Utils.now(),
                        expiresAt: new Date(Date.now() + self.SESSION_DURATION).toISOString()
                    };
                    return BIM.StorageManager.create('sessions', session).then(function() {
                        localStorage.setItem(self.SESSION_KEY, token);
                        self.logActivity(user.id, user.name, 'login', 'system', null, 'Erstanmeldung — Passwort gesetzt', '');
                        return user;
                    });
                });
            });
        });
    },

    // ── Self-Service Password Change ──────────────────────────

    /**
     * Change own password. Requires current password verification.
     * Invalidates all sessions, creates a fresh one.
     */
    changePasswordSelf: function(userId, currentPassword, newPassword) {
        var self = this;

        // Validate new password policy
        var validation = this.validatePassword(newPassword);
        if (!validation.valid) {
            return Promise.reject(new Error(validation.errors[0]));
        }

        return BIM.StorageManager.getById('userProfiles', userId).then(function(user) {
            if (!user) return Promise.reject(new Error('Benutzer nicht gefunden.'));

            // Verify current password
            return self.verifyPassword(currentPassword, user.passwordHash).then(function(result) {
                if (!result.valid) {
                    return Promise.reject(new Error('Aktuelles Passwort ist falsch.'));
                }

                // Hash new password
                var salt = self.generateSalt();
                return self.hashPasswordPBKDF2(newPassword, salt).then(function(hash) {
                    user.passwordHash = hash;
                    user.mustSetPassword = false;
                    user.updatedAt = BIM.Utils.now();

                    // Invalidate all sessions then create fresh one
                    return self.invalidateUserSessions(userId).then(function() {
                        return BIM.StorageManager.update('userProfiles', user);
                    }).then(function() {
                        var token = BIM.Utils.uuid();
                        var session = {
                            id: token,
                            userId: user.id,
                            createdAt: BIM.Utils.now(),
                            expiresAt: new Date(Date.now() + self.SESSION_DURATION).toISOString()
                        };
                        return BIM.StorageManager.create('sessions', session).then(function() {
                            localStorage.setItem(self.SESSION_KEY, token);
                            self.logActivity(user.id, user.name, 'update', 'user', userId, user.name, 'Passwort geändert');
                            return user;
                        });
                    });
                });
            });
        });
    },

    // ── Admin Password Reset ──────────────────────────────────

    /**
     * Admin forces a password reset for a user.
     * Clears the password hash, sets mustSetPassword, invalidates sessions.
     */
    adminResetPassword: function(userId) {
        var self = this;
        return BIM.StorageManager.getById('userProfiles', userId).then(function(user) {
            if (!user) return Promise.reject(new Error('Benutzer nicht gefunden.'));
            user.passwordHash = null;
            user.mustSetPassword = true;
            user.failedAttempts = 0;
            user.lockedUntil = null;
            user.lastFailedAttempt = null;
            user.updatedAt = BIM.Utils.now();

            return self.invalidateUserSessions(userId).then(function() {
                return BIM.StorageManager.update('userProfiles', user);
            });
        });
    },

    /**
     * Admin resets lockout for a user (clears failed attempts and lock).
     */
    resetUserLockout: function(userId) {
        return BIM.StorageManager.getById('userProfiles', userId).then(function(user) {
            if (!user) return Promise.reject(new Error('Benutzer nicht gefunden.'));
            user.failedAttempts = 0;
            user.lockedUntil = null;
            user.lastFailedAttempt = null;
            user.updatedAt = BIM.Utils.now();
            return BIM.StorageManager.update('userProfiles', user);
        });
    },

    // ── Session Management ────────────────────────────────────

    /**
     * Invalidate all sessions for a given user.
     */
    invalidateUserSessions: function(userId) {
        return BIM.StorageManager.query('sessions', { userId: userId }).then(function(sessions) {
            return Promise.all(sessions.map(function(s) {
                return BIM.StorageManager.remove('sessions', s.id);
            }));
        });
    },

    getCurrentSession: function() {
        var token = localStorage.getItem(this.SESSION_KEY);
        if (!token) return Promise.resolve(null);
        return BIM.StorageManager.getById('sessions', token).then(function(session) {
            if (!session) return null;
            if (new Date(session.expiresAt) < new Date()) {
                localStorage.removeItem('bim_session_token');
                return BIM.StorageManager.remove('sessions', token).then(function() { return null; });
            }
            return session;
        });
    },

    getCurrentUser: function() {
        return this.getCurrentSession().then(function(session) {
            if (!session) return null;
            return BIM.StorageManager.getById('userProfiles', session.userId);
        });
    },

    /**
     * Require login — redirects to login page if not authenticated
     * or if user must set their password.
     */
    requireAuth: function(loginUrl) {
        loginUrl = loginUrl || '../../login.html';
        return this.getCurrentUser().then(function(user) {
            if (!user || user.status !== 'active') {
                window.location.href = loginUrl;
                return null;
            }
            // Force password setup if needed
            if (user.mustSetPassword || user.passwordHash === null) {
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
            if (user && user.status === 'active' && !user.mustSetPassword && user.passwordHash !== null) {
                window.location.href = redirectUrl;
                return true;
            }
            return false;
        });
    },

    // ── RBAC ──────────────────────────────────────────────────

    canAccessAdmin: function(user) {
        return user && user.role === 'admin';
    },

    canAccessSeries: function(user, seriesId) {
        if (!user) return false;
        if (user.role === 'admin') return true;
        if (!user.seriesAccess || user.seriesAccess.length === 0) return true;
        return user.seriesAccess.indexOf(seriesId) !== -1;
    },

    canEdit: function(user) {
        return user && (user.role === 'admin' || user.role === 'editor');
    },

    canEditSeriesSettings: function(user) {
        return user && user.role === 'admin';
    },

    ROLE_LABELS: {
        admin: 'Administrator',
        editor: 'Bearbeiter',
        viewer: 'Betrachter'
    },

    getRoleLabel: function(role) {
        return this.ROLE_LABELS[role] || role;
    },

    // ── User CRUD ─────────────────────────────────────────────

    /**
     * Create a new user without a password. User must set password on first login.
     */
    createUser: function(data) {
        var user = {
            id: BIM.Utils.uuid(),
            name: data.name || '',
            company: data.company || '',
            email: data.email || '',
            username: (data.username || '').trim().toLowerCase(),
            passwordHash: null,
            mustSetPassword: true,
            role: data.role || 'viewer',
            status: 'active',
            isDefault: false,
            failedAttempts: 0,
            lockedUntil: null,
            lastFailedAttempt: null,
            seriesAccess: data.seriesAccess || [],
            lastActivity: null,
            createdAt: BIM.Utils.now(),
            updatedAt: BIM.Utils.now()
        };
        return BIM.StorageManager.create('userProfiles', user).then(function() {
            return user;
        });
    },

    updateUser: function(user) {
        user.updatedAt = BIM.Utils.now();
        return BIM.StorageManager.update('userProfiles', user);
    },

    deactivateUser: function(userId) {
        var self = this;
        return BIM.StorageManager.getById('userProfiles', userId).then(function(user) {
            if (!user) return Promise.reject(new Error('Benutzer nicht gefunden.'));
            user.status = 'inactive';
            user.updatedAt = BIM.Utils.now();
            return self.invalidateUserSessions(userId).then(function() {
                return BIM.StorageManager.update('userProfiles', user);
            });
        });
    },

    activateUser: function(userId) {
        return BIM.StorageManager.getById('userProfiles', userId).then(function(user) {
            if (!user) return Promise.reject(new Error('Benutzer nicht gefunden.'));
            user.status = 'active';
            user.updatedAt = BIM.Utils.now();
            return BIM.StorageManager.update('userProfiles', user);
        });
    },

    getAllUsers: function() {
        return BIM.StorageManager.getAll('userProfiles');
    },

    getActiveUsers: function() {
        return BIM.StorageManager.query('userProfiles', { status: 'active' });
    },

    // ── Activity Logging ──────────────────────────────────────

    logActivity: function(userId, userName, action, resourceType, resourceId, resourceName, details) {
        var log = {
            id: BIM.Utils.uuid(),
            userId: userId,
            userName: userName || '',
            action: action,
            resourceType: resourceType || '',
            resourceId: resourceId || '',
            resourceName: resourceName || '',
            details: details || '',
            timestamp: BIM.Utils.now()
        };
        BIM.StorageManager.create('activityLogs', log).catch(function(err) {
            console.warn('Activity log failed:', err);
        });
    },

    getActivityLogs: function(filter) {
        if (filter) {
            return BIM.StorageManager.query('activityLogs', filter);
        }
        return BIM.StorageManager.getAll('activityLogs');
    },

    getRecentActivity: function(limit) {
        limit = limit || 50;
        return BIM.StorageManager.getAll('activityLogs').then(function(logs) {
            logs.sort(function(a, b) {
                return a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0;
            });
            return logs.slice(0, limit);
        });
    },

    getUserActivity: function(userId, limit) {
        limit = limit || 50;
        return BIM.StorageManager.query('activityLogs', { userId: userId }).then(function(logs) {
            logs.sort(function(a, b) {
                return a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0;
            });
            return logs.slice(0, limit);
        });
    },

    // ── Session cleanup ───────────────────────────────────────

    cleanExpiredSessions: function() {
        return BIM.StorageManager.getAll('sessions').then(function(sessions) {
            var now = new Date();
            var expired = sessions.filter(function(s) { return new Date(s.expiresAt) < now; });
            return Promise.all(expired.map(function(s) {
                return BIM.StorageManager.remove('sessions', s.id);
            }));
        });
    },

    // ── Activity Log Pruning ─────────────────────────────────

    /**
     * Remove activity logs older than maxDays (default 90).
     */
    pruneActivityLogs: function(maxDays) {
        maxDays = maxDays || 90;
        var cutoff = new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000).toISOString();
        return BIM.StorageManager.getAll('activityLogs').then(function(logs) {
            var old = logs.filter(function(l) { return l.timestamp < cutoff; });
            return Promise.all(old.map(function(l) {
                return BIM.StorageManager.remove('activityLogs', l.id);
            }));
        });
    },

    // ── Initialization ────────────────────────────────────────

    init: function() {
        var self = this;
        return this.seedDefaultAdmin().then(function() {
            return self.cleanExpiredSessions();
        }).then(function() {
            return self.pruneActivityLogs(90);
        });
    }
};
