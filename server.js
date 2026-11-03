/**
 * ProIM (Intern Manager) - Local Server & Serverless API Runner
 * Zero External Dependencies (Runs directly on standard Node.js)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const apiHandler = require('./api/_handler.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = reqUrl.pathname;

  // 1. API Route -> Run Hardened Backend API with Geofencing, Rate Limiting & Auth
  if (pathname.startsWith('/api')) {
    return apiHandler(req, res);
  }

  // 2. Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  fs.stat(filePath, (err, stats) => {
    // SPA Fallback: if not found, serve index.html
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log('================================================================');
  console.log('🚀 ProIM Hardened Local Server (Full TNK & Progressive Data)');
  console.log('----------------------------------------------------------------');
  console.log(`🌐 Local Web App : http://localhost:${PORT}`);
  console.log(`🔌 Backend API   : http://localhost:${PORT}/api`);
  console.log(`🛡️ Security      : Scrypt Auth, Rate Limiting, Geofence Validation`);
  console.log('================================================================');
  console.log('กด Ctrl+C เพื่อหยุดการทำงานของเซิร์ฟเวอร์\n');
});
