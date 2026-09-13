// Supabase Edge Function — POST /apply-mode
//
// Proxy LLM per rielaborazione testo (Modes). Fuori scope MVP secondo docs/scope.md §3.2,
// quindi questa funzione è uno stub predisposto per Fase 2: valida input, richiede
// OPENAI_API_KEY, ma se chiamata risponde con errore strutturato "not implemented" finché
// i Modes non saranno nello scope.
//
// Contratto Giorno 3 — Fase 2:
//   POST application/json (autenticato via JWT o x-license-key)
//     { text: string, mode: string, vocabulary?: string[] }
//   → 200 { text: string }  (quando i Modes saranno attivi)
//   → 4xx/5xx { error: string, code?: string }
//
// Privacy: nessun contenuto salvato lato cloud.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-license-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Metodo non consentito. Usa POST.", code: "METHOD_NOT_ALLOWED" }, 405);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return json({ error: "OPENAI_API_KEY non configurata sulla Edge Function.", code: "MISSING_API_KEY" }, 500);

  let body: { text?: unknown; mode?: unknown; vocabulary?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body non valido: atteso JSON.", code: "INVALID_BODY" }, 400);
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const mode = typeof body.mode === "string" ? body.mode.trim() : "";

  if (!text) return json({ error: "Campo 'text' mancante o vuoto.", code: "MISSING_TEXT" }, 400);
  if (text.length > 20000) return json({ error: "Testo troppo lungo (max 20000 caratteri).", code: "TEXT_TOO_LONG" }, 413);
  if (!mode) return json({ error: "Campo 'mode' mancante.", code: "MISSING_MODE" }, 400);

  // Fuori scope MVP — verifica docs/scope.md §3.2: Modes multipli rimandati a Fase 2
  // Risposta strutturata gestibile lato client senza crash
  const allowedModes = ["email_formale", "codice", "riassunto", "verbatim"];
  if (!allowedModes.includes(mode)) {
    return json({ error: `Mode non riconosciuto: ${mode}. Modes disponibili: ${allowedModes.join(", ")} (attualmente in Fase 2).`, code: "UNKNOWN_MODE" }, 400);
  }

  // Se si volesse attivare davvero il proxy LLM (Fase 2), qui chiamare OpenAI Chat Completions:
  // const res = await fetch("https://api.openai.com/v1/chat/completions", { ... })
  // Per ora, stub che dichiara esplicitamente "non ancora attivo"

  return json(
    {
      error: "Modes LLM non ancora attivi in MVP (Fase 2). Il testo è stato ricevuto ma non rielaborato. Usa mode 'verbatim' lato client.",
      code: "NOT_IMPLEMENTED",
    },
    501,
  );
});
