import {
  getArtworkUrl,
  peekArtworkUrl,
  prefetchCards,
  prepareCollectionInBackground
} from '../../artwork/index.js';
import { binderEntries, binderStats, filterBinderCards, paginateBinder } from './binder-model.js';
import { binderBridgeNow } from './binder-bridge.js';
import { updateBinderArtworkStatus } from './binder-status.js';

let renderToken = 0;

function filterControls() {
  return {
    query: document.getElementById('search')?.value || '',
    set: document.getElementById('setFilter')?.value || 'all'
  };
}

export function currentBinderCards() {
  const bridge = binderBridgeNow();
  if (!bridge) return [];
  return filterBinderCards(binderEntries(bridge.getBinderMap()), {
    ...filterControls(),
    tier: bridge.tier
  });
}

function makeSlot(card, bridge) {
  const slot = document.createElement('div');
  slot.dataset.cardId = card.id;
  const fx = bridge.effectClass(card);
  slot.className = `slot v252ArtPending${fx ? ` cardFx ${fx}` : ''}`;

  const img = document.createElement('img');
  img.className = 'binderArtV252';
  img.alt = card.name || 'Card';
  img.decoding = 'async';
  img.loading = 'eager';
  if ('fetchPriority' in img) img.fetchPriority = 'high';

  const stars = document.createElement('span');
  stars.className = 'rarity-stars';
  stars.setAttribute('aria-hidden', 'true');

  const qty = document.createElement('span');
  qty.className = 'qty';
  qty.textContent = `${Math.max(1, Number(card.qty || 1))}x`;

  slot.append(img, stars, qty);
  slot.addEventListener('click', () => window.openBinderCard?.(card.id));
  return { slot, img };
}

function showSlotFailure(slot, img, card) {
  if (!slot.isConnected) return;
  slot.classList.remove('v252ArtPending', 'v252ArtReady');
  slot.classList.add('v252ArtFailed');
  let retry = slot.querySelector('.v252ArtRetry');
  if (!retry) {
    retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'v252ArtRetry';
    retry.innerHTML = '<b>ARTWORK RETRY</b><span>Tap to repair this card</span>';
    retry.addEventListener('click', async event => {
      event.stopPropagation();
      retry.disabled = true;
      slot.classList.add('v252ArtPending');
      try {
        const url = await getArtworkUrl(card, 'low', { force: true, priority: 130 });
        if (!img.isConnected) return;
        img.src = url;
        slot.classList.remove('v252ArtFailed', 'v252ArtPending');
        slot.classList.add('v252ArtReady');
        retry.remove();
      } catch {
        slot.classList.remove('v252ArtPending');
        retry.disabled = false;
      }
    });
    slot.appendChild(retry);
  }
}

async function hydrateVisibleSlot(slot, img, card, token) {
  try {
    let url = await peekArtworkUrl(card, 'low');
    if (!url) url = await getArtworkUrl(card, 'low', { priority: 120 });
    if (token !== renderToken || !img.isConnected) return;
    img.src = url;
    slot.classList.remove('v252ArtPending', 'v252ArtFailed');
    slot.classList.add('v252ArtReady');
  } catch {
    if (token === renderToken) showSlotFailure(slot, img, card);
  }
}

function prefetchAround(cards, page, pageSize) {
  const previous = cards.slice(Math.max(0, (page - 1) * pageSize), Math.max(0, page * pageSize));
  const next = cards.slice((page + 1) * pageSize, (page + 2) * pageSize);
  const run = () => {
    prefetchCards([...next, ...previous], { priority: 55 }).catch(() => {});
    prepareCollectionInBackground(cards).catch(() => {});
  };
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 900 });
  else setTimeout(run, 250);
}

export function renderBinderPage(anim = false) {
  const bridge = binderBridgeNow();
  if (!bridge) return false;
  if (document.getElementById('rip')?.classList.contains('active') && !document.getElementById('binder')?.classList.contains('active')) return false;

  const token = ++renderToken;
  bridge.applyTheme();
  bridge.renderShelf();
  const cards = currentBinderCards();
  const stats = binderStats(cards);
  const pagination = paginateBinder(cards, bridge.getPage(), bridge.pageSize);
  bridge.setPage(pagination.page);

  const stat = document.getElementById('binderStat');
  if (stat) stat.textContent = `${stats.unique} unique • ${stats.total} total cards`;
  const label = document.getElementById('pageLabel');
  if (label) label.textContent = `Page ${pagination.page + 1} / ${pagination.totalPages}`;
  const previous = document.getElementById('prevPage');
  const next = document.getElementById('nextPage');
  if (previous) previous.disabled = pagination.page === 0;
  if (next) next.disabled = pagination.page >= pagination.totalPages - 1;

  const grid = document.getElementById('binderGrid');
  if (!grid) return false;
  grid.replaceChildren();
  for (const card of pagination.cards) {
    const { slot, img } = makeSlot(card, bridge);
    grid.appendChild(slot);
    hydrateVisibleSlot(slot, img, card, token);
  }
  for (let index = pagination.cards.length; index < bridge.pageSize; index++) {
    const empty = document.createElement('div');
    empty.className = 'slot emptySlot';
    empty.style.opacity = '.12';
    grid.appendChild(empty);
  }

  if (anim) {
    grid.classList.remove('page-arrive-next', 'page-arrive-prev');
    void grid.offsetWidth;
    grid.classList.add(anim === 'prev' ? 'page-arrive-prev' : 'page-arrive-next');
    setTimeout(() => grid.classList.remove('page-arrive-next', 'page-arrive-prev'), 620);
  }

  prefetchAround(cards, pagination.page, bridge.pageSize);
  updateBinderArtworkStatus();
  return true;
}
