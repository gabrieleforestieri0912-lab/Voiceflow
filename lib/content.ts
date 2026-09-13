// Copy centralizzata Voiceflow — originale, tone diretto/produttività
// TODO pricing da confermare, nessun superwhisper copy

export const siteContent = {
  nav: {
    links: [
      { label: "Funzionalità", href: "#features" },
      { label: "Prezzi", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    cta: "Scarica per Windows",
  },
  hero: {
    headline: ["Parli,", "Voiceflow scrive."],
    sub: "Dettatura push-to-talk nativa per Windows. Tieni premuto Ctrl+Spazio, parla, rilascia: il testo appare dove stai scrivendo — in Slack, Cursor, Word, ovunque.",
    ctaPrimary: "Scarica per Windows",
    ctaSecondary: "Guarda la demo",
    shortcutHint: "Premi Ctrl+Space per provare",
    // Fallback decisione #2: ciclico 3 esempi
    typewriterExamples: [
      "Ciao team, ti invio il recap della call: abbiamo chiuso i task della sprint e domani testiamo la build.",
      "Hey, hai visto la PR sul refactor auth? Ho lasciato un commento sul token refresh.",
      "PS C:\\Dev\\voiceflow> genera il componente pricing con toggle mensile/annuale",
    ],
  },
  trustBar: {
    label: "Usato da chi lavora veloce",
  },
  adaptability: {
    tabs: [
      { value: "formale", label: "Formale" },
      { value: "casual", label: "Casual" },
      { value: "tecnico", label: "Tecnico" },
      { value: "chat", label: "Chat" },
    ],
  },
  features: [
    { title: "Funziona offline", desc: "Trascrizione locale, nessuna connessione richiesta per la base." },
    { title: "Vocabolario personalizzato", desc: "Nomi, acronimi e termini tecnici salvati una volta." },
    { title: "Modalità predefinite", desc: "Tono e formattazione ottimizzati per email, doc e chat." },
    { title: "100+ lingue", desc: "Riconosce la tua lingua e traduce verso IT/EN." },
    { title: "Clipboard nativa Windows", desc: "Incolla automaticamente dove stai scrivendo, senza friction." },
    { title: "Assistente riunioni", desc: "Registra e riassume i meeting — badge New", badge: "New" },
  ],
  integrations: {
    title: "Funziona dove già lavori",
    apps: ["Slack", "Notion", "VS Code", "Cursor", "Windows Terminal", "Teams"],
  },
  agenticDemo: {
    title: "Voiceflow per chi programma con agenti",
    // Fallback decisione #3: generico
    prompt: "PS C:\\Dev\\voiceflow> voiceflow dettatura → agente coding al lavoro",
  },
  pricing: {
    // TODO: confermare pricing — placeholder
    plans: [
      { name: "Free", price: "0€", features: ["Trascrizione base", "Offline"] },
      { name: "Pro", price: "19€", featured: true, features: ["Tutto Free + vocabolario", "100+ lingue", "Supporto"] },
      { name: "Enterprise", price: "Custom", features: ["SSO", "On-premise", "SLA"] },
    ],
  },
  faq: [
    { q: "Serve connessione?", a: "La base funziona offline, le funzioni avanzate usano il proxy cloud senza esporre chiavi." },
    { q: "Su quali Windows?", a: "Windows 10/11 64-bit, microfono e shortcut Ctrl+Spazio configurabile." },
    { q: "Licenza multi-device?", a: "Pro include fino a 3 dispositivi, gestibile dal portale." },
  ],
} as const;
