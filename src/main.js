import { mountUI } from './ui.js';
import { configurePlatform } from './platform/mobile.js';
import { loadCriticalRuntime, loadPackRuntime, loadBinderRuntime, loadSecondaryRuntime, scheduleSecondaryRuntime } from './app/runtime-loader.js';
import { installNavigationPreload } from './app/navigation-preload.js';
import { installDiagnostics, bootMark } from './app/diagnostics.js';
import { installHealthCheck } from './app/health-check.js';
import { registerPWA } from './pwa/register.js';
import { installImagePolicy } from './platform/image-policy.js';
import { installScreenTransitions } from './animations/screen-transitions.js';
import { installBinderModule } from './systems/binder.js';
import { installPackModule } from './systems/packs.js';
import { installRankFrameRenderer } from './systems/rank-frame-renderer.js';
import { beginLaunch, setLaunchStage, prewarmFirstFrame, finishLaunch, failLaunch } from './app/launch-screen.js';
import { APP_CONFIG, exposeAppConfig } from './config/app-config.js?v=2541';

beginLaunch();
exposeAppConfig();
installDiagnostics();
installHealthCheck();
configurePlatform();
bootMark('boot-start', { version: APP_CONFIG.version, buildId: APP_CONFIG.buildId });

let bootStage = 'initialising';

function showBootFailure(error) {
  console.error('[TCG] Boot failed', error);
  const message = failLaunch(bootStage, error);
  bootMark('boot-failed', { stage: bootStage, message });
}

async function boot() {
  try {
    bootStage = 'loading interface';
    setLaunchStage('BUILDING COLLECTOR ROOM', 18, 'Mounting the game interface…');
    await mountUI();
    bootMark('ui-mounted');

    bootStage = 'installing interface systems';
    setLaunchStage('WIRING INTERFACE', 32, 'Preparing controls and mobile input…');
    installNavigationPreload();
    installImagePolicy(document);
    installScreenTransitions(document);
    installBinderModule();
    installRankFrameRenderer();

    bootStage = 'starting critical game systems';
    setLaunchStage('LOADING COLLECTION', 47, 'Restoring packs, progress and collection systems…');
    await loadCriticalRuntime();
    bootMark('critical-runtime-ready');

    bootStage = 'starting pack engine';
    setLaunchStage('STARTING PACK ENGINE', 63, 'Preparing reveals, pull tracking and pack flow…');
    try {
      await loadPackRuntime();
      installPackModule();
      bootMark('pack-engine-ready');
    } catch (error) {
      console.error('[TCG] Modular pack engine unavailable; using legacy pack flow', error);
      bootMark('pack-engine-failed', { message: String(error?.message || error) });
    }

    // Warm optional runtime while the splash is still covering layout changes.
    bootStage = 'warming collection systems';
    setLaunchStage('WARMING COLLECTION', 76, 'Preloading Binder, ranked and multiplayer systems…');
    const warmOptional = Promise.allSettled([
      loadBinderRuntime(),
      loadSecondaryRuntime()
    ]);

    bootStage = 'preparing first frame';
    setLaunchStage('POLISHING FIRST FRAME', 89, 'Loading pack art and locking the layout into place…');
    await Promise.allSettled([
      prewarmFirstFrame(),
      Promise.race([warmOptional, new Promise(resolve => setTimeout(resolve, 2200))])
    ]);

    bootStage = 'finishing startup';
    setLaunchStage('FINAL CHECK', 96, 'Everything is almost ready…');

    window.dispatchEvent(new CustomEvent('tcg:app-ready', {
      detail: { version: APP_CONFIG.version }
    }));
    bootMark('app-ready');

    if (APP_CONFIG.featureFlags.pwa) registerPWA();
    scheduleSecondaryRuntime();
    await finishLaunch();
  } catch (error) {
    showBootFailure(error);
  }
}

boot();
