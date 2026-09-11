import { contextBridge, ipcRenderer } from "electron";

// Whitelist canali espliciti — mai esporre ipcRenderer generico.
// Renderer può solo invocare/inviare/ascoltare questi canali.

const ALLOWED_INVOKE = new Set([
  "settings:get",
  "settings:set",
  "overlay:getState",
  "transcription:transcribe",
  "input:injectText",
  "tray:update",
  "app:getVersion",
  "app:getPath",
]);

const ALLOWED_ON = new Set([
  "main-process-message",
  "hotkey:down",
  "hotkey:up",
  "overlay:state",
]);

const ALLOWED_SEND = new Set(["renderer:recording-state"]);

type Listener = (...args: unknown[]) => void;
type Wrapped = (event: Electron.IpcRendererEvent, ...args: unknown[]) => void;

// Mappa listener originali → wrapper, così off() rimuove davvero il wrapper corretto.
const wrappedListeners = new WeakMap<Listener, Wrapped>();

function assertOn(channel: string) {
  if (!ALLOWED_ON.has(channel)) throw new Error(`Canale on non consentito: ${channel}`);
}

contextBridge.exposeInMainWorld("voiceflow", {
  // invoke → ipcMain.handle
  invoke(channel: string, ...args: unknown[]) {
    if (!ALLOWED_INVOKE.has(channel)) throw new Error(`Canale invoke non consentito: ${channel}`);
    return ipcRenderer.invoke(channel, ...args);
  },
  // on/off per eventi push dal main
  on(channel: string, listener: Listener) {
    assertOn(channel);
    const wrapped: Wrapped = (_event, ...args) => listener(...args);
    wrappedListeners.set(listener, wrapped);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.off(channel, wrapped);
  },
  off(channel: string, listener: Listener) {
    assertOn(channel);
    const wrapped = wrappedListeners.get(listener);
    // Fallback: se mai wrappato, prova a rimuovere direttamente (no-op se non presente)
    ipcRenderer.off(channel, wrapped ?? (listener as unknown as Wrapped));
  },
  send(channel: string, ...args: unknown[]) {
    if (!ALLOWED_SEND.has(channel)) throw new Error(`Canale send non consentito: ${channel}`);
    return ipcRenderer.send(channel, ...args);
  },
});

declare global {
  interface Window {
    voiceflow: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      on: (channel: string, listener: (...args: unknown[]) => void) => () => void;
      off: (channel: string, listener: (...args: unknown[]) => void) => void;
      send: (channel: string, ...args: unknown[]) => void;
    };
  }
}

// Loading placeholder (opzionale, minimale)
function domReady(states: DocumentReadyState[] = ["complete", "interactive"]): Promise<void> {
  return new Promise((resolve) => {
    if (states.includes(document.readyState)) resolve();
    else
      document.addEventListener("readystatechange", () => {
        if (states.includes(document.readyState)) resolve();
      });
  });
}

domReady().then(() => {
  // Rimuove eventuale loader se presente
  const loader = document.getElementById("app-loading");
  if (loader) loader.remove();
});
