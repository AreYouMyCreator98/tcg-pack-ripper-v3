import { loadSecondaryRuntime } from '../app/runtime-loader.js';
import { prepareBinderArtwork, retryMissingArtwork, artworkStatus } from '../artwork/index.js';

let installed = false;
let warmPromise = null;

function binderIsActive() {
  return document.getElementById('binder')?.classList.contains('active');
}

function warmBinderRuntime() {
  if (!warmPromise) {
    warmPromise = loadSecondaryRuntime().catch(error => {
      warmPromise = null;
      throw error;
    });
  }
  return warmPromise;
}

async function prepareIfActive(show = true) {
  if (!binderIsActive()) return null;
  const result = await prepareBinderArtwork({ show });
  // Artwork runtime replaces renderBinder with its cache-aware renderer.
  try { window.renderBinder?.(false); } catch (_) {}
  return result;
}

export function installBinderModule() {
  if (installed) return;
  installed = true;

  const navButton = document.querySelector('.nav [data-s="binder"]');
  navButton?.addEventListener('pointerdown', () => {
    warmBinderRuntime().catch(() => {});
  }, { passive: true });

  navButton?.addEventListener('click', () => {
    // Let the legacy navigation switch screens first, then upgrade Binder.
    setTimeout(() => {
      warmBinderRuntime()
        .then(() => prepareIfActive(true))
        .catch(error => console.error('[TCG] Binder module failed', error));
    }, 0);
  });

  window.addEventListener('tcg:secondary-ready', () => {
    if (binderIsActive()) prepareIfActive(true).catch(() => {});
  });
}

export async function openBinder() {
  await warmBinderRuntime();
  document.querySelector('.nav [data-s="binder"]')?.click();
  return prepareIfActive(true);
}

export async function repairBinderArtwork() {
  await warmBinderRuntime();
  return retryMissingArtwork({ show: true });
}

export function getBinderArtworkStatus() {
  return artworkStatus();
}
