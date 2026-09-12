import { useCallback, useEffect, useRef, useState } from "react";
import { createCapture } from "../services/audio/capture";
import { transcribeAudio } from "../services/transcription/client";
import { checkMicrophonePermission } from "../services/permissions";
import type { AppSettings } from "../services/storage/settings";

type MicStatus = "idle" | "checking" | "granted" | "denied" | "not-found" | "error";
type HookStatus = "idle" | "checking" | "ok" | "fail";
type TrialPhase = "idle" | "recording" | "processing" | "success" | "error";
type TrialErrorKind = "mic" | "transcription" | "injection" | "unknown";

const HOTKEY_LABEL = "Ctrl+Spazio";

function Kbd({ children }: { children: string }) {
  return <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-100">{children}</kbd>;
}

function StepDots({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={[
            "h-1.5 rounded-full transition-all",
            n === current ? "w-8 bg-white" : n < current ? "w-6 bg-emerald-500" : "w-6 bg-zinc-700",
          ].join(" ")}
          aria-hidden
        />
      ))}
      <span className="ml-2 text-xs text-zinc-500">Passo {current}/3</span>
    </div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Fase 1 — permessi
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [micMsg, setMicMsg] = useState("");
  const [micCanOpenSettings, setMicCanOpenSettings] = useState(false);
  const [hookStatus, setHookStatus] = useState<HookStatus>("idle");
  const [hookMsg, setHookMsg] = useState("");

  // Fase 2 — trial
  const [trialPhase, setTrialPhase] = useState<TrialPhase>("idle");
  const [trialText, setTrialText] = useState("");
  const [trialErrorKind, setTrialErrorKind] = useState<TrialErrorKind | null>(null);
  const [trialError, setTrialError] = useState("");
  const captureRef = useRef<Awaited<ReturnType<typeof createCapture>> | null>(null);
  const isHotkeyRecordingRef = useRef(false);

  // Fase 3 — config
  const [hotkeyInput, setHotkeyInput] = useState("Ctrl+Space");
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    const s = (await window.voiceflow.invoke("settings:get")) as AppSettings;
    setSettings(s);
    setHotkeyInput(s.hotkey);
    setAutoLaunch(s.autoLaunch);
    return s;
  }, []);

  useEffect(() => {
    loadSettings();
    // Reset UI quando richiesto dal main (Rifai tutorial)
    const off = window.voiceflow.on("onboarding:reset-ui", () => {
      setStep(1);
      setTrialPhase("idle");
      setTrialText("");
      setTrialError("");
      setTrialErrorKind(null);
      setMicStatus("idle");
      setHookStatus("idle");
    });
    return () => off();
  }, [loadSettings]);

  const checkMic = useCallback(async () => {
    setMicStatus("checking");
    setMicMsg("");
    try {
      // Verifica reale via getUserMedia nel renderer (vede privacy Windows)
      const r = await checkMicrophonePermission();
      setMicMsg(r.message);
      setMicCanOpenSettings(r.canOpenSettings);
      if (r.state === "granted") setMicStatus("granted");
      else if (r.state === "not-found") setMicStatus("not-found");
      else if (r.state === "denied") setMicStatus("denied");
      else if (r.state === "prompt") setMicStatus("error");
      else setMicStatus("error");
      return r.state === "granted";
    } catch (e) {
      setMicStatus("error");
      setMicMsg((e as Error).message);
      setMicCanOpenSettings(true);
      return false;
    }
  }, []);

  const checkHook = useCallback(async () => {
    setHookStatus("checking");
    setHookMsg("");
    try {
      const res = (await window.voiceflow.invoke("permissions:checkHook")) as {
        ok: boolean;
        reason: string;
      };
      setHookMsg(res.reason);
      setHookStatus(res.ok ? "ok" : "fail");
      return res.ok;
    } catch (e) {
      setHookStatus("fail");
      setHookMsg((e as Error).message);
      return false;
    }
  }, []);

  const openMicSettings = useCallback(async () => {
    try {
      await window.voiceflow.invoke("permissions:openMicSettings");
    } catch {
      // fallback: shell.openExternal già gestito lato main
    }
  }, []);

  const runPermissionChecks = useCallback(async () => {
    await Promise.all([checkMic(), checkHook()]);
  }, [checkMic, checkHook]);

  useEffect(() => {
    if (step === 1) {
      runPermissionChecks();
    }
  }, [step, runPermissionChecks]);

  // Heartbeathotkey: l'overlay mostra registrazione, ma onboarding(step2) usa lo stesso bus
  useEffect(() => {
    const offDown = window.voiceflow.on("hotkey:down", async () => {
      if (step !== 2) return;
      if (isHotkeyRecordingRef.current) return;
      isHotkeyRecordingRef.current = true;
      setTrialError("");
      setTrialErrorKind(null);
      setTrialPhase("recording");
      try {
        const s = settings ?? (await loadSettings());
        const handle = await createCapture(s.audioDeviceId);
        captureRef.current = handle;
        await handle.start();
      } catch (e) {
        const msg = (e as Error).message;
        isHotkeyRecordingRef.current = false;
        setTrialPhase("error");
        setTrialErrorKind("mic");
        setTrialError(msg);
        try {
          captureRef.current?.dispose();
        } catch {
          /* ignore */
        }
        captureRef.current = null;
      }
    });

    const offUp = window.voiceflow.on("hotkey:up", async () => {
      if (step !== 2) return;
      if (!isHotkeyRecordingRef.current) return;
      // Se non c'è handle, probabilmente start fallita; reset
      const handle = captureRef.current;
      captureRef.current = null;
      if (!handle) {
        isHotkeyRecordingRef.current = false;
        // se trialPhase è già error, non sovrascrivere
        setTrialPhase((prev) => (prev === "error" ? prev : "idle"));
        return;
      }
      isHotkeyRecordingRef.current = false;
      setTrialPhase("processing");
      try {
        const blob = await handle.stop();
        handle.dispose();
        if (!blob) {
          setTrialPhase("error");
          setTrialErrorKind("mic");
          setTrialError("Nessun audio catturato. Tieni premuto Ctrl+Spazio mentre parli, poi rilascia.");
          return;
        }
        if (blob.size < 1000) {
          setTrialPhase("error");
          setTrialErrorKind("mic");
          setTrialError("Audio troppo breve — tieni premuto Ctrl+Spazio e parla per almeno un secondo.");
          return;
        }
        const s = settings ?? (await loadSettings());
        const res = await transcribeAudio(blob, s.language);
        if ("error" in res) {
          setTrialPhase("error");
          setTrialErrorKind("transcription");
          setTrialError(res.error);
          return;
        }
        const text = res.text?.trim();
        if (!text) {
          setTrialPhase("error");
          setTrialErrorKind("transcription");
          setTrialError("Trascrizione vuota — forse silenzio o audio non comprensibile. Riprova parlando più forte.");
          return;
        }
        setTrialText(text);
        // Iniezione reale: l'utente deve avere un editor aperto con focus.
        // Se non ha focus, mostriamo comunque successo e spieghiamo dove incollare manualmente.
        try {
          const inj = (await window.voiceflow.invoke("input:injectText", text)) as {
            ok: boolean;
            error?: string;
          };
          if (!inj.ok) {
            setTrialPhase("error");
            setTrialErrorKind("injection");
            setTrialError(
              inj.error ??
                "Testo copiato in clipboard ma iniezione non riuscita — la finestra target potrebbe aver perso il focus durante la trascrizione. Incolla manualmente con Ctrl+V dove vuoi.",
            );
            // Lasciamo trialText comunque visibile
            return;
          }
        } catch (e) {
          setTrialPhase("error");
          setTrialErrorKind("injection");
          setTrialError(
            `Iniezione fallita: ${(e as Error).message}. Il testo è comunque in clipboard — incolla con Ctrl+V.`,
          );
          return;
        }
        setTrialPhase("success");
      } catch (e) {
        try {
          handle.dispose();
        } catch {
          /* ignore */
        }
        setTrialPhase("error");
        // Classifica l'errore
        const msg = (e as Error).message;
        if (msg.includes("microfono") || msg.includes("NotAllowed") || msg.includes("NotFound")) {
          setTrialErrorKind("mic");
        } else if (msg.includes("Trascrizione") || msg.includes("rete") || msg.includes("timeout")) {
          setTrialErrorKind("transcription");
        } else if (msg.includes("Clipboard") || msg.includes("Ctrl+V") || msg.includes("injection")) {
          setTrialErrorKind("injection");
        } else {
          setTrialErrorKind("unknown");
        }
        setTrialError(msg);
      }
    });

    return () => {
      offDown();
      offUp();
    };
  }, [step, settings, loadSettings]);

  const completeOnboarding = useCallback(async () => {
    setSaving(true);
    try {
      // Salva hotkey + autoLaunch + flag onboarding
      if (hotkeyInput.trim() && hotkeyInput !== settings?.hotkey) {
        await window.voiceflow.invoke("settings:set", "hotkey", hotkeyInput.trim());
      }
      if (autoLaunch !== settings?.autoLaunch) {
        await window.voiceflow.invoke("settings:set", "autoLaunch", autoLaunch);
      }
      await window.voiceflow.invoke("onboarding:complete");
      setStep(4);
      // Dopo un breve delay, minimizza in tray con notifica
      setTimeout(async () => {
        try {
          await window.voiceflow.invoke("onboarding:minimizeToTray");
        } catch {
          // ignore
        }
      }, 400);
    } catch (e) {
      setTrialError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [hotkeyInput, autoLaunch, settings]);

  const skipToSettings = useCallback(async () => {
    // L'app resta utilizzabile per funzioni non bloccate.
    // Salva comunque onboarding_completed se l'utente vuole saltare — ma tracciamo che ha saltato.
    // Per questo flusso: segna onboarding come completato dopo la fase 3 review, skip manda a step 3.
    setStep(3);
  }, []);

  // Riprova trial: reset stato
  const retryTrial = useCallback(() => {
    setTrialPhase("idle");
    setTrialError("");
    setTrialErrorKind(null);
    setTrialText("");
    isHotkeyRecordingRef.current = false;
    captureRef.current?.dispose();
    captureRef.current = null;
  }, []);

  const canProceedFromStep1 = true; // sempre, anche se permessi negati: app resta usabile

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col p-6">
        {/* Header onboarding */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-zinc-950">V</span>
            <span className="text-sm font-semibold tracking-tight">VoiceFlow</span>
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-500">Primo avvio</span>
          </div>
          <StepDots current={step === 4 ? 3 : (step as 1 | 2 | 3)} />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Configuriamo VoiceFlow</h1>
                <p className="mt-1 text-sm leading-6 text-zinc-400">
                  VoiceFlow vive in background: tieni premuto <Kbd>Ctrl+Spazio</Kbd>, parli, rilasci, il testo appare dove è il cursore.
                  Verifichiamo che i permessi di sistema siano a posto.
                </p>
              </div>

              {/* Microfono */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Microfono</span>
                      {micStatus === "checking" && <span className="text-xs text-zinc-500">verifica…</span>}
                      {micStatus === "granted" && <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">OK</span>}
                      {(micStatus === "denied" || micStatus === "not-found" || micStatus === "error") && (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">Richiesta azione</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-5 text-zinc-400">
                      {micStatus === "idle" && "Avvio verifica…"}
                      {micStatus === "checking" && "Provo ad accedere al microfono…"}
                      {(micStatus === "granted" || micStatus === "denied" || micStatus === "not-found" || micStatus === "error") &&
                        (micMsg || "—")}
                    </p>
                    {(micStatus === "denied" || micStatus === "error") && micCanOpenSettings && (
                      <button
                        type="button"
                        onClick={openMicSettings}
                        className="mt-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-800"
                      >
                        Apri Impostazioni microfono di Windows
                      </button>
                    )}
                    {micStatus === "not-found" && (
                      <p className="mt-2 text-xs text-zinc-500">Suggerimento: se usi cuffie Bluetooth, assicurati che siano collegate e non occupate da Teams/Zoom.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={checkMic}
                    className="shrink-0 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                  >
                    Riprova
                  </button>
                </div>
              </div>

              {/* Hook */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Hotkey globale {HOTKEY_LABEL}</span>
                      {hookStatus === "checking" && <span className="text-xs text-zinc-500">verifica…</span>}
                      {hookStatus === "ok" && <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">OK</span>}
                      {hookStatus === "fail" && <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-300">Bloccata</span>}
                    </div>
                    <p className="mt-1 text-sm leading-5 text-zinc-400">
                      {hookStatus === "idle" && "Avvio verifica hook globale…"}
                      {hookStatus === "checking" && "Testo hook tastiera globale…"}
                      {(hookStatus === "ok" || hookStatus === "fail") && (hookMsg || "—")}
                    </p>
                    {hookStatus === "fail" && (
                      <p className="mt-2 rounded-lg bg-amber-950/40 px-3 py-2 text-xs leading-5 text-amber-200/90">
                        L'hook globale può essere bloccato da antivirus/EDR aziendali (Defender for Endpoint, CrowdStrike, SentinelOne) o
                        da policy IT. VoiceFlow resta usabile dal tray, ma la dettatura push-to-talk non partirà finché l'hook non è attivo.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={checkHook}
                    className="shrink-0 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                  >
                    Riprova
                  </button>
                </div>
              </div>

              {(micStatus === "denied" || micStatus === "not-found" || micStatus === "error" || hookStatus === "fail") && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 px-4 py-3 text-xs leading-5 text-amber-200/90">
                  <strong>Puoi proseguire.</strong> Le funzioni non bloccate restano disponibili. Le parti con permesso mancante mostreranno
                  cosa manca. Puoi sempre rifare il tutorial da <Kbd>Tray → Rifai tutorial</Kbd>.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Salta subito a step 3 (config) rispettando regola "resta utilizzabile"
                    skipToSettings();
                  }}
                  className="rounded-full px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100"
                >
                  Salta
                </button>
                <button
                  type="button"
                  disabled={!canProceedFromStep1}
                  onClick={() => setStep(2)}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-50"
                >
                  Continua
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Prova guidata — il loop vero</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-400">
                  Apri il <strong className="text-zinc-200">Blocco Note</strong> (o qualsiasi editor: Word, Cursor, Gmail), metti il cursore in un
                  campo di testo, poi <strong className="text-zinc-100">tieni premuto <Kbd>{HOTKEY_LABEL}</Kbd> e parla</strong>. Rilascia: il
                  testo deve comparire dove si trovava il cursore.
                </p>
              </div>

              <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-zinc-300">
                <li>
                  Premi <Kbd>Win+R</Kbd>, scrivi <Kbd>notepad</Kbd>, Invio.
                </li>
                <li>Clicca dentro la pagina bianca del Blocco Note.</li>
                <li>
                  Tieni premuto <Kbd>{HOTKEY_LABEL}</Kbd> — vedrai l'overlay rosso <em>"Registrazione…"</em> in basso al centro dello schermo.
                </li>
                <li>Dì una frase (es. "Ciao VoiceFlow, prova dettatura.") e rilascia i tasti.</li>
              </ol>

              <div
                className={[
                  "rounded-xl border p-4",
                  trialPhase === "recording"
                    ? "border-red-500/30 bg-red-500/10"
                    : trialPhase === "processing"
                      ? "border-amber-500/30 bg-amber-500/10"
                      : trialPhase === "success"
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : trialPhase === "error"
                          ? "border-red-500/30 bg-red-950/40"
                          : "border-zinc-800 bg-zinc-950",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "h-2.5 w-2.5 shrink-0 rounded-full",
                      trialPhase === "recording"
                        ? "animate-pulse bg-red-500"
                        : trialPhase === "processing"
                          ? "animate-pulse bg-amber-400"
                          : trialPhase === "success"
                            ? "bg-emerald-500"
                            : trialPhase === "error"
                              ? "bg-red-500"
                              : "bg-zinc-600",
                    ].join(" ")}
                    aria-hidden
                  />
                  <span className="text-sm font-medium">
                    {trialPhase === "idle" && `Pronto — tieni premuto ${HOTKEY_LABEL}`}
                    {trialPhase === "recording" && "Registrazione… parla ora, rilascia per trascrivere"}
                    {trialPhase === "processing" && "Trascrizione in corso…"}
                    {trialPhase === "success" && "Fatto! Testo iniettato nell'editor."}
                    {trialPhase === "error" && "Non è andato — vedi diagnosi sotto"}
                  </span>
                  {trialPhase === "idle" && (
                    <span className="ml-auto hidden text-xs text-zinc-500 sm:inline">L'overlay deve apparire mentre tieni premuto</span>
                  )}
                </div>

                {trialPhase === "error" && trialError && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm leading-5 text-red-200">{trialError}</p>
                    <div className="rounded-lg bg-zinc-950 px-3 py-2 text-xs leading-5 text-zinc-300">
                      {trialErrorKind === "mic" && (
                        <>
                          <strong className="text-zinc-100">Diagnosi: microfono non rilevato / permesso negato.</strong>
                          <br />
                          Controlla il microfono in Impostazioni di Windows → Privacy → Microfono (o premi "Apri Impostazioni microfono" nello
                          step 1). Se usi Bluetooth, disconnetti/riconnetti e riprova.
                        </>
                      )}
                      {trialErrorKind === "transcription" && (
                        <>
                          <strong className="text-zinc-100">Diagnosi: trascrizione fallita (rete/API).</strong>
                          <br />
                          Verifica connessione, poi riprova. Se l'Edge Function Supabase non è configurata (VITE_TRANSCRIBE_FUNCTION_URL /
                          OPENAI_API_KEY sul server), la trascrizione fallirà — chiedi al maintainer di completare il deploy della function.
                        </>
                      )}
                      {trialErrorKind === "injection" && (
                        <>
                          <strong className="text-zinc-100">Diagnosi: testo non iniettato (focus perso).</strong>
                          <br />
                          Durante la trascrizione la finestra target potrebbe aver perso il focus (alt-tab, overlay, screensaver). Il testo è
                          comunque in clipboard: premi <Kbd>Ctrl+V</Kbd> nel Blocco Note per incollarlo. Riprova tenendo il focus sull'editor.
                        </>
                      )}
                      {(trialErrorKind === "unknown" || !trialErrorKind) && (
                        <>
                          <strong className="text-zinc-100">Diagnosi: errore generico.</strong>
                          <br />
                          Riprova. Se l'errore persiste, riavvia l'app dal tray e rifai il tutorial.
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={retryTrial}
                      className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-800"
                    >
                      Riprova dettatura
                    </button>
                  </div>
                )}

                {trialPhase === "success" && trialText && (
                  <div className="mt-3 rounded-lg bg-zinc-950 p-3">
                    <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Testo trascritto</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-100">"{trialText}"</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Se non vedi il testo nel Blocco Note, premi <Kbd>Ctrl+V</Kbd> lì dentro — è in clipboard come fallback.
                    </p>
                  </div>
                )}

                {trialPhase === "idle" && (
                  <p className="mt-2 text-xs text-zinc-500">
                    Suggerimento: prova prima una frase breve. Se l'overlay non appare quando tieni premuto, l'hook potrebbe essere bloccato (torna
                    allo step permessi).
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
                >
                  Indietro
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="rounded-full px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100"
                  >
                    Salta prova
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className={[
                      "rounded-full px-5 py-2.5 text-sm font-semibold",
                      trialPhase === "success" ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400" : "bg-white text-zinc-950 hover:bg-zinc-100",
                    ].join(" ")}
                  >
                    {trialPhase === "success" ? "Avanti — perfetto" : "Avanti lo stesso"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Ultimi ritocchi</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-400">
                  Hotkey e avvio automatico. Puoi cambiare tutto dopo da <Kbd>Tray → Impostazioni</Kbd>.
                </p>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-zinc-200">Hotkey push-to-talk</span>
                <input
                  value={hotkeyInput}
                  onChange={(e) => setHotkeyInput(e.target.value)}
                  placeholder="Ctrl+Space"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100"
                />
                <span className="mt-1 block text-xs text-zinc-500">
                  MVP: funziona <Kbd>Ctrl+Spazio</Kbd> (hold). Altre combo saranno configurabili. Non usare combo di sistema critiche (es.{" "}
                  <Kbd>Alt+F4</Kbd>).
                </span>
              </label>

              <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-100">Avvia VoiceFlow all'accesso a Windows</p>
                  <p className="text-xs text-zinc-500">Parte in background e resta nel tray. Disattivabile in qualunque momento.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoLaunch}
                  onChange={(e) => setAutoLaunch(e.target.checked)}
                  className="h-4 w-4 shrink-0 accent-white"
                />
              </label>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs leading-5 text-zinc-400">
                <strong className="text-zinc-200">Post-onboarding:</strong> minimizzeremo l'app nel tray con notifica{" "}
                <em>"VoiceFlow è pronto — premi {HOTKEY_LABEL} per iniziare"</em>. Trovi sempre <Kbd>Impostazioni</Kbd> e{" "}
                <Kbd>Rifai tutorial</Kbd> nel menu del tray.
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
                >
                  Indietro
                </button>
                <button
                  type="button"
                  onClick={completeOnboarding}
                  disabled={saving}
                  className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-50"
                >
                  {saving ? "Salvataggio…" : "Finito — vai in tray"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-xl text-zinc-950">✓</div>
              <h2 className="text-lg font-semibold tracking-tight">Tutto pronto!</h2>
              <p className="text-sm leading-6 text-zinc-400">
                VoiceFlow è nel system tray. Premi <Kbd>{HOTKEY_LABEL}</Kbd> in qualsiasi app per dettare.
                <br />
                Se hai bisogno, trovi il tutorial in <Kbd>Tray → Rifai tutorial</Kbd>.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await window.voiceflow.invoke("onboarding:minimizeToTray");
                  } catch {
                    /* ignore */
                  }
                }}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
              >
                Chiudi e vai in tray
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-zinc-600">VoiceFlow · Solo Windows · v0 · Passo {step === 4 ? 3 : step}/3</p>
      </div>
    </div>
  );
}
