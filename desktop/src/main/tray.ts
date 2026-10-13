import { Tray, Menu, app, nativeImage } from "electron";

let tray: Tray | null = null;

// PNG 1px fallback così il tray è sempre visibile anche senza asset.
const FALLBACK_ICON = nativeImage.createFromDataURL(
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAEElEQVQ4jWNgGAWjYBSMglEAAAwAAH6Rq7/5AAAAAElFTkSuQmCC"
);

export interface TrayCallbacks {
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
}

export function createTray(cb: TrayCallbacks) {
  if (tray) return tray;
  tray = new Tray(FALLBACK_ICON);
  tray.setToolTip("VoiceFlow — dettatura vocale");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Impostazioni…", click: cb.onOpenSettings },
      { label: "Rifai tutorial", click: cb.onOpenOnboarding },
      { type: "separator" },
      { label: `Versione ${app.getVersion()}`, enabled: false },
      { label: "Esci", click: () => app.quit() },
    ])
  );
  tray.on("click", () => cb.onOpenSettings());
  return tray;
}

export function destroyTray() {
  tray?.destroy();
  tray = null;
}
