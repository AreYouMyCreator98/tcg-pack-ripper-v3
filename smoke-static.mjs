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
  '', 'src/main.js', 'src/config/app-config.js', 'src/app/runtime-loader.js', 'src/app/health-check.js',
  'src/artwork/index.js', 'src/artwork/artwork-cache.js', 'src/artwork/artwork-db.js', 'src/artwork/artwork-resolver.js', 'src/artwork/artwork-queue.js', 'src/artwork/card-identity.js',
  'src/screens/binder/index.js', 'src/screens/binder/binder-renderer.js', 'src/screens/binder/binder-inspector.js', 'src/screens/binder/binder-model.js', 'src/screens/binder/binder-status.js', 'src/screens/binder/binder-bridge.js',
  'src/systems/binder.js', 'src/systems/rank-frame-renderer.js',
  'runtime/core.js', 'runtime/progression.js', 'runtime/special-collection.js', 'runtime/packs.js', 'runtime/binder-bridge.js',
  'runtime/multiplayer.js', 'runtime/rank-frames.js', 'runtime/ranked.js',
  'styles/core.css', 'styles/binder.css', 'ui/chrome.html', 'ui/screens/rip.html', 'ui/screens/binder.html',
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
