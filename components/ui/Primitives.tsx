import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Common = {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  size?: "md" | "lg" | "sm";
  className?: string;
};

const styles = {
  base: "group inline-flex items-center justify-center gap-2 rounded-[12px] font-medium transition-all duration-micro ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.98]",
  primary:
    "bg-accent text-black hover:-translate-y-[1px] hover:shadow-glow",
  ghost: "border border-border bg-surface text-foreground hover:bg-surface-2",
  outline: "border border-border text-foreground hover:border-accent/40 hover:bg-accentSoft",
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-[15px]",
  lg: "px-7 py-3.5 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(styles.base, styles[variant], styles[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(styles.base, styles[variant], styles[size], className)} {...rest}>
      {children}
    </a>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1 text-xs font-medium text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-2.5" aria-label="Voiceflow home">
      <Image src="/voiceflow-icon.svg" alt="" width={32} height={32} className="h-8 w-8 rounded-[10px]" aria-hidden />
      {!compact && <span className="text-[17px] font-semibold tracking-tight">Voiceflow</span>}
    </a>
  );
}
