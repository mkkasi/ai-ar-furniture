class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String? icon;
  final String? imageUrl;
  // 'furniture' or 'appliance' - lets the UI group category chips/tabs.
  final String productType;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.icon,
    this.imageUrl,
    this.productType = 'furniture',
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) => CategoryModel(
        id: json['_id'] ?? json['id'],
        name: json['name'] ?? '',
        slug: json['slug'] ?? '',
        icon: json['icon'],
        imageUrl: json['image'] is Map ? json['image']['url'] : null,
        productType: json['productType'] ?? 'furniture',
      );
}
