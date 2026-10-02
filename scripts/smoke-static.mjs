import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('../deploy/', import.meta.url).pathname;
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml' };

const server = http.createServer(async (req, res) => {
  try {
    const raw = new URL(req.url, 'http://localhost').pathname;
    let path = normalize(join(root, raw === '/' ? 'index.html' : raw));
    if (!path.startsWith(root)) throw new Error('bad path');
    const s = await stat(path);
    if (s.isDirectory()) path = join(path, 'index.html');
    const body = await readFile(path);
    res.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}/`;
const checks = [
  '', 'src/main.js', 'src/config/app-config.js', 'src/app/runtime-loader.js', 'src/app/health-check.js', 'src/artwork/index.js', 'src/systems/binder.js',
  'runtime/core.js', 'runtime/progression.js', 'runtime/special-collection.js', 'runtime/packs.js',
  'runtime/multiplayer.js', 'runtime/rank-frames.js', 'runtime/ranked.js', 'runtime/artwork.js',
  'styles/core.css', 'ui/chrome.html', 'ui/screens/rip.html', 'ui/screens/binder.html',
  'assets/manifest.json', 'manifest.webmanifest', 'sw.js'
];
try {
  for (const path of checks) {
    const response = await fetch(base + path);
    if (!response.ok) throw new Error(`${path || 'index.html'} -> ${response.status}`);
  }
  console.log(`Static smoke OK (${checks.length} resources)`);
} finally {
  server.close();
}
