// Cattura microfono via getUserMedia + MediaRecorder (renderer/hidden window).
export interface CaptureHandle {
  stop: () => Promise<Blob | null>;
  dispose: () => void;
}

export async function createCapture(deviceId?: string): Promise<CaptureHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: deviceId ? { deviceId: { exact: deviceId } } : true,
  });
  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
  const rec = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  rec.start();
  return {
    stop: () =>
      new Promise((resolve) => {
        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          if (chunks.length === 0) return resolve(null);
          resolve(new Blob(chunks, { type: mimeType }));
        };
        rec.stop();
      }),
    dispose: () => stream.getTracks().forEach((t) => t.stop()),
  };
}
