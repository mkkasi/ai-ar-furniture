import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';

/// Wraps Hive (fast local cache/preferences) and FlutterSecureStorage
/// (encrypted token storage) behind one convenient service.
class HiveService {
  HiveService._();
  static final HiveService instance = HiveService._();

  static const _secureStorage = FlutterSecureStorage();

  late Box _userBox;
  late Box _settingsBox;
  late Box _cacheBox;

  Future<void> init() async {
    await Hive.initFlutter();
    _userBox = await Hive.openBox(AppConstants.userBoxName);
    _settingsBox = await Hive.openBox(AppConstants.settingsBoxName);
    _cacheBox = await Hive.openBox(AppConstants.cacheBoxName);
  }

  // ---- Secure token storage ----
  Future<void> saveTokens({required String accessToken, required String refreshToken}) async {
    await _secureStorage.write(key: AppConstants.accessTokenKey, value: accessToken);
    await _secureStorage.write(key: AppConstants.refreshTokenKey, value: refreshToken);
  }

  Future<String?> getAccessToken() => _secureStorage.read(key: AppConstants.accessTokenKey);
  Future<String?> getRefreshToken() => _secureStorage.read(key: AppConstants.refreshTokenKey);

  Future<void> clearTokens() async {
    await _secureStorage.delete(key: AppConstants.accessTokenKey);
    await _secureStorage.delete(key: AppConstants.refreshTokenKey);
  }

  // ---- User profile cache (as JSON map) ----
  Future<void> saveUser(Map<String, dynamic> user) =>
      _userBox.put(AppConstants.currentUserKey, user);

  Map<String, dynamic>? getUser() {
    final raw = _userBox.get(AppConstants.currentUserKey);
    return raw == null ? null : Map<String, dynamic>.from(raw);
  }

  Future<void> clearUser() => _userBox.delete(AppConstants.currentUserKey);

  // ---- Settings ----
  bool get onboardingSeen => _settingsBox.get(AppConstants.onboardingSeenKey, defaultValue: false);
  Future<void> setOnboardingSeen(bool value) => _settingsBox.put(AppConstants.onboardingSeenKey, value);

  bool get isDarkMode => _settingsBox.get(AppConstants.darkModeKey, defaultValue: false);
  Future<void> setDarkMode(bool value) => _settingsBox.put(AppConstants.darkModeKey, value);

  String get language => _settingsBox.get(AppConstants.languageKey, defaultValue: 'en');
  Future<void> setLanguage(String value) => _settingsBox.put(AppConstants.languageKey, value);

  // ---- Offline furniture cache ----
  Future<void> cacheFurnitureList(String key, List<dynamic> items) => _cacheBox.put(key, items);
  List<dynamic>? getCachedFurnitureList(String key) => _cacheBox.get(key);
}
