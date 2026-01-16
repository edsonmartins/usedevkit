import 'package:devkit_sdk/devkit_sdk.dart';
import 'package:test/test.dart';

void main() {
  group('DevKitClient', () {
    test('requires apiKey', () {
      expect(() => DevKitClient(apiKey: ''), throwsArgumentError);
    });

    test('cache size starts at zero', () {
      final client = DevKitClient(apiKey: 'test-key');
      expect(client.cacheSize, equals(0));
    });
  });
}
