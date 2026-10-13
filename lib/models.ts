// Catalogo modelli AI locali per la trascrizione vocale (dati fittizi, stile Whisper).
// Lo stato (scaricati + attivo) è persistito in localStorage e condiviso
// tra la sezione LocalModels e l'overlay desktop.

export type LocalModel = {
  id: string;
  name: string;
  params: string;
  size: string;
  sizeMb: number;
  ram: string;
  speed: string;
  accuracy: number; // 1-5
  multilingual: boolean;
  desc: string;
  recommended?: boolean;
};

export const MODEL_CATALOG: LocalModel[] = [
  {
    id: "vocalis-tiny",
    name: "Vocalis Tiny",
    params: "39M",
    size: "75 MB",
    sizeMb: 75,
    ram: "~1 GB",
    speed: "32x realtime",
    accuracy: 2,
    multilingual: false,
    desc: "Bozze veloci in inglese, CPU datate.",
  },
  {
    id: "vocalis-base",
    name: "Vocalis Base",
    params: "74M",
    size: "145 MB",
    sizeMb: 145,
    ram: "~1 GB",
    speed: "16x realtime",
    accuracy: 3,
    multilingual: false,
    desc: "Equilibrio per appunti quotidiani in inglese.",
  },
  {
    id: "vocalis-small",
    name: "Vocalis Small",
    params: "244M",
    size: "480 MB",
    sizeMb: 480,
    ram: "~2 GB",
    speed: "6x realtime",
    accuracy: 4,
    multilingual: true,
    desc: "Multilingua IT/EN, buon compromesso.",
    recommended: true,
  },
  {
    id: "vocalis-medium",
    name: "Vocalis Medium",
    params: "769M",
    size: "1.5 GB",
    sizeMb: 1536,
    ram: "~5 GB",
    speed: "2x realtime",
    accuracy: 4,
    multilingual: true,
    desc: "Preciso su accenti e gergo tecnico.",
  },
  {
    id: "vocalis-large",
    name: "Vocalis Large",
    params: "1.5B",
    size: "2.9 GB",
    sizeMb: 2969,
    ram: "~10 GB",
    speed: "1x realtime",
    accuracy: 5,
    multilingual: true,
    desc: "Massima qualità, serve GPU o Mac recenti.",
  },
];

const DOWNLOADED_KEY = "vocalis-models-downloaded";
const ACTIVE_KEY = "vocalis-active-model";
export const MODELS_CHANGED_EVENT = "vocalis-models-changed";

export function loadDownloaded(): string[] {
  try {
    const raw = localStorage.getItem(DOWNLOADED_KEY);
    if (!raw) return ["vocalis-base"]; // preinstallato
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : ["vocalis-base"];
  } catch {
    return ["vocalis-base"];
  }
}

export function saveDownloaded(ids: string[]) {
  try {
    localStorage.setItem(DOWNLOADED_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(MODELS_CHANGED_EVENT));
  } catch {}
}

export function loadActiveModel(): string {
  try {
    return localStorage.getItem(ACTIVE_KEY) ?? "vocalis-base";
  } catch {
    return "vocalis-base";
  }
}

export function saveActiveModel(id: string) {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
    window.dispatchEvent(new CustomEvent(MODELS_CHANGED_EVENT, { detail: { active: id } }));
  } catch {}
}

export function formatMb(mb: number): string {
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
}
