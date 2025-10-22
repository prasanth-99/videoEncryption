@echo off
echo 🎬 Video Encryption Packaging (Windows)
echo.

REM Check if input video exists
if not exist "content\input.mp4" (
    echo ❌ Input video not found!
    echo Please place your video file at: content\input.mp4
    echo.
    echo You can download a test video from:
    echo https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4
    pause
    exit /b 1
)

REM Load keys from file (simplified version)
if not exist "content\encryption-keys.json" (
    echo ❌ Encryption keys not found!
    echo Please run: npm run generate-keys
    pause
    exit /b 1
)

echo ✅ Input video and keys found
echo.

REM Note: This is a simplified batch version
REM For full functionality, use: npm run package-video
echo 💡 For full automation, please use: npm run package-video
echo This batch file is provided as a reference for manual commands.
echo.

REM Example manual commands (replace with actual key values):
echo Example Shaka Packager command:
echo packager ^
echo   input=content\input.mp4,stream=video,output=content\video_encrypted.mp4 ^
echo   input=content\input.mp4,stream=audio,output=content\audio_encrypted.mp4 ^
echo   --enable_raw_key_encryption ^
echo   --keys label=SD:key_id=YOUR_KID_HEX:key=YOUR_KEY_HEX ^
echo   --protection_scheme cenc ^
echo   --mpd_output content\manifest.mpd

pause