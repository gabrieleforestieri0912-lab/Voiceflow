"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Trash2, Check, Cpu, HardDrive } from "lucide-react";
import { Reveal, Section, SectionHeading } from "@/components/ui/Reveal";
import {
  MODEL_CATALOG,
  MODELS_CHANGED_EVENT,
  formatMb,
  loadActiveModel,
  loadDownloaded,
  saveActiveModel,
  saveDownloaded,
} from "@/lib/models";
import { cn } from "@/lib/utils";

export function LocalModels() {
  const [downloaded, setDownloaded] = useState<string[]>(["vocalis-base"]);
  const [active, setActive] = useState("vocalis-base");
  const [progress, setProgress] = useState<Record<string, number>>({});
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setDownloaded(loadDownloaded());
    setActive(loadActiveModel());
    const sync = () => {
      setDownloaded(loadDownloaded());
      setActive(loadActiveModel());
    };
    window.addEventListener(MODELS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(MODELS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
      timers.current.forEach((t) => window.clearInterval(t));
    };
  }, []);

  const downloading = (id: string) => progress[id] !== undefined;

  const startDownload = (id: string) => {
    if (downloaded.includes(id) || downloading(id)) return;
    setProgress((p) => ({ ...p, [id]: 0 }));
    let pct = 0;
    const tick = () => {
      pct += 4 + Math.random() * 9;
      if (pct >= 100) {
        setProgress((p) => {
          const next = { ...p };
          delete next[id];
          return next;
        });
        const next = [...loadDownloaded(), id];
        saveDownloaded(next);
        setDownloaded(next);
      } else {
        setProgress((p) => ({ ...p, [id]: Math.min(99, Math.round(pct)) }));
        timers.current.push(window.setTimeout(tick, 160));
      }
    };
    timers.current.push(window.setTimeout(tick, 160));
  };

  const remove = (id: string) => {
    if (id === "vocalis-base") return; // preinstallato, non rimovibile
    const next = loadDownloaded().filter((x) => x !== id);
    saveDownloaded(next);
    setDownloaded(next);
    if (active === id) {
      saveActiveModel("vocalis-base");
      setActive("vocalis-base");
    }
  };

  const select = (id: string) => {
    if (!downloaded.includes(id)) return;
    saveActiveModel(id);
    setActive(id);
  };

  const usedMb = MODEL_CATALOG.filter((m) => downloaded.includes(m.id)).reduce((s, m) => s + m.sizeMb, 0);
  const activeModel = MODEL_CATALOG.find((m) => m.id === active);

  return (
    <Section id="models" className="py-20 sm:py-28">
      <SectionHeading
        eyebrow="Modelli locali"
        title="Scegli il cervello della trascrizione"
        sub="Modelli AI scaricabili sul tuo PC: funzionano offline. Scarica, seleziona, detta."
      />

      <Reveal delay={0.1}>
        <div className="card-shadow mx-auto mt-10 max-w-3xl rounded-card border border-border bg-surface p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-3 rounded-[14px] border border-accent/25 bg-accentSoft px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-accent text-black">
              <Cpu size={17} />
            </span>
            <div className="text-sm">
              <p className="font-semibold">
                In uso: {activeModel?.name ?? active} <span className="ml-1 font-normal text-dim">· {activeModel?.size} · {activeModel?.ram} RAM</span>
              </p>
              <p className="text-xs text-muted">La registrazione vocale usa questo modello, anche senza connessione.</p>
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-muted">
              <HardDrive size={13} /> {formatMb(usedMb)} su disco
            </span>
          </div>

          <ul className="mt-4 space-y-3" role="radiogroup" aria-label="Modelli AI locali">
            {MODEL_CATALOG.map((m) => {
              const isDown = downloaded.includes(m.id);
              const isActive = active === m.id;
              const pct = progress[m.id];
              return (
                <li
                  key={m.id}
                  className={cn(
                    "rounded-[14px] border p-4 transition-colors",
                    isActive ? "border-accent/50 bg-accentSoft/40" : "border-border bg-background"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      role="radio"
                      aria-checked={isActive}
                      disabled={!isDown}
                      onClick={() => select(m.id)}
                      title={isDown ? `Usa ${m.name} per la trascrizione` : `Scarica ${m.name} per usarlo`}
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded-full border-2 transition-colors",
                        isActive ? "border-accent bg-accent text-black" : "border-dim",
                        !isDown && "cursor-not-allowed opacity-40"
                      )}
                    >
                      {isActive && <Check size={12} strokeWidth={3.5} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                        {m.name}
                        {m.recommended && (
                          <span className="rounded-pill bg-accent px-2 py-0.5 text-[10px] font-bold text-black">Consigliato</span>
                        )}
                        {m.multilingual && (
                          <span className="rounded-pill border border-border px-2 py-0.5 text-[10px] text-muted">IT + EN</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[13px] text-muted">{m.desc}</p>
                      <p className="mt-1 font-mono text-[11px] text-dim">
                        {m.params} · {m.size} · {m.ram} · {m.speed} · {"★".repeat(m.accuracy)}{"☆".repeat(5 - m.accuracy)}
                      </p>
                    </div>
                    {isDown ? (
                      <button
                        onClick={() => remove(m.id)}
                        disabled={m.id === "vocalis-base"}
                        title={m.id === "vocalis-base" ? "Modello preinstallato" : `Elimina ${m.name}`}
                        className="grid h-9 w-9 place-items-center rounded-[10px] border border-border text-muted transition-colors hover:border-danger/50 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : pct !== undefined ? (
                      <div className="w-36">
                        <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Download ${m.name}`}>
                          <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${pct}%` }} transition={{ duration: 0.2 }} />
                        </div>
                        <p className="mt-1 text-right font-mono text-[11px] text-muted">{pct}%</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => startDownload(m.id)}
                        className="flex items-center gap-1.5 rounded-[10px] bg-accent px-3.5 py-2 text-[13px] font-semibold text-black transition-all hover:-translate-y-[1px] hover:shadow-glow active:scale-[0.98]"
                      >
                        <Download size={14} /> Scarica
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-center text-xs text-dim">
            I download sono simulati in questa demo — nessun file reale. Lo stato persiste nel browser.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
