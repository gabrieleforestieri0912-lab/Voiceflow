import { Tray, Menu, app } from "electron";
import { loadTrayIcon } from "./icon.js";

export function createTray(opts: {
  onShowSettings: () => void;
  onShowOnboarding: () => void;
  onToggleHotkey: () => void;
  onQuit: () => void;
  isHotkeyActive: () => boolean;
}): Tray {
  const tray = new Tray(loadTrayIcon());
  tray.setToolTip("VoiceFlow — tieni Ctrl+Spazio per dettare");

  const buildMenu = () =>
    Menu.buildFromTemplate([
      { label: "VoiceFlow", enabled: false },
      { type: "separator" },
      { label: "Impostazioni…", click: opts.onShowSettings },
      { label: "Rifai tutorial", click: opts.onShowOnboarding },
      {
        label: opts.isHotkeyActive() ? "Pausa dettatura" : "Riprendi dettatura",
        click: () => {
          opts.onToggleHotkey();
          tray.setContextMenu(buildMenu());
        },
      },
      { type: "separator" },
      { label: `v${app.getVersion()}`, enabled: false },
      { label: "Esci", click: opts.onQuit },
    ]);

  tray.setContextMenu(buildMenu());
  tray.on("click", () => opts.onShowSettings());
  tray.on("double-click", () => opts.onShowSettings());

  return tray;
}
