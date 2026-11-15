// Shardlight on the desktop: one window that shows the single-file build, scaled by whole pixels.
// F11 or Alt+Enter toggles fullscreen. Saves live in the app's own data folder, like any desktop game.

const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("node:path");

const W = 320, H = 180, SCALE = 4;

function createWindow() {
  const win = new BrowserWindow({
    title: "Shardlight",
    width: W * SCALE,
    height: H * SCALE,
    minWidth: W * 2,
    minHeight: H * 2,
    useContentSize: true,
    backgroundColor: "#07060d",
    icon: path.join(__dirname, "icon.png"),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
  });
  win.setAspectRatio(W / H);
  win.once("ready-to-show", () => win.show());
  win.loadFile(path.join(__dirname, "..", "dist", "shardlight.html"));
  // the game asks for sound on the first keypress or click, as browsers want; on the desktop it may play at once
  win.webContents.setAudioMuted(false);
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "F11" || (input.alt && input.key === "Enter")) {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    }
    if (input.key === "F12" && !app.isPackaged) win.webContents.toggleDevTools();
  });
  // links (the README's credits) open in the real browser, never inside the game window
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e) => e.preventDefault());
  return win;
}

app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
// an app menu only on macOS, where the system expects one (Quit, fullscreen, minimize)
Menu.setApplicationMenu(process.platform === "darwin" ? Menu.buildFromTemplate([{ role: "appMenu" }, { role: "windowMenu" }]) : null);
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});
app.on("window-all-closed", () => app.quit());
