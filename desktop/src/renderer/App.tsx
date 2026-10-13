import { useEffect, useState } from "react";

declare global {
  interface Window {
    voiceflow: { invoke: (channel: string, ...args: unknown[]) => Promise<unknown> };
  }
}

interface Settings {
  hotkey: string;
  language: string;
  autoLaunch: boolean;
  launchMinimized: boolean;
  microphoneId?: string;
}

const DEFAULTS: Settings = {
  hotkey: "Ctrl+Space",
  language: "auto",
  autoLaunch: false,
  launchMinimized: true,
};

export function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [status, setStatus] = useState("Caricamento…");

  useEffect(() => {
    window.voiceflow
      .invoke("settings:get")
      .then((s) => {
        setSettings({ ...DEFAULTS, ...((s as Partial<Settings>) ?? {}) });
        setStatus("Pronto — premi la hotkey per dettare ovunque.");
      })
      .catch(() => setStatus("Storage non disponibile (fallback memoria)."));
  }, []);

  const save = async (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await window.voiceflow.invoke("settings:set", patch).catch(() => {});
  };

  return (
    <div style={{ fontFamily: "system-ui", background: "#09090b", color: "#e4e4e7", minHeight: "100vh", padding: 24 }}>
      <h1>VoiceFlow — Impostazioni</h1>
      <p>{status}</p>
      <label>
        Hotkey push-to-talk{" "}
        <input value={settings.hotkey} onChange={(e) => save({ hotkey: e.target.value })} style={{ marginLeft: 8 }} />
      </label>
      <div style={{ marginTop: 12 }}>
        <label>
          Lingua{" "}
          <select value={settings.language} onChange={(e) => save({ language: e.target.value })}>
            <option value="auto">Auto</option>
            <option value="it">Italiano</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <label>
          <input type="checkbox" checked={settings.autoLaunch} onChange={(e) => save({ autoLaunch: e.target.checked })} />{" "}
          Avvia all&apos;accesso a Windows
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>
          <input
            type="checkbox"
            checked={settings.launchMinimized}
            onChange={(e) => save({ launchMinimized: e.target.checked })}
          />{" "}
          Avvia minimizzata in tray
        </label>
      </div>
    </div>
  );
}
