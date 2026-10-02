import { mountUI } from './ui.js';
import { configurePlatform } from './platform/mobile.js';
import { loadCriticalRuntime, loadPackRuntime, scheduleSecondaryRuntime } from './app/runtime-loader.js';
import { installNavigationPreload } from './app/navigation-preload.js';
import { installDiagnostics, bootMark } from './app/diagnostics.js';
import { installHealthCheck } from './app/health-check.js';
import { registerPWA } from './pwa/register.js';
import { installImagePolicy } from './platform/image-policy.js';
import { installScreenTransitions } from './animations/screen-transitions.js';
import { installBinderModule } from './systems/binder.js';
import { installPackModule } from './systems/packs.js';
import { installRankFrameRenderer } from './systems/rank-frame-renderer.js';
import { APP_CONFIG, exposeAppConfig } from './config/app-config.js';

exposeAppConfig();
installDiagnostics();
installHealthCheck();
configurePlatform();
bootMark('boot-start', { version: APP_CONFIG.version, buildId: APP_CONFIG.buildId });

let bootStage = 'initialising';

function setStatus(text) {
  const status = document.getElementById('modern-boot-status');
  if (status) status.textContent = text;
}

function showBootFailure(error) {
  console.error('[TCG] Boot failed', error);
  const message = String(error?.message || error || 'Unknown startup error');
  bootMark('boot-failed', { stage: bootStage, message });

  const status = document.getElementById('modern-boot-status');
  if (!status) return;

  status.textContent = `STARTUP FAILED\n${bootStage}\n${message}`;
  status.classList.add('failed');
  Object.assign(status.style, {
    whiteSpace: 'pre-wrap',
    maxWidth: '92vw',
    width: 'auto',
    borderRadius: '18px',
    lineHeight: '1.35',
    textAlign: 'left',
    fontSize: '11px'
  });

  status.onclick = async () => {
    const report = `TCG PACK RIPPER STARTUP ERROR\nStage: ${bootStage}\nError: ${message}`;
    try {
      await navigator.clipboard.writeText(report);
      status.textContent += '\n\nERROR COPIED';
    } catch {
      alert(report);
    }
  };
}

async function boot() {
  try {
    bootStage = 'loading interface';
    setStatus('Loading interface…');
    await mountUI();
    bootMark('ui-mounted');

    bootStage = 'installing interface systems';
    installNavigationPreload();
    installImagePolicy(document);
    installScreenTransitions(document);
    installBinderModule();
    installRankFrameRenderer();

    bootStage = 'starting critical game systems';
    setStatus('Starting game systems…');
    await loadCriticalRuntime();
    bootMark('critical-runtime-ready');

    // V253 is deliberately additive: if its modular bridge/UI fails, the proven
    // V252 pack generator and reveal flow stay usable instead of blocking boot.
    try {
      await loadPackRuntime();
      installPackModule();
      bootMark('pack-engine-ready');
    } catch (error) {
      console.error('[TCG] V253 pack engine unavailable; using legacy pack flow', error);
      bootMark('pack-engine-failed', { message: String(error?.message || error) });
    }

    bootStage = 'finishing startup';
    document.documentElement.classList.remove('modern-booting');
    document.getElementById('modern-boot-status')?.remove();

    window.dispatchEvent(new CustomEvent('tcg:app-ready', {
      detail: { version: APP_CONFIG.version }
    }));
    bootMark('app-ready');

    // Secondary systems are deliberately non-blocking. A Binder/multiplayer
    // network issue must never prevent Rip Packs from opening.
    scheduleSecondaryRuntime();
    if (APP_CONFIG.featureFlags.pwa) registerPWA();
  } catch (error) {
    showBootFailure(error);
  }
}

boot();
