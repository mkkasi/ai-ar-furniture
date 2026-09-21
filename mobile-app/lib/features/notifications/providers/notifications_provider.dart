import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/notification_model.dart';

class NotificationsNotifier extends AsyncNotifier<List<NotificationModel>> {
  @override
  Future<List<NotificationModel>> build() async {
    final res = await DioClient.instance.dio.get(ApiConstants.notifications);
    final list = res.data['data'] as List;
    return list.map((e) => NotificationModel.fromJson(e)).toList();
  }

  Future<void> markAsRead(String id) async {
    await DioClient.instance.dio.put('${ApiConstants.notifications}/$id/read');
    final current = state.value ?? [];
    state = AsyncData([
      for (final n in current)
        if (n.id == id)
          NotificationModel(id: n.id, title: n.title, body: n.body, type: n.type, isRead: true, createdAt: n.createdAt)
        else
          n,
    ]);
  }
}

final notificationsProvider = AsyncNotifierProvider<NotificationsNotifier, List<NotificationModel>>(NotificationsNotifier.new);
