// Client trascrizione lato renderer: preferisce IPC verso il main
// (window.voiceflow.invoke), fallback fetch diretto per smoke/test.
export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function transcribeAudio(blob: Blob, language?: string, vocabulary?: string[]): Promise<string> {
  const audioBase64 = await blobToBase64(blob);
  if (typeof window !== "undefined" && (window as unknown as { voiceflow?: { invoke: Function } }).voiceflow) {
    const { voiceflow } = window as unknown as { voiceflow: { invoke: (c: string, p: object) => Promise<{ text: string }> } };
    const res = await voiceflow.invoke("transcription:transcribe", {
      audioBase64,
      mimeType: blob.type,
      language,
      vocabulary,
    });
    return res.text;
  }
  // Fallback diretto (solo dev/test): richiede VITE_* esposti.
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const form = new FormData();
  form.append("audio", blob, "recording.webm");
  if (language) form.append("language", language);
  const res = await fetch(`${url}/functions/v1/transcribe-audio`, {
    method: "POST",
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    body: form,
  });
  const data = (await res.json()) as { text?: string };
  if (!data.text) throw new Error("UPSTREAM_EMPTY");
  return data.text;
}
