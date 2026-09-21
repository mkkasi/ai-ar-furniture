/// Central place for API base URLs and endpoint paths.
/// Values are read from --dart-define or fall back to local dev defaults.
class ApiConstants {
  ApiConstants._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:5000/api', // Android emulator -> localhost
  );

  // Auth
  static const String register = '/auth/register';
  static const String verifyOtp = '/auth/verify-otp';
  static const String resendOtp = '/auth/resend-otp';
  static const String login = '/auth/login';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String refreshToken = '/auth/refresh-token';
  static const String profile = '/auth/profile';
  static const String changePassword = '/auth/change-password';
  static const String logout = '/auth/logout';

  // Furniture
  static const String furniture = '/furniture';
  static const String recentlyViewed = '/furniture/recently-viewed';

  // Categories
  static const String categories = '/categories';

  // Favorites
  static const String favorites = '/favorites';

  // Saved designs
  static const String savedDesigns = '/saved-designs';

  // Notifications
  static const String notifications = '/notifications';

  // AI
  static const String aiRecommendations = '/ai/recommendations';
  static String aiMatch(String furnitureId) => '/ai/match/$furnitureId';
  static const String aiInteriorDesign = '/ai/interior-design';
  static const String aiVisualSearch = '/ai/visual-search';
  static const String aiChat = '/ai/chat';
  static const String aiChatHistory = '/ai/chat/history';

  static const int connectTimeoutMs = 15000;
  static const int receiveTimeoutMs = 15000;
}
