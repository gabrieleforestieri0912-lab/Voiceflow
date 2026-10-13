import { useState } from "react";

// Tutorial max 3 schermate + successo. Prova guidata = vero loop
// (capture → transcribe via main → inject), mai simulazione.
export function Onboarding() {
  const [step, setStep] = useState(0);
  const finish = async () => {
    await window.voiceflow.invoke("settings:set", {
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    });
    await window.voiceflow.invoke("onboarding:minimizeToTray");
  };

  return (
    <div style={{ fontFamily: "system-ui", background: "#09090b", color: "#e4e4e7", minHeight: "100vh", padding: 32 }}>
      {step === 0 && (
        <>
          <h1>1/3 — Tieni premuto, parla, rilascia</h1>
          <p>VoiceFlow incolla il testo dove si trova il cursore, in qualsiasi app.</p>
          <button onClick={() => setStep(1)}>Continua</button>
        </>
      )}
      {step === 1 && (
        <>
          <h1>2/3 — Prova reale</h1>
          <p>Apri Blocco Note, tieni premuto Ctrl+Spazio, parla 2–3s, rilascia.</p>
          <button onClick={() => setStep(2)}>L&apos;ho provato</button>
        </>
      )}
      {step === 2 && (
        <>
          <h1>3/3 — Hotkey e avvio</h1>
          <p>Default Ctrl+Spazio. Puoi cambiarla in Impostazioni.</p>
          <button onClick={finish}>Finito</button>
        </>
      )}
    </div>
  );
}
