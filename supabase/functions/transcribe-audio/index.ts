// Supabase Edge Function — POST /transcribe-audio
//
// Proxy cloud-only verso OpenAI Whisper. OPENAI_API_KEY vive SOLO qui come secret.
// Il bundle Electron non contiene mai la chiave. Nessun DB necessario per MVP
// (opzione 2: niente licenses/transcription_usage, solo proxy + rate-limit).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions";
const MODEL = "whisper-1";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_SECONDS = 60;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function errorMessage(status: number, code: string, message: string) {
  return json({ error: message, code }, status);
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return errorMessage(405, "METHOD_NOT_ALLOWED", "Metodo non consentito. Usa POST.");

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return errorMessage(500, "MISSING_API_KEY", "OPENAI_API_KEY non configurata sulla Edge Function.");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return errorMessage(429, "RATE_LIMITED", "Troppe richieste, riprova tra un minuto.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return errorMessage(400, "INVALID_BODY", "Body non valido: atteso multipart/form-data.");
  }

  const audio = form.get("audio");
  if (!(audio instanceof File)) return errorMessage(400, "MISSING_AUDIO", "Campo 'audio' mancante o non è un file.");
  if (audio.size === 0) return errorMessage(400, "EMPTY_AUDIO", "Audio vuoto.");
  if (audio.size > MAX_BYTES) return errorMessage(413, "AUDIO_TOO_LARGE", `Audio troppo grande (max ${MAX_BYTES / 1024 / 1024} MB).`);

  const languageRaw = form.get("language");
  const language = typeof languageRaw === "string" && languageRaw !== "auto" ? languageRaw : undefined;
  const vocabRaw = form.get("vocabulary");
  let vocabulary: string[] | undefined;
  if (typeof vocabRaw === "string" && vocabRaw.trim()) {
    try {
      const parsed = JSON.parse(vocabRaw);
      if (Array.isArray(parsed)) vocabulary = parsed.filter((s) => typeof s === "string").slice(0, 50);
    } catch {}
  }

  const upstream = new FormData();
  upstream.append("file", audio, audio.name || "audio.webm");
  upstream.append("model", MODEL);
  if (language) upstream.append("language", language);
  upstream.append("response_format", "json");
  if (vocabulary && vocabulary.length > 0) upstream.append("prompt", `Vocabulary: ${vocabulary.join(", ")}`);

  let res: Response;
  try {
    res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
      signal: AbortSignal.timeout((MAX_SECONDS + 15) * 1000),
    });
  } catch (err) {
    return errorMessage(502, "UPSTREAM_NETWORK_ERROR", `Errore di rete verso Whisper: ${(err as Error).message}`);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[transcribe-audio] upstream error", res.status, detail.slice(0, 300));
    if (res.status === 401) return errorMessage(502, "UPSTREAM_AUTH_ERROR", "Errore autenticazione Whisper (chiave API non valida).");
    if (res.status === 429) return errorMessage(502, "UPSTREAM_RATE_LIMITED", "Provider AI temporaneamente sovraccarico, riprova tra poco.");
    return errorMessage(502, "UPSTREAM_ERROR", `Trascrizione fallita (upstream ${res.status}).`);
  }

  let data: { text?: string } | null = null;
  try {
    data = (await res.json()) as { text?: string };
  } catch {
    return errorMessage(502, "UPSTREAM_MALFORMED", "Risposta Whisper malformata (JSON atteso).");
  }
  const text = data?.text?.trim();
  if (!text) return errorMessage(422, "EMPTY_TRANSCRIPTION", "Whisper non ha restituito testo (audio troppo breve o silenzioso?).");

  return json({ text });
});
