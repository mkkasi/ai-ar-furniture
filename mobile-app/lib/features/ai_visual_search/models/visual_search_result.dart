import '../../home/models/furniture_model.dart';

class VisualSearchInsights {
  final String? itemType;
  final String? primaryType;
  final String? style;
  final List<String> materials;
  final List<String> colors;
  final String? reasoning;

  const VisualSearchInsights({
    this.itemType,
    this.primaryType,
    this.style,
    this.materials = const [],
    this.colors = const [],
    this.reasoning,
  });

  factory VisualSearchInsights.fromJson(Map<String, dynamic> json) => VisualSearchInsights(
        itemType: json['itemType'],
        primaryType: json['primaryType'],
        style: json['style'],
        materials: List<String>.from(json['materials'] ?? []),
        colors: List<String>.from(json['colors'] ?? []),
        reasoning: json['reasoning'],
      );
}

class VisualSearchResult {
  final String photoUrl;
  final VisualSearchInsights insights;
  final List<FurnitureModel> matches;

  const VisualSearchResult({required this.photoUrl, required this.insights, required this.matches});

  factory VisualSearchResult.fromJson(Map<String, dynamic> json) => VisualSearchResult(
        photoUrl: json['photoUrl'] ?? '',
        insights: VisualSearchInsights.fromJson(json['aiInsights'] ?? {}),
        matches: (json['matches'] as List? ?? []).map((e) => FurnitureModel.fromJson(e)).toList(),
      );
}
