import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../home/models/furniture_model.dart';

/// Loads and mutates the current user's favorites (wishlist), keeping
/// local state in sync with the backend after add/remove actions.
class FavoritesNotifier extends AsyncNotifier<List<FurnitureModel>> {
  @override
  Future<List<FurnitureModel>> build() async {
    final res = await DioClient.instance.dio.get(ApiConstants.favorites);
    final list = res.data['data'] as List;
    return list.map((e) => FurnitureModel.fromJson(e)).toList();
  }

  Future<void> toggle(String furnitureId) async {
    final current = state.value ?? [];
    final isFavorite = current.any((f) => f.id == furnitureId);

    if (isFavorite) {
      state = AsyncData(current.where((f) => f.id != furnitureId).toList());
      try {
        await DioClient.instance.dio.delete('${ApiConstants.favorites}/$furnitureId');
      } catch (_) {
        ref.invalidateSelf();
      }
    } else {
      try {
        await DioClient.instance.dio.post(ApiConstants.favorites, data: {'furnitureId': furnitureId});
        ref.invalidateSelf();
      } catch (_) {
        // Ignore — UI will simply not reflect the optimistic add
      }
    }
  }
}

final favoritesProvider = AsyncNotifierProvider<FavoritesNotifier, List<FurnitureModel>>(FavoritesNotifier.new);
