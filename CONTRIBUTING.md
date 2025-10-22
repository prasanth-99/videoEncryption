# 🤝 Contributing to Video Encryption Pipeline

Thank you for your interest in contributing! This project demonstrates video encryption using MPEG-CENC and EME, and we welcome improvements and enhancements.

## 🚀 Quick Start for Contributors

### 1. Setup Development Environment
```bash
git clone <your-fork>
cd VideoEncryption
npm run setup
npm run status  # Check project status
```

### 2. Add Test Video
```bash
# Add your test video (any MP4 file)
cp test-video.mp4 content/input.mp4
npm run generate-keys
npm run package-video
```

### 3. Test Your Changes
```bash
npm run dev  # Start both servers
# Open: http://localhost:8080/players/test-unencrypted.html
```

## 📋 Development Guidelines

### Code Structure
- **`scripts/`** - Build and encryption tools
- **`server/`** - Backend services (Node.js + Python)
- **`players/`** - Frontend video player demos
- **`content/`** - Video files and generated encryption content

### Key Technologies
- **MPEG-CENC**: Video encryption standard
- **Shaka Player**: Video player with EME support  
- **ClearKey DRM**: Browser-native DRM for testing
- **Node.js/Express**: License server
- **Python**: Enhanced content server

## 🔧 Areas for Contribution

### 🎯 High Priority
- [ ] **Multi-DRM Support**: Add Widevine, PlayReady, FairPlay
- [ ] **HLS Support**: Extend beyond DASH manifests
- [ ] **Docker Setup**: Containerize the entire pipeline
- [ ] **CI/CD Pipeline**: Automated testing and deployment

### 🛠️ Medium Priority  
- [ ] **UI Improvements**: Better player interface and controls
- [ ] **Error Handling**: More robust error recovery
- [ ] **Performance**: Optimize large video file handling
- [ ] **Documentation**: Video tutorials and guides

### 🎨 Nice to Have
- [ ] **Multiple Video Quality**: Adaptive bitrate streaming
- [ ] **Subtitle Support**: Encrypted subtitle tracks
- [ ] **Analytics**: Playback metrics and monitoring
- [ ] **Mobile Support**: Touch-friendly interface

## 🧪 Testing

### Manual Testing
```bash
npm run status     # Check project health
npm run clean      # Clean generated files
npm run validate   # Validate setup
```

### Test Scenarios
1. **Unencrypted Playback** - Baseline functionality
2. **Client-Side ClearKey** - Direct key embedding
3. **License Server Flow** - Network-based key distribution
4. **Error Conditions** - Network failures, invalid keys

### Browser Testing
- Chrome (primary)
- Firefox
- Safari  
- Edge

## 📝 Submission Process

### 1. Fork & Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Thoroughly
```bash
npm run status    # Ensure project is healthy
# Test all player scenarios
# Verify both servers work
```

### 4. Commit & Push
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 5. Create Pull Request
- Clear description of changes
- Link to any related issues
- Include testing steps

## 🐛 Bug Reports

### Include This Information
- **OS**: Windows/macOS/Linux version
- **Browser**: Name and version
- **Node.js**: Version (`node --version`)
- **Python**: Version (`python --version`)
- **Error Messages**: Complete stack traces
- **Steps to Reproduce**: Detailed steps
- **Expected vs Actual**: What should happen vs what happens

### Bug Report Template
```
**Bug Description**
Brief description of the issue

**Steps to Reproduce**
1. Step one
2. Step two
3. Error occurs

**Environment**
- OS: 
- Browser: 
- Node.js: 
- Python: 

**Error Messages**
```
Paste complete error messages here
```

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Good Feature Requests Include
- **Use Case**: Why is this needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: What other approaches were considered?
- **Implementation**: Any implementation ideas?

## 🔒 Security Considerations

### Important Notes
- This project uses **ClearKey DRM for testing only**
- **Never commit real production keys**
- **Report security issues privately** (not in public issues)

### For Production DRM
- Use commercial DRM systems (Widevine, PlayReady, FairPlay)
- Implement proper key management
- Use HTTPS everywhere
- Add rate limiting and monitoring

## 📚 Resources

### Learning Materials
- [MPEG-CENC Specification](https://www.iso.org/standard/68042.html)
- [EME API Documentation](https://www.w3.org/TR/encrypted-media/)
- [Shaka Player Documentation](https://shaka-player-demo.appspot.com/docs/api/)
- [Shaka Packager Guide](https://github.com/shaka-project/shaka-packager)

### Development Tools
- [EME Logger Extension](https://github.com/google/eme_logger) - Debug EME
- [Media Inspector](https://github.com/google/shaka-player/tree/master/ui) - Analyze streams
- [MP4 Analyzer](https://github.com/axiomatic-systems/Bento4) - Inspect MP4 files

## 📞 Getting Help

### Community Support
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and help
- **Documentation**: README.md and SETUP.md

### Direct Contact
- For security issues or sensitive questions
- Include "Video Encryption Pipeline" in subject

## 🎉 Recognition

Contributors will be recognized in:
- GitHub contributors page
- CHANGELOG.md for significant contributions
- README.md for major features

---

**Happy Contributing!** 🚀🔒