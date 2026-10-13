"use client";

import { useRef } from "react";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Section, SectionHeading, Reveal } from "@/components/ui/Reveal";

const videos = [
  { title: "Dictate your first email", dur: "2:14", hue: "#FFD60A" },
  { title: "Build a custom mode", dur: "4:02", hue: "#7DD3FC" },
  { title: "Vocabulary that sticks", dur: "1:47", hue: "#C4B5FD" },
  { title: "Meeting recaps in one key", dur: "3:31", hue: "#6EE7B7" },
  { title: "Agentic coding by voice", dur: "5:20", hue: "#FDA4AF" },
];

export function Tutorials() {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <Section id="tutorials" className="pb-20 sm:pb-28">
      <SectionHeading eyebrow="Tutorials" title="Learn in minutes" />
      <Reveal delay={0.1}>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => scroll(-1)} aria-label="Scroll left" className="grid h-10 w-10 place-items-center rounded-[10px] border border-border bg-surface hover:border-ocean">
            <ChevronLeft size={17} />
          </button>
          <button onClick={() => scroll(1)} aria-label="Scroll right" className="grid h-10 w-10 place-items-center rounded-[10px] border border-border bg-surface hover:border-ocean">
            <ChevronRight size={17} />
          </button>
        </div>
      </Reveal>
      <Reveal delay={0.15}>
        <div ref={track} className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
          {videos.map((v) => (
            <article key={v.title} className="group w-[280px] shrink-0 snap-start overflow-hidden rounded-card border border-border bg-surface sm:w-[320px]">
              <div className="relative aspect-video" style={{ background: `linear-gradient(135deg, ${v.hue}33, transparent 60%), #1a1a1a` }}>
                <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ocean text-white transition-transform duration-standard group-hover:scale-110">
                  <Play size={18} />
                </span>
                <span className="absolute bottom-2 right-2 rounded-[8px] bg-black/70 px-2 py-0.5 font-mono text-xs">{v.dur}</span>
              </div>
              <h3 className="p-4 text-[15px] font-medium">{v.title}</h3>
            </article>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

