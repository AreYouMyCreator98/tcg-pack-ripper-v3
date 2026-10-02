const fragmentPaths = [
  'ui/chrome.html',
  'ui/screens/rip.html',
  'ui/screens/binder.html',
  'ui/components/binder-shop.html',
  'ui/screens/bulk.html',
  'ui/components/bulk-inspect.html',
  'ui/screens/trade.html',
  'ui/screens/history.html',
  'ui/screens/marketplace.html',
  'ui/screens/profile.html'
];

async function getText(path) {
  const r = await fetch(path, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`UI fragment failed: ${path} (${r.status})`);
  return r.text();
}

export async function mountUI() {
  const [parts, overlays] = await Promise.all([
    Promise.all(fragmentPaths.map(getText)),
    getText('ui/overlays.html')
  ]);
  const app = document.createElement('div');
  app.className = 'app';
  app.innerHTML = parts.join('\n');
  document.getElementById('app-root').replaceWith(app);
  document.body.insertAdjacentHTML('beforeend', overlays);
  return app;
}
