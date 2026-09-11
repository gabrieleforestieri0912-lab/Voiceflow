import { BrowserWindow, screen } from "electron";
import path from "node:path";

export function createOverlayWindow(
  preload: string,
  viteUrl: string | undefined,
  rendererDist: string,
): BrowserWindow {
  const overlay = new BrowserWindow({
    width: 320,
    height: 72,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    hasShadow: false,
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  overlay.setIgnoreMouseEvents(true);
  overlay.setVisibleOnAllWorkspaces(true); // no-op su Windows, utile su macOS in futuro
  overlay.setAlwaysOnTop(true, "screen-saver");

  const indexHtml = path.join(rendererDist, "index.html");

  if (viteUrl) {
    // Overlay usa stesso renderer ma con hash #overlay per distinguere la view
    overlay.loadURL(`${viteUrl}#overlay`).catch((e) => console.error("[overlay] loadURL", e));
  } else {
    overlay.loadFile(indexHtml, { hash: "overlay" }).catch((e) => console.error("[overlay] loadFile", e));
  }

  // Posiziona in basso al centro dello schermo primario
  overlay.on("ready-to-show", () => {
    const primary = screen.getPrimaryDisplay();
    const { width, height } = primary.workAreaSize;
    const [w, h] = overlay.getSize();
    overlay.setPosition(Math.round((width - w) / 2), Math.round(height - h - 40));
  });

  return overlay;
}

export function updateOverlayState(win: BrowserWindow | null, state: string): void {
  if (!win) return;
  if (state === "idle" || state === "hidden") {
    win.hide();
    return;
  }
  // recording / processing → mostra
  if (!win.isVisible()) win.showInactive();
  win.webContents.send("overlay:state", state);
}
