# 🔧 Video Encryption Pipeline - Detailed Setup Guide

This guide provides step-by-step instructions for setting up and running the video encryption pipeline.

## 📋 Prerequisites

### Required Software
- **Node.js** (v14 or higher)
  - Download: https://nodejs.org/
  - Verify: `node --version`
  
- **Python** (v3.7 or higher)
  - Download: https://python.org/
  - Verify: `python --version`
  
- **Git** (for cloning the repository)
  - Download: https://git-scm.com/
  - Verify: `git --version`

### Optional Tools
- **FFmpeg** (for video conversion)
  - Download: https://ffmpeg.org/
  - Used to convert videos to MP4 format if needed

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd VideoEncryption
```

### 2. Run Automated Setup
```bash
npm run setup
```

This will:
- ✅ Check prerequisites
- ✅ Create directory structure
- ✅ Install Node.js dependencies
- ✅ Download Shaka Packager (if needed)
- ✅ Validate setup

### 3. Manual Setup (Alternative)

If automated setup fails, follow these manual steps:

#### Install Dependencies
```bash
npm install
```

#### Download Shaka Packager
1. Visit: https://github.com/shaka-project/shaka-packager/releases
2. Download `packager-win-x64.exe` (Windows) or appropriate version
3. Rename to `packager.exe`
4. Place in `scripts/` folder

## 📁 Project Structure Setup

### Required Directories
The setup will create these directories:
```
VideoEncryption/
├── content/          # Video files and generated content
├── scripts/          # Build and encryption scripts  
├── server/           # Backend servers
├── players/          # Video player demos
└── docs/             # Documentation
```

### Essential Files
Make sure these files exist:
- `scripts/packager.exe` - Shaka Packager binary
- `content/input.mp4` - Your source video file

## 🎥 Video Setup

### Adding Your Video
1. **Prepare your video file:**
   - Format: MP4
   - Codec: H.264 (AVC)
   - Audio: AAC (optional)
   - Duration: Any (10-60 seconds recommended for testing)

2. **Place video file:**
   ```bash
   cp your-video.mp4 content/input.mp4
   ```

### Video Conversion (if needed)
If your video isn't in the right format:
```bash
# Convert to MP4 with H.264
ffmpeg -i input-video.mov -c:v libx264 -c:a aac content/input.mp4

# Resize if too large (optional)
ffmpeg -i input-video.mp4 -vf scale=1280:720 content/input.mp4
```

### Sample Videos
For testing, you can use:
- Record a short video with your phone/camera
- Download from: https://pixabay.com/videos/ (free stock videos)
- Use any existing MP4 file you have

## 🔑 Encryption Setup

### 1. Generate Encryption Keys
```bash
npm run generate-keys
```

This creates:
- `content/encryption-keys.json` - Key storage
- Random 128-bit AES encryption keys
- Both hex and base64url formats

### 2. Package Video with Encryption
```bash
npm run package-video
```

This generates:
- `content/video_encrypted.mp4` - Encrypted video file
- `content/manifest.mpd` - DASH manifest with encryption metadata
- `content/player-config.json` - Player configuration

## 🚀 Running the Pipeline

### Start Both Servers
```bash
# Option 1: Start both servers together
npm run dev

# Option 2: Start servers separately
# Terminal 1:
npm run start-content

# Terminal 2:
npm run start-license
```

### Server Details
- **Content Server**: `http://localhost:8080`
  - Serves encrypted video content
  - Enhanced with HTTP range requests
  - Handles CORS and proper MIME types

- **License Server**: `http://localhost:8443`
  - Distributes encryption keys
  - Token-based authentication
  - ClearKey license format

### Test the Pipeline
Open in your browser:
```
http://localhost:8080/players/test-unencrypted.html
```

## 🎯 Testing Guide

### Testing Order
1. **File Check**: Click "Check Video Files" to validate setup
2. **Unencrypted**: Test "Load Original Video" (baseline)
3. **Encrypted**: Test "Load Encrypted Video" (main test)

### Expected Results
- ✅ **Unencrypted Video**: Should play immediately
- ✅ **Encrypted Video**: Should play after key negotiation
- ✅ **Enhanced Logging**: Detailed step-by-step process

### Testing Scenarios

#### 1. Basic Comparison (`test-unencrypted.html`)
- Side-by-side unencrypted vs encrypted
- Comprehensive debugging logs
- Error analysis and troubleshooting

#### 2. Quick Path (`quick-path.html`)
- Client-side key embedding
- Fastest setup for development
- Direct ClearKey configuration

#### 3. Realistic Path (`realistic-path.html`)
- Full license server workflow
- Production-like DRM flow
- Network-based key distribution

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Setup Issues

**Node.js Version Error**
```bash
# Check version
node --version

# Install/update Node.js from nodejs.org
# Minimum version: 14.0.0
```

**Python Not Found**
```bash
# Check Python installation
python --version

# On some systems, try:
python3 --version

# Update package.json scripts if needed
```

**Permission Errors**
```bash
# Windows: Run as Administrator
# macOS/Linux: Use sudo for global installs
sudo npm install -g <package>
```

#### Video Issues

**Video Not Found**
```bash
# Verify file exists and is named correctly
ls content/input.mp4

# Check file format
file content/input.mp4
```

**Packaging Fails**
```bash
# Check Shaka Packager
ls scripts/packager.exe

# Download from: https://github.com/shaka-project/shaka-packager/releases
# Ensure executable permissions (macOS/Linux)
chmod +x scripts/packager
```

**Invalid Video Format**
```bash
# Convert to compatible format
ffmpeg -i input.mov -c:v libx264 -c:a aac content/input.mp4
```

#### Server Issues

**Port Already in Use**
```bash
# Find process using port
netstat -ano | findstr :8080
netstat -ano | findstr :8443

# Kill process (Windows)
taskkill /PID <process_id> /F

# Kill process (macOS/Linux)  
kill -9 <process_id>
```

**CORS Errors**
- Ensure enhanced content server is running
- Check browser console for specific errors
- Verify CORS headers in server response

**License Server Connection Failed**
```bash
# Test license server directly
curl http://localhost:8443/health

# Check server logs for errors
# Ensure token authentication is working
```

#### Playback Issues

**Shaka Error 3004**
- Check manifest accessibility
- Verify content server is running
- Ensure proper MIME types
- Check browser console for details

**Key Format Errors**
```bash
# Regenerate keys
npm run generate-keys

# Repackage video
npm run package-video
```

**EME Not Supported**
- Use modern browser (Chrome, Firefox, Safari, Edge)
- Check browser EME support: chrome://media-internals/
- Ensure HTTPS for production (localhost OK for testing)

### Debug Mode

#### Enable Detailed Logging
1. Open browser developer tools (F12)
2. Go to Console tab
3. Run any test scenario
4. Review step-by-step logs

#### Server Logs
- Content server shows request details
- License server shows key distribution
- Check terminal output for errors

#### Validation Commands
```bash
# Check if files exist
npm run validate

# Clean generated files
npm run clean

# Re-run full setup
npm run setup
```

## 🔒 Security Considerations

### Development vs Production

**This Demo Uses ClearKey DRM**
- ✅ Perfect for testing and development
- ❌ NOT for production use
- ❌ Keys are visible in clear text

**For Production**
- Use commercial DRM (Widevine, PlayReady, FairPlay)
- Implement proper key management
- Use HTTPS for all communications
- Add authentication and authorization

### Best Practices
- Rotate encryption keys regularly
- Monitor for unauthorized access
- Implement rate limiting
- Use secure key storage
- Log security events

## 📚 Advanced Configuration

### Custom Video Settings
Edit `scripts/package-video.js` to modify:
- Encryption parameters
- Video quality settings
- Manifest configuration
- DRM system options

### Server Configuration
Customize `server/content-server.py`:
- Port settings
- CORS policies  
- Security headers
- Logging levels

### Player Configuration
Modify player HTML files:
- Shaka Player settings
- DRM configuration
- UI customization
- Error handling

## 📖 Additional Resources

### Documentation
- [Shaka Player Documentation](https://shaka-player-demo.appspot.com/docs/api/index.html)
- [EME Specification](https://www.w3.org/TR/encrypted-media/)
- [MPEG-CENC Standard](https://www.iso.org/standard/68042.html)

### Tools
- [Shaka Packager](https://github.com/shaka-project/shaka-packager)
- [FFmpeg](https://ffmpeg.org/documentation.html)
- [MP4Box](https://github.com/gpac/gpac)

### Testing
- [EME Test Vectors](https://github.com/w3c/media-source/tree/main/media-source-respec.html)
- [Shaka Player Demo](https://shaka-player-demo.appspot.com/)

## 🆘 Getting Help

### Support Channels
1. **Check Documentation**: README.md and this SETUP.md
2. **Review Logs**: Browser console and server terminal output  
3. **Validate Setup**: Use `npm run validate`
4. **Clean and Retry**: Use `npm run clean` then re-setup

### Reporting Issues
When reporting problems, include:
- Operating system and version
- Node.js and Python versions
- Complete error messages
- Steps to reproduce
- Browser type and version

---

**🎬 Ready to encrypt some video!** 🔒