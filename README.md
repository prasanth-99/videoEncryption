# 🎬 Video Encryption Pipeline

A complete demonstration of video encryption using **MPEG-CENC**, **Shaka Packager**, and **Encrypted Media Extensions (EME)** with **ClearKey** DRM system.

## 🌟 Features

- 🔒 **MPEG-CENC Video Encryption** - Industry-standard video encryption
- 🎯 **ClearKey DRM System** - Browser-native DRM for testing and development
- 🚀 **Shaka Player Integration** - Professional video player with EME support
- 🔑 **License Server** - Node.js server for key distribution
- 📺 **Enhanced Content Server** - Python server with video streaming support
- 🎪 **Multiple Test Scenarios** - Compare encrypted vs unencrypted playback
- 🐛 **Advanced Debugging** - Comprehensive logging and error analysis

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Video Input   │───▶│  Shaka Packager  │───▶│ Encrypted DASH  │
│   (MP4 File)    │    │   (CENC Encrypt)  │    │   + Manifest    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐             │
│  License Server │◀───│   Shaka Player   │◀────────────┘
│  (ClearKey DRM) │    │  (EME + DASH)    │
└─────────────────┘    └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14+)
- **Python** (v3.7+)
- **Git** (for cloning)

### 1️⃣ Clone & Setup
```bash
git clone <repository-url>
cd VideoEncryption
npm run setup
```

### 2️⃣ Add Your Video
```bash
# Place your MP4 video file
cp your-video.mp4 content/input.mp4
```

### 3️⃣ Generate Encrypted Content
```bash
npm run generate-keys    # Create encryption keys
npm run package-video    # Encrypt video with CENC
```

### 4️⃣ Start Servers
```bash
# Terminal 1: Content Server
npm run start-content

# Terminal 2: License Server  
npm run start-license
```

### 5️⃣ Test Encryption
Open: `http://localhost:8080/players/test-unencrypted.html`

## 📁 Project Structure

```
VideoEncryption/
├── 📄 README.md              # This file
├── 📄 SETUP.md               # Detailed setup guide
├── 📄 package.json           # Node.js dependencies
├── 📄 setup.js               # Automated setup script
├── 📄 .gitignore             # Git ignore rules
│
├── 📁 content/               # Video content & encryption output
│   ├── 📄 input.mp4          # Your source video (add this)
│   ├── 📄 video_encrypted.mp4 # Generated encrypted video
│   ├── 📄 manifest.mpd       # Generated DASH manifest
│   ├── 📄 encryption-keys.json # Generated encryption keys
│   └── 📄 player-config.json # Generated player config
│
├── 📁 scripts/               # Build & encryption scripts
│   ├── 📄 generate-keys.js   # Generate encryption keys
│   ├── 📄 package-video.js   # Encrypt video with Shaka Packager
│   └── 📄 packager.exe       # Shaka Packager binary (download separately)
│
├── 📁 server/                # Backend servers
│   ├── 📄 license-server.js  # ClearKey license distribution
│   └── 📄 content-server.py  # Enhanced video content server
│
└── 📁 players/               # Video player demos
    ├── 📄 test-unencrypted.html   # Main testing interface
    ├── 📄 quick-path.html         # Client-side key demo
    ├── 📄 realistic-path.html     # License server demo
    └── 📄 index.html              # Player overview
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | Complete automated setup |
| `npm run generate-keys` | Generate new encryption keys |
| `npm run package-video` | Encrypt video with CENC |
| `npm run start-content` | Start content server (port 8080) |
| `npm run start-license` | Start license server (port 8443) |
| `npm run start` | Start both servers simultaneously |
| `npm test` | Run validation tests |

## 🎯 Testing Scenarios

### 1. **Unencrypted Baseline**
- Tests basic video playback without encryption
- Validates server connectivity and player functionality

### 2. **Client-Side ClearKey** (`quick-path.html`)
- Demonstrates direct key embedding in player
- Fastest setup for development testing

### 3. **License Server Integration** (`realistic-path.html`)
- Full DRM workflow with license requests
- Production-like key distribution

### 4. **Comprehensive Testing** (`test-unencrypted.html`)
- Side-by-side comparison
- Advanced debugging and error analysis
- Step-by-step encryption process visualization

## 🔒 Security & DRM

### Encryption Details
- **Algorithm**: AES-128-CTR (MPEG-CENC standard)
- **Key Length**: 128-bit encryption keys
- **Protection**: PSSH boxes for DRM metadata
- **Streaming**: Encrypted DASH segments

### ClearKey DRM
- **Purpose**: Testing and development DRM system
- **Browser Support**: Native EME implementation
- **License Format**: JSON Web Key (JWK) format
- **Authentication**: Token-based access control

> ⚠️ **Note**: ClearKey is for testing only. Use production DRM (Widevine, PlayReady, FairPlay) for real applications.

## 🐛 Troubleshooting

### Common Issues

**Shaka Error 3004**
```
Problem: Unable to guess manifest type
Solution: Check manifest accessibility and CORS headers
```

**Connection Errors**
```
Problem: Server connection failures
Solution: Ensure both servers are running on correct ports
```

**Video Not Found**
```
Problem: Missing input video file
Solution: Place MP4 file as content/input.mp4
```

**Key Format Errors**
```
Problem: Mismatched encryption key formats
Solution: Regenerate keys with npm run generate-keys
```

### Debug Mode
Enable detailed logging by opening browser console in the test pages.

## 📚 Technical Background

### MPEG-CENC (Common Encryption)
- **Standard**: ISO/IEC 23001-7
- **Purpose**: DRM-agnostic video encryption
- **Benefits**: Single encrypted file works with multiple DRM systems

### Encrypted Media Extensions (EME)
- **W3C Standard**: Browser API for DRM integration
- **Components**: MediaKeys, MediaKeySession, MediaKeySystemAccess
- **Support**: All modern browsers

### Shaka Packager
- **Developer**: Google/Shaka Project
- **Purpose**: Video packaging and encryption
- **Features**: DASH, HLS, CENC, multi-DRM support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📝 License

This project is for educational and demonstration purposes.

## 🆘 Support

- 📖 Check [SETUP.md](SETUP.md) for detailed instructions
- 🐛 Report issues via GitHub Issues
- 💬 Discussion and questions welcome

---

**🎬 Happy Video Encryption!** 🔒