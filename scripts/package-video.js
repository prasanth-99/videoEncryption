const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Video packaging script using Shaka Packager
 */

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const INPUT_VIDEO = path.join(CONTENT_DIR, 'input.mp4');
const KEYS_FILE = path.join(CONTENT_DIR, 'encryption-keys.json');

/**
 * Load encryption keys from the generated keys file
 */
function loadKeys() {
    if (!fs.existsSync(KEYS_FILE)) {
        console.error('❌ Encryption keys not found!');
        console.log('Please run: npm run generate-keys');
        process.exit(1);
    }
    
    const keysData = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    return keysData.encryption;
}

/**
 * Check if input video exists
 */
function checkInputVideo() {
    if (!fs.existsSync(INPUT_VIDEO)) {
        console.error('❌ Input video not found!');
        console.log(`Please place your video file at: ${INPUT_VIDEO}`);
        console.log('\nYou can download a test video:');
        console.log('https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4');
        process.exit(1);
    }
    console.log('✅ Input video found');
}

/**
 * Find packager executable
 */
function findPackager() {
    const localPackager = path.join(__dirname, 'packager.exe');
    if (fs.existsSync(localPackager)) {
        return `"${localPackager}"`;
    }
    return 'packager'; // fallback to system PATH
}

/**
 * Package video with Shaka Packager
 */
function packageVideo(keys) {
    const { key, kid } = keys.hex;
    
    console.log('📦 Packaging video with encryption...');
    console.log(`Using Key ID: ${kid}`);
    console.log(`Using Key: ${key}`);
    
    // Find packager executable
    const packagerCmd = findPackager();
    console.log(`Using packager: ${packagerCmd}`);
    
    // Shaka Packager command for DASH
    // Generate with Common Encryption for ClearKey compatibility
    const command = `${packagerCmd} ` +
        `input="${INPUT_VIDEO}",stream=video,output="${path.join(CONTENT_DIR, 'video_encrypted.mp4')}" ` +
        `--enable_raw_key_encryption ` +
        `--keys key_id=${kid}:key=${key} ` +
        `--protection_scheme cenc ` +
        `--clear_lead 0 ` +
        `--generate_static_live_mpd ` +
        `--mpd_output "${path.join(CONTENT_DIR, 'manifest.mpd')}"`;
    
    console.log('🔧 Note: Generating CENC manifest for ClearKey...');
    
    try {
        console.log('\n🔧 Running Shaka Packager...');
        console.log('Command:', command);
        
        const output = execSync(command, { 
            stdio: 'pipe',
            cwd: CONTENT_DIR 
        }).toString();
        
        console.log('✅ Packaging completed successfully!');
        console.log('\nOutput files created:');
        console.log('- manifest.mpd (DASH manifest)');
        console.log('- video_encrypted.mp4 (encrypted video track)');
        console.log('- audio_encrypted.mp4 (encrypted audio track)');
        
        return true;
    } catch (error) {
        console.error('❌ Packaging failed!');
        console.error('Error:', error.message);
        
        if (error.message.includes('packager')) {
            console.log('\n💡 Make sure Shaka Packager is installed:');
            console.log('Windows: Download from https://github.com/shaka-project/shaka-packager/releases');
            console.log('macOS: brew install shaka-packager');
            console.log('Linux: Download binary and add to PATH');
        }
        
        return false;
    }
}

/**
 * Generate HLS manifest as well (optional)
 */
function generateHLS(keys) {
    const { key, kid } = keys.hex;
    
    console.log('\n📱 Generating HLS manifest...');
    
    const hlsCommand = `packager ` +
        `input="${INPUT_VIDEO}",stream=video,output="${path.join(CONTENT_DIR, 'video_hls.mp4')}" ` +
        `input="${INPUT_VIDEO}",stream=audio,output="${path.join(CONTENT_DIR, 'audio_hls.mp4')}" ` +
        `--enable_raw_key_encryption ` +
        `--keys label=SD:key_id=${kid}:key=${key} ` +
        `--protection_scheme cenc ` +
        `--hls_master_playlist_output "${path.join(CONTENT_DIR, 'master.m3u8')}"`;
    
    try {
        execSync(hlsCommand, { 
            stdio: 'pipe',
            cwd: CONTENT_DIR 
        });
        
        console.log('✅ HLS manifest generated: master.m3u8');
        return true;
    } catch (error) {
        console.warn('⚠️  HLS generation failed (optional):', error.message);
        return false;
    }
}

/**
 * Create player configuration file
 */
function createPlayerConfig(keys) {
    const config = {
        manifestUrl: 'http://localhost:8080/content/manifest.mpd',
        hlsUrl: 'http://localhost:8080/content/master.m3u8',
        licenseUrl: 'http://localhost:8443/license?token=devtoken',
        clearKeys: {
            [keys.hex.kid]: keys.hex.key
        },
        licenseServerKeys: {
            [keys.base64url.kid]: keys.base64url.key
        }
    };
    
    const configPath = path.join(CONTENT_DIR, 'player-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`📋 Player configuration saved: ${configPath}`);
}

// Main execution
if (require.main === module) {
    console.log('🎬 Video Encryption Packaging\n');
    
    // Load encryption keys
    const keys = loadKeys();
    console.log('✅ Encryption keys loaded');
    
    // Check input video
    checkInputVideo();
    
    // Package video
    const success = packageVideo(keys);
    
    if (success) {
        // Generate HLS (optional)
        generateHLS(keys);
        
        // Create player config
        createPlayerConfig(keys);
        
        console.log('\n🎉 All done! Your encrypted video is ready.');
        console.log('\n🚀 Next steps:');
        console.log('1. Start license server: npm start');
        console.log('2. Serve content: npm run serve-content');
        console.log('3. Open http://localhost:8080/players/ in your browser');
    } else {
        console.log('\n❌ Packaging failed. Please check the errors above.');
        process.exit(1);
    }
}

module.exports = { loadKeys, packageVideo, generateHLS, createPlayerConfig };