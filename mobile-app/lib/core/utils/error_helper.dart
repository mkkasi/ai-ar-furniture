import 'package:dio/dio.dart';

/// Extracts a human-readable message from any error thrown by a Dio call.
///
/// Without this, screens were showing the raw DioException.toString() to
/// users - a multi-line stack-trace-like dump (status code, MDN link,
/// generic troubleshooting text) instead of the actual reason the request
/// failed. This pulls the backend's own `message` field out of the JSON
/// error body when present, and otherwise falls back to a short, clear
/// message per HTTP status code.
String friendlyErrorMessage(Object error) {
  if (error is DioException) {
    final serverMessage = error.response?.data is Map ? error.response?.data['message'] as String? : null;
    if (serverMessage != null && serverMessage.trim().isNotEmpty) {
      return serverMessage;
    }

    switch (error.response?.statusCode) {
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return "You don't have permission to do that.";
      case 404:
        return 'Not found.';
      case 429:
        return 'Too many requests - please wait a moment and try again.';
      case null:
        return 'Could not connect to the server. Check your internet connection.';
      default:
        return 'Something went wrong (error ${error.response?.statusCode}). Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}
