import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_tokens.dart';
import '../../home/models/furniture_model.dart';
import '../../home/widgets/furniture_card.dart';
import '../models/visual_search_result.dart';
import '../providers/visual_search_provider.dart';

/// AI Visual Search: snap or upload a photo of any furniture/appliance —
/// spotted in a magazine, a friend's home, anywhere — and find
/// visually/stylistically similar items in the catalog. Distinct from
/// AI Interior Design (which analyzes a whole ROOM); this analyzes one
/// PRODUCT photo.
class VisualSearchScreen extends ConsumerStatefulWidget {
  const VisualSearchScreen({super.key});

  @override
  ConsumerState<VisualSearchScreen> createState() => _VisualSearchScreenState();
}

class _VisualSearchScreenState extends ConsumerState<VisualSearchScreen> {
  File? _pickedPhoto;

  Future<void> _pickPhoto(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: source, imageQuality: 85, maxWidth: 2000);
    if (picked == null) return;

    setState(() => _pickedPhoto = File(picked.path));
    if (!mounted) return;
    ref.read(visualSearchProvider.notifier).searchByPhoto(File(picked.path));
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(visualSearchProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Visual Search'),
        actions: [
          if (state.result != null)
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              tooltip: 'Try another photo',
              onPressed: () {
                setState(() => _pickedPhoto = null);
                ref.read(visualSearchProvider.notifier).reset();
              },
            ),
        ],
      ),
      body: SafeArea(
        child: _pickedPhoto == null ? _buildIntro(context) : _buildResult(context, state),
      ),
    );
  }

  Widget _buildIntro(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.image_search_rounded, size: 56),
          const SizedBox(height: 16),
          Text(
            'Seen a piece you love?',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Snap a photo of any sofa, chair, table, or appliance — anywhere — '
            'and our AI will find similar items in our catalog.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey),
          ),
          const SizedBox(height: 32),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: () => _pickPhoto(ImageSource.camera),
                  icon: const Icon(Icons.camera_alt_outlined),
                  label: const Text('Take Photo'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _pickPhoto(ImageSource.gallery),
                  icon: const Icon(Icons.photo_library_outlined),
                  label: const Text('From Gallery'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildResult(BuildContext context, VisualSearchState state) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(AppRadii.card),
          child: Image.file(_pickedPhoto!, height: 220, width: double.infinity, fit: BoxFit.cover),
        ),
        const SizedBox(height: 20),
        if (state.isSearching)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Column(
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Looking for similar items...'),
              ],
            ),
          )
        else if (state.errorMessage != null)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Text(state.errorMessage!, style: const TextStyle(color: Colors.red)),
          )
        else if (state.result != null)
          _buildMatches(context, state.result!),
      ],
    );
  }

  Widget _buildMatches(BuildContext context, VisualSearchResult result) {
    final insights = result.insights;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (insights.primaryType != null || insights.style != null) ...[
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (insights.primaryType != null)
                Chip(avatar: const Icon(Icons.category_outlined, size: 18), label: Text(insights.primaryType!)),
              if (insights.style != null)
                Chip(avatar: const Icon(Icons.palette_outlined, size: 18), label: Text(insights.style!)),
            ],
          ),
          const SizedBox(height: 16),
        ],
        if (insights.colors.isNotEmpty) ...[
          Text('Detected Colors', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Row(
            children: insights.colors
                .map<Widget>((hex) => Padding(
                      padding: const EdgeInsets.only(right: 10),
                      child: CircleAvatar(radius: 16, backgroundColor: _parseHex(hex)),
                    ))
                .toList(),
          ),
          const SizedBox(height: 16),
        ],
        Text('Similar Items', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 10),
        if (result.matches.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Text('No close matches yet — try browsing the catalog instead.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey)),
          )
        else
          _itemGrid(result.matches),
      ],
    );
  }

  Widget _itemGrid(List<FurnitureModel> items) {
    return SizedBox(
      height: 230,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (context, i) => SizedBox(width: 160, child: FurnitureCard(item: items[i])),
      ),
    );
  }

  Color _parseHex(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return Colors.grey;
    }
  }
}
