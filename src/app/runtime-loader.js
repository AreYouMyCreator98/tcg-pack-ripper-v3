import { criticalRuntime, secondaryRuntime } from '../config/runtime-manifest.js';
import { APP_CONFIG } from '../config/app-config.js';
import { withTimeout } from '../utils/async.js';

const loaded = new Map();
let secondaryPromise = null;

function runtimeUrl(path, attempt = 0) {
  const url = new URL(path, document.baseURI);
  url.searchParams.set('v', APP_CONFIG.buildId);
  if (attempt) url.searchParams.set('retry', String(attempt));
  return url.href;
}

function injectClassicScript(path, attempt) {
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = runtimeUrl(path, attempt);
    tag.async = false;
    tag.dataset.runtimeChunk = path;
    tag.dataset.runtimeAttempt = String(attempt + 1);
    tag.onload = () => resolve(path);
    tag.onerror = () => {
      tag.remove();
      reject(new Error(`Failed to load ${path} (attempt ${attempt + 1})`));
    };
    document.body.appendChild(tag);
  });
}

async function loadWithRetry(path, timeoutMs) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await withTimeout(
        injectClassicScript(path, attempt),
        timeoutMs,
        `runtime ${path}`
      );
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 180));
    }
  }
  throw lastError || new Error(`Failed to load ${path}`);
}

export function loadClassicScript(path, timeoutMs = 20000) {
  if (loaded.has(path)) return loaded.get(path);
  const promise = loadWithRetry(path, timeoutMs).catch(error => {
    loaded.delete(path); // A later user action can retry a failed chunk.
    throw error;
  });
  loaded.set(path, promise);
  return promise;
}

async function loadSequence(paths, timeoutMs, group) {
  for (let index = 0; index < paths.length; index++) {
    const path = paths[index];
    window.dispatchEvent(new CustomEvent('tcg:runtime-progress', {
      detail: { group, path, index, total: paths.length, phase: 'loading' }
    }));
    await loadClassicScript(path, timeoutMs);
    window.dispatchEvent(new CustomEvent('tcg:runtime-progress', {
      detail: { group, path, index: index + 1, total: paths.length, phase: 'loaded' }
    }));
  }
}

export async function loadCriticalRuntime() {
  await loadSequence(criticalRuntime, 20000, 'critical');
  window.dispatchEvent(new CustomEvent('tcg:critical-ready'));
}

export function loadSecondaryRuntime() {
  if (!secondaryPromise) {
    secondaryPromise = loadSequence(secondaryRuntime, 25000, 'secondary')
      .then(() => {
        window.dispatchEvent(new CustomEvent('tcg:secondary-ready'));
        return true;
      })
      .catch(err => {
        console.error('[TCG] Secondary runtime failed', err);
        window.dispatchEvent(new CustomEvent('tcg:secondary-failed', {
          detail: { message: String(err?.message || err) }
        }));
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
export function runtimeLoadState() { return Object.freeze([...loaded.keys()]); }
