#!/bin/bash

echo ""
echo "========================================"
echo "  Video Encryption Pipeline Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed or not in PATH${NC}"
    echo "   Please install Node.js from: https://nodejs.org/"
    echo "   Then run this script again."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}❌ Python is not installed or not in PATH${NC}"
    echo "   Please install Python from: https://python.org/"
    echo "   Then run this script again."
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Run the Node.js setup script
echo -e "${BLUE}🚀 Running automated setup...${NC}"
node setup.js

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Setup failed. Please check the error messages above.${NC}"
    echo "   For help, see SETUP.md"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "   1. Add your video file as: content/input.mp4"
echo "   2. Run: npm run generate-keys"
echo "   3. Run: npm run package-video" 
echo "   4. Run: npm run dev"
echo "   5. Open: http://localhost:8080/players/test-unencrypted.html"
echo ""
echo -e "${BLUE}📚 For detailed instructions, see:${NC}"
echo "   - README.md"
echo "   - SETUP.md"
echo ""