import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/furniture_model.dart';
import '../models/category_model.dart';

/// Fetches active categories for the home screen chips/grid.
final categoriesProvider = FutureProvider<List<CategoryModel>>((ref) async {
  final res = await DioClient.instance.dio.get(ApiConstants.categories);
  final list = res.data['data'] as List;
  return list.map((e) => CategoryModel.fromJson(e)).toList();
});

/// Trending furniture for the home screen carousel.
final trendingFurnitureProvider = FutureProvider<List<FurnitureModel>>((ref) async {
  final res = await DioClient.instance.dio.get(ApiConstants.furniture, queryParameters: {'trending': 'true', 'limit': 10});
  final list = res.data['data'] as List;
  return list.map((e) => FurnitureModel.fromJson(e)).toList();
});

/// Recommended (featured) furniture for the home screen.
final recommendedFurnitureProvider = FutureProvider<List<FurnitureModel>>((ref) async {
  final res = await DioClient.instance.dio.get(ApiConstants.furniture, queryParameters: {'featured': 'true', 'limit': 10});
  final list = res.data['data'] as List;
  return list.map((e) => FurnitureModel.fromJson(e)).toList();
});

/// Recently viewed furniture for the logged-in user.
final recentlyViewedProvider = FutureProvider<List<FurnitureModel>>((ref) async {
  final res = await DioClient.instance.dio.get(ApiConstants.recentlyViewed);
  final list = res.data['data'] as List;
  return list.map((e) => FurnitureModel.fromJson(e)).toList();
});

/// Search/filter state driving the search screen's query.
class FurnitureFilter {
  final String? query;
  final String? categoryId;
  final List<String> colors;
  final List<String> materials;
  final String? roomType;
  final String sort;

  const FurnitureFilter({
    this.query,
    this.categoryId,
    this.colors = const [],
    this.materials = const [],
    this.roomType,
    this.sort = '-createdAt',
  });

  FurnitureFilter copyWith({
    String? query,
    String? categoryId,
    List<String>? colors,
    List<String>? materials,
    String? roomType,
    String? sort,
  }) {
    return FurnitureFilter(
      query: query ?? this.query,
      categoryId: categoryId ?? this.categoryId,
      colors: colors ?? this.colors,
      materials: materials ?? this.materials,
      roomType: roomType ?? this.roomType,
      sort: sort ?? this.sort,
    );
  }

  Map<String, dynamic> toQuery() => {
        if (query != null && query!.isNotEmpty) 'q': query,
        if (categoryId != null) 'category': categoryId,
        if (colors.isNotEmpty) 'colors': colors.join(','),
        if (materials.isNotEmpty) 'materials': materials.join(','),
        if (roomType != null) 'roomType': roomType,
        'sort': sort,
      };
}

final furnitureFilterProvider = StateProvider<FurnitureFilter>((ref) => const FurnitureFilter());

/// Search results driven by [furnitureFilterProvider].
final searchResultsProvider = FutureProvider<List<FurnitureModel>>((ref) async {
  final filter = ref.watch(furnitureFilterProvider);
  final res = await DioClient.instance.dio.get(ApiConstants.furniture, queryParameters: filter.toQuery());
  final list = res.data['data'] as List;
  return list.map((e) => FurnitureModel.fromJson(e)).toList();
});
