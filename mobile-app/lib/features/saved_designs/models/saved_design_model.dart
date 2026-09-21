class SavedDesignModel {
  final String id;
  final String name;
  final String roomType;
  final String? screenshotUrl;
  final int itemCount;
  final DateTime createdAt;

  const SavedDesignModel({
    required this.id,
    required this.name,
    required this.roomType,
    this.screenshotUrl,
    required this.itemCount,
    required this.createdAt,
  });

  factory SavedDesignModel.fromJson(Map<String, dynamic> json) => SavedDesignModel(
        id: json['_id'] ?? json['id'],
        name: json['name'] ?? 'Untitled design',
        roomType: json['roomType'] ?? 'living_room',
        screenshotUrl: json['screenshot'] is Map ? json['screenshot']['url'] : null,
        itemCount: (json['placedItems'] as List? ?? []).length,
        createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      );
}
