import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/utils/error_helper.dart';
import '../providers/saved_designs_provider.dart';

class SavedDesignsScreen extends ConsumerWidget {
  const SavedDesignsScreen({super.key});

  Future<void> _showRenameDialog(BuildContext context, WidgetRef ref, String id, String currentName) async {
    final ctrl = TextEditingController(text: currentName);
    final newName = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Rename Design'),
        content: TextField(controller: ctrl, autofocus: true),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(context, ctrl.text), child: const Text('Save')),
        ],
      ),
    );
    if (newName != null && newName.trim().isNotEmpty) {
      await ref.read(savedDesignsActionsProvider).rename(id, newName.trim());
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final designs = ref.watch(savedDesignsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Saved Designs')),
      body: designs.when(
        data: (items) => items.isEmpty
            ? const Center(child: Text('No saved designs yet. Save a layout from the AR view!'))
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) {
                  final d = items[i];
                  return Card(
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(10),
                      onTap: () => context.push('/design/${d.id}'),
                      leading: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: SizedBox(
                          width: 64,
                          height: 64,
                          child: d.screenshotUrl != null
                              ? CachedNetworkImage(imageUrl: d.screenshotUrl!, fit: BoxFit.cover)
                              : Container(color: Colors.grey.shade200, child: const Icon(Icons.view_in_ar_outlined)),
                        ),
                      ),
                      title: Text(d.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                      subtitle: Text('${d.itemCount} item(s) • ${d.roomType.replaceAll('_', ' ')}'),
                      trailing: PopupMenuButton<String>(
                        onSelected: (action) async {
                          switch (action) {
                            case 'rename':
                              await _showRenameDialog(context, ref, d.id, d.name);
                              break;
                            case 'share':
                              final token = await ref.read(savedDesignsActionsProvider).share(d.id);
                              await Share.share('Check out my room design: $token');
                              break;
                            case 'delete':
                              await ref.read(savedDesignsActionsProvider).delete(d.id);
                              break;
                          }
                        },
                        itemBuilder: (context) => const [
                          PopupMenuItem(value: 'rename', child: Text('Rename')),
                          PopupMenuItem(value: 'share', child: Text('Share')),
                          PopupMenuItem(value: 'delete', child: Text('Delete')),
                        ],
                      ),
                    ),
                  );
                },
              ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(friendlyErrorMessage(e))),
      ),
    );
  }
}
