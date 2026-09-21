import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import '../constants/api_constants.dart';
import '../storage/hive_service.dart';

/// Configures a single shared Dio instance with base URL, timeouts,
/// an auth-token interceptor, and automatic access-token refresh on 401.
class DioClient {
  DioClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(milliseconds: ApiConstants.connectTimeoutMs),
        receiveTimeout: const Duration(milliseconds: ApiConstants.receiveTimeoutMs),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await HiveService.instance.getAccessToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401 && !_isAuthEndpoint(error.requestOptions.path)) {
            final refreshed = await _tryRefreshToken();
            if (refreshed) {
              final clonedRequest = await _retry(error.requestOptions);
              return handler.resolve(clonedRequest);
            }
          }
          handler.next(error);
        },
      ),
    );

    _dio.interceptors.add(
      PrettyDioLogger(
        requestHeader: false,
        requestBody: true,
        responseBody: true,
        compact: true,
      ),
    );
  }

  static final DioClient instance = DioClient._internal();
  late final Dio _dio;

  Dio get dio => _dio;

  bool _isAuthEndpoint(String path) =>
      path.contains('/auth/login') || path.contains('/auth/register') || path.contains('/auth/refresh-token');

  Future<bool> _tryRefreshToken() async {
    final refreshToken = await HiveService.instance.getRefreshToken();
    if (refreshToken == null) return false;

    try {
      final response = await Dio(BaseOptions(baseUrl: ApiConstants.baseUrl)).post(
        ApiConstants.refreshToken,
        data: {'refreshToken': refreshToken},
      );
      final newAccessToken = response.data['data']['accessToken'] as String;
      await HiveService.instance.saveTokens(accessToken: newAccessToken, refreshToken: refreshToken);
      return true;
    } catch (_) {
      await HiveService.instance.clearTokens();
      return false;
    }
  }

  Future<Response<dynamic>> _retry(RequestOptions requestOptions) async {
    final token = await HiveService.instance.getAccessToken();
    final options = Options(method: requestOptions.method, headers: {
      ...requestOptions.headers,
      'Authorization': 'Bearer $token',
    });
    return _dio.request<dynamic>(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }
}
