import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

test('secondary runtime remains non-blocking after app ready', () => {
  const ready = main.indexOf('tcg:app-ready');
  const secondary = main.indexOf('scheduleSecondaryRuntime()');
  assert.ok(ready >= 0 && secondary > ready);
});

test('Binder module is installed before critical runtime starts', () => {
  const binder = main.indexOf('installBinderModule()');
  const critical = main.indexOf('await loadCriticalRuntime()');
  assert.ok(binder >= 0 && critical > binder);
});

test('rank-frame image renderer replaces the old artwork-runtime dependency', () => {
  assert.match(main, /installRankFrameRenderer\(\)/);
});
