import { criticalRuntime, binderRuntime, secondaryRuntime } from '../config/runtime-manifest.js';
import { APP_CONFIG } from '../config/app-config.js';
import { withTimeout } from '../utils/async.js';

const loaded = new Map();
const groupPromises = new Map();

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
      return await withTimeout(injectClassicScript(path, attempt), timeoutMs, `runtime ${path}`);
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
    loaded.delete(path);
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

function loadGroup(name, paths, timeoutMs) {
  if (!groupPromises.has(name)) {
    const promise = loadSequence(paths, timeoutMs, name)
      .then(() => {
        window.dispatchEvent(new CustomEvent(`tcg:${name}-ready`));
        return true;
      })
      .catch(error => {
        groupPromises.delete(name);
        window.dispatchEvent(new CustomEvent(`tcg:${name}-failed`, {
          detail: { message: String(error?.message || error) }
        }));
        throw error;
      });
    groupPromises.set(name, promise);
  }
  return groupPromises.get(name);
}

export async function loadCriticalRuntime() {
  await loadSequence(criticalRuntime, 20000, 'critical');
  window.dispatchEvent(new CustomEvent('tcg:critical-ready'));
}

export function loadBinderRuntime() {
  return loadGroup('binder-runtime', binderRuntime, 12000);
}

export function loadSecondaryRuntime() {
  return loadGroup('secondary', secondaryRuntime, 25000);
}

export function scheduleSecondaryRuntime() {
  const run = () => loadSecondaryRuntime().catch(error => console.error('[TCG] Secondary runtime failed', error));
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1800 });
  else setTimeout(run, 650);
}

export function isRuntimeLoaded(path) { return loaded.has(path); }
export function runtimeLoadState() { return Object.freeze([...loaded.keys()]); }
