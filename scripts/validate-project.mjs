import { access, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const required = [
  'index.html','src/main.js','src/config/app-config.js','src/state/save-schema.js','src/app/health-check.js','src/artwork/index.js','src/systems/binder.js',
  'public/runtime/core.js','public/runtime/packs.js','public/runtime/progression.js',
  'public/runtime/multiplayer.js','public/runtime/ranked.js','public/runtime/artwork.js',
  'public/manifest.webmanifest','public/sw.js','public/assets/manifest.json'
];
let failed = false;
for (const file of required) {
  try { await access(join(root, file)); }
  catch { console.error(`Missing required file: ${file}`); failed = true; }
}
const runtimeFiles = ['core','packs','progression','multiplayer','ranked','artwork','rank-frames','special-collection'];
for (const name of runtimeFiles) {
  const path = join(root, `public/runtime/${name}.js`);
  try {
    const text = await readFile(path, 'utf8');
    const giantDataUri = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]{100000,}/i.test(text);
    if (giantDataUri) { console.error(`Large embedded base64 image found in ${name}.js`); failed = true; }
    const s = await stat(path);
    if (s.size > 2_000_000) { console.error(`Runtime chunk unexpectedly large: ${name}.js (${s.size})`); failed = true; }
  } catch (error) { console.error(error); failed = true; }
}
if (failed) process.exit(1);
console.log('Project integrity OK');
