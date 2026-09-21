import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/storage/hive_service.dart';

/// Drives the app's ThemeMode based on the user's stored preference.
class ThemeModeNotifier extends StateNotifier<bool> {
  ThemeModeNotifier() : super(HiveService.instance.isDarkMode);

  Future<void> toggle(bool isDark) async {
    state = isDark;
    await HiveService.instance.setDarkMode(isDark);
  }
}

final darkModeProvider = StateNotifierProvider<ThemeModeNotifier, bool>((ref) => ThemeModeNotifier());

class LanguageNotifier extends StateNotifier<String> {
  LanguageNotifier() : super(HiveService.instance.language);

  Future<void> setLanguage(String lang) async {
    state = lang;
    await HiveService.instance.setLanguage(lang);
  }
}

final languageProvider = StateNotifierProvider<LanguageNotifier, String>((ref) => LanguageNotifier());
