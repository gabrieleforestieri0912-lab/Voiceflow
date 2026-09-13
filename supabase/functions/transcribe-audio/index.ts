// Supabase Edge Function — POST /transcribe-audio
//
// Proxy cloud-only verso OpenAI Whisper. OPENAI_API_KEY vive SOLO qui come secret.
// Il bundle Electron non contiene mai la chiave.
//
// Contratto Giorno 3 — Fase 2:
//   POST multipart/form-data (autenticato via Supabase JWT o license_key)
//     audio     File (webm/ogg/mp3/m4a/wav, max 10 MB, max ~60s)
//     language  string opzionale ("it" | "en" | "auto"/omesso → auto)
//     vocabulary string opzionale JSON array di termini custom (per migliorare riconoscimento)
//   → 200 { text: string }
//   → 4xx/5xx { error: string, code?: string }  — sempre errore strutturato, mai crash
//
// Garanzie: nessun salvataggio audio, nessun log testo, rate-limit IP, quota parole per piano free,
// timeout ragionevoli, gestione rete/provider down/risposta malformata.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions";
const MODEL = "whisper-1";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_SECONDS = 60;
const FREE_MONTHLY_WORD_LIMIT = Number(Deno.env.get("FREE_MONTHLY_WORD_LIMIT") ?? "10000");

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-license-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limit best-effort in-memory (effimero; per limiti forti usare KV in Fase 2)
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

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
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

  // --- Auth: JWT Supabase o license_key ---
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let userId: string | null = null;
  let plan: string = "free";

  const authHeader = req.headers.get("authorization") ?? "";
  const licenseKey = req.headers.get("x-license-key") ?? "";

  if (supabaseUrl && serviceRoleKey && (authHeader.startsWith("Bearer ") || licenseKey)) {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      if (authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        // Verifica JWT via auth.getUser
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          userId = data.user.id;
        }
      }
      // Se license_key fornita, verifica licenza (può essere pre-acquisto senza user_id)
      if (licenseKey) {
        const { data: lic } = await supabase.from("licenses").select("user_id, plan, status").eq("license_key", licenseKey).maybeSingle();
        if (lic) {
          if (lic.status === "revoked") return errorMessage(403, "LICENSE_REVOKED", "Licenza revocata.");
          // Se licenza ha user_id, deve combaciare con JWT se presente
          if (lic.user_id && userId && lic.user_id !== userId) {
            return errorMessage(403, "LICENSE_MISMATCH", "Licenza non associata a questo utente.");
          }
          if (lic.user_id && !userId) userId = lic.user_id;
          plan = lic.plan ?? "free";
        } else if (!userId) {
          // license_key invalida e nessun JWT → 401
          return errorMessage(401, "INVALID_LICENSE", "Licenza non valida.");
        }
      }
      // Se autenticato via JWT, carica plan dalla tabella licenses (se esiste)
      if (userId && !licenseKey) {
        const { data: lic } = await supabase.from("licenses").select("plan, status").eq("user_id", userId).maybeSingle();
        if (lic) {
          if (lic.status === "revoked") return errorMessage(403, "LICENSE_REVOKED", "Licenza revocata.");
          plan = lic.plan ?? "free";
        }
      }
    } catch {
      // Se supabaseUrl/serviceRole non configurati, procedi senza quota (dev locale)
    }
  }

  // --- Quota parole per piano free ---
  if (userId && supabaseUrl && serviceRoleKey && plan === "free") {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      const { data: usage } = await supabase.from("transcription_usage").select("words_transcribed").eq("user_id", userId).eq("period_start", periodStart).maybeSingle();
      const current = usage?.words_transcribed ?? 0;
      if (current >= FREE_MONTHLY_WORD_LIMIT) {
        return errorMessage(429, "QUOTA_EXCEEDED", `Limite parole mensile superato (${FREE_MONTHLY_WORD_LIMIT} parole nel piano free). Passa a Pro o attendi il prossimo mese.`);
      }
    } catch {
      // Se tabella non esiste ancora, ignora quota
    }
  }

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
    } catch {
      // vocabolario malformato → ignora
    }
  }

  const upstream = new FormData();
  upstream.append("file", audio, audio.name || "audio.webm");
  upstream.append("model", MODEL);
  if (language) upstream.append("language", language);
  upstream.append("response_format", "json");
  // Whisper prompt opzionale con vocabolario custom (se in scope Fase 3)
  if (vocabulary && vocabulary.length > 0) {
    upstream.append("prompt", `Vocabulary: ${vocabulary.join(", ")}`);
  }

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

  // Aggiorna contatore parole per utente (best-effort, non bloccante)
  if (userId && supabaseUrl && serviceRoleKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      const words = countWords(text);
      const { data: existing } = await supabase.from("transcription_usage").select("id, words_transcribed").eq("user_id", userId).eq("period_start", periodStart).maybeSingle();
      if (existing) {
        await supabase.from("transcription_usage").update({ words_transcribed: existing.words_transcribed + words }).eq("id", existing.id);
      } else {
        await supabase.from("transcription_usage").insert({ user_id: userId, words_transcribed: words, period_start: periodStart, period_end: periodEnd });
      }
    } catch {
      // non bloccare la risposta se il conteggio fallisce
    }
  }

  return json({ text });
});
