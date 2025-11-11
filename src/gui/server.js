import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../');
const UI_DIR = path.join(ROOT_DIR, 'ui');
const PORT = Number(process.env.PORT) || 4173;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url || '/');
    const isDataRequest = urlPath.startsWith('/data/');
    const relativePath =
      urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '').replace(/\\.\\./g, '');
    const baseDir = isDataRequest ? ROOT_DIR : UI_DIR;
    const targetPath = path.join(baseDir, relativePath);

    const stat = await fs.stat(targetPath);
    if (stat.isDirectory()) {
      res.writeHead(403);
      res.end('Directory access is not allowed.');
      return;
    }

    const ext = path.extname(targetPath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    const data = await fs.readFile(targetPath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(error.code === 'ENOENT' ? 'Dosya bulunamadı.' : 'Beklenmeyen sunucu hatası.');
  }
});

server.listen(PORT, () => {
  console.log(`📊 Match viewer http://localhost:${PORT}`);
});
