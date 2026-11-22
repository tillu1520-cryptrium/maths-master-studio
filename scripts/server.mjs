import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  
  let filePath = path.join(process.cwd(), reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // If it's a subroute or missing file, fallback to index.html if html expected
    if (reqPath.endsWith('.js') || reqPath.endsWith('.json') || reqPath.endsWith('.svg')) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found: ' + reqPath);
      return;
    }
    filePath = path.join(process.cwd(), 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Maths Master Studio Local Dev Server running at http://localhost:${PORT}`);
});
