/**
 * Storage impostazioni utente.
 *
 * Strategia: prova better-sqlite3 se disponibile (modulo nativo con prebuild),
 * altrimenti fallback a electron-store (JSON, zero nativi) — vedi docs/scope §4.6.
 * Per v0 sono solo preferenze leggere: niente cronologia audio/testo.
 *
 * Nota ESM: il main è ESM (`"type": "module"`). `require` non esiste a runtime,
 * quindi better-sqlite3 (CJS) passa da `createRequire` ed electron-store (ESM-only)
 * da `import()` dinamico. initStorage è async per questo.
 */

import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export type AppSettings = {
  hotkey: string;
  audioDeviceId: string | null;
  autoLaunch: boolean;
  launchMinimized: boolean;
  language: string; // "auto" | "it" | "en"
  supabaseUrl: string | null;
  transcribeFunctionUrl: string | null;
};

const DEFAULTS: AppSettings = {
  hotkey: "Ctrl+Space",
  audioDeviceId: null,
  autoLaunch: false,
  launchMinimized: false,
  language: "auto",
  supabaseUrl: null,
  transcribeFunctionUrl: null,
};

type StoreLike = {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  store: Record<string, unknown>;
};

let store: StoreLike | null = null;
let useBetterSqlite = false;

export async function initStorage(): Promise<void> {
  // Tentativo better-sqlite3 (opzionale, modulo nativo CJS)
  try {
    const Database = require("better-sqlite3") as new (dbPath: string) => {
      prepare: (sql: string) => {
        run: (...args: unknown[]) => unknown;
        get: (...a: unknown[]) => { value: string } | undefined;
        all: (...a: unknown[]) => { key: string; value: string }[];
      };
      exec: (sql: string) => void;
    };
    const userData = app.getPath("userData");
    if (!fs.existsSync(userData)) fs.mkdirSync(userData, { recursive: true });
    const dbPath = path.join(userData, "voiceflow.db");
    const db = new Database(dbPath);
    db.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
    // Seed defaults se mancanti
    for (const [k, v] of Object.entries(DEFAULTS)) {
      const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(k);
      if (!row) db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(k, JSON.stringify(v));
    }
    store = {
      get: (key: string) => {
        const r = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
        return r ? JSON.parse(r.value) : undefined;
      },
      set: (key: string, value: unknown) => {
        db.prepare(
          "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        ).run(key, JSON.stringify(value));
      },
      store: Object.fromEntries(db.prepare("SELECT key, value FROM settings").all().map((r) => [r.key, JSON.parse(r.value)])),
    };
    useBetterSqlite = true;
    console.log("[voiceflow] storage: better-sqlite3 attivo at", dbPath);
    return;
  } catch (e) {
    console.log("[voiceflow] storage: better-sqlite3 non disponibile, fallback a electron-store:", (e as Error).message);
  }

  // Fallback: electron-store (ESM-only → import dinamico)
  try {
    const mod = (await import("electron-store")) as unknown as {
      default: new (opts: unknown) => StoreLike;
    };
    const Store = mod.default;
    const s = new Store({ name: "voiceflow", defaults: DEFAULTS as unknown as Record<string, unknown> });
    store = s;
    console.log("[voiceflow] storage: electron-store attivo");
  } catch (e) {
    console.warn("[voiceflow] storage: electron-store non disponibile, uso memoria volatile:", e);
    const mem: Record<string, unknown> = { ...DEFAULTS };
    store = {
      get: (k: string) => mem[k],
      set: (k: string, v: unknown) => {
        mem[k] = v;
      },
      get store() {
        return mem;
      },
    };
  }
}

export function getSettings(): AppSettings {
  if (!store) return { ...DEFAULTS };
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(DEFAULTS)) {
    const v = store.get(k);
    out[k] = v !== undefined ? v : (DEFAULTS as Record<string, unknown>)[k];
  }
  return out as AppSettings;
}

export function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
  if (!store) return;
  store.set(key, value);
}

export function isUsingBetterSqlite(): boolean {
  return useBetterSqlite;
}
