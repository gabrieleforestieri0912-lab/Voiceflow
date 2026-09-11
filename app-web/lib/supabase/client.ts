"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase lato browser (componenti "use client").
 * Legge solo le env pubbliche: la service_role NON deve mai finire qui.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase non configurato: imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY in app-web/.env.local (vedi .env.example).",
    );
  }

  return createBrowserClient(url, anonKey);
}
