#!/usr/bin/env python3
"""
Enhanced Content Server for Video Encryption Pipeline
Handles large video files with proper streaming and CORS support
"""

import http.server
import socketserver
import os
import mimetypes
import urllib.parse
from pathlib import Path
import sys

class VideoHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Enhanced HTTP request handler with streaming support for large video files"""
    
    def __init__(self, *args, **kwargs):
        # Set up MIME types for video streaming
        mimetypes.add_type('video/mp4', '.mp4')
        mimetypes.add_type('application/dash+xml', '.mpd')
        mimetypes.add_type('video/webm', '.webm')
        mimetypes.add_type('application/json', '.json')
        super().__init__(*args, **kwargs)
    
    def end_headers(self):
        """Add CORS headers and caching policies"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range')
        self.send_header('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges')
        
        # Enable range requests for video streaming
        if self.path.endswith(('.mp4', '.webm', '.mkv')):
            self.send_header('Accept-Ranges', 'bytes')
            self.send_header('Cache-Control', 'no-cache')
        elif self.path.endswith('.mpd'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """Enhanced GET handler with range request support"""
        # Parse the URL
        parsed_path = urllib.parse.urlparse(self.path)
        file_path = parsed_path.path.lstrip('/')
        
        # Security check
        if '..' in file_path:
            self.send_error(403, "Access denied")
            return
        
        # Handle root path
        if not file_path or file_path == '/':
            file_path = 'index.html'
        
        # Convert to absolute path
        full_path = os.path.join(os.getcwd(), file_path)
        
        try:
            if os.path.isfile(full_path):
                self.serve_file_with_range(full_path)
            elif os.path.isdir(full_path):
                # Try to serve index.html from directory
                index_path = os.path.join(full_path, 'index.html')
                if os.path.isfile(index_path):
                    self.serve_file_with_range(index_path)
                else:
                    self.list_directory(file_path)
            else:
                self.send_error(404, f"File not found: {file_path}")
                
        except Exception as e:
            print(f"Error serving {file_path}: {e}")
            try:
                self.send_error(500, f"Internal server error: {str(e)}")
            except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
                # Connection already closed, can't send error
                pass
    
    def serve_file_with_range(self, file_path):
        """Serve file with HTTP range support for streaming"""
        try:
            file_size = os.path.getsize(file_path)
            
            # Check for Range header
            range_header = self.headers.get('Range')
            
            if range_header and file_path.endswith(('.mp4', '.webm', '.mkv')):
                # Handle range request for video files
                self.handle_range_request(file_path, file_size, range_header)
            else:
                # Handle normal request
                self.handle_normal_request(file_path, file_size)
                
        except Exception as e:
            print(f"Error serving file {file_path}: {e}")
            self.send_error(500, str(e))
    
    def handle_range_request(self, file_path, file_size, range_header):
        """Handle HTTP range requests for video streaming"""
        try:
            # Parse range header (e.g., "bytes=0-1023")
            if not range_header.startswith('bytes='):
                self.send_error(416, "Invalid range")
                return
            
            ranges = range_header[6:].split(',')[0]  # Take first range
            
            if '-' not in ranges:
                self.send_error(416, "Invalid range format")
                return
                
            start_str, end_str = ranges.split('-', 1)
            
            # Calculate start and end positions
            start = int(start_str) if start_str else 0
            end = int(end_str) if end_str else file_size - 1
            
            # Validate range
            if start >= file_size or end >= file_size or start > end:
                self.send_error(416, f"Range not satisfiable: {start}-{end}/{file_size}")
                return
            
            # Calculate content length
            content_length = end - start + 1
            
            print(f"Serving range {start}-{end}/{file_size} for {os.path.basename(file_path)}")
            
            # Send headers
            self.send_response(206)  # Partial Content
            self.send_header('Content-Type', self.guess_type(file_path))
            self.send_header('Content-Length', str(content_length))
            self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
            self.end_headers()
            
            # Send file content
            with open(file_path, 'rb') as f:
                f.seek(start)
                remaining = content_length
                buffer_size = 8192  # 8KB chunks
                
                while remaining > 0:
                    chunk_size = min(buffer_size, remaining)
                    chunk = f.read(chunk_size)
                    
                    if not chunk:
                        break
                    
                    try:
                        self.wfile.write(chunk)
                        remaining -= len(chunk)
                    except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
                        # Client disconnected, this is normal for video streaming
                        print(f"Client disconnected during range request for {os.path.basename(file_path)}")
                        return  # Don't try to send error response
                        
        except Exception as e:
            print(f"Range request error: {e}")
            try:
                self.send_error(500, str(e))
            except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
                # Connection already closed, can't send error
                pass
    
    def handle_normal_request(self, file_path, file_size):
        """Handle normal HTTP requests"""
        try:
            print(f"Serving {os.path.basename(file_path)} ({file_size} bytes)")
            
            # Send headers
            self.send_response(200)
            self.send_header('Content-Type', self.guess_type(file_path))
            self.send_header('Content-Length', str(file_size))
            self.end_headers()
            
            # Send file content in chunks for large files
            with open(file_path, 'rb') as f:
                if file_size > 1024 * 1024:  # Files larger than 1MB
                    # Stream in chunks
                    buffer_size = 64 * 1024  # 64KB chunks
                    while True:
                        chunk = f.read(buffer_size)
                        if not chunk:
                            break
                        try:
                            self.wfile.write(chunk)
                        except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
                            print(f"Client disconnected during transfer of {os.path.basename(file_path)}")
                            return  # Don't try to send error response
                else:
                    # Small files, send all at once
                    try:
                        self.wfile.write(f.read())
                    except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
                        print(f"Client disconnected during transfer of {os.path.basename(file_path)}")
                        return
                    
        except Exception as e:
            print(f"Normal request error: {e}")
            try:
                self.send_error(500, str(e))
            except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
                # Connection already closed, can't send error
                pass
    
    def log_message(self, format, *args):
        """Custom log format"""
        timestamp = self.log_date_time_string()
        client_ip = self.address_string()
        message = format % args
        
        # Only log successful requests and errors, suppress connection errors
        if "200" in message or "206" in message or "404" in message:
            print(f"[{timestamp}] {client_ip} - {message}")

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    """HTTP server with threading support"""
    daemon_threads = True
    allow_reuse_address = True

def main():
    """Start the enhanced content server"""
    port = 8080
    
    # Change to project root directory
    os.chdir(Path(__file__).parent.parent)
    
    # Handle Windows encoding issues
    import sys
    if sys.platform.startswith('win'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except:
            pass
    
    print("Enhanced Video Content Server")
    print("=" * 50)
    print(f"Starting server on port {port}")
    print(f"Serving content from: {os.getcwd()}")
    print(f"Access your content at: http://localhost:{port}")
    print()
    print("Available endpoints:")
    print(f"   Video player: http://localhost:{port}/players/test-unencrypted.html")
    print(f"   Unencrypted video: http://localhost:{port}/content/input.mp4")
    print(f"   Encrypted video: http://localhost:{port}/video_encrypted.mp4")
    print(f"   DASH manifest: http://localhost:{port}/manifest.mpd")
    print()
    print("Features:")
    print("   - HTTP Range requests for video streaming")
    print("   - CORS headers for cross-origin requests")
    print("   - Proper MIME types for video content")
    print("   - Connection error handling")
    print("   - Threading support for concurrent requests")
    print()
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        with ThreadedHTTPServer(("", port), VideoHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Server error: {e}")

if __name__ == "__main__":
    main()