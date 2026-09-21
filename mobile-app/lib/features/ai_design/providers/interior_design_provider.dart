import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../models/room_design_result.dart';

class InteriorDesignState {
  final bool isAnalyzing;
  final RoomDesignResult? result;
  final String? errorMessage;

  const InteriorDesignState({this.isAnalyzing = false, this.result, this.errorMessage});

  InteriorDesignState copyWith({
    bool? isAnalyzing,
    RoomDesignResult? result,
    String? errorMessage,
    bool clearError = false,
    bool clearResult = false,
  }) {
    return InteriorDesignState(
      isAnalyzing: isAnalyzing ?? this.isAnalyzing,
      result: clearResult ? null : (result ?? this.result),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

class InteriorDesignNotifier extends StateNotifier<InteriorDesignState> {
  InteriorDesignNotifier() : super(const InteriorDesignState());

  /// Uploads [roomPhoto] to the backend, which analyzes it with Gemini
  /// vision and returns a style/palette/layout breakdown plus matching
  /// furniture AND appliance (TV/AC) catalog recommendations.
  Future<void> analyzeRoom(File roomPhoto, {String? roomType, double? budget}) async {
    state = state.copyWith(isAnalyzing: true, clearError: true, clearResult: true);
    try {
      final formData = FormData.fromMap({
        'roomPhoto': await MultipartFile.fromFile(roomPhoto.path),
        if (roomType != null) 'roomType': roomType,
        if (budget != null) 'budget': budget,
      });

      final response = await DioClient.instance.dio.post(ApiConstants.aiInteriorDesign, data: formData);
      final result = RoomDesignResult.fromJson(response.data['data']);
      state = state.copyWith(isAnalyzing: false, result: result);
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Could not analyze this room photo. Please try again.';
      state = state.copyWith(isAnalyzing: false, errorMessage: message);
    } catch (e) {
      state = state.copyWith(isAnalyzing: false, errorMessage: 'Something went wrong: $e');
    }
  }

  void reset() => state = const InteriorDesignState();
}

final interiorDesignProvider = StateNotifierProvider<InteriorDesignNotifier, InteriorDesignState>(
  (ref) => InteriorDesignNotifier(),
);
