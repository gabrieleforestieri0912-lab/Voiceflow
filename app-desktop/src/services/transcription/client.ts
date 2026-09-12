/**
 * Client trascrizione — cloud-only via Supabase Edge Function proxy.
 * Mai chiave OpenAI nel bundle Electron.
 *
 * Edge Function attesa: POST { audio: base64|multipart, mimeType?, language? } → { text: string }
 * Se la funzione non è ancora deployata, il client ritorna errore esplicativo.
 */

export type TranscribeResult = { text: string } | { error: string };

function getEnv(name: string): string | undefined {
  // Vite espone import.meta.env.VITE_*
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
  return env?.[name];
}

export async function transcribeAudio(blob: Blob, language: string = "auto"): Promise<TranscribeResult> {
  const fnUrl =
    getEnv("VITE_TRANSCRIBE_FUNCTION_URL") ||
    (getEnv("VITE_SUPABASE_URL") ? `${getEnv("VITE_SUPABASE_URL")}/functions/v1/transcribe` : undefined);
  const anonKey = getEnv("VITE_SUPABASE_ANON_KEY");

  if (!fnUrl) {
    return {
      error:
        "Trascrizione non configurata: manca VITE_TRANSCRIBE_FUNCTION_URL (o VITE_SUPABASE_URL) in app-desktop/.env. Vedi app-desktop/.env.example e docs/scope.md §5.",
    };
  }

  // Whisper ha limiti: ~25 MB; noi limitiamo a 10 MB / 60s lato client per UX
  if (blob.size > 10 * 1024 * 1024) {
    return { error: "Audio troppo lungo/grande (max ~60s / 10 MB). Prova con una dettatura più breve." };
  }
  if (blob.size < 1000) {
    return { error: "Audio troppo breve — tieni premuto Ctrl+Spazio mentre parli." };
  }

  const form = new FormData();
  const ext = mimeToExt(blob.type);
  form.append("audio", blob, `voiceflow-${Date.now()}.${ext}`);
  if (language && language !== "auto") form.append("language", language);

  const headers: Record<string, string> = {};
  if (anonKey) headers["apikey"] = anonKey;
  if (anonKey) headers["Authorization"] = `Bearer ${anonKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(fnUrl, {
      method: "POST",
      headers,
      body: form,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      // 1 retry rapido su 5xx / rete
      if (res.status >= 500) {
        await new Promise((r) => setTimeout(r, 800));
        const retry = await fetch(fnUrl, { method: "POST", headers, body: form }).catch(() => null);
        if (retry && retry.ok) {
          const j = (await retry.json().catch(() => null)) as { text?: string } | null;
          if (j?.text) return { text: j.text };
        }
      }
      return { error: `Trascrizione fallita (HTTP ${res.status}): ${body || res.statusText}` };
    }

    const json = (await res.json().catch(() => null)) as { text?: string; error?: string } | null;
    if (!json) return { error: "Risposta trascrizione non valida (JSON atteso)." };
    if (json.error) return { error: json.error };
    if (typeof json.text === "string") return { text: json.text };
    return { error: "Risposta trascrizione senza campo text." };
  } catch (err) {
    const e = err as Error;
    if (e.name === "AbortError") return { error: "Timeout trascrizione (30s). Controlla la connessione e riprova." };
    return { error: `Errore rete trascrizione: ${e.message}` };
  } finally {
    clearTimeout(timeout);
  }
}

function mimeToExt(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  return "webm";
}
