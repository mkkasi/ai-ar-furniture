import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ar_furniture_studio/core/theme/app_theme.dart';

void main() {
  testWidgets('AppTheme builds valid light and dark ThemeData', (tester) async {
    expect(AppTheme.lightTheme.brightness, Brightness.light);
    expect(AppTheme.darkTheme.brightness, Brightness.dark);
  });

  testWidgets('Basic MaterialApp smoke test renders without throwing', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          theme: AppTheme.lightTheme,
          home: const Scaffold(body: Center(child: Text('AR Furniture Studio'))),
        ),
      ),
    );
    expect(find.text('AR Furniture Studio'), findsOneWidget);
  });
}
