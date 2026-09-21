import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'core/storage/hive_service.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'features/settings/providers/settings_provider.dart';

Future<void> _backgroundMessageHandler(RemoteMessage message) async {
  // Handles push notifications received while the app is terminated/backgrounded.
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await dotenv.load(fileName: '.env', mergeWith: const {});
  await HiveService.instance.init();

  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_backgroundMessageHandler);
  } catch (_) {
    // Firebase is optional for local development without google-services.json
  }

  runApp(const ProviderScope(child: ArFurnitureStudioApp()));
}

class ArFurnitureStudioApp extends ConsumerWidget {
  const ArFurnitureStudioApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final isDark = ref.watch(darkModeProvider);

    return MaterialApp.router(
      title: 'AR Furniture Studio',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
      routerConfig: router,
    );
  }
}
