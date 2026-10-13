import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'theme.dart';

class VoiceFlowApp extends StatelessWidget {
  const VoiceFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VoiceFlow',
      theme: buildLightTheme(),
      darkTheme: buildDarkTheme(),
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
    );
  }
}
