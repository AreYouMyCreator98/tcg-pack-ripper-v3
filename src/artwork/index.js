import { loadSecondaryRuntime } from '../app/runtime-loader.js';

export const ARTWORK_ARCHITECTURE_VERSION = 2;

function legacyApi() {
  return window.tcgBinderArtV241 || window.tcgBinderArtV239 || null;
}

export async function ensureArtworkRuntime() {
  await loadSecondaryRuntime();
  const api = legacyApi();
  if (!api?.prepareAll || !api?.fetchBlob) {
    throw new Error('Binder artwork runtime is unavailable');
  }
  return api;
}

export function artworkStatus() {
  const api = legacyApi();
  return Object.freeze({
    loaded: !!api,
    ready: !!api?.ready,
    failed: Array.isArray(api?.failed) ? api.failed.length : 0
  });
}

export async function prepareBinderArtwork(options = {}) {
  const api = await ensureArtworkRuntime();
  const detail = { phase: 'starting', ...artworkStatus() };
  window.dispatchEvent(new CustomEvent('tcg:artwork-status', { detail }));
  try {
    const ok = await api.prepareAll(options);
    const status = artworkStatus();
    window.dispatchEvent(new CustomEvent('tcg:artwork-status', {
      detail: { phase: ok ? 'ready' : 'partial', ...status }
    }));
    return { ok, ...status };
  } catch (error) {
    const status = artworkStatus();
    window.dispatchEvent(new CustomEvent('tcg:artwork-status', {
      detail: { phase: 'failed', message: String(error?.message || error), ...status }
    }));
    throw error;
  }
}

export async function getCardArtwork(card, size = 'low', force = false) {
  const api = await ensureArtworkRuntime();
  return api.fetchBlob(card, size, force);
}

export async function retryMissingArtwork({ show = true } = {}) {
  return prepareBinderArtwork({ show, forceFailed: true });
}
