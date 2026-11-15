// Launch the packaged desktop app and check the game boots and runs: node tools/desktop-check.cjs <executable>
// (on Linux without a display: xvfb-run node tools/desktop-check.cjs release/linux-unpacked/shardlight)
let _electron;
try {
  ({ _electron } = require("playwright"));
} catch {
  ({ _electron } = require("/opt/node-tools/node_modules/playwright"));
}
(async () => {
  const exe = process.argv[2];
  const app = await _electron.launch({ executablePath: exe, args: ["--no-sandbox"] });
  const win = await app.firstWindow();
  const errors = [];
  win.on("pageerror", (e) => errors.push(e.message));
  await win.waitForTimeout(1500);
  await win.keyboard.press("Space");
  await win.waitForTimeout(2000);
  await win.keyboard.press("Space");
  await win.waitForTimeout(3500);
  const info = await win.evaluate(() => ({ title: document.title, scene: window.game?.scene, w: innerWidth, h: innerHeight, render: window.game?.perf.render.toFixed(2) }));
  await win.screenshot({ path: "shots/desktop.png" });
  console.log(JSON.stringify(info), errors.length ? "ERRORS " + errors.join("; ") : "no errors");
  await app.close();
  process.exit(info.scene === "play" && !errors.length ? 0 : 1);
})();
