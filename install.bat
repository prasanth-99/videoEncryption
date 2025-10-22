@echo off
echo.
echo ========================================
echo   Video Encryption Pipeline Setup
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo    Please install Node.js from: https://nodejs.org/
    echo    Then run this script again.
    pause
    exit /b 1
)

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo    Please install Python from: https://python.org/
    echo    Then run this script again.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

:: Run the Node.js setup script
echo 🚀 Running automated setup...
node setup.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ Setup failed. Please check the error messages above.
    echo    For help, see SETUP.md
    pause
    exit /b 1
)

echo.
echo ✅ Setup completed successfully!
echo.
echo 📋 Next steps:
echo    1. Add your video file as: content\input.mp4
echo    2. Run: npm run generate-keys
echo    3. Run: npm run package-video
echo    4. Run: npm run dev
echo    5. Open: http://localhost:8080/players/test-unencrypted.html
echo.
echo 📚 For detailed instructions, see:
echo    - README.md
echo    - SETUP.md
echo.
pause