export function revealTier(card = {}) {
  const rarity = String(card.rarity || '').toLowerCase().trim();
  if (/hyper|secret|rainbow|rare rainbow|rare secret|gold/.test(rarity)) return 5;
  if (/special illustration|shiny ultra/.test(rarity)) return 4;
  if (/illustration|shiny rare|rare shiny|ultra|amazing|radiant|trainer gallery|galarian gallery|rare holo vmax|rare holo vstar/.test(rarity)) return 3;
  if (/double rare|rare holo v|ace spec|rare holo gx|\bvmax\b|\bvstar\b/.test(rarity)) return 2;
  if (/rare|holo/.test(rarity)) return 1;
  return 0;
}

export function revealProfile(card = {}) {
  const tier = revealTier(card);
  const rarity = String(card.rarity || 'Card');
  const lower = rarity.toLowerCase();
  const god = /god pack/i.test(String(card.finish || ''));
  const secret = !!card.secret;
  const sirPlus = tier >= 4 || /special illustration|hyper|secret|rainbow|gold|shiny ultra/.test(lower);
  const hit = tier >= 2 || secret;

  let label = rarity.toUpperCase();
  if (/special illustration/.test(lower)) label = 'SPECIAL ILLUSTRATION RARE';
  else if (/illustration/.test(lower)) label = 'ILLUSTRATION RARE';
  else if (/hyper|secret|rainbow|gold/.test(lower)) label = 'HYPER / SECRET RARE';
  else if (/ultra/.test(lower)) label = 'ULTRA RARE';
  else if (/double rare/.test(lower)) label = 'DOUBLE RARE';
  else if (/ace spec/.test(lower)) label = 'ACE SPEC';
  else if (/radiant/.test(lower)) label = 'RADIANT RARE';
  else if (/amazing/.test(lower)) label = 'AMAZING RARE';

  return Object.freeze({
    tier,
    hit,
    sirPlus,
    god,
    secret,
    label,
    intensity: god ? 'god' : tier >= 5 ? 'apex' : tier === 4 ? 'chase' : tier === 3 ? 'major' : tier === 2 ? 'hit' : tier === 1 ? 'foil' : 'base'
  });
}
