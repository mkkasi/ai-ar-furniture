import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/hive_service.dart';
import '../models/user_model.dart';

/// Immutable auth state consumed by the UI layer.
class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;
  // Set after a successful password_reset OTP verification; carried
  // through to ResetPasswordScreen so it can authorize the reset call.
  final String? resetToken;

  const AuthState({this.user, this.isLoading = false, this.error, this.resetToken});

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    UserModel? user,
    bool? isLoading,
    String? error,
    bool clearUser = false,
    String? resetToken,
    bool clearResetToken = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      error: error,
      resetToken: clearResetToken ? null : (resetToken ?? this.resetToken),
    );
  }
}

/// Handles registration, OTP verification, login/logout, and profile
/// updates, and keeps a cached user available across app restarts.
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _restoreSession();
  }

  final Dio _dio = DioClient.instance.dio;

  void _restoreSession() {
    final cached = HiveService.instance.getUser();
    if (cached != null) {
      state = state.copyWith(user: UserModel.fromJson(cached));
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _dio.post(ApiConstants.register, data: {
        'name': name,
        'email': email,
        'password': password,
        if (phone != null) 'phone': phone,
      });
      state = state.copyWith(isLoading: false);
      return true;
    } on DioException catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
      return false;
    }
  }

  Future<bool> verifyOtp({required String email, required String otp, required String purpose}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _dio.post(ApiConstants.verifyOtp, data: {
        'email': email,
        'otp': otp,
        'purpose': purpose,
      });
      final token = res.data?['data']?['resetToken'] as String?;
      state = state.copyWith(isLoading: false, resetToken: token);
      return res.statusCode == 200;
    } on DioException catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
      return false;
    }
  }

  /// Requests a fresh OTP be sent, for when the original expired or never
  /// arrived. Same purposes as verifyOtp ('email_verification' | 'password_reset').
  Future<bool> resendOtp({required String email, required String purpose}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _dio.post(ApiConstants.resendOtp, data: {'email': email, 'purpose': purpose});
      state = state.copyWith(isLoading: false);
      return true;
    } on DioException catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
      return false;
    }
  }

  Future<bool> login({required String email, required String password}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _dio.post(ApiConstants.login, data: {'email': email, 'password': password});
      final data = res.data['data'];
      final user = UserModel.fromJson(data['user']);

      await HiveService.instance.saveTokens(
        accessToken: data['accessToken'],
        refreshToken: data['refreshToken'],
      );
      await HiveService.instance.saveUser(user.toJson());

      state = state.copyWith(user: user, isLoading: false);
      return true;
    } on DioException catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
      return false;
    }
  }

  Future<bool> forgotPassword(String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _dio.post(ApiConstants.forgotPassword, data: {'email': email});
      state = state.copyWith(isLoading: false);
      return true;
    } on DioException catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
      return false;
    }
  }

  Future<bool> resetPassword({required String resetToken, required String newPassword}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _dio.post(ApiConstants.resetPassword, data: {
        'resetToken': resetToken,
        'newPassword': newPassword,
      });
      state = state.copyWith(isLoading: false);
      return true;
    } on DioException catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post(ApiConstants.logout);
    } catch (_) {
      // Ignore network errors on logout — we clear local state regardless.
    }
    await HiveService.instance.clearTokens();
    await HiveService.instance.clearUser();
    state = const AuthState();
  }

  Future<bool> updateProfile({String? name, String? phone}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _dio.put(ApiConstants.profile, data: {
        if (name != null) 'name': name,
        if (phone != null) 'phone': phone,
      });
      final user = UserModel.fromJson(res.data['data']['user']);
      await HiveService.instance.saveUser(user.toJson());
      state = state.copyWith(user: user, isLoading: false);
      return true;
    } on DioException catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
      return false;
    }
  }

  String _extractError(DioException e) {
    final message = e.response?.data is Map ? e.response?.data['message'] : null;
    return message ?? e.message ?? 'Something went wrong. Please try again.';
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier());
