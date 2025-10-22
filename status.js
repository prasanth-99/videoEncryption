#!/usr/bin/env node
/**
 * Project Status Checker
 * Quick validation of project setup and readiness
 */

const fs = require('fs');
const path = require('path');

class ProjectChecker {
    constructor() {
        this.checks = [];
        this.errors = [];
        this.warnings = [];
    }

    async check() {
        console.log('🔍 Video Encryption Pipeline - Status Check');
        console.log('=' .repeat(50));
        
        this.checkRequiredFiles();
        this.checkGeneratedContent();
        this.checkDependencies();
        this.checkServers();
        
        this.printResults();
    }

    checkRequiredFiles() {
        console.log('\n📁 Required Files:');
        
        const requiredFiles = [
            { path: 'package.json', desc: 'Package configuration' },
            { path: 'scripts/generate-keys.js', desc: 'Key generation script' },
            { path: 'scripts/package-video.js', desc: 'Video packaging script' },
            { path: 'server/license-server.js', desc: 'License server' },
            { path: 'server/content-server.py', desc: 'Content server' },
            { path: 'players/test-unencrypted.html', desc: 'Main test player' }
        ];

        requiredFiles.forEach(file => {
            if (fs.existsSync(file.path)) {
                console.log(`  ✅ ${file.desc}`);
                this.checks.push(`✅ ${file.desc}`);
            } else {
                console.log(`  ❌ ${file.desc} (${file.path})`);
                this.errors.push(`Missing: ${file.path}`);
            }
        });
    }

    checkGeneratedContent() {
        console.log('\n🎬 Content Status:');
        
        const inputVideo = 'content/input.mp4';
        if (fs.existsSync(inputVideo)) {
            const stats = fs.statSync(inputVideo);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
            console.log(`  ✅ Input video found (${sizeMB} MB)`);
            this.checks.push('✅ Input video ready');
        } else {
            console.log(`  ⚠️  Input video not found (content/input.mp4)`);
            this.warnings.push('Add your video as content/input.mp4');
        }

        const generatedFiles = [
            { path: 'content/encryption-keys.json', desc: 'Encryption keys', cmd: 'npm run generate-keys' },
            { path: 'content/video_encrypted.mp4', desc: 'Encrypted video', cmd: 'npm run package-video' },
            { path: 'content/manifest.mpd', desc: 'DASH manifest', cmd: 'npm run package-video' },
            { path: 'content/player-config.json', desc: 'Player config', cmd: 'npm run package-video' }
        ];

        generatedFiles.forEach(file => {
            if (fs.existsSync(file.path)) {
                console.log(`  ✅ ${file.desc} generated`);
                this.checks.push(`✅ ${file.desc}`);
            } else {
                console.log(`  ⚠️  ${file.desc} not generated (run: ${file.cmd})`);
                this.warnings.push(`Generate ${file.desc}: ${file.cmd}`);
            }
        });
    }

    checkDependencies() {
        console.log('\n📦 Dependencies:');
        
        // Check Node.js dependencies
        if (fs.existsSync('node_modules')) {
            console.log('  ✅ Node.js dependencies installed');
            this.checks.push('✅ Node dependencies');
        } else {
            console.log('  ❌ Node.js dependencies not installed (run: npm install)');
            this.errors.push('Run: npm install');
        }

        // Check Shaka Packager
        const packagerPaths = ['scripts/packager.exe', 'scripts/packager'];
        const hasPackager = packagerPaths.some(p => fs.existsSync(p));
        
        if (hasPackager) {
            console.log('  ✅ Shaka Packager found');
            this.checks.push('✅ Shaka Packager');
        } else {
            console.log('  ⚠️  Shaka Packager not found');
            this.warnings.push('Download packager from: https://github.com/shaka-project/shaka-packager/releases');
        }
    }

    checkServers() {
        console.log('\n🚀 Server Configuration:');
        
        // Just check if server files exist and are readable
        const servers = [
            { path: 'server/license-server.js', port: 8443, desc: 'License Server' },
            { path: 'server/content-server.py', port: 8080, desc: 'Content Server' }
        ];

        servers.forEach(server => {
            if (fs.existsSync(server.path)) {
                console.log(`  ✅ ${server.desc} ready (port ${server.port})`);
                this.checks.push(`✅ ${server.desc}`);
            } else {
                console.log(`  ❌ ${server.desc} missing`);
                this.errors.push(`Missing: ${server.path}`);
            }
        });
    }

    printResults() {
        console.log('\n' + '=' .repeat(50));
        
        if (this.errors.length === 0) {
            console.log('🎉 Project Status: READY!');
            
            if (this.warnings.length > 0) {
                console.log('\n⚠️  Recommendations:');
                this.warnings.forEach(warning => console.log(`   • ${warning}`));
            }
            
            console.log('\n🚀 Quick Start:');
            if (!fs.existsSync('content/input.mp4')) {
                console.log('   1. Add video: cp your-video.mp4 content/input.mp4');
                console.log('   2. Generate keys: npm run generate-keys');
                console.log('   3. Package video: npm run package-video');
            } else if (!fs.existsSync('content/encryption-keys.json')) {
                console.log('   1. Generate keys: npm run generate-keys');
                console.log('   2. Package video: npm run package-video');
            } else if (!fs.existsSync('content/video_encrypted.mp4')) {
                console.log('   1. Package video: npm run package-video');
            }
            console.log('   📡 Start servers: npm run dev');
            console.log('   🌐 Test: http://localhost:8080/players/test-unencrypted.html');
            
        } else {
            console.log('❌ Project Status: NEEDS ATTENTION');
            console.log('\n🔧 Issues to fix:');
            this.errors.forEach(error => console.log(`   • ${error}`));
            
            if (this.warnings.length > 0) {
                console.log('\n⚠️  Additional recommendations:');
                this.warnings.forEach(warning => console.log(`   • ${warning}`));
            }
        }
        
        console.log('\n📚 Documentation:');
        console.log('   • README.md - Project overview');
        console.log('   • SETUP.md - Detailed setup guide');
    }
}

// Run check if called directly
if (require.main === module) {
    const checker = new ProjectChecker();
    checker.check().catch(console.error);
}

module.exports = ProjectChecker;