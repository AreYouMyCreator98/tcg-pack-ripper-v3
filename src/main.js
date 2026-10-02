import { mountUI } from './ui.js';
import { configurePlatform } from './platform/mobile.js';
import { loadCriticalRuntime, scheduleSecondaryRuntime } from './app/runtime-loader.js';
import { installNavigationPreload } from './app/navigation-preload.js';
import { installDiagnostics, bootMark } from './app/diagnostics.js';
import { registerPWA } from './pwa/register.js';
import { installImagePolicy } from './platform/image-policy.js';
import { installScreenTransitions } from './animations/screen-transitions.js';
import { APP_CONFIG, exposeAppConfig } from './config/app-config.js';

exposeAppConfig();
installDiagnostics();
configurePlatform();
bootMark('boot-start', { version: APP_CONFIG.version, buildId: APP_CONFIG.buildId });

async function boot() {
  const status = document.getElementById('modern-boot-status');
  try {
    status.textContent = 'Loading interface…';
    await mountUI();
    bootMark('ui-mounted');
    installNavigationPreload();
    installImagePolicy(document);
    installScreenTransitions(document);

    status.textContent = 'Starting game systems…';
    await loadCriticalRuntime();
    bootMark('critical-runtime-ready');

    document.documentElement.classList.remove('modern-booting');
    status.remove();
    window.dispatchEvent(new CustomEvent('tcg:app-ready', { detail: { version: APP_CONFIG.version } }));
    bootMark('app-ready');

    scheduleSecondaryRuntime();
    if (APP_CONFIG.featureFlags.pwa) registerPWA();
  } catch (error) {
    console.error('[TCG] Boot failed', error);
    bootMark('boot-failed', { message: String(error?.message || error) });
    if (status) {
      status.textContent = 'Startup problem — tap to retry';
      status.classList.add('failed');
      status.onclick = () => location.reload();
    }
  }
}

boot();
