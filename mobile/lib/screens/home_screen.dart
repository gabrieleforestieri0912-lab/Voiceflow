import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:share_plus/share_plus.dart';
import '../services/transcription_service.dart';

enum RecorderState { idle, recording, processing }

/// Home push-to-talk: tieni premuto il pulsante, parla, rilascia.
/// La trascrizione arriva dalla Edge Function `transcribe-audio` (stessa del desktop).
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  RecorderState _state = RecorderState.idle;
  String _text = '';
  String? _error;
  final _service = TranscriptionService();

  Future<void> _start() async {
    final mic = await Permission.microphone.request();
    if (!mic.isGranted) {
      setState(() => _error = 'Permesso microfono negato — abilitalo nelle Impostazioni di sistema.');
      return;
    }
    setState(() {
      _state = RecorderState.recording;
      _error = null;
    });
    await _service.startRecording();
  }

  Future<void> _stop() async {
    if (_state != RecorderState.recording) return;
    setState(() => _state = RecorderState.processing);
    try {
      final text = await _service.stopAndTranscribe();
      setState(() {
        _text = text;
        _state = RecorderState.idle;
      });
    } catch (e) {
      setState(() {
        _error = 'Trascrizione fallita: $e';
        _state = RecorderState.idle;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('VoiceFlow')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_error != null)
              Card(
                color: Theme.of(context).colorScheme.errorContainer,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(_error!),
                ),
              ),
            Expanded(
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: SelectableText(
                    _text.isEmpty ? 'Tieni premuto il microfono e parla…' : _text,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            GestureDetector(
              onLongPressStart: (_) => _start(),
              onLongPressEnd: (_) => _stop(),
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: Icon(
                  _state == RecorderState.processing
                      ? Icons.hourglass_top
                      : Icons.mic,
                ),
                label: Text(
                  _state == RecorderState.recording
                      ? 'Registrazione… rilascia per trascrivere'
                      : _state == RecorderState.processing
                          ? 'Trascrizione…'
                          : 'Tieni premuto per dettare',
                ),
              ),
            ),
            if (_text.isNotEmpty)
              TextButton.icon(
                onPressed: () => Share.share(_text),
                icon: const Icon(Icons.share),
                label: const Text('Condividi testo'),
              ),
          ],
        ),
      ),
    );
  }
}
