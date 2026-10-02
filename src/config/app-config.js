export const APP_CONFIG = Object.freeze({
  name: 'TCG Pack Ripper+',
  version: '0.250.0',
  buildId: 'v250-futureproof-1',
  saveSchemaVersion: 1,
  assetSchemaVersion: 1,
  cacheVersion: 'tcg-v250-1',
  supabase: Object.freeze({
    projectRef: 'ddeuwrnfmdgvizkrjhii',
    url: 'https://ddeuwrnfmdgvizkrjhii.supabase.co',
    cardArtFunction: 'card-art-v239'
  }),
  featureFlags: Object.freeze({
    modularBoot: true,
    pwa: true,
    collectionWorker: true,
    accountFirstSaves: true,
    binderArtworkCache: true,
    nativeShell: false,
    experimentalRenderer: false
  })
});

export function exposeAppConfig(target = window) {
  target.TCG_CONFIG = APP_CONFIG;
  target.TCG_BUILD = APP_CONFIG.buildId;
  target.TCG_VERSION = APP_CONFIG.version;
  target.TCG_SAVE_SCHEMA_VERSION = APP_CONFIG.saveSchemaVersion;
  return APP_CONFIG;
}
