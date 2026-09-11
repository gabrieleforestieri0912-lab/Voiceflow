/**
 * Cattura audio via getUserMedia + MediaRecorder in renderer.
 * Chiamato dalla finestra nascosta / overlay; il main non tocca direttamente il microfono.
 */

export type CaptureHandle = {
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  isRecording: () => boolean;
  dispose: () => void;
  getStream: () => MediaStream | null;
};

export async function createCapture(deviceId: string | null): Promise<CaptureHandle> {
  let stream: MediaStream | null = null;
  let recorder: MediaRecorder | null = null;
  let chunks: BlobPart[] = [];
  let recording = false;

  const constraints: MediaStreamConstraints = {
    audio: deviceId
      ? {
          deviceId: { exact: deviceId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      : {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
  };

  async function start() {
    if (recording) return;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      const e = err as DOMException;
      if (e.name === "NotAllowedError") throw new Error("Permesso microfono negato. Consenti l'accesso al microfono nelle Impostazioni di Windows > Privacy > Microfono.");
      if (e.name === "NotFoundError") throw new Error("Nessun microfono trovato. Collega un microfono e riprova.");
      throw new Error(`Impossibile accedere al microfono: ${e.message} (${e.name})`);
    }

    const mimeType = pickMimeType();
    chunks = [];
    recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) chunks.push(ev.data);
    };

    recorder.start(100);
    recording = true;
  }

  async function stop(): Promise<Blob | null> {
    if (!recording || !recorder) return null;
    recording = false;

    const blobPromise = new Promise<Blob | null>((resolve) => {
      if (!recorder) return resolve(null);
      recorder.onstop = () => {
        const type = recorder?.mimeType || "audio/webm";
        const blob = chunks.length ? new Blob(chunks, { type }) : null;
        chunks = [];
        resolve(blob);
      };
      // Se già inattivo, risolvi subito
      if (recorder.state === "inactive") {
        const type = recorder.mimeType || "audio/webm";
        const blob = chunks.length ? new Blob(chunks, { type }) : null;
        chunks = [];
        resolve(blob);
      } else {
        try {
          recorder.stop();
        } catch {
          resolve(null);
        }
      }
    });

    // Ferma le tracce dopo aver fermato il recorder (evita leak)
    const result = await blobPromise;
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    recorder = null;
    return result;
  }

  function dispose() {
    try {
      if (recorder && recorder.state !== "inactive") recorder.stop();
    } catch {
      // ignore
    }
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    recorder = null;
    recording = false;
    chunks = [];
  }

  return {
    start,
    stop,
    isRecording: () => recording,
    dispose,
    getStream: () => stream,
  };
}

function pickMimeType(): string | undefined {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return undefined;
}

export async function listAudioInputs(): Promise<MediaDeviceInfo[]> {
  try {
    // Richiede permesso già concesso per avere label; se non concesso, ritorna device senza label
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "audioinput");
  } catch {
    return [];
  }
}
