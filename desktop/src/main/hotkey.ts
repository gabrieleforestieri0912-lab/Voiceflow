// Hotkey globale push-to-talk (default Ctrl+Space, hold = registra).
// uiohook-napi è opzionale: se manca o è bloccato (AV/EDR), nessun crash.

import { createRequire } from "module";

const require = createRequire(import.meta.url);

let paused = false;
let hook: { start: () => void; stop: () => void } | null = null;
let lastError: string | null = null;

export function isPaused() {
  return paused;
}

export function setPaused(v: boolean) {
  paused = v;
}

export function getLastHookError() {
  return lastError;
}

export function registerHotkey(): boolean {
  if (paused) return false;
  try {
    // Modulo nativo opzionale — import via createRequire (main ESM).
    const mod = require("uiohook-napi") as {
      uIOhook: {
        on: (ev: string, cb: (e: { keycode?: number; ctrlKey?: boolean }) => void) => void;
        start: () => void;
        stop: () => void;
      };
    };
    const { uIOhook } = mod;
    let spaceDown = false;
    uIOhook.on("keydown", (e) => {
      if (paused) return;
      // Ctrl+Space — keycode Space = 57 su uiohook.
      if (e.ctrlKey && e.keycode === 57 && !spaceDown) {
        spaceDown = true;
        // TODO: emit start-recording verso overlay/audio.
      }
    });
    uIOhook.on("keyup", (e) => {
      if (e.keycode === 57 && spaceDown) {
        spaceDown = false;
        // TODO: emit stop-recording → transcribe → inject.
      }
    });
    uIOhook.start();
    hook = uIOhook;
    lastError = null;
    return true;
  } catch (err) {
    lastError = err instanceof Error ? err.message : String(err);
    console.warn("[voiceflow] uiohook non disponibile:", lastError);
    return false;
  }
}

export function stopHotkey() {
  try {
    hook?.stop();
  } catch {
    /* noop */
  }
  hook = null;
}
