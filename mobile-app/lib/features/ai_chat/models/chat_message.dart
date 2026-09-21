class ChatMessage {
  final String role; // 'user' | 'assistant'
  final String content;
  final List<String> suggestedCategories;
  final DateTime? createdAt;

  const ChatMessage({
    required this.role,
    required this.content,
    this.suggestedCategories = const [],
    this.createdAt,
  });

  bool get isUser => role == 'user';

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
        role: json['role'] ?? 'assistant',
        content: json['content'] ?? '',
        suggestedCategories: List<String>.from(json['suggestedCategories'] ?? []),
        createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      );
}
