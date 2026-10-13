// Vocabolario custom — FUORI scope MVP. Stub persistito via electron-store quando disponibile.
const terms = new Set<string>();

export function getVocabulary(): string[] {
  return [...terms];
}

export function addVocabularyTerm(term: string): void {
  const t = term.trim();
  if (t) terms.add(t);
}

export function removeVocabularyTerm(term: string): void {
  terms.delete(term);
}

export function getVocabularyTermsForPrompt(): string[] {
  return getVocabulary().slice(0, 50);
}
