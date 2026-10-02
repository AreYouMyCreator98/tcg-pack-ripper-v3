import { loadSecondaryRuntime } from '../app/runtime-loader.js';
export async function openBinder() {
  await loadSecondaryRuntime();
  document.querySelector('.nav [data-s="binder"]')?.click();
}
export async function repairBinderArtwork() {
  await loadSecondaryRuntime();
  return window.tcgBinderArtV239?.prepare?.({ force: true }) ?? null;
}
