import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Centralized Material 3 theme definitions for light and dark mode.
class AppColors {
  AppColors._();

  static const Color primary = Color(0xFF2E5945); // deep sage green
  static const Color secondary = Color(0xFFC9A876); // warm oak accent
  static const Color error = Color(0xFFBA1A1A);

  static const Color lightBackground = Color(0xFFFBFAF7);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color darkBackground = Color(0xFF14181B);
  static const Color darkSurface = Color(0xFF1E2327);
}

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        secondary: AppColors.secondary,
        brightness: Brightness.light,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: AppColors.lightBackground,
    );
    return _applyShared(base);
  }

  static ThemeData get darkTheme {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        secondary: AppColors.secondary,
        brightness: Brightness.dark,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: AppColors.darkBackground,
    );
    return _applyShared(base);
  }

  static ThemeData _applyShared(ThemeData base) {
    final textTheme = GoogleFonts.interTextTheme(base.textTheme);
    return base.copyWith(
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: base.scaffoldBackgroundColor,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
        iconTheme: IconThemeData(color: base.colorScheme.onSurface),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: base.colorScheme.surfaceContainerLow,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        margin: EdgeInsets.zero,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: base.colorScheme.primary,
          foregroundColor: base.colorScheme.onPrimary,
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          side: BorderSide(color: base.colorScheme.outlineVariant),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: base.colorScheme.surfaceContainerLow,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: base.colorScheme.primary, width: 1.5),
        ),
      ),
      chipTheme: base.chipTheme.copyWith(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        side: BorderSide.none,
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: base.colorScheme.surface,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
