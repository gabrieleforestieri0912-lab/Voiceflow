import { useEffect, useState } from "react";

export default function Overlay() {
  const [state, setState] = useState<string>("idle");

  useEffect(() => {
    const off1 = window.voiceflow.on("overlay:state", (s) => setState(String(s)));
    const off2 = window.voiceflow.on("hotkey:down", () => setState("recording"));
    const off3 = window.voiceflow.on("hotkey:up", () => setState("processing"));
    return () => {
      off1();
      off2();
      off3();
    };
  }, []);

  if (state === "idle" || state === "hidden") return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-2">
      <div
        className={[
          "flex items-center gap-3 rounded-full border px-5 py-3 shadow-2xl backdrop-blur",
          state === "recording"
            ? "border-red-500/40 bg-red-500/95 text-white"
            : "border-amber-500/40 bg-amber-500/95 text-zinc-950",
        ].join(" ")}
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <span
          className={["h-2.5 w-2.5 rounded-full", state === "recording" ? "animate-ping bg-white" : "animate-spin border-2 border-zinc-900 border-t-transparent"].join(" ")}
          aria-hidden
        />
        <span className="text-sm font-semibold">
          {state === "recording" ? "Registrazione… rilascia per trascrivere" : "Trascrizione…"}
        </span>
      </div>
    </div>
  );
}
