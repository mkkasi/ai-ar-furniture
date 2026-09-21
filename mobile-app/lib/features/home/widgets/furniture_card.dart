import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../models/furniture_model.dart';

/// A furniture thumbnail card used across home, search, and favorites grids.
class FurnitureCard extends StatelessWidget {
  final FurnitureModel item;
  final VoidCallback? onFavoriteToggle;
  final bool isFavorite;

  const FurnitureCard({super.key, required this.item, this.onFavoriteToggle, this.isFavorite = false});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: () => context.push('/furniture/${item.id}'),
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerLow,
          borderRadius: BorderRadius.circular(20),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: item.imageUrls.isNotEmpty
                        ? CachedNetworkImage(imageUrl: item.imageUrls.first, fit: BoxFit.cover)
                        : Container(color: theme.colorScheme.surfaceContainerHigh, child: const Icon(Icons.chair)),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: onFavoriteToggle,
                      child: CircleAvatar(
                        backgroundColor: Colors.white.withValues(alpha: 0.9),
                        radius: 16,
                        child: Icon(isFavorite ? Icons.favorite : Icons.favorite_border, size: 18, color: Colors.redAccent),
                      ),
                    ),
                  ),
                  if (item.model3DUrl != null)
                    Positioned(
                      bottom: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: Colors.black87, borderRadius: BorderRadius.circular(20)),
                        child: const Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(Icons.view_in_ar, size: 12, color: Colors.white),
                          SizedBox(width: 4),
                          Text('AR', style: TextStyle(color: Colors.white, fontSize: 11)),
                        ]),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: theme.textTheme.titleSmall),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      if (item.categoryName != null)
                        Expanded(
                          child: Text(
                            item.categoryName!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey),
                          ),
                        ),
                      if (item.ratingsCount > 0) ...[
                        const Icon(Icons.star_rounded, size: 14, color: Color(0xFFC9A876)),
                        const SizedBox(width: 2),
                        Text(item.ratingsAverage.toStringAsFixed(1), style: theme.textTheme.bodySmall),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
