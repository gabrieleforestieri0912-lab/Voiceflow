"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      setMsg("Inserisci un'email valida.");
      return;
    }
    setStatus("loading");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("newsletter_signups").insert({ email: email.trim().toLowerCase() });
      if (error) throw error;
      setStatus("success");
      setMsg("Iscritto! Ti aggiorneremo.");
      setEmail("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Errore iscrizione";
      // Se tabella non esiste (RLS non deployata), mostra fallback
      if (message.includes("newsletter_signups")) {
        setStatus("error");
        setMsg("Newsletter non ancora attiva — tabella da deployare (vedi docs).");
      } else {
        setStatus("error");
        setMsg(message);
      }
    }
  };

  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-4">
          <div>
            <p className="text-sm font-semibold">VoiceFlow</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Dettatura nativa per Windows. Parli, Voiceflow scrive.</p>
          </div>
          {[
            { title: "Prodotto", links: ["Funzionalità", "Prezzi", "Download"] },
            { title: "Risorse", links: ["Docs", "Changelog", "Supporto"] },
            { title: "Legale", links: ["Privacy", "Termini", "Contatti"] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{col.title}</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <li key={l} className="hover:text-foreground">
                    <a href="#">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-8 flex max-w-md items-center gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="La tua email per la newsletter"
            className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-ring"
          />
          <Button type="submit" disabled={status === "loading"} className="rounded-full bg-accent text-background hover:bg-accent/90">
            {status === "loading" ? "Invio…" : "Iscriviti"}
          </Button>
        </form>
        {msg && <p className={`mt-2 text-xs ${status === "success" ? "text-success" : "text-destructive"}`}>{msg}</p>}

        <p className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} VoiceFlow · StackUp · Solo Windows</p>
      </div>
    </footer>
  );
}
