// Storico locale — FUORI scope MVP (scope.md §3.2). Stub con retention 30gg futura.
export interface HistoryEntry {
  id: string;
  text: string;
  createdAt: string;
  durationMs?: number;
  language?: string;
}

const mem: HistoryEntry[] = [];

export function addHistoryEntry(e: Omit<HistoryEntry, "id" | "createdAt">): HistoryEntry {
  const entry = { ...e, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  mem.push(entry);
  return entry;
}

export function getHistory(): HistoryEntry[] {
  return [...mem];
}

export function purgeExpired(retentionDays = 30): number {
  const cutoff = Date.now() - retentionDays * 86_400_000;
  const before = mem.length;
  for (let i = mem.length - 1; i >= 0; i--) {
    if (new Date(mem[i].createdAt).getTime() < cutoff) mem.splice(i, 1);
  }
  return before - mem.length;
}
