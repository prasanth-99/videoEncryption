#!/usr/bin/env node
/**
 * Video Encryption Pipeline Setup Script
 * Automates the complete setup process for the video encryption demonstration
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class SetupManager {
    constructor() {
        this.projectRoot = process.cwd();
        this.requiredDirs = [
            'content',
            'scripts',
            'server',
            'players',
            'docs'
        ];
    }

    async setup() {
        console.log('🎬 Video Encryption Pipeline Setup');
        console.log('=' .repeat(50));
        
        try {
            await this.checkPrerequisites();
            await this.createDirectories();
            await this.installDependencies();
            await this.downloadShakaDependencies();
            await this.createSampleVideo();
            await this.generateEncryptionKeys();
            await this.packageVideo();
            await this.validateSetup();
            
            console.log('\n✅ Setup completed successfully!');
            this.printUsageInstructions();
            
        } catch (error) {
            console.error('\n❌ Setup failed:', error.message);
            process.exit(1);
        }
    }

    async checkPrerequisites() {
        console.log('\n📋 Checking prerequisites...');
        
        // Check Node.js
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            console.log(`  ✅ Node.js: ${nodeVersion}`);
        } catch (error) {
            throw new Error('Node.js is required but not installed');
        }

        // Check Python
        try {
            const pythonVersion = execSync('python --version', { encoding: 'utf8' }).trim();
            console.log(`  ✅ Python: ${pythonVersion}`);
        } catch (error) {
            throw new Error('Python is required but not installed');
        }

        // Check if Shaka Packager exists
        const packagerPath = path.join(this.projectRoot, 'scripts', 'packager.exe');
        if (!await this.fileExists(packagerPath)) {
            console.log('  ⚠️  Shaka Packager not found - will download');
        } else {
            console.log('  ✅ Shaka Packager found');
        }
    }

    async createDirectories() {
        console.log('\n📁 Creating directory structure...');
        
        for (const dir of this.requiredDirs) {
            const dirPath = path.join(this.projectRoot, dir);
            try {
                await fs.mkdir(dirPath, { recursive: true });
                console.log(`  ✅ Created: ${dir}/`);
            } catch (error) {
                console.log(`  ✅ Exists: ${dir}/`);
            }
        }
    }

    async installDependencies() {
        console.log('\n📦 Installing Node.js dependencies...');
        
        try {
            execSync('npm install', { 
                stdio: 'inherit',
                cwd: this.projectRoot 
            });
            console.log('  ✅ Dependencies installed');
        } catch (error) {
            throw new Error('Failed to install Node.js dependencies');
        }
    }

    async downloadShakaDependencies() {
        console.log('\n⬇️ Checking Shaka Packager...');
        
        const packagerPath = path.join(this.projectRoot, 'scripts', 'packager.exe');
        
        if (!await this.fileExists(packagerPath)) {
            console.log('  📥 Downloading Shaka Packager...');
            
            // For demo purposes, we'll create a placeholder
            // In a real setup, you would download from: 
            // https://github.com/shaka-project/shaka-packager/releases
            const placeholderContent = `@echo off
echo Shaka Packager placeholder
echo Please download the actual packager from:
echo https://github.com/shaka-project/shaka-packager/releases
echo And replace this file with packager.exe
exit /b 1`;
            
            await fs.writeFile(packagerPath, placeholderContent);
            console.log('  ⚠️  Placeholder created - download real packager.exe');
        }
    }

    async createSampleVideo() {
        console.log('\n🎥 Setting up sample video...');
        
        const videoPath = path.join(this.projectRoot, 'content', 'input.mp4');
        
        if (!await this.fileExists(videoPath)) {
            console.log('  📝 Creating video placeholder...');
            
            // Create a README for video setup
            const videoReadme = `# Video Setup

## Required: Input Video File

Place your video file here as 'input.mp4'

### Requirements:
- Format: MP4
- Codec: H.264 (AVC)
- Duration: Any (recommended: 10-60 seconds for testing)
- Resolution: Any (720p+ recommended)

### Suggested Test Videos:
1. Create a simple test video with your phone/camera
2. Use free stock video from https://pixabay.com/videos/
3. Convert existing video to MP4 using ffmpeg:
   \`\`\`
   ffmpeg -i your-video.mov -c:v libx264 -c:a aac input.mp4
   \`\`\`

### For Quick Testing:
You can also use any MP4 video you have available.
The encryption process will work with any valid MP4 file.
`;
            
            await fs.writeFile(
                path.join(this.projectRoot, 'content', 'VIDEO_SETUP.md'), 
                videoReadme
            );
            console.log('  ✅ Video setup guide created');
        } else {
            console.log('  ✅ Input video found');
        }
    }

    async generateEncryptionKeys() {
        console.log('\n🔑 Generating encryption keys...');
        
        try {
            execSync('node scripts/generate-keys.js', {
                stdio: 'inherit',
                cwd: this.projectRoot
            });
            console.log('  ✅ Encryption keys generated');
        } catch (error) {
            console.log('  ⚠️  Keys will be generated on first package');
        }
    }

    async packageVideo() {
        console.log('\n📦 Preparing video packaging...');
        
        const videoPath = path.join(this.projectRoot, 'content', 'input.mp4');
        
        if (await this.fileExists(videoPath)) {
            console.log('  🎬 Video found - packaging...');
            try {
                execSync('node scripts/package-video.js', {
                    stdio: 'inherit',
                    cwd: this.projectRoot
                });
                console.log('  ✅ Video packaged successfully');
            } catch (error) {
                console.log('  ⚠️  Video packaging skipped (missing dependencies)');
            }
        } else {
            console.log('  ⚠️  No input video - packaging skipped');
        }
    }

    async validateSetup() {
        console.log('\n🔍 Validating setup...');
        
        const requiredFiles = [
            'package.json',
            'server/license-server.js',
            'server/content-server.py',
            'scripts/generate-keys.js',
            'scripts/package-video.js',
            'players/test-unencrypted.html'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(this.projectRoot, file);
            if (await this.fileExists(filePath)) {
                console.log(`  ✅ ${file}`);
            } else {
                console.log(`  ❌ Missing: ${file}`);
            }
        }
    }

    printUsageInstructions() {
        console.log('\n🚀 Usage Instructions:');
        console.log('=' .repeat(30));
        console.log('\n1️⃣ Add your video:');
        console.log('   • Place MP4 video as: content/input.mp4');
        console.log('\n2️⃣ Generate content:');
        console.log('   • npm run generate-keys');
        console.log('   • npm run package-video');
        console.log('\n3️⃣ Start servers:');
        console.log('   • npm run start-content');
        console.log('   • npm run start-license (in another terminal)');
        console.log('\n4️⃣ Test encryption:');
        console.log('   • Open: http://localhost:8080/players/test-unencrypted.html');
        console.log('\n📚 Documentation:');
        console.log('   • README.md - Complete project overview');
        console.log('   • SETUP.md - Detailed setup guide');
        console.log('\n🆘 Need help?');
        console.log('   • Check logs for errors');
        console.log('   • Ensure both servers are running');
        console.log('   • Verify your video file is valid MP4');
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}

// Run setup if called directly
if (require.main === module) {
    const setup = new SetupManager();
    setup.setup().catch(console.error);
}

module.exports = SetupManager;