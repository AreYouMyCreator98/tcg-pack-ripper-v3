import { artworkRepairReport, artworkStatus, repairFailedArtwork } from '../../artwork/index.js';

let installed = false;

function ensureStatusElement() {
  let host = document.getElementById('binderArtworkStatusV252');
  if (host) return host;
  const anchor = document.querySelector('#binder .binderShelfHeaderV147');
  if (!anchor) return null;
  host = document.createElement('div');
  host.id = 'binderArtworkStatusV252';
  host.className = 'binderArtworkStatusV252';
  host.innerHTML = '<span><b>Artwork cache ready</b><small id="binderArtworkMetaV252">Local-first card fronts</small></span><button type="button" id="binderArtworkRepairV252" hidden>REPAIR</button><button type="button" id="binderArtworkReportV252" hidden>REPORT</button>';
  anchor.insertAdjacentElement('afterend', host);
  return host;
}

function renderStatus(extra = '') {
  const host = ensureStatusElement();
  if (!host) return;
  const status = artworkStatus();
  const meta = host.querySelector('#binderArtworkMetaV252');
  const repair = host.querySelector('#binderArtworkRepairV252');
  const report = host.querySelector('#binderArtworkReportV252');
  const busy = status.running + status.queued + status.inflight;
  if (meta) meta.textContent = extra || (status.failed
    ? `${status.failed} artwork item${status.failed === 1 ? '' : 's'} need repair`
    : busy ? `Caching artwork • ${busy} queued/active` : 'All visible artwork uses the local-first cache');
  if (repair) repair.hidden = status.failed === 0;
  if (report) report.hidden = status.failed === 0;
}

export function installBinderArtworkStatus(getCards) {
  if (installed) return;
  installed = true;
  const host = ensureStatusElement();
  host?.querySelector('#binderArtworkRepairV252')?.addEventListener('click', async () => {
    renderStatus('Retrying unresolved artwork only…');
    await repairFailedArtwork(getCards?.() || []);
    renderStatus();
    window.renderBinder?.(false);
  });
  host?.querySelector('#binderArtworkReportV252')?.addEventListener('click', async () => {
    const report = JSON.stringify(artworkRepairReport(), null, 2);
    try {
      await navigator.clipboard.writeText(report);
      renderStatus('Repair report copied');
    } catch {
      console.info('[TCG] Binder artwork report', report);
      renderStatus('Repair report written to console');
    }
  });
  window.addEventListener('tcg:artwork-status', () => renderStatus());
  renderStatus();
}

export { renderStatus as updateBinderArtworkStatus };
