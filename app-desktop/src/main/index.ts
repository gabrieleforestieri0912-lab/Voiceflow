import { app, BrowserWindow, Tray, ipcMain, shell, session } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { initStorage, getSettings, setSetting } from "../services/storage/settings.js";
import { registerHotkey, unregisterHotkey, stopHotkey, isHotkeyActive } from "./hotkey.js";
import { createTray } from "./tray.js";
import { createOverlayWindow, updateOverlayState } from "./overlay.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "../..");
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;

if (process.platform === "win32" && os.release().startsWith("6.1")) app.disableHardwareAcceleration();
if (process.platform === "win32") app.setAppUserModelId("com.stackup.voiceflow");

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "VoiceFlow — Impostazioni",
    width: 640,
    height: 520,
    show: false,
    resizable: false,
    minimizable: true,
    maximizable: false,
    icon: path.join(process.env.VITE_PUBLIC ?? RENDERER_DIST, "favicon.ico"),
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    await mainWindow.loadFile(indexHtml);
  }

  mainWindow.on("close", (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send("main-process-message", new Date().toLocaleString());
  });
}

function showSettingsWindow() {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function setupIpc() {
  // Impostazioni
  ipcMain.handle("settings:get", async () => getSettings());
  ipcMain.handle("settings:set", async (_e, key: string, value: unknown) => {
    setSetting(key as never, value as never);
    if (key === "hotkey" && typeof value === "string") {
      unregisterHotkey();
      registerHotkey(value as string, handleHotkeyDown, handleHotkeyUp);
    }
    if (key === "autoLaunch" && typeof value === "boolean") {
      app.setLoginItemSettings({ openAtLogin: value, openAsHidden: true });
    }
    return getSettings();
  });

  // Overlay / stato registrazione
  ipcMain.handle("overlay:getState", () => ({ isHotkeyActive: isHotkeyActive() }));
  ipcMain.on("renderer:recording-state", (_e, state: string) => {
    updateOverlayState(overlayWindow, state);
  });

  // Trascrizione proxy (renderer invia blob, main inoltra a Edge Function se necessario futuro)
  ipcMain.handle("transcription:transcribe", async (_e, payload: { audioBase64: string; mimeType: string }) => {
    // v0: il renderer chiama direttamente la Supabase Edge Function via fetch.
    // Questo handler resta come punto di estensione se si vuole spostare la chiamata lato main
    // per non esporre nemmeno l'URL della funzione al renderer in futuro.
    return { ok: false, error: "Usa il client transcription dal renderer (Supabase Edge Function proxy).", payload };
  });

  // Iniezione testo (clipboard + Ctrl+V) — eseguita lato main perché richiede privilegi main
  ipcMain.handle("input:injectText", async (_e, text: string) => {
    const { injectText } = await import("../services/input-injection/inject.js");
    return injectText(text);
  });

  // Tray
  ipcMain.handle("tray:update", async () => {
    // placeholder per aggiornare tray da renderer se necessario
    return true;
  });

  // App info
  ipcMain.handle("app:getVersion", () => app.getVersion());
  ipcMain.handle("app:getPath", (_e, name: string) => app.getPath(name as never));
}

let isRecording = false;

function handleHotkeyDown() {
  if (isRecording) return;
  isRecording = true;
  updateOverlayState(overlayWindow, "recording");
  mainWindow?.webContents.send("hotkey:down");
  overlayWindow?.webContents.send("hotkey:down");
}

function handleHotkeyUp() {
  if (!isRecording) return;
  isRecording = false;
  updateOverlayState(overlayWindow, "processing");
  mainWindow?.webContents.send("hotkey:up");
  overlayWindow?.webContents.send("hotkey:up");
}

app.whenReady().then(async () => {
  // Permessi media (microfono) per getUserMedia nel renderer
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    if (permission === "media" || permission === "mediaKeySystem") callback(true);
    else callback(false);
  });

  await initStorage();

  await createMainWindow();
  overlayWindow = createOverlayWindow(preload, VITE_DEV_SERVER_URL, RENDERER_DIST);

  const settings = getSettings();
  // Auto-launch
  if (settings.autoLaunch) {
    app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true });
  }

  // Hotkey globale push-to-talk (uiohook-napi)
  const hotkey = (settings.hotkey as string) || "Ctrl+Space";
  try {
    registerHotkey(hotkey, handleHotkeyDown, handleHotkeyUp);
  } catch (err) {
    console.error("[voiceflow] hotkey registration failed:", err);
  }

  tray = createTray({
    onShowSettings: showSettingsWindow,
    onToggleHotkey: () => {
      if (isHotkeyActive()) {
        unregisterHotkey();
      } else {
        registerHotkey(hotkey, handleHotkeyDown, handleHotkeyUp);
      }
    },
    onQuit: () => {
      app.isQuitting = true;
      app.quit();
    },
    isHotkeyActive,
  });

  setupIpc();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    else showSettingsWindow();
  });
});

app.on("window-all-closed", () => {
  // Su Windows, chiudere tutte le finestre non deve terminare l'app (resta in tray)
  // Non chiamare app.quit() qui.
});

app.on("second-instance", () => {
  showSettingsWindow();
});

app.on("before-quit", () => {
  app.isQuitting = true;
  // Ferma l'hook nativo: senza stop() il thread di uiohook tiene vivo il processo
  // e restano processi orfani dopo la chiusura.
  stopHotkey();
  tray?.destroy();
});

// Estensione per type augmentation
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Electron {
    interface App {
      isQuitting: boolean;
    }
  }
}

// Flag runtime per distinguere close→hide da quit reale
app.isQuitting = false;
