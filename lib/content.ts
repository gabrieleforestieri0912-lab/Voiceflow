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
    examples: {
      formale: {
        input: "ehm ciao volevo mandare email al cliente per dire che abbiamo finito la prima parte e che domani facciamo deploy alle dieci",
        output: "Buongiorno,\nabbiamo completato la prima fase del progetto. Domani procederemo con il deploy alle 10:00. Resto a disposizione per qualsiasi necessità.\nCordiali saluti",
        ctx: "Email di lavoro",
      },
      casual: {
        input: "ohi senti ho visto la tua bozza direi che va bene però cambierei un paio di cose al volo",
        output: "Ehi! Ho visto la tua bozza — direi che va bene così, cambierei solo un paio di dettagli al volo e poi siamo a posto 👌",
        ctx: "Messaggio Slack a un collega",
      },
      tecnico: {
        input: "fai commit con messaggio fix del bug sul refresh token e aggiungi nota che chiude la issue quarantadue",
        output: "fix(auth): gestito edge case su refresh token\n\n- Evitato race su tab multipli\n- Aggiunto retry 401 con backoff\nCloses #42",
        ctx: "Commit message tecnico",
      },
      chat: {
        input: "ci vediamo domani sera per pizza? porto io la birra e poi guardiamo la partita",
        output: "Ci vediamo domani sera per pizza? Porto io le birre e dopo ci guardiamo la partita 🍕🍻",
        ctx: "Chat informale con un amico",
      },
    },
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
