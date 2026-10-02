import { revealProfile } from './reveal-profile.js';

const FAST_KEY = 'tcgFastRevealV253';
const REVEAL_CLASSES = ['v253Reveal','v253-base','v253-foil','v253-hit','v253-major','v253-chase','v253-apex','v253-god','v253FastRare'];

export function installRevealController(target = window) {
  let fast = false;
  try { fast = localStorage.getItem(FAST_KEY) === '1'; } catch {}

  const originalHero = typeof target.v128PlayHero === 'function' ? target.v128PlayHero : null;
  const originalRare = typeof target.v125ForceRareReveal === 'function' ? target.v125ForceRareReveal : null;

  if (originalHero) {
    target.v128PlayHero = function(card) {
      if (fast) return false;
      return originalHero.apply(this, arguments);
    };
  }

  if (originalRare) {
    target.v125ForceRareReveal = function(card, stack) {
      if (!fast) return originalRare.apply(this, arguments);
      const st = stack || document.getElementById('stack');
      if (!st) return;
      target.v124RareLockUntil = Date.now() + 220;
      st.classList.add('v253FastRare');
      setTimeout(() => st.classList.remove('v253FastRare'), 260);
    };
  }

  function paint(detail) {
    const card = detail?.card;
    const stack = document.getElementById('stack');
    const img = document.getElementById('cardImg');
    if (!card || !stack) return;
    const profile = revealProfile(card);
    stack.classList.remove(...REVEAL_CLASSES);
    stack.classList.add('v253Reveal', `v253-${profile.intensity}`);
    const key = `${card.id || ''}|${detail.index ?? ''}`;
    stack.dataset.v253CardKey = key;
    if (img) img.dataset.v253CardKey = key;
    document.documentElement.dataset.v253Reveal = profile.intensity;
  }

  target.addEventListener('tcg:card-reveal-start', () => {
    document.getElementById('stack')?.classList.remove(...REVEAL_CLASSES);
  });
  target.addEventListener('tcg:card-reveal', event => paint(event.detail));
  target.addEventListener('tcg:pack-summary', () => { delete document.documentElement.dataset.v253Reveal; });

  function setFast(next) {
    fast = !!next;
    document.documentElement.classList.toggle('v253FastReveal', fast);
    try { localStorage.setItem(FAST_KEY, fast ? '1' : '0'); } catch {}
    target.dispatchEvent(new CustomEvent('tcg:fast-reveal-changed', { detail: { fast } }));
    return fast;
  }
  setFast(fast);

  return Object.freeze({ isFast: () => fast, setFast, toggle: () => setFast(!fast), profile: revealProfile });
}
