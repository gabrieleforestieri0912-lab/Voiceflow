# Risorse app desktop

Asset per `electron-builder` e per l'icona tray.

- `tray.png` — icona tray 16x16 (se assente, il codice usa una PNG inline di fallback: vedi `src/main/icon.ts`).
- `icon.ico` — icona applicazione/installer NSIS (se assente, electron-builder usa l'icona di default di Electron).

Nessuno di questi file è obbligatorio per far girare l'app in dev: sono richiesti per una build
di distribuzione "brandizzata". Verranno aggiunti con l'identità definitiva (Giorno 6).
