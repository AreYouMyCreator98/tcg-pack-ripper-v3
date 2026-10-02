import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const artwork = await readFile(new URL('../src/artwork/index.js', import.meta.url), 'utf8');
const binder = await readFile(new URL('../src/systems/binder.js', import.meta.url), 'utf8');

test('Binder talks to artwork through modular facade', () => {
  assert.match(artwork, /ensureArtworkRuntime/);
  assert.match(artwork, /prepareBinderArtwork/);
  assert.match(binder, /from '..\/artwork\/index\.js'/);
  assert.doesNotMatch(binder, /tcgBinderArtV239/);
});
