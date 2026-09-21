/// App-wide constant values (Hive box names, storage keys, etc).
class AppConstants {
  AppConstants._();

  static const String appName = 'AR Furniture Studio';

  // Hive boxes
  static const String userBoxName = 'user_box';
  static const String settingsBoxName = 'settings_box';
  static const String cacheBoxName = 'furniture_cache_box';

  // Secure storage keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';

  // Hive keys
  static const String currentUserKey = 'current_user';
  static const String onboardingSeenKey = 'onboarding_seen';
  static const String darkModeKey = 'dark_mode';
  static const String languageKey = 'language';

  static const List<String> roomTypes = [
    'living_room',
    'bedroom',
    'kitchen',
    'dining',
    'office',
    'outdoor',
  ];
}
