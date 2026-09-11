/**
 * Hotkey globale push-to-talk via uiohook-napi.
 *
 * MVP: default "Ctrl+Space" (hold = registra, release = trascrivi).
 * Usa hook low-level non-bloccante: non interferisce con input normale tranne la hotkey target.
 *
 * Verifica richiesta in Checkpoint 2: key-down/key-up distinti, nessun blocco input normale.
 * Se uiohook-napi non è disponibile / prebuild fallisce, il modulo esporta un fallback che
 * logga e non registra (l'app resta usabile via click-to-toggle futuro).
 */

let active = false;
let downHandler: (() => void) | null = null;
let upHandler: (() => void) | null = null;
let hotkeyString = "Ctrl+Space";

// Stato tasti per riconoscimento Ctrl+Space hold
let ctrlDown = false;
let spaceDown = false;
let isHotkeyHeld = false;

// Lazy import per non rompere il cargimento se il nativo non è installato
let uIOhookRef: typeof import("uiohook-napi").uIOhook | null = null;
let UiohookKeyRef: typeof import("uiohook-napi").UiohookKey | null = null;
let hookStarted = false;

async function ensureHook() {
  if (uIOhookRef) return uIOhookRef;
  try {
    const mod = await import("uiohook-napi");
    uIOhookRef = mod.uIOhook;
    UiohookKeyRef = mod.UiohookKey;
    return uIOhookRef;
  } catch (err) {
    console.warn("[voiceflow] uiohook-napi non disponibile — hotkey globale disabilitata:", err);
    return null;
  }
}

function parseHotkey(hotkey: string) {
  const parts = hotkey.split("+").map((p) => p.trim().toLowerCase());
  return {
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
    meta: parts.includes("meta") || parts.includes("win") || parts.includes("cmd"),
    space: parts.includes("space"),
    // estensibile: altri tasti se necessario in Fase 2
  };
}

function keyIsCtrl(keycode: number): boolean {
  if (!UiohookKeyRef) return false;
  return (
    keycode === UiohookKeyRef.Ctrl ||
    keycode === UiohookKeyRef.CtrlRight ||
    (UiohookKeyRef as unknown as Record<string, number>)["LCtrl"] === keycode ||
    (UiohookKeyRef as unknown as Record<string, number>)["RCtrl"] === keycode
  );
}

function keyIsSpace(keycode: number): boolean {
  if (!UiohookKeyRef) return false;
  return keycode === UiohookKeyRef.Space;
}

export async function registerHotkey(
  hotkey: string,
  onDown: () => void,
  onUp: () => void,
): Promise<boolean> {
  hotkeyString = hotkey;
  downHandler = onDown;
  upHandler = onUp;

  const hook = await ensureHook();
  if (!hook || !UiohookKeyRef) {
    console.warn("[voiceflow] hotkey: hook non disponibile, registrato solo placeholder per", hotkey);
    active = false;
    return false;
  }

  const parsed = parseHotkey(hotkey);
  // MVP supporta solo Ctrl+Space; se altro, logga ma prova comunque Ctrl+Space logic
  if (!parsed.ctrl || !parsed.space) {
    console.warn(`[voiceflow] hotkey "${hotkey}" non è Ctrl+Space — MVP usa comunque Ctrl+Space come fallback.`);
  }

  // Listener keydown
  const onKeydown = (e: { keycode: number }) => {
    if (keyIsCtrl(e.keycode)) ctrlDown = true;
    if (keyIsSpace(e.keycode)) spaceDown = true;

    // Attiva solo su Ctrl tenuto + Space premuto (push-to-talk)
    if (ctrlDown && spaceDown && !isHotkeyHeld) {
      isHotkeyHeld = true;
      downHandler?.();
    }
  };

  const onKeyup = (e: { keycode: number }) => {
    const wasHeld = isHotkeyHeld;
    if (keyIsCtrl(e.keycode)) ctrlDown = false;
    if (keyIsSpace(e.keycode)) spaceDown = false;

    // Rilascia quando uno dei due viene rilasciato
    if (wasHeld && (!ctrlDown || !spaceDown)) {
      isHotkeyHeld = false;
      upHandler?.();
    }
    // Se solo Ctrl viene rilasciato ma Space era l'ultimo, comunque up
    if (!ctrlDown && !spaceDown && wasHeld) {
      isHotkeyHeld = false;
    }
  };

  // Rimuovi listener precedenti se presenti
  try {
    hook.off("keydown", onKeydown);
    hook.off("keyup", onKeyup);
  } catch {
    // ignore
  }

  hook.on("keydown", onKeydown);
  hook.on("keyup", onKeyup);

  // Avvia hook se non già avviato
  if (!hookStarted) {
    try {
      hook.start();
      hookStarted = true;
    } catch (err) {
      console.error("[voiceflow] uIOhook.start() failed:", err);
      return false;
    }
  }

  active = true;
  console.log(`[voiceflow] hotkey registrata: ${hotkey} (push-to-talk: tieni premuto)`);
  return true;
}

export function unregisterHotkey(): void {
  if (!active || !uIOhookRef) {
    active = false;
    isHotkeyHeld = false;
    ctrlDown = false;
    spaceDown = false;
    return;
  }
  try {
    uIOhookRef.removeAllListeners("keydown");
    uIOhookRef.removeAllListeners("keyup");
    // Nota: non chiamiamo stop() qui per non interrompere altri listener futuri;
    // lo stop globale avviene in before-quit.
  } catch (err) {
    console.warn("[voiceflow] unregisterHotkey error:", err);
  }
  active = false;
  isHotkeyHeld = false;
  ctrlDown = false;
  spaceDown = false;
}

export function isHotkeyActive(): boolean {
  return active;
}

/**
 * Ferma definitivamente l'hook low-level.
 * Va chiamata su quit: il thread nativo di uiohook tiene vivo il processo se non fermato,
 * causando processi orfani dopo la chiusura (vedi docs/scope.md §8).
 */
export function stopHotkey(): void {
  unregisterHotkey();
  if (uIOhookRef && hookStarted) {
    try {
      uIOhookRef.stop();
    } catch (err) {
      console.warn("[voiceflow] uIOhook.stop() error:", err);
    }
    hookStarted = false;
  }
}

export function getHotkey(): string {
  return hotkeyString;
}
