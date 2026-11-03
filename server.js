/**
 * ProIM (Intern Manager) - Local Server & API Proxy
 * Zero External Dependencies (Runs directly on standard Node.js)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const REMOTE_API_HOST = 'proim.vercel.app';

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

  // 1. API Reverse Proxy -> Forward to live ProIM backend
  if (pathname.startsWith('/api')) {
    const options = {
      hostname: REMOTE_API_HOST,
      port: 443,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: REMOTE_API_HOST,
        origin: `https://${REMOTE_API_HOST}`,
        referer: `https://${REMOTE_API_HOST}/`
      }
    };

    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error(`[API Proxy Error] ${req.method} ${pathname}:`, err.message);
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        error: 'Proxy Error: ไม่สามารถเชื่อมต่อ API ปลายทางได้ (' + err.message + ')',
        status: 502
      }));
    });

    req.pipe(proxyReq, { end: true });
    return;
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
  console.log('🚀 ProIM (Intern Manager) Local Server');
  console.log('----------------------------------------------------------------');
  console.log(`🌐 Local Web App : http://localhost:${PORT}`);
  console.log(`🔌 API Proxy     : https://${REMOTE_API_HOST}/api`);
  console.log(`📦 Offline Mode  : http://localhost:${PORT}/index-offline.html`);
  console.log('================================================================');
  console.log('กด Ctrl+C เพื่อหยุดการทำงานของเซิร์ฟเวอร์\n');
});
