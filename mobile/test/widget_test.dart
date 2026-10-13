import 'package:flutter_test/flutter_test.dart';
import 'package:voiceflow_mobile/app.dart';

void main() {
  testWidgets('VoiceFlow app si avvia', (tester) async {
    await tester.pumpWidget(const VoiceFlowApp());
    expect(find.text('VoiceFlow'), findsOneWidget);
  });
}
