import { useEffect, useState, useCallback, useRef } from "react";
import { createCapture, listAudioInputs } from "../services/audio/capture";
import { transcribeAudio } from "../services/transcription/client";
import type { AppSettings } from "../services/storage/settings";

type Status = "idle" | "recording" | "processing" | "error";

export default function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [lastText, setLastText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [version, setVersion] = useState<string>("");
  const captureRef = useRef<Awaited<ReturnType<typeof createCapture>> | null>(null);

  const loadSettings = useCallback(async () => {
    const s = (await window.voiceflow.invoke("settings:get")) as AppSettings;
    setSettings(s);
    return s;
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      // Richiede permesso microfono per avere label
      await navigator.mediaDevices.getUserMedia({ audio: true }).then((st) => {
        st.getTracks().forEach((t) => t.stop());
      }).catch(() => {});
    } catch {
      // ignore
    }
    const list = await listAudioInputs();
    setDevices(list);
  }, []);

  useEffect(() => {
    loadSettings();
    refreshDevices();
    window.voiceflow.invoke("app:getVersion").then((v) => setVersion(String(v ?? ""))).catch(() => {});
    navigator.mediaDevices.addEventListener?.("devicechange", refreshDevices);
    return () => navigator.mediaDevices.removeEventListener?.("devicechange", refreshDevices as never);
  }, [loadSettings, refreshDevices]);

  const updateSetting = useCallback(async (key: keyof AppSettings, value: unknown) => {
    const updated = (await window.voiceflow.invoke("settings:set", key, value)) as AppSettings;
    setSettings(updated);
  }, []);

  // Hotkey push-to-talk: main invia eventi hotkey:down / hotkey:up
  useEffect(() => {
    const offDown = window.voiceflow.on("hotkey:down", async () => {
      setError("");
      setStatus("recording");
      window.voiceflow.send("renderer:recording-state", "recording");
      try {
        const s = settings ?? (await loadSettings());
        const handle = await createCapture(s.audioDeviceId);
        captureRef.current = handle;
        await handle.start();
      } catch (e) {
        setStatus("error");
        setError((e as Error).message);
        window.voiceflow.send("renderer:recording-state", "idle");
      }
    });

    const offUp = window.voiceflow.on("hotkey:up", async () => {
      const handle = captureRef.current;
      captureRef.current = null;
      if (!handle) {
        setStatus("idle");
        window.voiceflow.send("renderer:recording-state", "idle");
        return;
      }
      setStatus("processing");
      window.voiceflow.send("renderer:recording-state", "processing");
      try {
        const blob = await handle.stop();
        handle.dispose();
        if (!blob) {
          setStatus("error");
          setError("Nessun audio catturato. Tieni premuto Ctrl+Spazio mentre parli.");
          window.voiceflow.send("renderer:recording-state", "idle");
          return;
        }
        const s = settings ?? (await loadSettings());
        const res = await transcribeAudio(blob, s.language);
        if ("error" in res) {
          setStatus("error");
          setError(res.error);
          window.voiceflow.send("renderer:recording-state", "idle");
          return;
        }
        setLastText(res.text);
        // Iniezione nell'app attiva
        const inj = (await window.voiceflow.invoke("input:injectText", res.text)) as { ok: boolean; error?: string };
        if (!inj.ok) {
          setStatus("error");
          setError(inj.error ?? "Iniezione fallita — testo copiato in clipboard, incolla con Ctrl+V.");
        } else {
          setStatus("idle");
        }
        window.voiceflow.send("renderer:recording-state", "idle");
        // Auto-hide errore dopo successo
        setTimeout(() => setStatus((prev) => (prev === "error" ? prev : "idle")), 1200);
      } catch (e) {
        handle.dispose();
        setStatus("error");
        setError((e as Error).message);
        window.voiceflow.send("renderer:recording-state", "idle");
      }
    });

    return () => {
      offDown();
      offUp();
    };
  }, [settings, loadSettings]);

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <p className="text-sm text-zinc-400">Caricamento impostazioni…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-2xl p-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">VoiceFlow</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Tieni premuto <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-200">{settings.hotkey}</kbd>{" "}
              per dettare in qualsiasi app → rilascia per incollare.
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
            v{version || "0.1.0"} · Windows
          </div>
        </header>

        {/* Stato */}
        <div
          className={[
            "mb-6 rounded-2xl border p-4",
            status === "recording"
              ? "border-red-500/30 bg-red-500/10"
              : status === "processing"
                ? "border-amber-500/30 bg-amber-500/10"
                : status === "error"
                  ? "border-red-500/40 bg-red-950/40"
                  : "border-zinc-800 bg-zinc-900/60",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <span
              className={[
                "h-2.5 w-2.5 rounded-full",
                status === "recording"
                  ? "animate-pulse bg-red-500"
                  : status === "processing"
                    ? "animate-pulse bg-amber-400"
                    : status === "error"
                      ? "bg-red-500"
                      : "bg-emerald-500",
              ].join(" ")}
            />
            <span className="text-sm font-medium">
              {status === "recording"
                ? "Registrazione… tieni premuto e parla"
                : status === "processing"
                  ? "Trascrizione in corso…"
                  : status === "error"
                    ? "Errore"
                    : "Pronto — premi e tieni premuto la hotkey"}
            </span>
            <span className="ml-auto text-xs text-zinc-500">
              {status === "idle" ? "icona nel system tray · chiudi finestra per restare in background" : ""}
            </span>
          </div>
          {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
          {lastText ? (
            <div className="mt-3 rounded-xl bg-zinc-950 p-3">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Ultima trascrizione</p>
              <p className="mt-1 text-sm leading-6 text-zinc-200">{lastText}</p>
              <p className="mt-2 text-xs text-zinc-500">Incollata nell&apos;app attiva. Se l&apos;app non ha accettato Ctrl+V, incolla manualmente con Ctrl+V (è in clipboard).</p>
            </div>
          ) : null}
        </div>

        <section className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Impostazioni</h2>

          <label className="block">
            <span className="text-sm font-medium text-zinc-200">Microfono</span>
            <select
              value={settings.audioDeviceId ?? ""}
              onChange={(e) => updateSetting("audioDeviceId", e.target.value || null)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="">Predefinito di sistema</option>
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microfono ${d.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-zinc-500">
              Se il microfono non compare, consenti l&apos;accesso in Impostazioni di Windows → Privacy → Microfono, poi premi Aggiorna.
            </span>
            <button
              type="button"
              onClick={refreshDevices}
              className="mt-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-900"
            >
              Aggiorna elenco
            </button>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-200">Hotkey (push-to-talk)</span>
            <input
              value={settings.hotkey}
              onChange={(e) => updateSetting("hotkey", e.target.value)}
              placeholder="Ctrl+Space"
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100"
            />
            <span className="mt-1 block text-xs text-zinc-500">
              MVP: supporta Ctrl+Space (hold). Altre combo saranno configurabili in Fase 2. Richiede riavvio dettatura per applicare.
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-200">Lingua trascrizione</span>
            <select
              value={settings.language}
              onChange={(e) => updateSetting("language", e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="auto">Auto (Whisper)</option>
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>
          </label>

          <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <span className="text-sm font-medium text-zinc-200">Avvio automatico all&apos;accesso</span>
            <input
              type="checkbox"
              checked={settings.autoLaunch}
              onChange={(e) => updateSetting("autoLaunch", e.target.checked)}
              className="h-4 w-4 accent-white"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <span className="text-sm font-medium text-zinc-200">Avvia minimizzata (solo tray)</span>
            <input
              type="checkbox"
              checked={settings.launchMinimized}
              onChange={(e) => updateSetting("launchMinimized", e.target.checked)}
              className="h-4 w-4 accent-white"
            />
          </label>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-950 p-3">
            <span className="text-xs leading-5 text-zinc-400">
              Vuoi rifare il tour iniziale? Lo ritrovi in <strong className="text-zinc-200">Tray → Rifai tutorial</strong>.
            </span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await window.voiceflow.invoke("onboarding:reset");
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
              className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-100"
            >
              Rifai tutorial
            </button>
          </div>

          {settings.onboarding_completed === false && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 px-3 py-2 text-xs leading-5 text-amber-200/90">
              Onboarding non completato — l'app mostra il tutorial al prossimo avvio. Completalo dal tray (Rifai tutorial) o chiudi questa
              finestra per restare in background.
            </div>
          )}
        </section>

        <footer className="mt-6 text-xs text-zinc-500">
          <p>
            Trascrizione: cloud Whisper via Supabase Edge Function (nessuna chiave nel bundle). Audio non salvato. Vedi{" "}
            <code className="rounded bg-zinc-900 px-1 py-0.5">docs/scope.md</code> §5.
          </p>
        </footer>
      </div>
    </div>
  );
}
