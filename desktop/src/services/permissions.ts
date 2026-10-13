// Check permesso microfono nel renderer (distingue i casi Windows/Chromium).
export type MicStatus = "granted" | "denied" | "not-found" | "busy" | "unknown";

export async function checkMicrophonePermission(): Promise<{ status: MicStatus; message: string }> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return { status: "granted", message: "Microfono OK" };
  } catch (err) {
    const name = err instanceof DOMException ? err.name : "Unknown";
    if (name === "NotAllowedError")
      return { status: "denied", message: "Permesso negato — apri Impostazioni Windows > Privacy > Microfono" };
    if (name === "NotFoundError") return { status: "not-found", message: "Nessun microfono trovato" };
    if (name === "NotReadableError") return { status: "busy", message: "Microfono occupato da un'altra app" };
    return { status: "unknown", message: `Errore microfono: ${name}` };
  }
}
