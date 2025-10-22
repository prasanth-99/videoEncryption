const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate random encryption key and key ID for MPEG-CENC
 */
function generateKeys() {
    // Generate 16 bytes (128-bit) random values
    const keyBytes = crypto.randomBytes(16);
    const kidBytes = crypto.randomBytes(16);
    
    // Convert to hex (for Shaka Packager)
    const keyHex = keyBytes.toString('hex');
    const kidHex = kidBytes.toString('hex');
    
    // Convert to base64url (for license server)
    const keyB64url = keyBytes.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    const kidB64url = kidBytes.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    return {
        hex: { key: keyHex, kid: kidHex },
        base64url: { key: keyB64url, kid: kidB64url }
    };
}

/**
 * Save keys to a configuration file
 */
function saveKeysToFile(keys, filename = 'encryption-keys.json') {
    const keysPath = path.join(__dirname, '..', 'content', filename);
    const config = {
        generated: new Date().toISOString(),
        encryption: {
            hex: keys.hex,
            base64url: keys.base64url
        },
        instructions: {
            hex: "Use these values for Shaka Packager packaging command",
            base64url: "Use these values for license server configuration"
        }
    };
    
    fs.writeFileSync(keysPath, JSON.stringify(config, null, 2));
    console.log(`Keys saved to: ${keysPath}`);
    return keysPath;
}

/**
 * Generate PowerShell/Bash environment variables
 */
function generateEnvCommands(keys) {
    const powershell = `# PowerShell commands
$env:KEY_HEX = "${keys.hex.key}"
$env:KID_HEX = "${keys.hex.kid}"
$env:KEY_B64URL = "${keys.base64url.key}"
$env:KID_B64URL = "${keys.base64url.kid}"`;

    const bash = `# Bash commands
export KEY_HEX="${keys.hex.key}"
export KID_HEX="${keys.hex.kid}"
export KEY_B64URL="${keys.base64url.key}"
export KID_B64URL="${keys.base64url.kid}"`;

    return { powershell, bash };
}

// Main execution
if (require.main === module) {
    console.log('🔑 Generating encryption keys...\n');
    
    const keys = generateKeys();
    
    console.log('Generated Keys:');
    console.log('===============');
    console.log('\nHex format (for Shaka Packager):');
    console.log(`Key ID:  ${keys.hex.kid}`);
    console.log(`Key:     ${keys.hex.key}`);
    
    console.log('\nBase64URL format (for License Server):');
    console.log(`Key ID:  ${keys.base64url.kid}`);
    console.log(`Key:     ${keys.base64url.key}`);
    
    // Save to file
    const savedPath = saveKeysToFile(keys);
    
    // Generate environment commands
    const envCommands = generateEnvCommands(keys);
    
    console.log('\n📝 Environment Variables:');
    console.log('==========================');
    console.log('\nFor PowerShell:');
    console.log(envCommands.powershell);
    console.log('\nFor Bash/Linux:');
    console.log(envCommands.bash);
    
    console.log('\n✅ Keys generated successfully!');
    console.log(`📁 Configuration saved to: ${savedPath}`);
    console.log('\n🚀 Next steps:');
    console.log('1. Place your input video as content/input.mp4');
    console.log('2. Run: npm run package-video');
    console.log('3. Test with the HTML players');
}

module.exports = { generateKeys, saveKeysToFile, generateEnvCommands };