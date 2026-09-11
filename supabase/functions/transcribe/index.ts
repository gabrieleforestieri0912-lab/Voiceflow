// Supabase Edge Function — POST /transcribe
//
// Proxy cloud-only verso OpenAI Whisper. La chiave OPENAI_API_KEY vive SOLO qui
// come secret della funzione: nel bundle Electron distribuito non c'è nessuna chiave.
//
// Contratto:
//   POST multipart/form-data
//     audio     file  (webm/ogg/mp3/m4a/wav, max 10 MB)
//     language  string opzionale ("it" | "en" | "auto"/omesso → auto-detect)
//   → 200 { text: string }
//   → 4xx/5xx { error: string }
//
// Garanzie MVP: nessun salvataggio dell'audio (stateless), nessun log del testo
// trascritto, limiti di size + rate limit best-effort per IP.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions";
const MODEL = "whisper-1";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB (≈60s opus)
const MAX_SECONDS = 60;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limit best-effort in-memory (le istanze Edge sono effimere: è una mitigazione,
// non una garanzia. Per limiti forti usare un KV/store dedicato in Fase 2).
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // guardia memoria
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Metodo non consentito. Usa POST." }, 405);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return json({ error: "OPENAI_API_KEY non configurata sulla Edge Function." }, 500);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return json({ error: "Troppe richieste, riprova tra un minuto." }, 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "Body non valido: atteso multipart/form-data." }, 400);
  }

  const audio = form.get("audio");
  if (!(audio instanceof File)) return json({ error: "Campo 'audio' mancante o non è un file." }, 400);
  if (audio.size === 0) return json({ error: "Audio vuoto." }, 400);
  if (audio.size > MAX_BYTES) return json({ error: `Audio troppo grande (max ${MAX_BYTES / 1024 / 1024} MB).` }, 413);

  const languageRaw = form.get("language");
  const language = typeof languageRaw === "string" && languageRaw !== "auto" ? languageRaw : undefined;

  const upstream = new FormData();
  upstream.append("file", audio, audio.name || "audio.webm");
  upstream.append("model", MODEL);
  if (language) upstream.append("language", language);
  upstream.append("response_format", "json");

  let res: Response;
  try {
    res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
      signal: AbortSignal.timeout((MAX_SECONDS + 15) * 1000),
    });
  } catch (err) {
    return json({ error: `Errore di rete verso Whisper: ${(err as Error).message}` }, 502);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    // Non rilogghiamo il contenuto audio; solo status + messaggio upstream troncato.
    console.error("[transcribe] upstream error", res.status, detail.slice(0, 300));
    return json({ error: `Trascrizione fallita (upstream ${res.status}).` }, 502);
  }

  const data = (await res.json().catch(() => null)) as { text?: string } | null;
  const text = data?.text?.trim();
  if (!text) return json({ error: "Whisper non ha restituito testo (audio troppo breve o silenzioso?)." }, 422);

  return json({ text });
});
