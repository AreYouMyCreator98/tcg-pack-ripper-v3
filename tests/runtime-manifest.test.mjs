import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { criticalRuntime, secondaryRuntime } from '../src/config/runtime-manifest.js';

const root = new URL('../public/', import.meta.url).pathname;
test('every runtime manifest entry exists', async () => {
  for (const file of [...criticalRuntime, ...secondaryRuntime]) {
    await access(join(root, file));
    assert.ok(file.endsWith('.js'));
  }
});
