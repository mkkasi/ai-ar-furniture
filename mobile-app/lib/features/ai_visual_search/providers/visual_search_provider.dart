import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../models/visual_search_result.dart';

class VisualSearchState {
  final bool isSearching;
  final VisualSearchResult? result;
  final String? errorMessage;

  const VisualSearchState({this.isSearching = false, this.result, this.errorMessage});

  VisualSearchState copyWith({
    bool? isSearching,
    VisualSearchResult? result,
    String? errorMessage,
    bool clearError = false,
    bool clearResult = false,
  }) {
    return VisualSearchState(
      isSearching: isSearching ?? this.isSearching,
      result: clearResult ? null : (result ?? this.result),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

class VisualSearchNotifier extends StateNotifier<VisualSearchState> {
  VisualSearchNotifier() : super(const VisualSearchState());

  /// Uploads a photo of a single furniture/appliance item — seen
  /// elsewhere, e.g. a magazine or a friend's home — and finds visually
  /// and stylistically similar items in the catalog.
  Future<void> searchByPhoto(File photo) async {
    state = state.copyWith(isSearching: true, clearError: true, clearResult: true);
    try {
      final formData = FormData.fromMap({'photo': await MultipartFile.fromFile(photo.path)});
      final response = await DioClient.instance.dio.post(ApiConstants.aiVisualSearch, data: formData);
      final result = VisualSearchResult.fromJson(response.data['data']);
      state = state.copyWith(isSearching: false, result: result);
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Could not search with this photo. Please try again.';
      state = state.copyWith(isSearching: false, errorMessage: message);
    } catch (e) {
      state = state.copyWith(isSearching: false, errorMessage: 'Something went wrong: $e');
    }
  }

  void reset() => state = const VisualSearchState();
}

final visualSearchProvider = StateNotifierProvider<VisualSearchNotifier, VisualSearchState>(
  (ref) => VisualSearchNotifier(),
);
