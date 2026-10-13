// Trascrizione dal processo MAIN (superficie attacco minima: mai nel renderer).
// POST multipart { audio, language?, vocabulary? } → Edge Function transcribe-audio.

export interface TranscribePayload {
  audioBase64: string;
  mimeType?: string;
  language?: string;
  vocabulary?: string[];
}

const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 1; // 1 retry su 5xx / rete / timeout, mai su 4xx quota.

function supabaseConfig() {
  return {
    url: process.env.VITE_SUPABASE_URL ?? "",
    anonKey: process.env.VITE_SUPABASE_ANON_KEY ?? "",
    licenseKey: process.env.VITE_LICENSE_KEY ?? "",
  };
}

export async function transcribeInMain(payload: TranscribePayload): Promise<{ text: string }> {
  const { url, anonKey, licenseKey } = supabaseConfig();
  if (!url || !anonKey) throw new Error("SUPABASE_NOT_CONFIGURED");

  const endpoint = `${url.replace(/\/$/, "")}/functions/v1/transcribe-audio`;
  const audioBytes = Buffer.from(payload.audioBase64, "base64");
  const blob = new Blob([audioBytes], { type: payload.mimeType ?? "audio/webm" });
  const form = new FormData();
  form.append("audio", blob, "recording.webm");
  if (payload.language) form.append("language", payload.language);
  if (payload.vocabulary?.length) form.append("vocabulary", payload.vocabulary.slice(0, 50).join(", "));

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          ...(licenseKey ? { "x-license-key": licenseKey } : {}),
        },
        body: form,
        signal: ctrl.signal,
      });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string; code?: string };
      if (!res.ok) {
        const code = data.code ?? `HTTP_${res.status}`;
        // 4xx (quota, validazione) → mai retry.
        if (res.status >= 400 && res.status < 500) throw new Error(code);
        throw new Error(code);
      }
      if (!data.text) throw new Error("UPSTREAM_EMPTY");
      return { text: data.text };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const retryable =
        msg.includes("HTTP_5") || msg.includes("fetch") || msg.includes("abort") || msg.includes("UPSTREAM");
      if (retryable && attempt < MAX_RETRIES) {
        attempt += 1;
        continue;
      }
      throw err instanceof Error ? err : new Error(msg);
    } finally {
      clearTimeout(t);
    }
  }
}
