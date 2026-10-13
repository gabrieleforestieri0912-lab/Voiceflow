# VoiceFlow Mobile

App di dettatura vocale push-to-talk per Android + iOS: tieni premuto il pulsante, parla, rilascia — la trascrizione arriva dalla stessa Edge Function Supabase `transcribe-audio` usata dal desktop (Whisper, nessuna chiave nel bundle).

Vive dentro il monorepo VoiceFlow (`mobile/`). Web nella root Next.js, desktop in `desktop/`.

> **Prerequisito:** Flutter SDK ≥ 3.4 (`flutter --version`). Su questa macchina non è ancora installato — vedi sotto.

## Avvio

```bash
cd mobile
flutter pub get
flutter run --dart-define SUPABASE_URL=https://xyz.supabase.co \
            --dart-define SUPABASE_ANON_KEY=eyJ...
```

Altri comandi:

```bash
flutter analyze        # lint
flutter test           # widget test
flutter build apk      # Android release
flutter build ipa      # iOS release (solo macOS)
```

## Installare Flutter (Linux)

```bash
git clone https://github.com/flutter/flutter.git -b stable /opt/flutter
export PATH="$PATH:/opt/flutter/bin"
flutter doctor --android-licenses
```

 poi copia `android/local.properties.example` in `android/local.properties` e imposta `sdk.dir` + `flutter.sdk`.

## Struttura

```
lib/main.dart                  # entrypoint
lib/app.dart                   # MaterialApp + theme mode
lib/theme.dart                 # seed teal (coerente col web)
lib/screens/home_screen.dart   # UI push-to-talk (long-press)
lib/services/transcription_service.dart  # record → multipart → transcribe-audio
test/widget_test.dart
android/ ios/                  # shell native minime (permesso microfono già dichiarato)
```

## Note

- Chiavi Supabase **solo via `--dart-define`** (`String.fromEnvironment`), mai hardcodate né committate.
- iOS: `NSMicrophoneUsageDescription` già in `Info.plist`. Android: `RECORD_AUDIO` già nel manifest.
- Il contratto `POST multipart { audio, language? } → { text }` è identico al client desktop (`desktop/src/services/transcription/client.ts`).
