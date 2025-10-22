#!/usr/bin/env node
/**
 * Video File Analyzer
 * Helps diagnose video compatibility issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VideoAnalyzer {
    constructor() {
        this.videoPath = 'content/input.mp4';
    }

    async analyze() {
        console.log('🎥 Video File Analysis');
        console.log('=' .repeat(40));
        
        try {
            await this.checkFileExists();
            await this.checkFileSize();
            await this.analyzeWithFFprobe();
            await this.checkBrowserCompatibility();
            await this.generateRecommendations();
            
        } catch (error) {
            console.error(`❌ Analysis failed: ${error.message}`);
            this.showTroubleshootingTips();
        }
    }

    async checkFileExists() {
        console.log('\n📁 File Check:');
        
        if (fs.existsSync(this.videoPath)) {
            console.log(`  ✅ Video file found: ${this.videoPath}`);
        } else {
            throw new Error(`Video file not found: ${this.videoPath}`);
        }
    }

    async checkFileSize() {
        const stats = fs.statSync(this.videoPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        
        console.log(`  📏 File size: ${sizeMB} MB`);
        
        if (stats.size > 100 * 1024 * 1024) { // 100MB
            console.log('  ⚠️ Large file - may cause loading issues');
        }
        
        if (stats.size < 1024) { // 1KB
            console.log('  ❌ File too small - likely corrupted');
        }
    }

    async analyzeWithFFprobe() {
        console.log('\n🔍 Video Format Analysis:');
        
        try {
            // Try ffprobe first
            const output = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${this.videoPath}"`, 
                { encoding: 'utf8' });
            
            const data = JSON.parse(output);
            
            console.log('  📊 Container:', data.format.format_name);
            console.log('  ⏱️ Duration:', parseFloat(data.format.duration).toFixed(2), 'seconds');
            
            // Analyze video streams
            const videoStreams = data.streams.filter(s => s.codec_type === 'video');
            const audioStreams = data.streams.filter(s => s.codec_type === 'audio');
            
            if (videoStreams.length > 0) {
                const video = videoStreams[0];
                console.log('\n  🎬 Video Stream:');
                console.log(`    • Codec: ${video.codec_name} (${video.codec_long_name})`);
                console.log(`    • Resolution: ${video.width}x${video.height}`);
                console.log(`    • Frame Rate: ${video.r_frame_rate}`);
                console.log(`    • Profile: ${video.profile || 'N/A'}`);
                console.log(`    • Level: ${video.level || 'N/A'}`);
                
                // Check codec compatibility
                this.checkVideoCodecCompatibility(video.codec_name, video.profile);
            }
            
            if (audioStreams.length > 0) {
                const audio = audioStreams[0];
                console.log('\n  🔊 Audio Stream:');
                console.log(`    • Codec: ${audio.codec_name} (${audio.codec_long_name})`);
                console.log(`    • Sample Rate: ${audio.sample_rate} Hz`);
                console.log(`    • Channels: ${audio.channels}`);
                
                this.checkAudioCodecCompatibility(audio.codec_name);
            }
            
        } catch (error) {
            console.log('  ⚠️ FFprobe not available - using basic analysis');
            console.log('  💡 Install FFmpeg for detailed video analysis');
            
            // Basic file analysis
            const buffer = fs.readFileSync(this.videoPath, { start: 0, end: 100 });
            const hex = buffer.toString('hex');
            
            if (hex.includes('66747970')) {
                console.log('  ✅ Appears to be MP4 container');
            } else {
                console.log('  ❌ May not be valid MP4 file');
            }
        }
    }

    checkVideoCodecCompatibility(codec, profile) {
        console.log('\n  🎯 Video Codec Compatibility:');
        
        if (codec === 'h264') {
            console.log('    ✅ H.264 codec - widely supported');
            
            if (profile) {
                if (profile.toLowerCase().includes('baseline') || 
                    profile.toLowerCase().includes('main') || 
                    profile.toLowerCase().includes('high')) {
                    console.log(`    ✅ Profile: ${profile} - browser compatible`);
                } else {
                    console.log(`    ⚠️ Profile: ${profile} - may not be supported`);
                    console.log('    💡 Recommend: Baseline or Main profile');
                }
            }
        } else {
            console.log(`    ❌ Codec: ${codec} - not widely supported in browsers`);
            console.log('    💡 Recommend: Convert to H.264');
        }
    }

    checkAudioCodecCompatibility(codec) {
        console.log('\n  🎵 Audio Codec Compatibility:');
        
        if (codec === 'aac') {
            console.log('    ✅ AAC codec - widely supported');
        } else if (codec === 'mp3') {
            console.log('    ✅ MP3 codec - supported but AAC preferred');
        } else {
            console.log(`    ❌ Codec: ${codec} - may not be supported`);
            console.log('    💡 Recommend: Convert to AAC');
        }
    }

    async checkBrowserCompatibility() {
        console.log('\n🌐 Browser Compatibility:');
        console.log('  💡 Run this in browser console for live test:');
        console.log('  ```javascript');
        console.log('  const video = document.createElement("video");');
        console.log('  console.log("MP4:", video.canPlayType("video/mp4"));');
        console.log('  console.log("H.264:", video.canPlayType(\'video/mp4; codecs="avc1.42E01E"\'));');
        console.log('  console.log("AAC:", video.canPlayType(\'audio/mp4; codecs="mp4a.40.2"\'));');
        console.log('  ```');
    }

    async generateRecommendations() {
        console.log('\n🔧 Recommendations:');
        
        console.log('\n  1️⃣ Try HTML5 video test:');
        console.log('     • Open browser dev tools');
        console.log('     • Go to Network tab');
        console.log('     • Try loading: http://localhost:8080/content/input.mp4');
        console.log('     • Check for 200 OK response');
        
        console.log('\n  2️⃣ Convert video for maximum compatibility:');
        console.log('     ```bash');
        console.log('     ffmpeg -i content/input.mp4 \\');
        console.log('       -c:v libx264 -profile:v baseline -level 3.0 \\');
        console.log('       -c:a aac -b:a 128k \\');
        console.log('       -movflags +faststart \\');
        console.log('       content/input_compatible.mp4');
        console.log('     ```');
        
        console.log('\n  3️⃣ Alternative test videos:');
        console.log('     • Download test video from: https://sample-videos.com/');
        console.log('     • Use Big Buck Bunny sample: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
        
        console.log('\n  4️⃣ Quick fixes:');
        console.log('     • Try different browser (Chrome recommended)');
        console.log('     • Check if video plays in VLC/Media Player');
        console.log('     • Ensure content server is running on port 8080');
    }

    showTroubleshootingTips() {
        console.log('\n🆘 Troubleshooting Tips:');
        console.log('  • Ensure video file exists: content/input.mp4');
        console.log('  • Check file permissions');
        console.log('  • Try a different video file');
        console.log('  • Install FFmpeg for detailed analysis');
        console.log('  • Check browser console for additional errors');
    }
}

// Run analysis if called directly
if (require.main === module) {
    const analyzer = new VideoAnalyzer();
    analyzer.analyze().catch(console.error);
}

module.exports = VideoAnalyzer;