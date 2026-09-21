import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../home/models/furniture_model.dart';
import '../../favorites/providers/favorites_provider.dart';

/// Fetches a single furniture item's full detail payload.
final furnitureDetailProvider = FutureProvider.family<FurnitureModel, String>((ref, id) async {
  final res = await DioClient.instance.dio.get('${ApiConstants.furniture}/$id');
  return FurnitureModel.fromJson(res.data['data']);
});

class FurnitureDetailsScreen extends ConsumerStatefulWidget {
  final String furnitureId;
  const FurnitureDetailsScreen({super.key, required this.furnitureId});

  @override
  ConsumerState<FurnitureDetailsScreen> createState() => _FurnitureDetailsScreenState();
}

class _FurnitureDetailsScreenState extends ConsumerState<FurnitureDetailsScreen> {
  int _imageIndex = 0;

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(furnitureDetailProvider(widget.furnitureId));
    final favorites = ref.watch(favoritesProvider);
    final isFavorite = favorites.value?.any((f) => f.id == widget.furnitureId) ?? false;

    return Scaffold(
      body: detail.when(
        data: (item) => CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 340,
              pinned: true,
              actions: [
                IconButton(
                  icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border),
                  onPressed: () => ref.read(favoritesProvider.notifier).toggle(item.id),
                ),
                IconButton(
                  icon: const Icon(Icons.share_outlined),
                  onPressed: () => Share.share('Check out ${item.name} on AR Furniture Studio!'),
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: item.imageUrls.isEmpty
                    ? Container(color: Colors.grey.shade200)
                    : PageView.builder(
                        itemCount: item.imageUrls.length,
                        onPageChanged: (i) => setState(() => _imageIndex = i),
                        itemBuilder: (context, i) => CachedNetworkImage(imageUrl: item.imageUrls[i], fit: BoxFit.cover),
                      ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (item.imageUrls.length > 1)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          item.imageUrls.length,
                          (i) => Container(
                            margin: const EdgeInsets.symmetric(horizontal: 3),
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: i == _imageIndex ? Theme.of(context).colorScheme.primary : Colors.grey.shade300,
                            ),
                          ),
                        ),
                      ),
                    const SizedBox(height: 12),
                    Text(item.name, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    Row(children: [
                      RatingBarIndicator(
                        rating: item.ratingsAverage,
                        itemBuilder: (context, _) => const Icon(Icons.star, color: Colors.amber),
                        itemCount: 5,
                        itemSize: 18,
                      ),
                      const SizedBox(width: 6),
                      Text('${item.ratingsAverage.toStringAsFixed(1)} (${item.ratingsCount} reviews)',
                          style: Theme.of(context).textTheme.bodySmall),
                    ]),
                    const SizedBox(height: 12),
                    Text('Description', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    Text(item.description, style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 20),
                    Text('Dimensions', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    Text(
                      '${item.dimensions.widthCm.toStringAsFixed(0)}W × ${item.dimensions.heightCm.toStringAsFixed(0)}H × ${item.dimensions.depthCm.toStringAsFixed(0)}D cm',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    if (item.specifications.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      Text('Specifications', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      ...item.specifications.map<Widget>(
                        (spec) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SizedBox(
                                width: 140,
                                child: Text(spec.key, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey)),
                              ),
                              Expanded(child: Text(spec.value, style: Theme.of(context).textTheme.bodyMedium)),
                            ],
                          ),
                        ),
                      ),
                    ],
                    if (item.isAppliance && (item.voltage != null || item.energyRating != null)) ...[
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        children: [
                          if (item.voltage != null)
                            Chip(avatar: const Icon(Icons.bolt_rounded, size: 16), label: Text(item.voltage!)),
                          if (item.energyRating != null)
                            Chip(avatar: const Icon(Icons.eco_rounded, size: 16), label: Text(item.energyRating!)),
                        ],
                      ),
                    ],
                    if (item.colors.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      Text('Colors', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Row(
                        children: item.colors
                            .map((c) => Padding(
                                  padding: const EdgeInsets.only(right: 10),
                                  child: CircleAvatar(
                                    radius: 14,
                                    backgroundColor: Color(int.parse(c.hexCode.replaceFirst('#', '0xFF'))),
                                  ),
                                ))
                            .toList(),
                      ),
                    ],
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load item: $e')),
      ),
      bottomNavigationBar: detail.maybeWhen(
        data: (item) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(children: [
              if (item.model3DUrl != null) ...[
                OutlinedButton(
                  onPressed: () => context.push(
                    '/product-360',
                    extra: {'modelUrl': item.model3DUrl, 'itemName': item.name},
                  ),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(52, 52),
                    padding: EdgeInsets.zero,
                    shape: const CircleBorder(),
                  ),
                  child: const Icon(Icons.threesixty_rounded),
                ),
                const SizedBox(width: 12),
              ],
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: item.model3DUrl == null ? null : () => context.push('/ar-view/${item.id}'),
                  icon: const Icon(Icons.view_in_ar),
                  label: const Text('View in AR'),
                ),
              ),
            ]),
          ),
        ),
        orElse: () => null,
      ),
    );
  }
}
