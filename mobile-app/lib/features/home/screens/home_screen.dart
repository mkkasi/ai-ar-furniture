import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/theme/app_tokens.dart';
import '../providers/home_provider.dart';
import '../widgets/furniture_card.dart';
import '../widgets/category_chip.dart';

const _categoryIcons = {
  'Living Room': Icons.weekend_outlined,
  'Bedroom': Icons.bed_outlined,
  'Kitchen': Icons.kitchen_outlined,
  'Dining': Icons.table_restaurant_outlined,
  'Office': Icons.chair_alt_outlined,
  'Outdoor': Icons.deck_outlined,
  'Televisions': Icons.tv_outlined,
  'Air Conditioners': Icons.ac_unit_outlined,
};

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final categories = ref.watch(categoriesProvider);
    final trending = ref.watch(trendingFurnitureProvider);
    final recommended = ref.watch(recommendedFurnitureProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(categoriesProvider);
            ref.invalidate(trendingFurnitureProvider);
            ref.invalidate(recommendedFurnitureProvider);
          },
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Hi, ${user?.name.split(' ').first ?? 'there'} 👋',
                                style: Theme.of(context).textTheme.titleMedium),
                            Text('Find furniture for your space',
                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => context.push('/notifications'),
                        icon: const Icon(Icons.notifications_outlined),
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 10),
                  child: Row(
                    children: [
                      Expanded(
                        child: _AiFeatureCard(
                          icon: Icons.image_search_rounded,
                          label: 'Visual Search',
                          subtitle: 'Snap any item to find it',
                          onTap: () => context.push('/ai-visual-search'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _AiFeatureCard(
                          icon: Icons.chat_bubble_outline_rounded,
                          label: 'AI Assistant',
                          subtitle: 'Ask what fits your space',
                          onTap: () => context.push('/ai-chat'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
  child: Padding(
    padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
    child: GestureDetector(
      onTap: () => context.push('/ai-interior-design'),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Theme.of(context).colorScheme.primary,
              Theme.of(context)
                  .colorScheme
                  .primary
                  .withValues(alpha: 0.75),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
        ),
        child: const Row(
          children: [
            Icon(
              Icons.auto_awesome_rounded,
              color: Colors.white,
              size: 28,
            ),
            SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'AI Interior Design',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Snap your room for a style + furniture & appliance match',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: Colors.white,
            ),
          ],
        ),
      ),
    ),
  ),
),

SliverToBoxAdapter(
  child: Padding(
    padding: const EdgeInsets.symmetric(horizontal: 20),
    child: GestureDetector(
      onTap: () => context.push('/search'),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        decoration: BoxDecoration(
          color: Theme.of(context)
              .colorScheme
              .surfaceContainerLow,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Row(
          children: [
            Icon(
              Icons.search,
              color: Colors.grey,
            ),
            SizedBox(width: 10),
            Text(
              'Search sofas, tables, chairs...',
              style: TextStyle(
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ),
    ),
  ),
),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: categories.when(
                    data: (list) => Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        for (final cat in list)
                          CategoryChip(
                            label: cat.name,
                            icon: _categoryIcons[cat.name] ?? Icons.category_outlined,
                            selected: false,
                            onTap: () {
                              ref.read(furnitureFilterProvider.notifier).state =
                                  ref.read(furnitureFilterProvider).copyWith(categoryId: cat.id);
                              context.push('/search');
                            },
                          ),
                      ],
                    ),
                    loading: () => const SizedBox(
                      height: 56,
                      child: Center(child: CircularProgressIndicator()),
                    ),
                    error: (e, _) => const SizedBox.shrink(),
                  ),
                ),
              ),
              _sectionHeader(context, 'Trending Now'),
              _furnitureRow(trending),
              _sectionHeader(context, 'Recommended for You'),
              _furnitureRow(recommended),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionHeader(BuildContext context, String title) => SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
          child: Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
        ),
      );

  Widget _furnitureRow(AsyncValue items) => SliverToBoxAdapter(
        child: SizedBox(
          height: 230,
          child: items.when(
            data: (list) => ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: list.length,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, i) => SizedBox(width: 160, child: FurnitureCard(item: list[i])),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Failed to load: $e')),
          ),
        ),
      );
}

/// Compact secondary AI entry card used on the home screen for Visual
/// Search and the AI Assistant — sits beside the larger AI Interior
/// Design hero card to form one cohesive "AI hub" section.
class _AiFeatureCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final VoidCallback onTap;

  const _AiFeatureCard({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadii.card),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: scheme.surfaceContainerLow,
          borderRadius: BorderRadius.circular(AppRadii.card),
          border: Border.all(color: scheme.outlineVariant.withValues(alpha: 0.4)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(color: scheme.primaryContainer, borderRadius: BorderRadius.circular(AppRadii.chip)),
              child: Icon(icon, color: scheme.onPrimaryContainer, size: 20),
            ),
            const SizedBox(height: AppSpacing.sm + 2),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
            const SizedBox(height: 2),
            Text(subtitle, style: TextStyle(fontSize: 11.5, color: scheme.onSurfaceVariant), maxLines: 2),
          ],
        ),
      ),
    );
  }
}
