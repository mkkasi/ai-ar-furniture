import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/utils/error_helper.dart';
import '../providers/notifications_provider.dart';

const _typeIcons = {
  'offer': Icons.local_offer_outlined,
  'new_arrival': Icons.new_releases_outlined,
  'system': Icons.info_outline,
  'order': Icons.local_shipping_outlined,
};

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(notificationsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: notifications.when(
        data: (items) => items.isEmpty
            ? const Center(child: Text('No notifications yet'))
            : ListView.builder(
                itemCount: items.length,
                itemBuilder: (context, i) {
                  final n = items[i];
                  return ListTile(
                    onTap: () {
                      if (!n.isRead) ref.read(notificationsProvider.notifier).markAsRead(n.id);
                    },
                    leading: CircleAvatar(
                      backgroundColor: n.isRead ? Colors.grey.shade200 : Theme.of(context).colorScheme.primaryContainer,
                      child: Icon(_typeIcons[n.type] ?? Icons.notifications_outlined),
                    ),
                    title: Text(n.title, style: TextStyle(fontWeight: n.isRead ? FontWeight.normal : FontWeight.w700)),
                    subtitle: Text(n.body, maxLines: 2, overflow: TextOverflow.ellipsis),
                    trailing: Text(DateFormat.MMMd().format(n.createdAt), style: Theme.of(context).textTheme.bodySmall),
                  );
                },
              ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(friendlyErrorMessage(e))),
      ),
    );
  }
}
