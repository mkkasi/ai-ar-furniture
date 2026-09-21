class NotificationModel {
  final String id;
  final String title;
  final String body;
  final String type;
  final bool isRead;
  final DateTime createdAt;

  const NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) => NotificationModel(
        id: json['_id'] ?? json['id'],
        title: json['title'] ?? '',
        body: json['body'] ?? '',
        type: json['type'] ?? 'system',
        isRead: json['isRead'] ?? false,
        createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      );
}
