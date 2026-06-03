#!/usr/bin/env python3
"""Static dev server that disables caching.

`python3 -m http.server` sends Last-Modified headers, so browsers heuristically
cache ES modules and CSS — which makes verifying changes during development
unreliable (you edit a file, reload, and still see the old module). This server
sends `Cache-Control: no-store` on every response so a reload always re-fetches.
Dev-only; GitHub Pages serves the files directly.
"""
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    print(f"Serving (no-cache) on http://localhost:{PORT}")
    httpd.serve_forever()
