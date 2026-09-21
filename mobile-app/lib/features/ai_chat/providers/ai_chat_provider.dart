import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../home/models/furniture_model.dart';
import '../models/chat_message.dart';

class AiChatState {
  final List<ChatMessage> messages;
  final List<FurnitureModel> suggestedItems;
  final bool isSending;
  final bool isLoadingHistory;
  final String? errorMessage;

  const AiChatState({
    this.messages = const [],
    this.suggestedItems = const [],
    this.isSending = false,
    this.isLoadingHistory = false,
    this.errorMessage,
  });

  AiChatState copyWith({
    List<ChatMessage>? messages,
    List<FurnitureModel>? suggestedItems,
    bool? isSending,
    bool? isLoadingHistory,
    String? errorMessage,
    bool clearError = false,
  }) {
    return AiChatState(
      messages: messages ?? this.messages,
      suggestedItems: suggestedItems ?? this.suggestedItems,
      isSending: isSending ?? this.isSending,
      isLoadingHistory: isLoadingHistory ?? this.isLoadingHistory,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

/// Conversational AI shopping assistant — ask about furniture/appliance
/// choices in plain language and get catalog-aware recommendations, with
/// history persisted server-side across sessions.
class AiChatNotifier extends StateNotifier<AiChatState> {
  AiChatNotifier() : super(const AiChatState()) {
    loadHistory();
  }

  Future<void> loadHistory() async {
    state = state.copyWith(isLoadingHistory: true);
    try {
      final response = await DioClient.instance.dio.get(ApiConstants.aiChatHistory);
      final messages = (response.data['data'] as List? ?? []).map((e) => ChatMessage.fromJson(e)).toList();
      state = state.copyWith(messages: messages, isLoadingHistory: false);
    } catch (e) {
      state = state.copyWith(isLoadingHistory: false);
    }
  }

  Future<void> send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || state.isSending) return;

    state = state.copyWith(
      messages: [...state.messages, ChatMessage(role: 'user', content: trimmed)],
      isSending: true,
      clearError: true,
    );

    try {
      final response = await DioClient.instance.dio.post(ApiConstants.aiChat, data: {'message': trimmed});
      final data = response.data['data'];
      final reply = ChatMessage(
        role: 'assistant',
        content: data['reply'] ?? '',
        suggestedCategories: List<String>.from(data['suggestedCategories'] ?? []),
      );
      final suggestedItems =
          (data['suggestedItems'] as List? ?? []).map((e) => FurnitureModel.fromJson(e)).toList();

      state = state.copyWith(
        messages: [...state.messages, reply],
        suggestedItems: suggestedItems,
        isSending: false,
      );
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? "Couldn't reach the assistant. Please try again.";
      state = state.copyWith(isSending: false, errorMessage: message);
    } catch (e) {
      state = state.copyWith(isSending: false, errorMessage: 'Something went wrong: $e');
    }
  }

  Future<void> clearHistory() async {
    try {
      await DioClient.instance.dio.delete(ApiConstants.aiChatHistory);
    } catch (_) {
      // Non-fatal — clear the local view regardless so the UI stays responsive.
    }
    state = const AiChatState();
  }
}

final aiChatProvider = StateNotifierProvider<AiChatNotifier, AiChatState>((ref) => AiChatNotifier());
