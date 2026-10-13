// Storage impostazioni: better-sqlite3 → electron-store → memoria.
export interface VoiceflowSettings {
  hotkey: string;
  language: string;
  autoLaunch: boolean;
  launchMinimized: boolean;
  microphoneId?: string;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
}

const DEFAULTS: VoiceflowSettings = {
  hotkey: "Ctrl+Space",
  language: "auto",
  autoLaunch: false,
  launchMinimized: true,
  onboarding_completed: false,
  onboarding_completed_at: null,
};

let memory: VoiceflowSettings = { ...DEFAULTS };
let store: { get: (k: string) => unknown; set: (k: string, v: unknown) => void } | null = null;

async function getStore() {
  if (store) return store;
  try {
    const mod = await import("electron-store");
    const Store = (mod as { default: new (o: object) => typeof store }).default;
    store = new Store({ name: "voiceflow-config" }) as typeof store;
    return store;
  } catch {
    return null;
  }
}

void getStore().then((s) => {
  if (!s) return;
  try {
    const saved = s.get("settings") as Partial<VoiceflowSettings> | undefined;
    if (saved) memory = { ...DEFAULTS, ...saved };
  } catch {
    /* noop */
  }
});

export function getSettings(): VoiceflowSettings {
  return { ...memory };
}

export function setSettings(patch: Partial<VoiceflowSettings>): VoiceflowSettings {
  memory = { ...memory, ...patch };
  void getStore().then((s) => {
    try {
      s?.set("settings", memory);
    } catch {
      /* noop */
    }
  });
  return getSettings();
}

export function isOnboardingCompleted(): boolean {
  return memory.onboarding_completed;
}
