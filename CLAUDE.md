# Shardlight

A side-scrolling open-world ARPG built on pixelfx (vendored in `vendor/pixelfx`, a full checkout with its tools).

- Run: `npm start` (serves from source). Build: `npm run build`. Test: `npm test` (headless playtest, ~3 min),
  `npm run coverage` (every pixelfx effect must be used; regenerates `src/data/fxuse.js`).
- The pixelfx skill is in `.claude/skills/pixelfx`. Its pixelfx checkout is `vendor/pixelfx`: run its tools from there
  (`node vendor/pixelfx/tools/render.mjs fire/torch`). New effects go in `vendor/pixelfx/src/fx/<category>/` and then
  `node vendor/pixelfx/tools/index.mjs` to register them.
- Effects are only ever referenced through `src/pfx.js`. Never use `Math.random` inside an effect file (game code may).
- Screenshots: `node tools/shot.mjs` (headless, Node only) or `node tools/browser.mjs` (real Chromium).
- Desktop: `npm run desktop` runs the Electron app; `npm run dist:linux|win|mac|mac-zip|all` packages into
  `release/` (gitignored). Electron's main process is `desktop/main.cjs`; packaging config is the `build` field of
  package.json. Windows builds on Linux need Wine; the macOS .dmg and universal build need a Mac.
