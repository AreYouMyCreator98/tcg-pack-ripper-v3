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
bootMark('boot-start', {
  version: APP_CONFIG.version,
  buildId: APP_CONFIG.buildId
});

let bootStage = 'initialising';

function setStatus(text) {
  const status = document.getElementById('modern-boot-status');
  if (status) status.textContent = text;
}

function showBootFailure(error) {
  console.error('[TCG] Boot failed', error);

  const message = String(
    error?.message ||
    error ||
    'Unknown startup error'
  );

  bootMark('boot-failed', {
    stage: bootStage,
    message
  });

  const status = document.getElementById('modern-boot-status');

  if (status) {
    status.textContent =
      `STARTUP FAILED\n${bootStage}\n${message}`;

    status.classList.add('failed');

    status.style.whiteSpace = 'pre-wrap';
    status.style.maxWidth = '92vw';
    status.style.width = 'auto';
    status.style.borderRadius = '18px';
    status.style.lineHeight = '1.35';
    status.style.textAlign = 'left';
    status.style.fontSize = '11px';

    status.onclick = async () => {
      const report =
        `TCG PACK RIPPER STARTUP ERROR\n` +
        `Stage: ${bootStage}\n` +
        `Error: ${message}`;

      try {
        await navigator.clipboard.writeText(report);
        status.textContent += '\n\nERROR COPIED';
      } catch {
        alert(report);
      }
    };
  }
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

    bootStage = 'starting critical game systems';
    setStatus('Starting game systems…');

    await loadCriticalRuntime();
    bootMark('critical-runtime-ready');

    bootStage = 'finishing startup';

    document.documentElement.classList.remove('modern-booting');

    const status = document.getElementById('modern-boot-status');
    if (status) status.remove();

    window.dispatchEvent(
      new CustomEvent('tcg:app-ready', {
        detail: {
          version: APP_CONFIG.version
        }
      })
    );

    bootMark('app-ready');

    scheduleSecondaryRuntime();

    if (APP_CONFIG.featureFlags.pwa) {
      registerPWA();
    }

  } catch (error) {
    showBootFailure(error);
  }
}

boot();
