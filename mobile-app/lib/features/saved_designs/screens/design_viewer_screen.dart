import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/saved_designs_provider.dart';

/// Read-only viewer for a previously saved AR design: shows the saved
/// screenshot plus the list of furniture items placed in that layout.
class DesignViewerScreen extends ConsumerWidget {
  final String designId;
  const DesignViewerScreen({super.key, required this.designId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final design = ref.watch(designDetailProvider(designId));

    return Scaffold(
      appBar: AppBar(title: const Text('Design')),
      body: design.when(
        data: (data) {
          final screenshotUrl = data['screenshot']?['url'] as String?;
          final placedItems = (data['placedItems'] as List? ?? []);
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (screenshotUrl != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: CachedNetworkImage(imageUrl: screenshotUrl, fit: BoxFit.cover, height: 260, width: double.infinity),
                ),
              const SizedBox(height: 20),
              Text('${data['name']}', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              Text('Placed items', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              ...placedItems.map((item) {
                final furniture = item['furniture'];
                final name = furniture is Map ? furniture['name'] : 'Furniture item';
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.chair_outlined),
                  title: Text(name ?? 'Furniture item'),
                );
              }),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load design: $e')),
      ),
    );
  }
}
