import { BrowserWindow, shell } from "electron";
import path from "node:path";

let onboardingWindow: BrowserWindow | null = null;

export function createOnboardingWindow(
  preload: string,
  viteUrl: string | undefined,
  rendererDist: string,
): BrowserWindow {
  // Se esiste già, riusa
  if (onboardingWindow && !onboardingWindow.isDestroyed()) {
    return onboardingWindow;
  }

  onboardingWindow = new BrowserWindow({
    title: "VoiceFlow — Benvenuto",
    width: 720,
    height: 620,
    minWidth: 640,
    minHeight: 520,
    show: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    center: true,
    autoHideMenuBar: true,
    backgroundColor: "#09090b",
    icon: path.join(process.env.VITE_PUBLIC ?? rendererDist, "favicon.ico"),
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const indexHtml = path.join(rendererDist, "index.html");

  if (viteUrl) {
    onboardingWindow
      .loadURL(`${viteUrl}#onboarding`)
      .catch((e) => console.error("[onboarding] loadURL", e));
  } else {
    onboardingWindow
      .loadFile(indexHtml, { hash: "onboarding" })
      .catch((e) => console.error("[onboarding] loadFile", e));
  }

  onboardingWindow.on("ready-to-show", () => {
    onboardingWindow?.show();
    onboardingWindow?.focus();
  });

  onboardingWindow.on("close", (e) => {
    // Non chiudere l'app: nascondi e resta in tray.
    // Se onboarding non completato, l'utente può riaprirlo dal tray ("Rifai tutorial").
    const win = onboardingWindow;
    void (globalThis as unknown as { appIsQuitting?: boolean }).appIsQuitting;
    // Controlla app.isQuitting direttamente se disponibile
    // Fallback: usa electron app.isQuitting via import dinamico? Più semplice: non prevent se dialog chiede quit
    // Leggiamo da electron via require? No ESM. Controlliamo se la window è l'unica?
    // Usiamo una variabile globale settata in index.ts: (global as any).__voiceflowQuitting
    const quitting = (global as unknown as { __voiceflowQuitting?: boolean }).__voiceflowQuitting;
    if (quitting) return;
    // Altrimenti nascondi invece di distruggere, così il tray resta
    // Ma se l'utente chiude con X e onboarding non completato, nascondiamo comunque
    // Per evitare destroy, preventDefault + hide
    e.preventDefault();
    win?.hide();
  });

  onboardingWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  onboardingWindow.on("closed", () => {
    onboardingWindow = null;
  });

  return onboardingWindow;
}

export function getOnboardingWindow(): BrowserWindow | null {
  return onboardingWindow;
}

export function showOnboardingWindow(): void {
  if (onboardingWindow && !onboardingWindow.isDestroyed()) {
    if (onboardingWindow.isMinimized()) onboardingWindow.restore();
    onboardingWindow.show();
    onboardingWindow.focus();
    // Ricarica se necessario per ripartire dal primo step (opzionale)
    // Non forziamo reload, il renderer gestisce reset via IPC
    try {
      onboardingWindow.webContents.send("onboarding:reset-ui");
    } catch {
      // ignore
    }
    return;
  }
  // Se non esiste, il chiamante deve ricrearla via createOnboardingWindow
  // (index.ts gestisce la ricreazione)
}

export function hideOnboardingWindow(): void {
  onboardingWindow?.hide();
}

export function destroyOnboardingWindow(): void {
  if (onboardingWindow && !onboardingWindow.isDestroyed()) {
    // Bypassa close->hide
    (global as unknown as { __voiceflowQuitting?: boolean }).__voiceflowQuitting = true;
    onboardingWindow.destroy();
    (global as unknown as { __voiceflowQuitting?: boolean }).__voiceflowQuitting = false;
  }
  onboardingWindow = null;
}

export function isOnboardingWindowVisible(): boolean {
  return onboardingWindow !== null && !onboardingWindow.isDestroyed() && onboardingWindow.isVisible();
}
