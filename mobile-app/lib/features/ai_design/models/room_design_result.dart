import '../../home/models/furniture_model.dart';

class RoomDesignInsights {
  final String? detectedRoomType;
  final String? detectedStyle;
  final List<String> colorPalette;
  final List<String> layoutTips;
  final int? suggestedTvSizeInches;
  final int? suggestedAcBtu;
  final String? reasoning;

  const RoomDesignInsights({
    this.detectedRoomType,
    this.detectedStyle,
    this.colorPalette = const [],
    this.layoutTips = const [],
    this.suggestedTvSizeInches,
    this.suggestedAcBtu,
    this.reasoning,
  });

  factory RoomDesignInsights.fromJson(Map<String, dynamic> json) => RoomDesignInsights(
        detectedRoomType: json['detectedRoomType'],
        detectedStyle: json['detectedStyle'],
        colorPalette: List<String>.from(json['colorPalette'] ?? []),
        layoutTips: List<String>.from(json['layoutTips'] ?? []),
        suggestedTvSizeInches: json['suggestedTvSizeInches'],
        suggestedAcBtu: json['suggestedAcBtu'],
        reasoning: json['reasoning'],
      );
}

class RoomDesignResult {
  final String roomPhotoUrl;
  final RoomDesignInsights insights;
  final List<FurnitureModel> recommendedFurniture;
  final List<FurnitureModel> recommendedAppliances;

  const RoomDesignResult({
    required this.roomPhotoUrl,
    required this.insights,
    required this.recommendedFurniture,
    required this.recommendedAppliances,
  });

  factory RoomDesignResult.fromJson(Map<String, dynamic> json) => RoomDesignResult(
        roomPhotoUrl: json['roomPhotoUrl'] ?? '',
        insights: RoomDesignInsights.fromJson(json['aiInsights'] ?? {}),
        recommendedFurniture: (json['recommendedFurniture'] as List? ?? [])
            .map((e) => FurnitureModel.fromJson(e))
            .toList(),
        recommendedAppliances: (json['recommendedAppliances'] as List? ?? [])
            .map((e) => FurnitureModel.fromJson(e))
            .toList(),
      );
}
