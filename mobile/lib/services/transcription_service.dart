import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:record/record.dart';

/// Registra con il microfono (`record`) e trascrive via Edge Function
/// `transcribe-audio` — stesso contratto del client desktop.
/// Config: --dart-define SUPABASE_URL=... --dart-define SUPABASE_ANON_KEY=...
class TranscriptionService {
  final AudioRecorder _recorder = AudioRecorder();
  String? _path;

  // Valori iniettati a build/run time, mai hardcodati.
  static const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

  Future<void> startRecording() async {
    if (await _recorder.hasPermission()) {
      _path = '/tmp/voiceflow_recording.m4a';
      await _recorder.start(
        const RecordConfig(encoder: AudioEncoder.aacLc),
        path: _path!,
      );
    } else {
      throw Exception('MIC_PERMISSION_DENIED');
    }
  }

  Future<String> stopAndTranscribe({String? language}) async {
    final path = await _recorder.stop();
    final filePath = path ?? _path;
    if (filePath == null) throw Exception('AUDIO_EMPTY');
    final file = File(filePath);
    if (!await file.exists()) throw Exception('AUDIO_EMPTY');

    if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
      throw Exception('SUPABASE_NOT_CONFIGURED');
    }
    final uri = Uri.parse('${supabaseUrl.replaceAll(RegExp(r'/$'), '')}/functions/v1/transcribe-audio');
    final req = http.MultipartRequest('POST', uri)
      ..headers['apikey'] = supabaseAnonKey
      ..headers['Authorization'] = 'Bearer $supabaseAnonKey'
      ..files.add(await http.MultipartFile.fromPath('audio', filePath));
    if (language != null) req.fields['language'] = language;

    final streamed = await req.send().timeout(const Duration(seconds: 30));
    final res = await http.Response.fromStream(streamed);
    if (res.statusCode != 200) throw Exception('UPSTREAM_${res.statusCode}: ${res.body}');
    final match = RegExp(r'"text"\s*:\s*"((?:[^"\\]|\\.)*)"').firstMatch(res.body);
    final text = match?.group(1);
    if (text == null || text.isEmpty) throw Exception('UPSTREAM_EMPTY');
    return text;
  }
}
