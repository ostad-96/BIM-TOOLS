/**
 * Pure JS SHA-256 + PBKDF2 polyfill for non-HTTPS contexts.
 * crypto.subtle is only available over HTTPS or localhost.
 * This provides the same functions as fallback when running over plain HTTP.
 */
(function() {
    // If crypto.subtle is available, do nothing
    if (typeof crypto !== 'undefined' && crypto.subtle) return;

    // ── SHA-256 (pure JS) ────────────────────────────────────

    var K = [
        0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
        0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
        0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
        0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
        0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
        0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
        0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
        0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];

    function rotr(n, x) { return (x >>> n) | (x << (32 - n)); }
    function ch(x, y, z) { return (x & y) ^ (~x & z); }
    function maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }
    function sigma0(x) { return rotr(2, x) ^ rotr(13, x) ^ rotr(22, x); }
    function sigma1(x) { return rotr(6, x) ^ rotr(11, x) ^ rotr(25, x); }
    function gamma0(x) { return rotr(7, x) ^ rotr(18, x) ^ (x >>> 3); }
    function gamma1(x) { return rotr(17, x) ^ rotr(19, x) ^ (x >>> 10); }

    function sha256(msgBytes) {
        var l = msgBytes.length;
        var bitLen = l * 8;

        // Padding
        var padded = [];
        for (var i = 0; i < l; i++) padded.push(msgBytes[i]);
        padded.push(0x80);
        while ((padded.length % 64) !== 56) padded.push(0);
        // Append bit length as big-endian 64-bit
        for (var i = 56; i >= 0; i -= 8) {
            padded.push((bitLen / Math.pow(2, i)) & 0xff);
        }

        var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];

        for (var offset = 0; offset < padded.length; offset += 64) {
            var W = new Array(64);
            for (var t = 0; t < 16; t++) {
                W[t] = (padded[offset+t*4]<<24) | (padded[offset+t*4+1]<<16) | (padded[offset+t*4+2]<<8) | padded[offset+t*4+3];
            }
            for (var t = 16; t < 64; t++) {
                W[t] = (gamma1(W[t-2]) + W[t-7] + gamma0(W[t-15]) + W[t-16]) | 0;
            }

            var a=H[0], b=H[1], c=H[2], d=H[3], e=H[4], f=H[5], g=H[6], h=H[7];
            for (var t = 0; t < 64; t++) {
                var T1 = (h + sigma1(e) + ch(e,f,g) + K[t] + W[t]) | 0;
                var T2 = (sigma0(a) + maj(a,b,c)) | 0;
                h=g; g=f; f=e; e=(d+T1)|0; d=c; c=b; b=a; a=(T1+T2)|0;
            }
            H[0]=(H[0]+a)|0; H[1]=(H[1]+b)|0; H[2]=(H[2]+c)|0; H[3]=(H[3]+d)|0;
            H[4]=(H[4]+e)|0; H[5]=(H[5]+f)|0; H[6]=(H[6]+g)|0; H[7]=(H[7]+h)|0;
        }

        var result = new Uint8Array(32);
        for (var i = 0; i < 8; i++) {
            result[i*4]   = (H[i]>>>24)&0xff;
            result[i*4+1] = (H[i]>>>16)&0xff;
            result[i*4+2] = (H[i]>>>8)&0xff;
            result[i*4+3] = H[i]&0xff;
        }
        return result;
    }

    // ── HMAC-SHA256 ──────────────────────────────────────────

    function hmacSha256(key, msg) {
        if (key.length > 64) key = sha256(key);
        var padded = new Uint8Array(64);
        for (var i = 0; i < key.length; i++) padded[i] = key[i];

        var ipad = new Uint8Array(64 + msg.length);
        var opad = new Uint8Array(64 + 32);
        for (var i = 0; i < 64; i++) {
            ipad[i] = padded[i] ^ 0x36;
            opad[i] = padded[i] ^ 0x5c;
        }
        for (var i = 0; i < msg.length; i++) ipad[64+i] = msg[i];

        var inner = sha256(ipad);
        for (var i = 0; i < 32; i++) opad[64+i] = inner[i];
        return sha256(opad);
    }

    // ── PBKDF2-SHA256 ────────────────────────────────────────

    function pbkdf2(password, salt, iterations, dkLen) {
        var hLen = 32;
        var numBlocks = Math.ceil(dkLen / hLen);
        var dk = new Uint8Array(numBlocks * hLen);

        for (var block = 1; block <= numBlocks; block++) {
            var saltBlock = new Uint8Array(salt.length + 4);
            for (var i = 0; i < salt.length; i++) saltBlock[i] = salt[i];
            saltBlock[salt.length]   = (block >>> 24) & 0xff;
            saltBlock[salt.length+1] = (block >>> 16) & 0xff;
            saltBlock[salt.length+2] = (block >>> 8) & 0xff;
            saltBlock[salt.length+3] = block & 0xff;

            var U = hmacSha256(password, saltBlock);
            var T = new Uint8Array(U);

            for (var iter = 1; iter < iterations; iter++) {
                U = hmacSha256(password, U);
                for (var j = 0; j < hLen; j++) T[j] ^= U[j];
            }

            var offset = (block - 1) * hLen;
            for (var i = 0; i < hLen; i++) dk[offset + i] = T[i];
        }

        return dk.slice(0, dkLen);
    }

    // ── Polyfill crypto.subtle ───────────────────────────────

    if (typeof crypto === 'undefined') window.crypto = {};

    crypto.subtle = {
        digest: function(algorithm, data) {
            return new Promise(function(resolve) {
                var bytes = new Uint8Array(data);
                var hash = sha256(Array.from(bytes));
                resolve(hash.buffer);
            });
        },

        importKey: function(format, keyData, algorithm, extractable, usages) {
            return Promise.resolve({ _keyData: new Uint8Array(keyData) });
        },

        deriveBits: function(params, key, length) {
            return new Promise(function(resolve) {
                var salt = new Uint8Array(params.salt);
                var result = pbkdf2(key._keyData, salt, params.iterations, length / 8);
                resolve(result.buffer);
            });
        }
    };

    console.info('%c[Crypto] Polyfill aktiv — HTTP-Modus erkannt', 'color:#f59e0b; font-weight:bold;');
})();
