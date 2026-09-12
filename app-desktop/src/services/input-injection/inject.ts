/**
 * Iniezione testo nell'app attiva: clipboard swap + Ctrl+V.
 * Eseguito lato main (Node) — usa nut-js per simulazione tastiera + clipboardy/clipboard Electron.
 *
 * Strategia (vedi docs/scope.md §4.3):
 *  1. salva clipboard originale
 *  2. scrive trascrizione in clipboard
 *  3. simula Ctrl+V
 *  4. dopo delay, ripristina solo se clipboard contiene ancora la trascrizione
 */

import { clipboard } from "electron";

export async function injectText(text: string): Promise<{ ok: boolean; error?: string }> {
  if (!text || !text.trim()) return { ok: false, error: "Testo vuoto, nulla da incollare." };

  const original = clipboard.readText();

  try {
    clipboard.writeText(text);
  } catch (err) {
    return { ok: false, error: `Clipboard write failed: ${(err as Error).message}` };
  }

  // Simula Ctrl+V
  try {
    const { keyboard, Key } = await import("@nut-tree-fork/nut-js");
    // Configurazione nut-js: delay minimo per affidabilità
    if (keyboard.config) keyboard.config.autoDelayMs = 20;

    await keyboard.pressKey(Key.LeftControl, Key.V);
    await keyboard.releaseKey(Key.LeftControl, Key.V);
  } catch (err) {
    // Fallback: lascia il testo in clipboard e suggerisce incolla manuale
    console.error("[voiceflow] keyboard simulation failed:", err);
    return {
      ok: false,
      error: `Testo copiato in clipboard ma simulazione Ctrl+V fallita: ${(err as Error).message}. Incolla manualmente con Ctrl+V.`,
    };
  }

  // Ripristino clipboard dopo delay, solo se invariata
  const delayMs = 1100;
  setTimeout(() => {
    try {
      const current = clipboard.readText();
      if (current === text) {
        clipboard.writeText(original);
      }
    } catch {
      // ignore
    }
  }, delayMs);

  return { ok: true };
}
