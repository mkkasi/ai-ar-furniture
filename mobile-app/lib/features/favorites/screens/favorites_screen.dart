import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/favorites_provider.dart';
import '../../home/widgets/furniture_card.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favorites = ref.watch(favoritesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Favorites')),
      body: favorites.when(
        data: (items) => items.isEmpty
            ? const Center(child: Text('No favorites yet. Tap the heart on any item to save it here.'))
            : GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2, mainAxisSpacing: 14, crossAxisSpacing: 14, childAspectRatio: 0.68),
                itemCount: items.length,
                itemBuilder: (context, i) => FurnitureCard(
                  item: items[i],
                  isFavorite: true,
                  onFavoriteToggle: () => ref.read(favoritesProvider.notifier).toggle(items[i].id),
                ),
              ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load favorites: $e')),
      ),
    );
  }
}
