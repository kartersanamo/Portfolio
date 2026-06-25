#!/usr/bin/env python3
"""
Simple contact form handler that saves messages to a local file.
Run this as a standalone server or integrate with your web server.
"""

import json
import os
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import cgi

# Directory to save messages (override in Docker with CONTACT_MESSAGES_DIR)
_DEFAULT_MSG = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'messages')
MESSAGES_DIR = os.environ.get('CONTACT_MESSAGES_DIR', _DEFAULT_MSG)
MESSAGES_FILE = os.path.join(MESSAGES_DIR, 'contact_messages.json')

# Ensure messages directory exists
os.makedirs(MESSAGES_DIR, exist_ok=True)

class ContactHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Handle POST requests from the contact form"""
        if self.path == '/api/contact':
            try:
                # Get content length
                content_length = int(self.headers.get('Content-Length', 0))
                
                # Read POST data
                post_data = self.rfile.read(content_length)
                
                # Parse JSON data
                data = json.loads(post_data.decode('utf-8'))
                
                # Extract form fields
                name = data.get('name', 'Unknown')
                email = data.get('email', 'No email')
                message = data.get('message', 'No message')
                
                # Create message entry
                message_entry = {
                    'timestamp': datetime.now().isoformat(),
                    'name': name,
                    'email': email,
                    'message': message
                }
                
                # Load existing messages
                messages = []
                if os.path.exists(MESSAGES_FILE):
                    try:
                        with open(MESSAGES_FILE, 'r', encoding='utf-8') as f:
                            messages = json.load(f)
                    except (json.JSONDecodeError, IOError):
                        messages = []
                
                # Add new message
                messages.append(message_entry)
                
                # Save to file
                with open(MESSAGES_FILE, 'w', encoding='utf-8') as f:
                    json.dump(messages, f, indent=2, ensure_ascii=False)
                
                # Also save individual text file for easy reading
                text_file = os.path.join(MESSAGES_DIR, f"message_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")
                with open(text_file, 'w', encoding='utf-8') as f:
                    f.write(f"Name: {name}\n")
                    f.write(f"Email: {email}\n")
                    f.write(f"Time: {message_entry['timestamp']}\n")
                    f.write(f"\nMessage:\n{message}\n")
                    f.write("\n" + "="*50 + "\n")
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {'success': True, 'message': 'Message saved successfully'}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except Exception as e:
                # Send error response
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {'success': False, 'message': str(e)}
                self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'Contact form handler is running.')

    def log_message(self, format, *args):
        """Override to reduce log noise"""
        pass

def run_server(port=8001, host=None):
    """Run the contact form handler server"""
    if host is None:
        host = os.environ.get('CONTACT_HANDLER_BIND', '')
    server_address = (host, port)
    httpd = HTTPServer(server_address, ContactHandler)
    print(f'Contact form handler running on port {port}')
    print(f'Messages will be saved to: {MESSAGES_DIR}')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down server...')
        httpd.shutdown()

if __name__ == '__main__':
    port = int(os.environ.get('CONTACT_HANDLER_PORT', '8001'))
    run_server(port=port)

