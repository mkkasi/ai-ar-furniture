import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/home_provider.dart';
import '../widgets/furniture_card.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchCtrl = TextEditingController();

  void _applyQuery(String value) {
    ref.read(furnitureFilterProvider.notifier).state = ref.read(furnitureFilterProvider).copyWith(query: value);
  }

  void _openFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => _FilterSheet(
        current: ref.read(furnitureFilterProvider),
        onApply: (filter) => ref.read(furnitureFilterProvider.notifier).state = filter,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final results = ref.watch(searchResultsProvider);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchCtrl,
          onSubmitted: _applyQuery,
          decoration: const InputDecoration(
            hintText: 'Search furniture...',
            border: InputBorder.none,
          ),
        ),
        actions: [IconButton(onPressed: _openFilterSheet, icon: const Icon(Icons.tune))],
      ),
      body: results.when(
        data: (items) => items.isEmpty
            ? const Center(child: Text('No furniture matches your search'))
            : GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate:
                    const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, mainAxisSpacing: 14, crossAxisSpacing: 14, childAspectRatio: 0.68),
                itemCount: items.length,
                itemBuilder: (context, i) => FurnitureCard(item: items[i]),
              ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Something went wrong: $e')),
      ),
    );
  }
}

class _FilterSheet extends StatefulWidget {
  final FurnitureFilter current;
  final ValueChanged<FurnitureFilter> onApply;
  const _FilterSheet({required this.current, required this.onApply});

  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
  String? _roomType;

  static const _roomTypes = ['living_room', 'bedroom', 'kitchen', 'dining', 'office', 'outdoor'];

  @override
  void initState() {
    super.initState();
    _roomType = widget.current.roomType;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(left: 20, right: 20, top: 20, bottom: MediaQuery.of(context).viewInsets.bottom + 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Filters', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          Text('Room type', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: _roomTypes
                .map((rt) => ChoiceChip(
                      label: Text(rt.replaceAll('_', ' ')),
                      selected: _roomType == rt,
                      onSelected: (sel) => setState(() => _roomType = sel ? rt : null),
                    ))
                .toList(),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              widget.onApply(widget.current.copyWith(
                roomType: _roomType,
              ));
              Navigator.pop(context);
            },
            child: const Text('Apply Filters'),
          ),
        ],
      ),
    );
  }
}
