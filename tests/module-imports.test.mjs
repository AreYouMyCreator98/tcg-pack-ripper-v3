import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = join(root, 'src/main.js');
const visited = new Set();

async function walk(file) {
  if (visited.has(file)) return;
  visited.add(file);
  const source = await readFile(file, 'utf8');
  const imports = [...source.matchAll(/(?:import\s+(?:[^'\"]+?\s+from\s+)?|export\s+[^'\"]+?\s+from\s+)["'](\.[^"']+)["']/g)].map(match => match[1]);
  for (const spec of imports) {
    const target = resolve(dirname(file), spec);
    await access(target);
    await walk(target);
  }
}

test('all relative ES-module imports from main resolve', async () => {
  await walk(entry);
  assert.ok(visited.size >= 10);
});
