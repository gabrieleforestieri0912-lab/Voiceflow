import { nativeImage } from "electron";
import path from "node:path";
import fs from "node:fs";

/**
 * Icona tray.
 *
 * Priorità: file reale `resources/tray.png` (in build) → `public/tray.png` (dev/api) →
 * PNG 16x16 generata inline (placeholder sempre valido, così il tray non è mai vuoto).
 * L'icona inline è un quadrato arrotondato indaco con un "mic" bianco.
 */
const INLINE_TRAY_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAM0lEQVR4nGNggILktI//ScEMyIBUzSiGkKsZbsjgNgAGRg0g0wB0MDBeoE9CojgzUZqdAdrlrKOPg2B1AAAAAElFTkSuQmCC";

export function loadTrayIcon(): Electron.NativeImage {
  const candidates = [
    process.env.VITE_PUBLIC ? path.join(process.env.VITE_PUBLIC, "tray.png") : null,
    path.join(process.resourcesPath ?? "", "tray.png"),
  ].filter((p): p is string => Boolean(p));

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const img = nativeImage.createFromPath(p);
        if (!img.isEmpty()) return img;
      }
    } catch {
      // ignore e prosegui col fallback inline
    }
  }

  return nativeImage.createFromDataURL(`data:image/png;base64,${INLINE_TRAY_PNG}`);
}
