import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { criticalRuntime, binderRuntime, packRuntime, secondaryRuntime } from '../src/config/runtime-manifest.js';

const publicRoot = new URL('../public/', import.meta.url).pathname;

test('all loaded classic runtime chunks parse as JavaScript', async () => {
  for (const file of [...criticalRuntime, ...binderRuntime, ...packRuntime, ...secondaryRuntime]) {
    const source = await readFile(join(publicRoot, file), 'utf8');
    assert.doesNotThrow(() => new vm.Script(source, { filename: file }), `${file} must parse`);
  }
});
