import { BrowserWindow, app, ipcMain } from "electron";
import { join } from "path";
import { isOnboardingCompleted, setSettings } from "../services/storage/settings.js";

let isQuitting = false;
app.on("before-quit", () => {
  isQuitting = true;
});

let onboardingWindow: BrowserWindow | null = null;

export { isOnboardingCompleted };

export function openOnboarding() {
  if (onboardingWindow && !onboardingWindow.isDestroyed()) {
    onboardingWindow.show();
    onboardingWindow.focus();
    return onboardingWindow;
  }
  onboardingWindow = new BrowserWindow({
    width: 720,
    height: 620,
    autoHideMenuBar: true,
    backgroundColor: "#09090b",
    center: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  // close → hide: l'utente può rifare il tutorial dal tray.
  onboardingWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      onboardingWindow?.hide();
    }
  });
  const isDev = !app.isPackaged;
  if (isDev) onboardingWindow.loadURL("http://localhost:5173/#/onboarding");
  else onboardingWindow.loadFile(join(__dirname, "../../dist/renderer/index.html"), { hash: "/onboarding" });
  return onboardingWindow;
}

// Registrato in index.ts — tenuto qui per coerenza futura.
export function registerOnboardingIpc() {
  ipcMain.handle("onboarding:reset", () => setSettings({ onboarding_completed: false }));
}
