class FurnitureColor {
  final String name;
  final String hexCode;
  const FurnitureColor({required this.name, required this.hexCode});

  factory FurnitureColor.fromJson(Map<String, dynamic> json) =>
      FurnitureColor(name: json['name'] ?? '', hexCode: json['hexCode'] ?? '#000000');
}

/// A free-form technical spec row, e.g. {key: 'Screen Size', value: '55 inch'}.
/// Used primarily by appliance items (TVs, ACs) which don't fit the
/// materials/colors fields furniture items use.
class SpecificationItem {
  final String key;
  final String value;
  const SpecificationItem({required this.key, required this.value});

  factory SpecificationItem.fromJson(Map<String, dynamic> json) =>
      SpecificationItem(key: json['key'] ?? '', value: json['value'] ?? '');
}

class FurnitureDimensions {
  final double widthCm;
  final double heightCm;
  final double depthCm;
  const FurnitureDimensions({required this.widthCm, required this.heightCm, required this.depthCm});

  factory FurnitureDimensions.fromJson(Map<String, dynamic> json) => FurnitureDimensions(
        widthCm: (json['widthCm'] ?? 0).toDouble(),
        heightCm: (json['heightCm'] ?? 0).toDouble(),
        depthCm: (json['depthCm'] ?? 0).toDouble(),
      );
}

class FurnitureModel {
  final String id;
  final String name;
  final String description;
  final String? categoryId;
  final String? categoryName;
  // 'furniture' or 'appliance' - see SpecificationItem doc comment above.
  final String itemType;
  final List<String> imageUrls;
  final String? model3DUrl;
  final FurnitureDimensions dimensions;
  final List<String> materials;
  final List<FurnitureColor> colors;
  final List<SpecificationItem> specifications;
  final String? voltage;
  final int? powerConsumptionWatts;
  final String? energyRating;
  final List<String> roomTypes;
  final double ratingsAverage;
  final int ratingsCount;
  final bool isAvailable;
  final bool isTrending;
  final bool isFeatured;

  const FurnitureModel({
    required this.id,
    required this.name,
    required this.description,
    this.categoryId,
    this.categoryName,
    this.itemType = 'furniture',
    this.imageUrls = const [],
    this.model3DUrl,
    required this.dimensions,
    this.materials = const [],
    this.colors = const [],
    this.specifications = const [],
    this.voltage,
    this.powerConsumptionWatts,
    this.energyRating,
    this.roomTypes = const [],
    this.ratingsAverage = 0,
    this.ratingsCount = 0,
    this.isAvailable = true,
    this.isTrending = false,
    this.isFeatured = false,
  });

  factory FurnitureModel.fromJson(Map<String, dynamic> json) {
    final category = json['category'];
    return FurnitureModel(
      id: json['_id'] ?? json['id'],
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      categoryId: category is Map ? category['_id'] : category,
      categoryName: category is Map ? category['name'] : null,
      itemType: json['itemType'] ?? 'furniture',
      imageUrls: (json['images'] as List? ?? []).map((e) => e['url'] as String).toList(),
      model3DUrl: json['model3D'] is Map ? json['model3D']['url'] : null,
      dimensions: FurnitureDimensions.fromJson(json['dimensions'] ?? {}),
      materials: List<String>.from(json['materials'] ?? []),
      colors: (json['colors'] as List? ?? []).map((e) => FurnitureColor.fromJson(e)).toList(),
      specifications: (json['specifications'] as List? ?? []).map((e) => SpecificationItem.fromJson(e)).toList(),
      voltage: json['voltage'],
      powerConsumptionWatts: json['powerConsumptionWatts'],
      energyRating: json['energyRating'],
      roomTypes: List<String>.from(json['roomTypes'] ?? []),
      ratingsAverage: (json['ratingsAverage'] ?? 0).toDouble(),
      ratingsCount: json['ratingsCount'] ?? 0,
      isAvailable: json['isAvailable'] ?? true,
      isTrending: json['isTrending'] ?? false,
      isFeatured: json['isFeatured'] ?? false,
    );
  }

  bool get isAppliance => itemType == 'appliance';
}
