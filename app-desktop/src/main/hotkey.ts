/**
 * Hotkey globale push-to-talk via uiohook-napi.
 *
 * MVP: default "Ctrl+Space" (hold = registra, release = trascrivi).
 * Usa hook low-level non-bloccante: non interferisce con input normale tranne la hotkey target.
 *
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
let lastHookError: string | null = null;

export function getLastHookError(): string | null {
  return lastHookError;
}

async function ensureHook() {
  if (uIOhookRef) return uIOhookRef;
  try {
    const mod = await import("uiohook-napi");
    uIOhookRef = mod.uIOhook;
    UiohookKeyRef = mod.UiohookKey;
    return uIOhookRef;
  } catch (err) {
    lastHookError = (err as Error).message;
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
  if (!parsed.ctrl || !parsed.space) {
    console.warn(`[voiceflow] hotkey "${hotkey}" non è Ctrl+Space — MVP usa comunque Ctrl+Space come fallback.`);
  }

  const onKeydown = (e: { keycode: number }) => {
    if (keyIsCtrl(e.keycode)) ctrlDown = true;
    if (keyIsSpace(e.keycode)) spaceDown = true;
    if (ctrlDown && spaceDown && !isHotkeyHeld) {
      isHotkeyHeld = true;
      downHandler?.();
    }
  };

  const onKeyup = (e: { keycode: number }) => {
    const wasHeld = isHotkeyHeld;
    if (keyIsCtrl(e.keycode)) ctrlDown = false;
    if (keyIsSpace(e.keycode)) spaceDown = false;
    if (wasHeld && (!ctrlDown || !spaceDown)) {
      isHotkeyHeld = false;
      upHandler?.();
    }
    if (!ctrlDown && !spaceDown && wasHeld) {
      isHotkeyHeld = false;
    }
  };

  try {
    hook.off("keydown", onKeydown);
    hook.off("keyup", onKeyup);
  } catch {
    // ignore
  }

  hook.on("keydown", onKeydown);
  hook.on("keyup", onKeyup);

  if (!hookStarted) {
    try {
      hook.start();
      hookStarted = true;
    } catch (err) {
      lastHookError = (err as Error).message;
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

/**
 * Test diagnostico per Giorno 2 — verifica che l'hook tastiera globale funzioni
 * nell'ambiente reale. Rileva blocchi da antivirus/EDR o prebuild nativo mancante.
 */
export async function testHook(): Promise<{ ok: boolean; reason: string; canRetry: boolean }> {
  const hook = await ensureHook();
  if (!hook || !UiohookKeyRef) {
    const msg = lastHookError ?? "uiohook-napi non disponibile (prebuild nativo mancante o bloccato)";
    return {
      ok: false,
      reason: `${msg}. Possibili cause: antivirus/EDR che blocca moduli nativi, oppure installazione corrotta. Prova: 1) aggiungi VoiceFlow alla whitelist dell'antivirus, 2) reinstalla l'app, 3) usa il toggle Pausa/Riprendi dal tray per riattivare.`,
      canRetry: true,
    };
  }
  if (!hookStarted) {
    try {
      hook.start();
      hookStarted = true;
      active = true;
    } catch (err) {
      lastHookError = (err as Error).message;
      return {
        ok: false,
        reason: `Avvio hook fallito: ${(err as Error).message}. Se usi antivirus aziendale (CrowdStrike, SentinelOne, Defender for Endpoint), l'hook tastiera globale potrebbe essere bloccato da policy. Aggiungi VoiceFlow alle eccezioni o usa l'app dal tray con "Rifai tutorial" dopo aver sbloccato.`,
        canRetry: true,
      };
    }
  }
  if (!active) {
    return {
      ok: false,
      reason:
        "Hook installato ma non attivo. Premi Pausa/Riprendi dal tray per riattivarlo. Se resta inattivo, l'antivirus potrebbe impedirne l'esecuzione.",
      canRetry: true,
    };
  }
  return {
    ok: true,
    reason:
      "Hook globale attivo: tieni premuto Ctrl+Space — l'overlay deve apparire. Se non appare, verifica che nessun'altra app stia intercettando Ctrl+Space.",
    canRetry: false,
  };
}
