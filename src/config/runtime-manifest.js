export const criticalRuntime = [
  'runtime/core.js',
  'runtime/progression.js',
  'runtime/special-collection.js',
  'runtime/packs.js'
];

// Binder now has its own tiny compatibility bridge. The artwork cache/renderer
// itself lives in src/ and is bundled as normal ES modules.
export const binderRuntime = [
  'runtime/binder-bridge.js'
];

// V253 modular pack engine observes the proven V252 generator through this
// tiny compatibility bridge. Failure here must not stop the legacy pack flow.
export const packRuntime = [
  'runtime/pack-bridge.js'
];

export const secondaryRuntime = [
  'runtime/multiplayer.js',
  'runtime/rank-frames.js',
  'runtime/ranked.js'
];
