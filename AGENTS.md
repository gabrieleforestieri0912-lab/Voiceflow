# Istruzioni permanenti — Voiceflow

## Lingua
- Rispondi sempre in italiano.

## Salvataggio su GitHub (preferenza utente permanente)
- Quando l'utente chiede di "salvare", "salva tutto", oppure a fine di ogni
  sessione di lavoro significativa: fai commit + push su GitHub.
- Repo: `https://github.com/gabrieleforestieri0912-lab/Voiceflow.git`
- Branch principale: `main`
- Procedura standard:
  1. `git status` e `git diff --stat` per verificare cosa è cambiato.
  2. `git add -A` (il `.gitignore` esclude già `node_modules/`, `desktop/dist/`,
     `desktop/dist-electron/`, `desktop/release/`, `mobile/build/`, `.env`, ecc. —
     non committare mai secrets o build artifacts).
  3. Commit con messaggio convenzionale in italiano o inglese breve
     (es. `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`).
  4. `git push origin main` e verifica con `git status -sb` / `git log --oneline -5`.
- Non committare mai: `.env`, `.env.local`, `node_modules/`, `desktop/dist/`,
  `desktop/dist-electron/`, `desktop/release/`, `mobile/build/`,
  `*.tsbuildinfo`, credenziali o chiavi API.
- Se il push fallisce per autenticazione, mostrare l'errore e chiedere
  all'utente di autenticarsi (es. `gh auth login`), senza mai chiedere o
  salvare password/token in chiaro.
