const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

/**
 * License Server for Video Encryption Pipeline
 * Implements ClearKey license distribution with authentication
 */

const app = express();
const PORT = process.env.PORT || 8443;
const KEYS_FILE = path.join(__dirname, '..', 'content', 'encryption-keys.json');

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true
}));
app.use(express.json());
app.use(express.text());

// Global configuration
let serverConfig = {
    keys: {},
    authTokens: ['devtoken', 'testtoken', 'demo123'],
    logRequests: true
};

/**
 * Load encryption keys from configuration file
 */
function loadKeys() {
    try {
        if (!fs.existsSync(KEYS_FILE)) {
            console.warn('⚠️  Encryption keys file not found. Using demo keys.');
            return {
                'demo-kid-base64url': 'demo-key-base64url'
            };
        }
        
        const keysData = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
        const base64urlKeys = keysData.encryption?.base64url;
        
        if (!base64urlKeys || !base64urlKeys.kid || !base64urlKeys.key) {
            throw new Error('Invalid keys format in configuration file');
        }
        
        console.log('✅ Encryption keys loaded successfully');
        console.log(`   Key ID: ${base64urlKeys.kid}`);
        console.log(`   Key: ${base64urlKeys.key.substring(0, 8)}...`);
        
        return {
            [base64urlKeys.kid]: base64urlKeys.key
        };
    } catch (error) {
        console.error('❌ Failed to load encryption keys:', error.message);
        console.log('💡 Make sure to run: npm run generate-keys');
        return {};
    }
}

/**
 * Authenticate request token
 */
function authenticateToken(req) {
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return { valid: false, reason: 'No token provided' };
    }
    
    if (!serverConfig.authTokens.includes(token)) {
        return { valid: false, reason: 'Invalid token' };
    }
    
    return { valid: true, token };
}

/**
 * Log request for debugging
 */
function logRequest(req, response, auth) {
    if (!serverConfig.logRequests) return;
    
    const timestamp = new Date().toISOString();
    console.log(`\n📝 [${timestamp}] License Request:`);
    console.log(`   Method: ${req.method}`);
    console.log(`   URL: ${req.originalUrl}`);
    console.log(`   User-Agent: ${req.headers['user-agent']?.substring(0, 50)}...`);
    console.log(`   Auth: ${auth.valid ? '✅ Valid' : '❌ ' + auth.reason}`);
    console.log(`   Response: ${response.success ? '✅ Success' : '❌ Failed'}`);
}

/**
 * Generate ClearKey JWK response
 */
function generateClearKeyResponse(keys) {
    const jwk = {
        keys: []
    };
    
    for (const [kid, key] of Object.entries(keys)) {
        jwk.keys.push({
            kty: 'oct',      // Key type: octet sequence
            alg: 'A128KW',   // Algorithm: AES Key Wrap with 128-bit key
            kid: kid,        // Key ID (base64url)
            k: key           // Key value (base64url)
        });
    }
    
    return jwk;
}

// Routes

/**
 * GET /license - Main license endpoint
 */
app.get('/license', (req, res) => {
    const auth = authenticateToken(req);
    let response = { success: false };
    
    try {
        if (!auth.valid) {
            response.error = auth.reason;
            res.status(403).json({ error: auth.reason });
            return;
        }
        
        if (Object.keys(serverConfig.keys).length === 0) {
            response.error = 'No encryption keys configured';
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }
        
        // Generate ClearKey license response
        const jwkResponse = generateClearKeyResponse(serverConfig.keys);
        
        res.set('Content-Type', 'application/json');
        res.json(jwkResponse);
        
        response.success = true;
        response.keysProvided = Object.keys(serverConfig.keys).length;
        
    } catch (error) {
        console.error('License generation error:', error);
        response.error = error.message;
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        logRequest(req, response, auth);
    }
});

/**
 * POST /license - Alternative license endpoint (for players that use POST)
 */
app.post('/license', (req, res) => {
    const auth = authenticateToken(req);
    let response = { success: false };
    
    try {
        if (!auth.valid) {
            response.error = auth.reason;
            res.status(403).json({ error: auth.reason });
            return;
        }
        
        // Some players send license challenge in request body
        const challenge = req.body;
        console.log('📋 License challenge received:', typeof challenge);
        
        if (Object.keys(serverConfig.keys).length === 0) {
            response.error = 'No encryption keys configured';
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }
        
        // Generate ClearKey license response
        const jwkResponse = generateClearKeyResponse(serverConfig.keys);
        
        res.set('Content-Type', 'application/json');
        res.json(jwkResponse);
        
        response.success = true;
        response.keysProvided = Object.keys(serverConfig.keys).length;
        
    } catch (error) {
        console.error('License generation error:', error);
        response.error = error.message;
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        logRequest(req, response, auth);
    }
});

/**
 * GET /health - Health check endpoint
 */
app.get('/health', (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        keysLoaded: Object.keys(serverConfig.keys).length,
        authTokens: serverConfig.authTokens.length
    };
    
    res.json(health);
});

/**
 * GET /config - Configuration endpoint (for debugging)
 */
app.get('/config', (req, res) => {
    const auth = authenticateToken(req);
    
    if (!auth.valid) {
        return res.status(403).json({ error: auth.reason });
    }
    
    const config = {
        keysConfigured: Object.keys(serverConfig.keys).length,
        keyIds: Object.keys(serverConfig.keys),
        authTokens: serverConfig.authTokens,
        endpoints: [
            'GET /license?token=xxx',
            'POST /license (with token)',
            'GET /health',
            'GET /config?token=xxx'
        ]
    };
    
    res.json(config);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        availableEndpoints: ['/license', '/health', '/config']
    });
});

/**
 * Start server
 */
function startServer() {
    // Load encryption keys
    serverConfig.keys = loadKeys();
    
    const server = app.listen(PORT, () => {
        console.log('\n🎬 Video Encryption License Server');
        console.log('=====================================');
        console.log(`🚀 Server running on: http://localhost:${PORT}`);
        console.log(`🔑 Keys loaded: ${Object.keys(serverConfig.keys).length}`);
        console.log(`🔐 Auth tokens: ${serverConfig.authTokens.length}`);
        console.log('\n📋 Available endpoints:');
        console.log(`   GET  ${PORT}/license?token=devtoken`);
        console.log(`   POST ${PORT}/license (with auth header/query)`);
        console.log(`   GET  ${PORT}/health`);
        console.log(`   GET  ${PORT}/config?token=devtoken`);
        console.log('\n💡 Test with:');
        console.log(`   curl "http://localhost:${PORT}/health"`);
        console.log(`   curl "http://localhost:${PORT}/license?token=devtoken"`);
        console.log('\n🎯 Ready for license requests from video players!');
        
        if (Object.keys(serverConfig.keys).length === 0) {
            console.log('\n⚠️  WARNING: No encryption keys loaded!');
            console.log('   Run: npm run generate-keys');
            console.log('   Then: npm run package-video');
        }
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down license server...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
    
    return server;
}

// Start server if this file is run directly
if (require.main === module) {
    startServer();
}

module.exports = { app, startServer, serverConfig };