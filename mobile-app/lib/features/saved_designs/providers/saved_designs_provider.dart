import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/saved_design_model.dart';

final savedDesignsProvider = FutureProvider.autoDispose<List<SavedDesignModel>>((ref) async {
  final res = await DioClient.instance.dio.get(ApiConstants.savedDesigns);
  final list = res.data['data'] as List;
  return list.map((e) => SavedDesignModel.fromJson(e)).toList();
});

final designDetailProvider = FutureProvider.family.autoDispose<Map<String, dynamic>, String>((ref, id) async {
  final res = await DioClient.instance.dio.get('${ApiConstants.savedDesigns}/$id');
  return res.data['data'] as Map<String, dynamic>;
});

class SavedDesignsActions {
  final Ref ref;
  SavedDesignsActions(this.ref);

  Future<void> rename(String id, String newName) async {
    await DioClient.instance.dio.put('${ApiConstants.savedDesigns}/$id', data: {'name': newName});
    ref.invalidate(savedDesignsProvider);
  }

  Future<void> delete(String id) async {
    await DioClient.instance.dio.delete('${ApiConstants.savedDesigns}/$id');
    ref.invalidate(savedDesignsProvider);
  }

  Future<String> share(String id) async {
    final res = await DioClient.instance.dio.post('${ApiConstants.savedDesigns}/$id/share');
    return res.data['data']['shareToken'] as String;
  }
}

final savedDesignsActionsProvider = Provider((ref) => SavedDesignsActions(ref));
