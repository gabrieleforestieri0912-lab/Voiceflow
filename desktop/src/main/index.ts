import { app, BrowserWindow, ipcMain, Notification, shell } from "electron";
import { join } from "path";
import { createTray, destroyTray } from "./tray.js";
import { registerHotkey, stopHotkey, isPaused, setPaused } from "./hotkey.js";
import { getSettings, setSettings } from "../services/storage/settings.js";
import { transcribeInMain } from "./transcription.js";
import { openOnboarding, isOnboardingCompleted } from "./onboarding.js";

let settingsWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let isQuitting = false;

const isDev = !app.isPackaged;

function createOverlay() {
  overlayWindow = new BrowserWindow({
    width: 320,
    height: 64,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  if (isDev) overlayWindow.loadURL("http://localhost:5173/#/overlay");
  else overlayWindow.loadFile(join(__dirname, "../../dist/renderer/index.html"), { hash: "/overlay" });
  // Non rubare mai il focus: l'incolla Ctrl+V deve andare all'app attiva.
  overlayWindow.setFocusable(false);
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 560,
    height: 680,
    autoHideMenuBar: true,
    backgroundColor: "#09090b",
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  settingsWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      settingsWindow?.hide();
    }
  });
  if (isDev) settingsWindow.loadURL("http://localhost:5173/");
  else settingsWindow.loadFile(join(__dirname, "../../dist/renderer/index.html"));
}

// --- IPC sicuri (whitelist mirrorata nel preload) ---

function registerIpc() {
  ipcMain.handle("settings:get", () => getSettings());
  ipcMain.handle("settings:set", (_e, patch: Record<string, unknown>) => {
    const next = setSettings(patch);
    // Applica autoLaunch subito.
    if (typeof patch.autoLaunch === "boolean") {
      app.setLoginItemSettings({ openAtLogin: patch.autoLaunch, openAsHidden: true });
    }
    return next;
  });

  ipcMain.handle("hotkey:pause", () => {
    setPaused(true);
    return true;
  });
  ipcMain.handle("hotkey:resume", () => {
    setPaused(false);
    return true;
  });
  ipcMain.handle("hotkey:isPaused", () => isPaused());

  ipcMain.handle("transcription:transcribe", (_e, payload) => transcribeInMain(payload));

  ipcMain.handle("onboarding:isCompleted", () => isOnboardingCompleted());
  ipcMain.handle("onboarding:minimizeToTray", () => {
    settingsWindow?.hide();
    new Notification({
      title: "VoiceFlow è pronto",
      body: "Premi la hotkey per iniziare a dettare ovunque.",
    }).show();
  });
  ipcMain.handle("shell:openMicrophoneSettings", () => {
    // Windows 10/11 — pagina privacy microfono.
    return shell.openExternal("ms-settings:privacy-microphone").catch(() => false);
  });
}

// --- Lifecycle ---

app.whenReady().then(async () => {
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    app.quit();
    return;
  }

  registerIpc();
  createOverlay();
  createSettingsWindow();
  createTray({
    onOpenSettings: () => settingsWindow?.show(),
    onOpenOnboarding: () => openOnboarding(),
  });

  // Permessi media Chromium: la barriera reale resta Windows Privacy.
  const { session } = await import("electron");
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    if (permission === "media") return callback(true);
    return callback(false);
  });

  const settings = getSettings();
  if (typeof settings.autoLaunch === "boolean") {
    app.setLoginItemSettings({ openAtLogin: settings.autoLaunch, openAsHidden: true });
  }

  const ok = registerHotkey();
  if (!ok) console.warn("[voiceflow] hotkey non registrata — vedi tray > Riprendi dettatura");

  const completed = isOnboardingCompleted();
  const launchedHidden = process.argv.includes("--hidden") || settings.launchMinimized;
  if (!completed) openOnboarding();
  else if (!launchedHidden) settingsWindow?.show();
});

app.on("window-all-closed", () => {
  // Resta in tray su Windows — quit solo dal menu tray.
});

app.on("before-quit", () => {
  isQuitting = true;
  stopHotkey();
  destroyTray();
});

// Evita processi orfani del thread nativo uiohook.
process.on("exit", () => {
  try {
    stopHotkey();
  } catch {
    /* noop */
  }
});
