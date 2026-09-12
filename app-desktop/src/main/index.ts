import { app, BrowserWindow, Tray, ipcMain, shell, session, Notification } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { initStorage, getSettings, setSetting } from "../services/storage/settings.js";
import { registerHotkey, unregisterHotkey, stopHotkey, isHotkeyActive, testHook } from "./hotkey.js";
import { createTray } from "./tray.js";
import { createOverlayWindow, updateOverlayState } from "./overlay.js";
import {
  createOnboardingWindow,
  getOnboardingWindow,
  showOnboardingWindow,
  hideOnboardingWindow,
} from "./onboarding.js";

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

// Evita doppi quit
let quitting = false;
(global as unknown as { __voiceflowQuitting?: boolean }).__voiceflowQuitting = false;

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "VoiceFlow — Impostazioni",
    width: 640,
    height: 560,
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
    if (!quitting) {
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
  // Se onboarding è visibile, portalo in primo piano invece di mostrare impostazioni
  const ob = getOnboardingWindow();
  if (ob && !ob.isDestroyed() && ob.isVisible()) {
    ob.focus();
    return;
  }
  // Se onboarding non completato e non c'è onboarding window visibile/nascosta,
  // questo è il primo avvio: mostra onboarding invece di settings.
  // Dopo che l'utente ha chiuso/nascosto onboarding, consenti l'accesso a Impostazioni
  // (rispetta "se un permesso viene negato, l'app resta utilizzabile" — Fase 1.3).
  // Quindi non forziamo onboarding qui se l'utente ha esplicitamente chiuso.
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function showOnboarding() {
  const existing = getOnboardingWindow();
  if (existing && !existing.isDestroyed()) {
    showOnboardingWindow();
    return;
  }
  createOnboardingWindow(preload, VITE_DEV_SERVER_URL, RENDERER_DIST);
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

  ipcMain.handle("transcription:transcribe", async (_e, payload: { audioBase64: string; mimeType: string }) => {
    return { ok: false, error: "Usa il client transcription dal renderer (Supabase Edge Function proxy).", payload };
  });

  ipcMain.handle("input:injectText", async (_e, text: string) => {
    const { injectText } = await import("../services/input-injection/inject.js");
    return injectText(text);
  });

  ipcMain.handle("tray:update", async () => true);

  ipcMain.handle("app:getVersion", () => app.getVersion());
  ipcMain.handle("app:getPath", (_e, name: string) => app.getPath(name as never));

  // Permessi — bridge per onboarding renderer: delega minima main.
  // Il check vero è nel main? Per Windows privacy system, il segnale reale è getUserMedia nel renderer,
  // ma forniamo anche via IPC per testabilità e per invocazione diretta da renderer/web.
  // Quindi qui non duplichiamo: il renderer chiama direttamente navigator.mediaDevices,
  // ma il main esporta un handler che il renderer può invocare anche via IPC (es. per permessi check rapido).
  // Per Hooke test: va nel main (nativo).
  ipcMain.handle("permissions:checkHook", async () => {
    try {
      const res = await testHook();
      return { ok: res.ok, reason: res.reason, canRetry: res.canRetry };
    } catch (e) {
      return { ok: false, reason: (e as Error).message, canRetry: true };
    }
  });

  // permissions:checkMic è implementato nel renderer direttamente (getUserMedia), ma per compatibilità
  // forniamo un handler lato main che ritorna "unknown" — il renderer fa la vera verifica.
  // In realtà il renderer invoca permissions:checkMic e si aspetta {state, message, canOpenSettings}.
  // Per non duplicare, il main risponde con stato delegato al renderer check:
  // se il renderer non intercetta, il main prova una via alternativa (media access check).
  ipcMain.handle("permissions:checkMic", async () => {
    // Il main non può fare getUserMedia; ritorna indicazione e lascia che il renderer faccia il vero check.
    // Per non rompere il contratto, rispondiamo con unknown e messaggio guida.
    // Nota: l'Onboarding.tsx fa invoke("permissions:checkMic") che arriva qui; ma il vero check richiede
    // getUserMedia nel renderer. Quindi qui rispondiamo con un placeholder; il renderer userà la funzione
    // locale se questo handler non soddisfa. Per evitare confusione, restituiamo un valore "prompt"
    // e il renderer override? Invece, facciamo sì che permissions:checkMic sia gestito lato main tramite
    // session permission check + sistema? Semplifichiamo: apriamo una BrowserWindow nascosta temporanea?
    // Più semplice: segnaliamo al renderer di eseguire la sua checkMicrophonePermission().
    // Per ora: ritorna unknown e canOpenSettings true; Onboarding.tsx farà fallback alla sua logica.
    // Per una migliore UX, proviamo a dedurre da systemPreferences (Windows).
    // Su Windows, se le impostazioni privacy microfono disabilitano app desktop, il sistema non espone API dedicata.
    // Quindi qui restiamo pragmatici.
    return {
      state: "prompt",
      message:
        "Verifica microfono eseguita lato renderer: se vedi questa scritta, clicca Riprova — il controllo getUserMedia verrà rieseguito nella finestra di onboarding.",
      canOpenSettings: true,
    };
  });

  ipcMain.handle("permissions:openMicSettings", async () => {
    // ms-settings:privacy-microphone apre direttamente le impostazioni privacy su Windows 10/11
    try {
      await shell.openExternal("ms-settings:privacy-microphone");
      return { ok: true };
    } catch (e) {
      // Fallback: prova via exec start
      try {
        const { exec } = await import("node:child_process");
        exec('start ms-settings:privacy-microphone');
        return { ok: true };
      } catch {
        return { ok: false, error: (e as Error).message };
      }
    }
  });

  // Onboarding
  ipcMain.handle("onboarding:complete", async () => {
    setSetting("onboarding_completed", true);
    setSetting("onboarding_completed_at", new Date().toISOString());
    return getSettings();
  });

  ipcMain.handle("onboarding:skip", async () => {
    // Non segna completato: lascia l'app utilizzabile ma ripropone onboarding alla prossima apertura impostazioni
    return getSettings();
  });

  ipcMain.handle("onboarding:minimizeToTray", async () => {
    const ob = getOnboardingWindow();
    hideOnboardingWindow();
    // Nascondi anche main se visibile
    mainWindow?.hide();

    // Notifica nativa Windows (Electron Notification = Win toast)
    const hotkey = (getSettings().hotkey as string) || "Ctrl+Spazio";
    try {
      if (Notification.isSupported()) {
        const n = new Notification({
          title: "VoiceFlow è pronto",
          body: `Premi ${hotkey} per iniziare a dettare — funziona in qualsiasi app.`,
          silent: false,
        });
        n.on("click", () => {
          showSettingsWindow();
        });
        n.show();
      }
    } catch (e) {
      console.warn("[voiceflow] notification failed", e);
    }
    // Se ob non esiste più, chiudi quella window
    // Non distruggere, solo hide per Rifai tutorial
    void ob;
    return true;
  });

  ipcMain.handle("onboarding:reset", async () => {
    setSetting("onboarding_completed", false);
    setSetting("onboarding_completed_at", null);
    showOnboarding();
    return getSettings();
  });
}

let isRecording = false;

function handleHotkeyDown() {
  if (isRecording) return;
  isRecording = true;
  updateOverlayState(overlayWindow, "recording");
  mainWindow?.webContents.send("hotkey:down");
  overlayWindow?.webContents.send("hotkey:down");
  getOnboardingWindow()?.webContents.send("hotkey:down");
}

function handleHotkeyUp() {
  if (!isRecording) return;
  isRecording = false;
  updateOverlayState(overlayWindow, "processing");
  mainWindow?.webContents.send("hotkey:up");
  overlayWindow?.webContents.send("hotkey:up");
  getOnboardingWindow()?.webContents.send("hotkey:up");
}

app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    if (permission === "media" || permission === "mediaKeySystem") callback(true);
    else callback(false);
  });

  // Media permission check lato session: per Electron, dobbiamo concedere sempre lato main,
  // la vera barriera resta Windows privacy settings (che causa NotAllowedError in getUserMedia)
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => {
    if (permission === "media") return true;
    return false;
  });

  await initStorage();

  await createMainWindow();
  overlayWindow = createOverlayWindow(preload, VITE_DEV_SERVER_URL, RENDERER_DIST);

  const settings = getSettings();
  if (settings.autoLaunch) {
    app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true });
  }

  const hotkey = (settings.hotkey as string) || "Ctrl+Space";
  try {
    registerHotkey(hotkey, handleHotkeyDown, handleHotkeyUp);
  } catch (err) {
    console.error("[voiceflow] hotkey registration failed:", err);
  }

  tray = createTray({
    onShowSettings: showSettingsWindow,
    onShowOnboarding: showOnboarding,
    onToggleHotkey: () => {
      if (isHotkeyActive()) {
        unregisterHotkey();
      } else {
        registerHotkey(hotkey, handleHotkeyDown, handleHotkeyUp);
      }
    },
    onQuit: () => {
      quitting = true;
      (global as unknown as { __voiceflowQuitting?: boolean }).__voiceflowQuitting = true;
      app.quit();
    },
    isHotkeyActive,
  });

  setupIpc();

  // Primo avvio: se onboarding non completato, mostra onboarding invece di main.
  // Se l'utente aveva scelto launchMinimized, rispetta ma onboarding ha precedenza.
  const onboardingDone = settings.onboarding_completed;
  if (!onboardingDone) {
    createOnboardingWindow(preload, VITE_DEV_SERVER_URL, RENDERER_DIST);
  } else {
    // Normale: rispetta launchMinimized/autoLaunch
    if (!settings.launchMinimized) {
      // Non mostrare automaticamente; resta in tray fino a click utente.
      // Ma se l'app non è in autoLaunch e non è launchMinimized, mostra main per visibilità prima volta post-onboarding?
      // Per non essere invasivi, non apriamo nulla — l'utente ha già completato onboarding.
    }
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    else showSettingsWindow();
  });
});

app.on("window-all-closed", () => {
  // Su Windows resta in tray
});

app.on("second-instance", () => {
  showSettingsWindow();
});

app.on("before-quit", () => {
  quitting = true;
  (global as unknown as { __voiceflowQuitting?: boolean }).__voiceflowQuitting = true;
  stopHotkey();
  tray?.destroy();
});

// Flag runtime
declare global {
  namespace Electron {
    interface App {
      isQuitting: boolean;
    }
  }
}

app.isQuitting = false;
