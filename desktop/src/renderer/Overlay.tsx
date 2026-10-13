import { useState } from "react";

// Overlay pill: idle (nascosta) → recording (rossa) → processing (spinner) → idle.
// Gestita via evento IPC "recording:state" dal main (hotkey hold/release).
export function Overlay() {
  const [state] = useState<"idle" | "recording" | "processing">("idle");
  if (state === "idle") return null;
  return (
    <div
      style={
        {
          background: state === "recording" ? "#dc2626" : "#ca8a04",
          color: "white",
          borderRadius: 999,
          padding: "8px 16px",
          fontFamily: "system-ui",
          fontSize: 13,
          textAlign: "center",
          WebkitAppRegion: "no-drag",
        } as React.CSSProperties
      }
    >
      {state === "recording" ? "● Registrazione…" : "…Trascrizione"}
    </div>
  );
}
