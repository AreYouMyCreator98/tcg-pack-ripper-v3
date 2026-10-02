import { criticalRuntime, secondaryRuntime } from '../config/runtime-manifest.js';
import { APP_CONFIG } from '../config/app-config.js';
import { withTimeout } from '../utils/async.js';

const loaded = new Map();
let secondaryPromise = null;

function withVersion(path) {
  return `${path}?v=${encodeURIComponent(APP_CONFIG.buildId)}`;
}

export function loadClassicScript(path) {
  if (loaded.has(path)) return loaded.get(path);
  const promise = new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = withVersion(path);
    tag.async = false;
    tag.dataset.runtimeChunk = path;
    tag.onload = () => resolve(path);
    tag.onerror = () => reject(new Error(`Failed to load ${path}`));
    document.body.appendChild(tag);
  });
  loaded.set(path, promise);
  return promise;
}

async function loadSequence(paths, timeoutMs) {
  for (const path of paths) await withTimeout(loadClassicScript(path), timeoutMs, `runtime ${path}`);
}

export async function loadCriticalRuntime() {
  await loadSequence(criticalRuntime, 20000);
  window.dispatchEvent(new CustomEvent('tcg:critical-ready'));
}

export function loadSecondaryRuntime() {
  if (!secondaryPromise) {
    secondaryPromise = loadSequence(secondaryRuntime, 25000)
      .then(() => window.dispatchEvent(new CustomEvent('tcg:secondary-ready')))
      .catch(err => {
        console.error('[TCG] Secondary runtime failed', err);
        secondaryPromise = null;
        throw err;
      });
  }
  return secondaryPromise;
}

export function scheduleSecondaryRuntime() {
  const run = () => loadSecondaryRuntime().catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1800 });
  else setTimeout(run, 650);
}

export function isRuntimeLoaded(path) { return loaded.has(path); }
