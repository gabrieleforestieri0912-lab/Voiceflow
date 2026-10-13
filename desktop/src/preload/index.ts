import { contextBridge, ipcRenderer } from "electron";

// Whitelist canali IPC — mirror di src/main/index.ts.
// Mai esporre require / process / Node al renderer.
const api = {
  invoke: (channel: string, ...args: unknown[]) => {
    const allowed = [
      "settings:get",
      "settings:set",
      "hotkey:pause",
      "hotkey:resume",
      "hotkey:isPaused",
      "transcription:transcribe",
      "onboarding:isCompleted",
      "onboarding:minimizeToTray",
      "onboarding:reset",
      "shell:openMicrophoneSettings",
    ];
    if (!allowed.includes(channel)) throw new Error(`IPC channel not allowed: ${channel}`);
    return ipcRenderer.invoke(channel, ...args);
  },
  on: (channel: string, cb: (...args: unknown[]) => void) => {
    const allowedEvents = ["recording:state"];
    if (!allowedEvents.includes(channel)) throw new Error(`IPC event not allowed: ${channel}`);
    const wrapped = (_e: unknown, ...args: unknown[]) => cb(...args);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },
};

contextBridge.exposeInMainWorld("voiceflow", api);
export type VoiceflowApi = typeof api;
