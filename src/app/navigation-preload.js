import { loadSecondaryRuntime } from './runtime-loader.js';

export function installNavigationPreload() {
  document.addEventListener('pointerdown', (event) => {
    const button = event.target.closest?.('.nav [data-s]');
    if (!button) return;
    const target = button.dataset.s;
    if (target === 'binder' || target === 'earn' || target === 'profile' || target === 'settings') {
      loadSecondaryRuntime().catch(() => {});
    }
  }, { capture: true, passive: true });
}
