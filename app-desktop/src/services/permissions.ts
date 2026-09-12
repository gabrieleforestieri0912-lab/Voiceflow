/**
 * Checks di permessi di sistema eseguiti nel renderer (via getUserMedia)
 * e nel main (hook uiohook). Questo file esporta helper usabili sia in
 * main (per test hook/test mic lato main) sia in renderer (via IPC o diretto).
 *
 * Nota: la verifica reale del permesso mic su Windows/Vite/Chromium avviene
 * via navigator.mediaDevices.getUserMedia({audio:true}) nel renderer.
 * Il main registra solo un permission handler permissivo, ma se Windows
 * ha disattivato privacy microfono a livello sistema per app desktop,
 * getUserMedia fallirà con NotAllowedError / NotFoundError — il renderer
 * mostra istruzioni con apertura ms-settings:privacy-microphone.
 */

export type MicPermissionState = "granted" | "denied" | "not-found" | "prompt" | "unknown";

export type MicCheckResult = {
  state: MicPermissionState;
  errorName?: string;
  message: string;
  canOpenSettings: boolean;
};

export type HookCheckResult = {
  ok: boolean;
  message: string;
  detail?: string;
};

/**
 * Usato dal renderer: prova getUserMedia e ritorna stato normalizzato.
 * Non lascia stream aperto.
 */
export async function checkMicrophonePermission(): Promise<MicCheckResult> {
  // Permissions API opzionale
  try {
    const perm = await (navigator as unknown as {
      permissions?: { query: (o: { name: string }) => Promise<{ state: string }> };
    }).permissions?.query({ name: "microphone" as never });
    if (perm && perm.state === "denied") {
      return {
        state: "denied",
        message:
          "Accesso al microfono negato dalle impostazioni di sistema. Apri Impostazioni di Windows > Privacy > Microfono e abilita l'accesso per le app desktop.",
        canOpenSettings: true,
      };
    }
  } catch {
    // ignore, fallback a getUserMedia
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return {
      state: "granted",
      message: "Microfono accessibile.",
      canOpenSettings: false,
    };
  } catch (err) {
    const e = err as DOMException;
    const name = e?.name ?? "UnknownError";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return {
        state: "denied",
        errorName: name,
        message:
          "Permesso microfono negato. Su Windows: Impostazioni > Privacy e sicurezza > Microfono → abilita \"Accesso al microfono\" e \"Consenti alle app desktop di accedere al microfono\". Poi riprova.",
        canOpenSettings: true,
      };
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return {
        state: "not-found",
        errorName: name,
        message: "Nessun microfono rilevato. Collega un microfono (USB/jack) e riprova. Se è già collegato, verifica che non sia disabilitato in Gestione dispositivi.",
        canOpenSettings: false,
      };
    }
    if (name === "NotReadableError" || name === "AbortError") {
      return {
        state: "denied",
        errorName: name,
        message:
          "Microfono occupato da un'altra app (o driver in errore). Chiudi altre app che usano il microfono (Teams, Zoom, ecc.) e riprova.",
        canOpenSettings: false,
      };
    }
    return {
      state: "unknown",
      errorName: name,
      message: `Impossibile accedere al microfono: ${e?.message ?? String(err)} (${name})`,
      canOpenSettings: true,
    };
  }
}

/**
 * Totale device visibility, senza richiedere permesso (enumerate senza label se denied).
 */
export async function enumerateMics(): Promise<MediaDeviceInfo[]> {
  try {
    const devs = await navigator.mediaDevices.enumerateDevices();
    return devs.filter((d) => d.kind === "audioinput");
  } catch {
    return [];
  }
}
